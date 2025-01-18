interface LogoProps {
  className?: string;
}

export function Logo({ className = "w-24 h-24" }: LogoProps) {
  return (
    <div className={className}>
      <img src="/images/disco-logo.svg" alt="Disco Logo" className="w-full h-full" />
    </div>
  );
}
