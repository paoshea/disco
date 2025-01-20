import { db } from '@/lib/prisma';
import type { Location as PrismaLocation } from '@prisma/client';
import type { Location, LocationPrivacyMode, GeolocationOptions } from '@/types/location';
import type { ServiceResponse } from '@/types/api';
import type { User } from '@/types/user';

export class LocationService {
  private static instance: LocationService;
  private prisma: typeof db.location;
  private trackingIntervals: Map<string, number> = new Map();
  private backgroundSync: boolean = false;
  private locationQueue: Map<string, GeolocationPosition[]> = new Map();
  private readonly SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private readonly QUEUE_SIZE_LIMIT = 100;
  private readonly defaultOptions: GeolocationOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
  };

  private constructor() {
    this.prisma = db.location;
    this.initServiceWorker().catch(console.error);
  }

  private async initServiceWorker() {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        // Request periodic background sync permission
        if ('periodicSync' in registration) {
          const status = await navigator.permissions.query({
            name: 'periodic-background-sync' as PermissionName,
          });

          if (status.state === 'granted') {
            await (registration.periodicSync as any).register('location-sync', {
              minInterval: this.SYNC_INTERVAL,
            });
          }
        }

        console.log('Service Worker registered for background location tracking');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  private async queueLocationUpdate(userId: string, position: GeolocationPosition) {
    // Get or create queue for user
    let userQueue = this.locationQueue.get(userId) || [];
    
    // Add new position
    userQueue.push(position);
    
    // Limit queue size
    if (userQueue.length > this.QUEUE_SIZE_LIMIT) {
      userQueue = userQueue.slice(-this.QUEUE_SIZE_LIMIT);
    }
    
    this.locationQueue.set(userId, userQueue);

    // Store in cache for service worker
    if ('caches' in window) {
      try {
        const cache = await caches.open('disco-location-cache-v1');
        await cache.put(
          '/location-queue',
          new Response(
            JSON.stringify({
              userId,
              positions: userQueue.map(pos => ({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy,
                timestamp: pos.timestamp,
              })),
            })
          )
        );

        // Request background sync
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('location-sync');
      } catch (error) {
        console.error('Error queuing location update:', error);
      }
    }
  }

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  private mapPrismaLocationToLocation(location: PrismaLocation): Location {
    return {
      id: location.id,
      userId: location.userId,
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy ?? undefined,
      privacyMode: location.privacyMode as LocationPrivacyMode,
      sharingEnabled: location.sharingEnabled,
      timestamp: location.timestamp,
    };
  }

  async updateLocation(
    userId: string,
    data: {
      latitude: number;
      longitude: number;
      accuracy?: number;
      privacyMode: LocationPrivacyMode;
      sharingEnabled?: boolean;
    }
  ): Promise<ServiceResponse<Location>> {
    try {
      if (!data.latitude || !data.longitude) {
        throw new Error('Latitude and longitude are required');
      }

      // Delete old locations for this user (keep only the latest)
      await this.prisma.deleteMany({
        where: {
          userId,
          timestamp: {
            lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Older than 24 hours
          },
        },
      });

      const locationData = {
        userId,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy ?? null,
        privacyMode: data.privacyMode,
        sharingEnabled: data.sharingEnabled ?? true,
        timestamp: new Date(),
      };

      const prismaLocation = await this.prisma.create({
        data: locationData,
      });

      return {
        success: true,
        data: this.mapPrismaLocationToLocation(prismaLocation),
      };
    } catch (error) {
      console.error('Error updating location:', error);
      return {
        success: false,
        error: 'Failed to update location',
      };
    }
  }

  async getLocationState(userId: string): Promise<ServiceResponse<Location>> {
    try {
      const prismaLocation = await this.prisma.findFirst({
        where: { userId },
        orderBy: { timestamp: 'desc' },
      });

      if (!prismaLocation) {
        return {
          success: false,
          error: 'No location found',
        };
      }

      return {
        success: true,
        data: this.mapPrismaLocationToLocation(prismaLocation),
      };
    } catch (error) {
      console.error('Error getting location state:', error);
      return {
        success: false,
        error: 'Failed to get location state',
      };
    }
  }

  async updateLocationState(
    userId: string,
    data: {
      privacyMode: LocationPrivacyMode;
      sharingEnabled: boolean;
    }
  ): Promise<ServiceResponse<Location>> {
    try {
      const currentLocation = await this.prisma.findFirst({
        where: { userId },
        orderBy: { timestamp: 'desc' },
      });

      if (!currentLocation) {
        return {
          success: false,
          error: 'No location found',
        };
      }

      const prismaLocation = await this.prisma.update({
        where: { id: currentLocation.id },
        data: {
          privacyMode: data.privacyMode,
          sharingEnabled: data.sharingEnabled,
        },
      });

      return {
        success: true,
        data: this.mapPrismaLocationToLocation(prismaLocation),
      };
    } catch (error) {
      console.error('Error updating location state:', error);
      return {
        success: false,
        error: 'Failed to update location state',
      };
    }
  }

  async getLatestLocation(userId: string): Promise<Location | null> {
    try {
      const prismaLocation = await this.prisma.findFirst({
        where: { userId },
        orderBy: { timestamp: 'desc' },
      });

      return prismaLocation
        ? this.mapPrismaLocationToLocation(prismaLocation)
        : null;
    } catch (error) {
      console.error('Error getting latest location:', error);
      throw error;
    }
  }

  async getLocation(userId: string): Promise<Location | null> {
    const prismaLocation = await this.prisma.findFirst({
      where: {
        userId,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    return prismaLocation
      ? this.mapPrismaLocationToLocation(prismaLocation)
      : null;
  }

  async toggleLocationSharing(userId: string): Promise<Location | null> {
    const currentLocation = await this.getLocation(userId);
    if (!currentLocation) {
      return null;
    }

    const prismaLocation = await this.prisma.update({
      where: {
        id: currentLocation.id,
      },
      data: {
        sharingEnabled: !currentLocation.sharingEnabled,
      },
    });

    return this.mapPrismaLocationToLocation(prismaLocation);
  }

  async startTracking(
    userId: string, 
    options: GeolocationOptions = {},
    background: boolean = false
  ): Promise<void> {
    if (this.trackingIntervals.has(userId)) {
      console.warn('Location tracking already active for user:', userId);
      return;
    }

    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by this browser.');
    }

    this.backgroundSync = background;

    const updateLocation = async (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = position.coords;
      
      try {
        if (this.backgroundSync) {
          // Queue update for background sync
          await this.queueLocationUpdate(userId, position);
        } else {
          // Update immediately
          const currentState = await this.getLocationState(userId);
          await this.updateLocation(userId, {
            latitude,
            longitude,
            accuracy,
            privacyMode: currentState.data?.privacyMode ?? 'precise',
            sharingEnabled: currentState.data?.sharingEnabled ?? true,
          });
        }
      } catch (error) {
        console.error('Error updating location during tracking:', error);
      }
    };

    const handleError = (error: GeolocationPositionError) => {
      console.error('Error getting location:', error);
      // Stop tracking on persistent errors
      if (error.code === error.PERMISSION_DENIED) {
        this.stopTracking(userId);
      }
    };

    const watchOptions = {
      ...this.defaultOptions,
      ...options,
    };

    // Start watching position
    const watchId = navigator.geolocation.watchPosition(
      updateLocation,
      handleError,
      watchOptions
    );

    // Store the watch ID for cleanup
    this.trackingIntervals.set(userId, watchId);

    // Request wake lock for background tracking
    if (background && 'wakeLock' in navigator) {
      try {
        const wakeLock = await (navigator as any).wakeLock.request('screen');
        wakeLock.addEventListener('release', () => {
          console.log('Wake Lock released');
        });
      } catch (err) {
        console.error('Wake Lock error:', err);
      }
    }
  }

  async stopTracking(userId: string): Promise<void> {
    const watchId = this.trackingIntervals.get(userId);
    if (watchId !== undefined) {
      navigator.geolocation.clearWatch(watchId);
      this.trackingIntervals.delete(userId);
      this.backgroundSync = false;

      // Sync any remaining queued locations
      if (this.locationQueue.has(userId)) {
        try {
          const registration = await navigator.serviceWorker.ready;
          await registration.sync.register('location-sync');
        } catch (error) {
          console.error('Error syncing final locations:', error);
        }
        this.locationQueue.delete(userId);
      }
    }
  }

  async updatePrivacyMode(
    userId: string,
    privacyMode: LocationPrivacyMode
  ): Promise<Location | null> {
    const currentLocation = await this.getLocation(userId);
    if (!currentLocation) {
      return null;
    }

    const prismaLocation = await this.prisma.update({
      where: {
        id: currentLocation.id,
      },
      data: {
        privacyMode,
      },
    });

    return this.mapPrismaLocationToLocation(prismaLocation);
  }

  async getNearbyUsers(
    latitude: number,
    longitude: number,
    radiusInMeters: number = 10000 // Default 10km
  ): Promise<User[]> {
    try {
      const nearbyLocations = await this.prisma.findMany({
        where: {
          latitude: {
            gte: latitude - 0.1, // Rough filter first
            lte: latitude + 0.1,
          },
          longitude: {
            gte: longitude - 0.1,
            lte: longitude + 0.1,
          },
          sharingEnabled: true,
        },
        include: {
          user: {
            include: {
              profile: true,
              preferences: true,
            },
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
        distinct: ['userId'], // Only get latest location per user
      });

      // Calculate actual distances and filter
      const usersWithinRadius = nearbyLocations
        .map(location => {
          const distance = this.calculateDistance(
            latitude,
            longitude,
            location.latitude,
            location.longitude
          );
          return {
            distance,
            user: location.user,
          };
        })
        .filter(({ distance }) => distance <= radiusInMeters)
        .sort((a, b) => a.distance - b.distance)
        .map(({ user }) => ({
          id: user.id,
          name: user.name || '',
          email: user.email,
          bio: user.profile?.bio || '',
          age: user.profile?.age || 0,
          location: {
            latitude: user.location?.latitude || 0,
            longitude: user.location?.longitude || 0,
          },
          interests: user.profile?.interests || [],
          lastActive: user.lastActive || new Date(),
          verificationStatus: user.verificationStatus || 'unverified',
          activityPreferences: user.preferences?.activityPreferences || [],
          privacySettings: user.preferences?.privacySettings || {},
        }));

      return usersWithinRadius;
    } catch (error) {
      console.error('Error getting nearby users:', error);
      return [];
    }
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }
}

export const locationService = LocationService.getInstance();
