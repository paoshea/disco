import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu } from '@headlessui/react';
import { User } from '@/types/user';

interface UserMenuProps {
  user: User;
  onLogout: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ user, onLogout }) => {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="flex items-center space-x-2">
        {user.avatar ? (
          <div className="h-8 w-8 rounded-full overflow-hidden">
            <Image
              src={user.avatar}
              alt={`${user.name}'s profile`}
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">
              {user.name.charAt(0)}
            </span>
          </div>
        )}
        <span className="text-sm font-medium text-gray-700">{user.name}</span>
      </Menu.Button>

      <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        <div className="py-1">
          <Menu.Item>
            {({ active }) => (
              <Link
                href="/profile"
                className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}
              >
                Profile
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                href="/settings"
                className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}
              >
                Settings
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={onLogout}
                className={`${active ? 'bg-gray-100' : ''} block w-full text-left px-4 py-2 text-sm text-gray-700`}
              >
                Sign out
              </button>
            )}
          </Menu.Item>
        </div>
      </Menu.Items>
    </Menu>
  );
};
