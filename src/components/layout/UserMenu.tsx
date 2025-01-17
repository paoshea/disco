import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import Link from 'next/link';
import Image from 'next/image';
import { User } from '@/types/user';
import { useAuth } from '@/hooks/useAuth';

interface UserMenuProps {
  user: User;
}

export const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
  const { logout } = useAuth();

  return (
    <Menu as="div" className="relative ml-3">
      <div>
        <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
          <span className="sr-only">Open user menu</span>
          {user.profileImage ? (
            <Image
              className="h-8 w-8 rounded-full"
              src={user.profileImage}
              alt={`${user.firstName} ${user.lastName}`}
              width={32}
              height={32}
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-sm font-medium text-primary-600">
                {user.firstName[0]}
                {user.lastName[0]}
              </span>
            </div>
          )}
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <Menu.Item>
            {({ active }) => (
              <Link
                href="/profile"
                className={`${
                  active ? 'bg-gray-100' : ''
                } block px-4 py-2 text-sm text-gray-700`}
              >
                Your Profile
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                href="/settings"
                className={`${
                  active ? 'bg-gray-100' : ''
                } block px-4 py-2 text-sm text-gray-700`}
              >
                Settings
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                href="/safety"
                className={`${
                  active ? 'bg-gray-100' : ''
                } block px-4 py-2 text-sm text-gray-700`}
              >
                Safety Center
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={logout}
                className={`${
                  active ? 'bg-gray-100' : ''
                } block w-full px-4 py-2 text-left text-sm text-gray-700`}
              >
                Sign out
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
