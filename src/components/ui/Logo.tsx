import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/utils/cn';

interface LogoProps {
  className?: string;
  priority?: boolean;
}

export function Logo({ className, priority = false }: LogoProps) {
  return (
    <Link href="/" className={cn('flex items-center space-x-2', className)}>
      <Image
        src="/images/disco-logo.svg"
        alt="Disco Logo"
        width={32}
        height={32}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
      />
      <span className="font-bold text-xl">Disco</span>
    </Link>
  );
}
