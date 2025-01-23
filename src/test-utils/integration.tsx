import React, { ReactElement, ReactNode } from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { UserRole } from '@prisma/client';
import { mockGeolocation } from '@/__tests__/__mocks__/geolocation';
import { mockPushNotification } from '@/__tests__/__mocks__/notifications';

// Mock next-auth session
const mockSession = {
  expires: new Date(Date.now() + 2 * 86400).toISOString(),
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: UserRole.user,
  },
};

// Custom render function that includes providers
interface WrapperProps {
  children: ReactNode;
}

const Wrapper = ({ children }: WrapperProps) => {
  return <SessionProvider session={mockSession}>{children}</SessionProvider>;
};

function render(
  ui: ReactElement,
  options: Omit<RenderOptions, 'wrapper'> = {}
) {
  return {
    ...rtlRender(ui, { wrapper: Wrapper, ...options }),
    // Add custom utilities here
    mockGeolocation,
    mockPushNotification,
    session: mockSession,
  };
}

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { render };
