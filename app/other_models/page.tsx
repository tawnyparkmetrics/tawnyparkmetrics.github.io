"use client";
// import React, { useEffect, useState } from 'react';
// import { motion } from 'framer-motion';
import Link from 'next/link';
import { Barlow } from 'next/font/google';

interface NavigationHeaderProps {
    activeTab?: string;
  }

const barlow = Barlow({
    subsets: ['latin'],
    weight: ['700'], // Use 700 for bold text
});

const NavigationHeader: React.FC<NavigationHeaderProps> = ({ activeTab }) => {
    const tabs = [
      { name: 'Home', href: '/' },
      { name: "TPM", href: '/tpmmodelpage' },
      { name: 'Models', href: '/other_models' },
    ];
  
    return (
      <>
        {/* Fixed header */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#19191A] border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Navigation Tabs */}
              <div className="flex space-x-4">
                {tabs.map((tab) => (
                  <Link
                    key={tab.name}
                    href={tab.href}
                    className={`
                      px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                      ${activeTab === tab.name 
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'
                      }
                    `}
                  >
                    {tab.name}
                  </Link>
                ))}
              </div>
  
              {/* TPM Logo */}
              <div className={`${barlow.className} text-4xl font-bold text-white italic`}>
                TPM
              </div>
            </div>
          </div>
        </div>
        
        {/* Spacer div to prevent content from hiding behind fixed header */}
        <div className="h-16"></div>
      </>
    );
  };

export default function ModelsPage() {
    return (
      <main className="min-h-screen bg-[#19191A]">
        <NavigationHeader activeTab="Models" />
      </main>
    );
}