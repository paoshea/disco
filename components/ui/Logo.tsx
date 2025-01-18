import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center space-x-2", className)}>
      <Image
        src="/images/disco-logo.svg"
        alt="Disco Logo"
        width={32}
        height={32}
        priority
      />
      <span className="font-bold text-xl">Disco</span>
    </Link>
  );
}
