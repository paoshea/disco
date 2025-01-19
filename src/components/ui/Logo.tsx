import Link from 'next/link';
import { cn } from '@/utils/cn';

interface LogoProps {
  className?: string;
  withLink?: boolean;
}

export function Logo({ className, withLink = true }: LogoProps) {
  const logo = (
    <div className={cn('flex items-center space-x-2', className)}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <circle
          cx="60"
          cy="60"
          r="55"
          fill="url(#disco-gradient)"
          stroke="#0284C7"
          strokeWidth="2"
        />
        <path
          d="M40 45C40 42.2386 42.2386 40 45 40H75C77.7614 40 80 42.2386 80 45V75C80 77.7614 77.7614 80 75 80H45C42.2386 80 40 77.7614 40 75V45Z"
          fill="white"
        />
        <path
          d="M60 70C65.5228 70 70 65.5228 70 60C70 54.4772 65.5228 50 60 50C54.4772 50 50 54.4772 50 60C50 65.5228 54.4772 70 60 70Z"
          fill="#0284C7"
        />
        <defs>
          <linearGradient
            id="disco-gradient"
            x1="0"
            y1="0"
            x2="120"
            y2="120"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
        </defs>
      </svg>
      <span className="font-bold text-xl">Disco</span>
    </div>
  );

  if (withLink) {
    return <Link href="/">{logo}</Link>;
  }

  return logo;
}
