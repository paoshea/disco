import { User } from '@/types/user';

export const mockUser: User = {
  id: '123',
  email: 'test@example.com',
  name: 'Test User',
  preferences: {
    maxDistance: 50,
    ageRange: {
      min: 18,
      max: 99,
    },
    interests: [],
    gender: [],
    lookingFor: [],
    relationshipType: [],
    notifications: {
      matches: false,
      messages: false,
      email: false,
    },
    privacy: {
      showOnlineStatus: false,
      showLastSeen: true,
      showLocation: false,
      showAge: true,
    },
    safety: {
      requireVerifiedMatch: true,
      meetupCheckins: true,
      emergencyContactAlerts: true,
      blockUnverifiedUsers: false,
    },
    theme: 'light',
    language: 'en',
    timezone: 'America/Chicago',
  },
};

export const mockUsers: User[] = [
  mockUser,
  {
    id: '456',
    email: 'jane@example.com',
    name: 'Jane Smith',
    preferences: {
      maxDistance: 25,
      ageRange: {
        min: 21,
        max: 35,
      },
      interests: ['hiking', 'photography'],
      gender: ['female'],
      lookingFor: ['male'],
      relationshipType: ['dating'],
      notifications: {
        matches: true,
        messages: true,
        email: true,
      },
      privacy: {
        showOnlineStatus: true,
        showLastSeen: true,
        showLocation: true,
        showAge: true,
      },
      safety: {
        requireVerifiedMatch: true,
        meetupCheckins: false,
        emergencyContactAlerts: false,
        blockUnverifiedUsers: true,
      },
      theme: 'dark',
      language: 'en',
      timezone: 'America/New_York',
    },
  },
];

// Test cases for user mock
describe('User Mock', () => {
  it('should have valid user data', () => {
    expect(mockUser).toBeDefined();
    expect(mockUser.id).toBe('123');
    expect(mockUser.email).toBe('test@example.com');
    expect(mockUser.name).toBe('Test User');
    expect(mockUser.preferences).toBeDefined();
  });

  it('should have valid preferences structure', () => {
    const { preferences } = mockUser;
    expect(preferences.maxDistance).toBeDefined();
    expect(preferences.ageRange).toBeDefined();
    expect(preferences.interests).toBeDefined();
    expect(preferences.notifications).toBeDefined();
    expect(preferences.privacy).toBeDefined();
    expect(preferences.safety).toBeDefined();
  });

  it('should have multiple mock users', () => {
    expect(mockUsers).toHaveLength(2);
    expect(mockUsers[0]).toBe(mockUser);
    expect(mockUsers[1].id).toBe('456');
  });
});
