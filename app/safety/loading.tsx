import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function SafetyLoading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}
