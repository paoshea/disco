'use client';

import { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Auth form */}
      <div className="flex w-full flex-col justify-center px-4 sm:px-6 lg:w-1/2 lg:px-8">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8">
            <div className="flex justify-between items-center px-4">
              <Link href="/" className="flex items-center">
                <Image
                  src="/images/disco-logo.svg"
                  alt="Disco"
                  width={32}
                  height={32}
                  className="h-8 w-auto"
                />
              </Link>
              <div className="flex gap-4">
                <Link
                  href="/"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Home
                </Link>
                <Link
                  href="/login"
                  className="text-sm font-medium text-sky-600 hover:text-sky-700"
                >
                  Login
                </Link>
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Welcome to Disco
            </h2>
          </div>
          {children}
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative min-h-screen">
        <Image
          src="/auth-background.svg"
          alt="Authentication background"
          fill
          className="object-cover"
          sizes="50vw"
          priority
        />
      </div>
    </div>
  );
}
