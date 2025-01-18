import Image from 'next/image';

interface LogoProps {
  className?: string;
}

export function Logo({ className = 'w-24 h-24' }: LogoProps) {
  return (
    <div className={className}>
      <Image
        src="/images/disco-logo.svg"
        alt="Disco Logo"
        width={96}
        height={96}
        priority
        className="w-full h-full"
      />
    </div>
  );
}
