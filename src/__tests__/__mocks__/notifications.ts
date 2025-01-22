export const mockPushNotification = {
  title: 'New Match Request',
  body: 'John Doe wants to connect with you',
  icon: '/icons/match-request.png',
  badge: '/icons/badge.png',
  tag: 'match-request',
  data: {
    url: '/matches/user-456',
    type: 'match_request',
    userId: 'user-456',
  },
  actions: [
    {
      action: 'accept',
      title: 'Accept',
    },
    {
      action: 'decline',
      title: 'Decline',
    },
  ],
};

export const mockEmailNotification = {
  subject: 'New Match Request',
  to: 'user@example.com',
  template: 'match-request',
  data: {
    userName: 'John Doe',
    matchId: 'match-123',
    actionUrl: 'https://app.disco.com/matches/user-456',
  },
};

export const mockNotificationPreferences = {
  pushEnabled: true,
  emailEnabled: true,
  categories: {
    matches: true,
    messages: true,
    events: true,
    system: true,
  },
  quiet_hours: {
    enabled: true,
    start: '22:00',
    end: '07:00',
  },
};

export const mockNotificationTypes = {
  MATCH_REQUEST: 'match_request',
  MESSAGE: 'message',
  EVENT_INVITATION: 'event_invitation',
  EVENT_REMINDER: 'event_reminder',
  SYSTEM_UPDATE: 'system_update',
};

// Helper to create a mock notification
export const createMockNotification = (type: string, data: any = {}) => {
  const baseNotification = {
    id: `notif-${Date.now()}`,
    timestamp: new Date().toISOString(),
    read: false,
  };

  switch (type) {
    case mockNotificationTypes.MATCH_REQUEST:
      return {
        ...baseNotification,
        type,
        title: 'New Match Request',
        message: `${data.userName} wants to connect with you`,
        actionUrl: `/matches/${data.userId}`,
      };
    case mockNotificationTypes.MESSAGE:
      return {
        ...baseNotification,
        type,
        title: 'New Message',
        message: `${data.userName}: ${data.preview}`,
        actionUrl: `/messages/${data.chatId}`,
      };
    case mockNotificationTypes.EVENT_INVITATION:
      return {
        ...baseNotification,
        type,
        title: 'Event Invitation',
        message: `${data.userName} invited you to ${data.eventName}`,
        actionUrl: `/events/${data.eventId}`,
      };
    case mockNotificationTypes.EVENT_REMINDER:
      return {
        ...baseNotification,
        type,
        title: 'Event Reminder',
        message: `${data.eventName} starts in ${data.timeUntil}`,
        actionUrl: `/events/${data.eventId}`,
      };
    case mockNotificationTypes.SYSTEM_UPDATE:
      return {
        ...baseNotification,
        type,
        title: 'System Update',
        message: data.message,
        actionUrl: data.actionUrl || '/settings',
      };
    default:
      return baseNotification;
  }
};
