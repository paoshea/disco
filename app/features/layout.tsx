import { PublicLayout } from '@/components/layout/PublicLayout';

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicLayout>{children}</PublicLayout>;
}
