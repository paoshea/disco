import { SVGProps } from 'react';

export function StreakIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}
