'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { PublicLayout } from '@/components/layout/PublicLayout';

export default function BlogPage() {
  const { isLoading, user } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push('/signin?callbackUrl=/blog');
    }
  }, [isLoading, user, router]);

  const blogPosts = [
    {
      title: 'Introducing Disco: The Future of Team Chat',
      date: 'January 18, 2025',
      excerpt:
        "Today, we're excited to announce the launch of Disco, a new way for teams to communicate and collaborate.",
      author: 'The Disco Team',
    },
    {
      title: 'Building Better Team Communication',
      date: 'January 15, 2025',
      excerpt:
        "Learn how effective communication can transform your team's productivity and culture.",
      author: 'Sarah Johnson',
    },
    {
      title: 'Security at Disco: Our Approach',
      date: 'January 10, 2025',
      excerpt:
        "Discover how we keep your team's conversations and data secure.",
      author: 'John Smith',
    },
  ];

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded mb-6"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">Blog</h1>
          <p className="mt-4 text-xl text-gray-600">
            Latest news, updates, and insights from the Disco team
          </p>
        </div>

        <div className="mt-16 grid gap-8">
          {blogPosts.map((post, index) => (
            <article
              key={index}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{post.date}</span>
                <span className="text-sm text-gray-500">{post.author}</span>
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-gray-900">
                {post.title}
              </h2>
              <p className="mt-2 text-gray-600">{post.excerpt}</p>
              <div className="mt-4">
                <button className="text-blue-600 hover:text-blue-800 font-medium">
                  Read more →
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
            Load more posts
          </button>
        </div>
      </div>
    </PublicLayout>
  );
}
