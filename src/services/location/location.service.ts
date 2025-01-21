import { db } from '@/lib/prisma';
import type {
  Location as PrismaLocation,
  User as PrismaUser,
} from '@prisma/client';
import type {
  Location,
  LocationPrivacyMode,
  GeolocationOptions,
} from '@/types/location';
import type { ServiceResponse } from '@/types/api';
import type { User } from '@/types/user';

interface ExtendedServiceWorkerRegistration extends ServiceWorkerRegistration {
  sync?: {
    register(tag: string): Promise<void>;
  };
  periodicSync?: {
    register(tag: string, options: { minInterval: number }): Promise<void>;
  };
}

// Define custom WakeLock types since they're not in lib.dom.d.ts
interface WakeLockSentinel {
  readonly released: boolean;
  readonly type: WakeLockType;
  release(): Promise<void>;
  onrelease: ((this: WakeLockSentinel, ev: Event) => void) | null;
  addEventListener(
    type: 'release',
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener(
    type: 'release',
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

interface WakeLock {
  request(type: WakeLockType): Promise<WakeLockSentinel>;
}

interface NavigatorWithWakeLock {
  wakeLock?: WakeLock;
}

type WakeLockType = 'screen';

export class LocationService {
  private static instance: LocationService;
  private prisma: typeof db.location;
  private trackingIntervals: Map<string, number> = new Map();
  private backgroundSync = false;
  private locationQueue: Map<string, GeolocationPosition[]> = new Map();
  private readonly SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private readonly QUEUE_SIZE_LIMIT = 100;
  private readonly defaultOptions: GeolocationOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
  };
  private wakeLock: WakeLockSentinel | null = null;

  private constructor() {
    this.prisma = db.location;
    this.initServiceWorker().catch(console.error);
  }

  private async initServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = (await navigator.serviceWorker.register(
          '/sw.js'
        )) as ExtendedServiceWorkerRegistration;

        // Request periodic background sync permission
        if (registration.periodicSync) {
          await registration.periodicSync.register('location-sync', {
            minInterval: this.SYNC_INTERVAL,
          });
        }

        // Enable background sync
        if (registration.sync) {
          void registration.sync.register('location-sync');
          this.backgroundSync = true;
        }
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  private async queueLocationUpdate(
    userId: string,
    position: GeolocationPosition
  ): Promise<void> {
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
        const registration = (await navigator.serviceWorker
          .ready) as ExtendedServiceWorkerRegistration;
        if (registration.sync) {
          await registration.sync.register('location-sync');
        }
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

  private async getUserWithProfile(userId: string): Promise<PrismaUser> {
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  private mapPrismaLocationToLocation(
    location: PrismaLocation & { user?: PrismaUser }
  ): Location {
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
      const location = await db.location.upsert({
        where: {
          id: `${userId}_${Date.now()}`,
        },
        create: {
          id: `${userId}_${Date.now()}`,
          userId,
          ...data,
          timestamp: new Date(),
        },
        update: {
          ...data,
          timestamp: new Date(),
        },
      });

      return {
        success: true,
        data: this.mapPrismaLocationToLocation(location),
      };
    } catch (error) {
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
    background = false
  ): Promise<void> {
    if (this.trackingIntervals.has(userId)) {
      console.warn('Location tracking already active for user:', userId);
      return;
    }

    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by this browser.');
    }

    this.backgroundSync = background;

    const updateLocation = (position: GeolocationPosition): void => {
      void this.queueLocationUpdate(userId, position);
    };

    const handleError = (error: GeolocationPositionError): void => {
      console.error('Error getting location:', error);

      // Stop tracking on persistent errors
      if (error.code === error.PERMISSION_DENIED) {
        void this.stopTracking(userId);
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
      await this.requestWakeLock();
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
          const registration = (await navigator.serviceWorker
            .ready) as ExtendedServiceWorkerRegistration;
          if (registration.sync) {
            await registration.sync.register('location-sync');
          }
        } catch (error) {
          console.error('Error syncing final locations:', error);
        }
        this.locationQueue.delete(userId);
      }

      // Release wake lock
      await this.releaseWakeLock();
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
    location: { latitude: number; longitude: number },
    radius: number
  ): Promise<User[]> {
    const nearbyUsers = await db.user.findMany({
      where: {
        locations: {
          some: {
            latitude: {
              gte: location.latitude - radius / 111000,
              lte: location.latitude + radius / 111000,
            },
            longitude: {
              gte:
                location.longitude -
                radius /
                  (111000 * Math.cos((location.latitude * Math.PI) / 180)),
              lte:
                location.longitude +
                radius /
                  (111000 * Math.cos((location.latitude * Math.PI) / 180)),
            },
            sharingEnabled: true,
            timestamp: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
        },
      },
      include: {
        locations: {
          orderBy: { timestamp: 'desc' },
          take: 1,
          where: { sharingEnabled: true },
        },
      },
    });

    return nearbyUsers.map(
      user =>
        ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          lastActive: user.updatedAt,
          verificationStatus: user.emailVerified ? 'verified' : 'pending',
          location: user.locations[0]
            ? {
                latitude: user.locations[0].latitude,
                longitude: user.locations[0].longitude,
                accuracy: user.locations[0].accuracy ?? undefined,
                timestamp: user.locations[0].timestamp,
                privacyMode: user.locations[0]
                  .privacyMode as LocationPrivacyMode,
              }
            : undefined,
        }) as User
    );
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

  private async requestWakeLock(): Promise<void> {
    try {
      const nav = navigator as NavigatorWithWakeLock;
      if ('wakeLock' in nav && nav.wakeLock) {
        this.wakeLock = await nav.wakeLock.request('screen');
        console.log('Wake Lock is active');
      }
    } catch (err) {
      console.error('Error requesting wake lock:', err);
    }
  }

  private async releaseWakeLock(): Promise<void> {
    if (this.wakeLock) {
      try {
        await this.wakeLock.release();
        this.wakeLock = null;
        console.log('Wake Lock released');
      } catch (err) {
        console.error('Error releasing wake lock:', err);
      }
    }
  }
}

export const locationService = LocationService.getInstance();
