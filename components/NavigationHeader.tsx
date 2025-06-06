"use client";
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
//import { X, ChevronDown } from 'lucide-react';
import ComingSoon from '@/components/ui/ComingSoon';

export interface NavigationHeaderProps {
  activeTab?: string;
}

export interface MenuItem {
  name: string;
  href: string;
  available: boolean;
  stage?: 'brainstorming' | 'development' | 'testing';
  subItems?: MenuItem[];
}

const NavigationHeader: React.FC<NavigationHeaderProps> = ({ activeTab }) => {
  const [DraftDropdownOpen, setTpmDropdownOpen] = useState(false);
  const [NBADropdownOpen, setModelsDropdownOpen] = useState(false);
  const DraftDropdownRef = useRef<HTMLDivElement>(null);
  const NBADropdownRef = useRef<HTMLDivElement>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState('');
  const [developmentStage, setDevelopmentStage] = useState<'brainstorming' | 'development' | 'testing'>('development');

  // Only Home as regular tab
  const homeTab = { name: 'Home', href: '/' };

  // TPM dropdown items
  const DraftDropdownItems = [
    {
      name: 'Max Savin',
      href: '#',
      available: true,
      subItems: [
        { name: 'Write Up', href: '/TPM_Write_Up', available: true },
        { name: 'Big Board', href: '/TPM_Draft_Page', available: true }
      ]
    },
    {
      name: 'Nick Kalinowski',
      href: '#',
      available: true,
      subItems: [
        { name: 'Write Up', href: 'https://medium.com/@kalidrafts/modeling-the-draft-building-a-predictive-big-board-for-future-nba-prospects-75f3122f3300', available: true },
        { name: 'Big Board', href: '/Nick_Draft_Page', available: true }
      ]
    }
  ];

  // Models dropdown items
  const NBADropdownItems = [
    { name: 'Max Savin', href: '/TPM_FVC', available: false, stage: 'testing' as const },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (DraftDropdownRef.current && !DraftDropdownRef.current.contains(event.target as Node)) {
        setTpmDropdownOpen(false);
      }
      if (NBADropdownRef.current && !NBADropdownRef.current.contains(event.target as Node)) {
        setModelsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleTpmDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setTpmDropdownOpen(!DraftDropdownOpen);
    if (NBADropdownOpen) setModelsDropdownOpen(false);
  };

  const handleItemClick = (e: React.MouseEvent, item: MenuItem) => {
    if (!item.available) {
      e.preventDefault();
      setComingSoonFeature(item.name);
      if (item.stage) {
        setDevelopmentStage(item.stage);
      }
      setShowComingSoon(true);
      setTpmDropdownOpen(false);
      setModelsDropdownOpen(false);
    } else if (item.href.startsWith('http')) {
      // For external links, open in new tab
      e.preventDefault();
      window.open(item.href, '_blank', 'noopener,noreferrer');
      setTpmDropdownOpen(false);
      setModelsDropdownOpen(false);
    }
  };

  const handleSupportClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open('https://buymeacoffee.com/tawnypark', '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* Fixed header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-[#19191A] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Navigation Tabs */}
            <div className="flex space-x-4">
              {/* Home tab */}
              <Link
                href={homeTab.href}
                className={`
                  px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                  ${activeTab === homeTab.name
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'
                  }
                `}
              >
                {homeTab.name}
              </Link>

              {/* Draft Dropdown */}
              <div className="relative" ref={DraftDropdownRef}>
                <button
                  onClick={toggleTpmDropdown}
                  className={`
                    px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                    ${activeTab === 'Draft'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'
                    }
                    flex items-center
                  `}
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={DraftDropdownOpen}
                >
                  Draft
                  <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Draft Dropdown menu */}
                {DraftDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      {DraftDropdownItems.map((item) => (
                        <div key={item.name}>
                          {item.subItems ? (
                            // Main item with sub-items
                            <div className="block px-4 py-2 text-sm text-blue-400 border-b border-gray-700">
                              {item.name}
                              <div className="mt-1 space-y-1">
                                {item.subItems.map((subItem) => (
                                  <Link
                                    key={subItem.name}
                                    href={subItem.available ? subItem.href : '#'}
                                    className={`
                                      block px-4 py-1 text-sm transition-colors duration-200
                                      ${subItem.available
                                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                        : 'text-gray-500 hover:bg-gray-700'
                                      }
                                    `}
                                    role="menuitem"
                                    onClick={(e) => handleItemClick(e, subItem)}
                                  >
                                    {subItem.name}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ) : (
                            // Regular item without sub-items
                            <Link
                              href={item.available ? item.href : '#'}
                              className={`
                                block px-4 py-2 text-sm transition-colors duration-200
                                ${item.available
                                  ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                  : 'text-gray-500 hover:bg-gray-700'
                                }
                              `}
                              role="menuitem"
                              onClick={(e) => handleItemClick(e, item)}
                            >
                              {item.name}
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* NBA Dropdown */}
              <div className="relative" ref={NBADropdownRef}>
                {/* <button
                  onClick={toggleModelsDropdown}
                  className={`
                    px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                    ${activeTab === 'NBA'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'
                    }
                    flex items-center
                  `}
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={NBADropdownOpen}
                >
                  NBA
                  <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button> */}

                {/* NBA Dropdown menu */}
                {NBADropdownOpen && (
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      {NBADropdownItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.available ? item.href : '#'}
                          className={`
                            block px-4 py-2 text-sm transition-colors duration-200
                            ${item.available
                              ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                              : 'text-gray-500 hover:bg-gray-700'
                            }
                          `}
                          role="menuitem"
                          onClick={(e) => handleItemClick(e, item)}
                        >
                          {item.name}
                          {!item.available && (
                            <span className="ml-2 text-xs text-gray-500"></span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* TPM Logo and Support button on the right */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSupportClick}
                className="px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700"
              >
                Support
              </button>
              <div className="flex items-center">
                <Image
                  src="/TPM_logo_designs/TPM Square (Dark with Map - no wordmark).png"
                  alt="TPM Logo"
                  width={60} // Adjust size as needed
                  height={60} // Adjust size as needed
                />
                {/* Hide TPM text on mobile, show on larger screens */}
                <div className={`ml-2 text-4xl font-bold text-white hidden sm:block`}>
                  TPM
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer div to prevent content from hiding behind fixed header */}
      <div className="h-16"></div>

      {/* Coming Soon overlay */}
      {showComingSoon && (
        <ComingSoon
          feature={comingSoonFeature}
          currentStage={developmentStage}
          onClose={() => setShowComingSoon(false)}
        />
      )}
    </>
  );
};

export default NavigationHeader;