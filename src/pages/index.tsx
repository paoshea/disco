import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const init = async () => {
      try {
        if (!isLoading && !user) {
          await router.push('/login');
        } else if (!isLoading && user) {
          await router.push('/profile');
        }
      } catch (err) {
        console.error('Navigation error:', err);
      }
    };

    void init();
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Layout>
      <div className="flex min-h-screen flex-col items-center justify-center py-2">
        <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
          <h1 className="text-6xl font-bold">
            Welcome to <span className="text-primary-600">Disco</span>
          </h1>
          <p className="mt-3 text-2xl">Redirecting you to the appropriate page...</p>
        </main>
      </div>
    </Layout>
  );
}
