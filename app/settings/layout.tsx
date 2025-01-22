'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const settingsLinks = [
  { href: '/settings/notifications', label: 'Notifications' },
  { href: '/settings/match-preferences', label: 'Match Preferences' },
  { href: '/settings/profile', label: 'Profile' },
  { href: '/settings/privacy', label: 'Privacy' },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-12 gap-8">
        <nav className="col-span-12 md:col-span-3 space-y-1">
          {settingsLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  isActive
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-900 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <main className="col-span-12 md:col-span-9">{children}</main>
      </div>
    </div>
  );
}
