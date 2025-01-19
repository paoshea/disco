'use client';

import { ReactNode } from 'react';
import Image from 'next/image';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Auth form */}
      <div className="flex w-full flex-col justify-center px-4 sm:px-6 lg:w-1/2 lg:px-8">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8">
            <Image
              src="/images/disco-logo.svg"
              alt="Disco"
              width={48}
              height={48}
              className="mx-auto h-12 w-auto"
              priority
            />
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Welcome to Disco
            </h2>
          </div>
          {children}
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="/auth-background.svg"
          alt="Authentication background"
          fill
          className="object-cover"
          sizes="50vw"
        />
      </div>
    </div>
  );
}
