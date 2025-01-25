
'use client';

import React from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';

export default function BlogPage() {
  const blogPosts = [
    {
      title: 'Building a Safer Community',
      date: '2024-01-20',
      excerpt: "How we're using technology to create secure connections.",
      author: 'Safety Team',
      category: 'Safety'
    },
    {
      title: 'The Future of Social Discovery',
      date: '2024-01-15',
      excerpt: 'Exploring new ways to meet like-minded people safely.',
      author: 'Product Team',
      category: 'Product'
    },
    {
      title: 'Community Guidelines Update',
      date: '2024-01-10',
      excerpt: 'Important updates to our community standards and safety measures.',
      author: 'Trust & Safety',
      category: 'Updates'
    }
  ];

  return (
    <PublicLayout>
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Our Blog
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Latest updates, stories and announcements
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post, index) => (
              <div
                key={index}
                className="bg-white overflow-hidden shadow rounded-lg"
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="ml-4">
                      <div className="text-sm font-medium text-indigo-600">
                        {post.category}
                      </div>
                      <div className="text-xl font-semibold text-gray-900">
                        {post.title}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-base text-gray-500">{post.excerpt}</p>
                  </div>
                  <div className="mt-6 flex items-center">
                    <div className="flex-shrink-0">
                      <span className="sr-only">{post.author}</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {post.author}
                      </p>
                      <div className="flex space-x-1 text-sm text-gray-500">
                        <time dateTime={post.date}>{post.date}</time>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
