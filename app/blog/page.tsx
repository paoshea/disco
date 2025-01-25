'use client';

import React from 'react';
//import { PublicLayout } from '@/components/layout/PublicLayout'; //Removed as PublicLayout is not used in the edited code

export default function BlogPage() {
  const blogPosts = [
    {
      title: 'Building a Safer Community',
      date: '2024-01-20',
      excerpt: "How we're using technology to create secure connections.",
      author: 'Safety Team',
      category: 'Safety',
    },
    {
      title: 'Dance Partner Matching',
      date: '2024-01-15',
      excerpt: 'Tips for finding the perfect dance partner.',
      author: 'Dance Team',
      category: 'Tips',
    },
    {
      title: 'Community Guidelines',
      date: '2024-01-10',
      excerpt: 'Our commitment to a respectful dance community.',
      author: 'Community Team',
      category: 'Community',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-2">{post.title}</h2>
            <p className="text-gray-600 mb-4">{post.excerpt}</p>
            <div className="flex justify-between text-sm text-gray-500">
              <span>{post.author}</span>
              <span>{post.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}