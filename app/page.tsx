"use client";
import React from 'react';
import Link from 'next/link';
//import ComingSoon from '../components/ui/ComingSoon';
import NavigationHeader from '@/components/NavigationHeader';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#19191A]">
      <NavigationHeader activeTab="Home" />
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">Tawny Park Metrics (TPM)</h1>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Draft Boards Card */}
          <Link href="/TPM_Draft_Page" className="group">
            <div className="bg-gray-800/20 border border-gray-800 rounded-xl p-6 hover:border-blue-500/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]">
              <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">
                Draft Boards
              </h2>
              <p className="text-gray-400 mb-4">
                Explore comprehensive draft boards from our expert analysts. Get detailed insights into the top prospects and their potential impact.
              </p>
              <div className="flex items-center text-blue-400">
                <span className="text-sm font-medium">View Draft Boards</span>
                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* About Section */}
      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gray-800/20 border border-gray-800 rounded-xl p-8">
          <h2 className="text-3xl font-bold text-white mb-6">About TPM</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          </div>
        </div>
      </div> */}
    </main>
  );
}