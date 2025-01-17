import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Company
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/about" className="text-base text-gray-500 hover:text-gray-900">
                  About
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-base text-gray-500 hover:text-gray-900">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-base text-gray-500 hover:text-gray-900">
                  Press
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Support
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/help" className="text-base text-gray-500 hover:text-gray-900">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/safety" className="text-base text-gray-500 hover:text-gray-900">
                  Safety Center
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-base text-gray-500 hover:text-gray-900">
                  Community Guidelines
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/privacy" className="text-base text-gray-500 hover:text-gray-900">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-base text-gray-500 hover:text-gray-900">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-base text-gray-500 hover:text-gray-900">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Connect
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/contact" className="text-base text-gray-500 hover:text-gray-900">
                  Contact Us
                </Link>
              </li>
              <li>
                <a
                  href="https://twitter.com/discoapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-gray-500 hover:text-gray-900"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/discoapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-gray-500 hover:text-gray-900"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-400 text-center">
            &copy; {new Date().getFullYear()} DISCO! All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
