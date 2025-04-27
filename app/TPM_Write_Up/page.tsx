"use client";
import React from 'react';
import NavigationHeader from '@/components/NavigationHeader';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function TPMWriteUpPage() {
  return (
    <div className="min-h-screen bg-[#19191A]">
      <NavigationHeader activeTab="Max Savin" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            Max Savin's <span className="text-blue-400">Write Up</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            Coming soon: Detailed analysis and insights from Max Savin's draft board.
          </p>
          <Link 
            href="/TPM_Draft_Page"
            className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-blue-500/20 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors duration-200"
          >
            See the Draft Board Here
            <ChevronRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
} 