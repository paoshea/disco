import { render as rtlRender } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { ReactElement } from 'react';
import { mockGeolocation } from '@/__tests__/__mocks__/geolocation';
import { mockPushNotification } from '@/__tests__/__mocks__/notifications';

// Mock next-auth session
const mockSession = {
  expires: new Date(Date.now() + 2 * 86400).toISOString(),
  user: {
    id: 'user123',
    email: 'test@example.com',
    name: 'Test User',
  },
};

// Custom render function that includes providers
function render(
  ui: ReactElement,
  {
    session = mockSession,
    router = {},
    ...options
  } = {}
) {
  function Wrapper({ children }: { children: ReactElement }) {
    return (
      <SessionProvider session={session}>
        {children}
      </SessionProvider>
    );
  }

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
