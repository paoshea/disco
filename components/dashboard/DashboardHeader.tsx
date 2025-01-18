import { useAuth } from '@/app/hooks/useAuth';
import { Logo } from '@/components/ui/Logo';

export function DashboardHeader() {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex items-center space-x-4">
            <Logo className="w-12 h-12" />
            <div>
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Welcome back, {user?.firstName}!
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Here&apos;s your safety and connection overview
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
