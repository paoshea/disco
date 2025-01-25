
import { Component, ErrorInfo, ReactNode } from 'react';
import { toast } from '@/components/ui/toast';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class AuthErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Auth error:', error, errorInfo);
    toast({
      title: 'Authentication Error',
      description: 'Please try logging in again',
      variant: 'destructive',
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-xl font-semibold">Authentication Error</h2>
          <p className="mt-2">Please try logging in again</p>
          <button
            className="mt-4 px-4 py-2 bg-sky-500 text-white rounded"
            onClick={() => window.location.href = '/login'}
          >
            Return to Login
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
