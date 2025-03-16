"use client";
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import ComingSoon from '../../components/ui/ComingSoon'; // Import the ComingSoon component

interface NavigationHeaderProps {
    activeTab?: string;
}

interface MenuItem {
    name: string;
    href: string;
    available: boolean;
    stage?: 'brainstorming' | 'development' | 'testing';
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
      { name: 'Max Savin', href: '/TPM_Draft_Page', available: true },
      { name: 'Nick Kalinowski', href: '/Nick_Draft_Page', available: false, stage: 'development' as const },
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
    
    const toggleModelsDropdown = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setModelsDropdownOpen(!NBADropdownOpen);
      if (DraftDropdownOpen) setTpmDropdownOpen(false);
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
      }
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
                
                {/* NBA Dropdown */}
                <div className="relative" ref={NBADropdownRef}>
                  <button 
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
                  </button>
                  
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
  
              {/* TPM Logo on the right */}
              <div className={`text-4xl font-bold text-white`}>
                TPM
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

export default function Home() {
  return (
    <main className="min-h-screen bg-[#19191A]">
      <NavigationHeader activeTab="Max Savin"/>
    </main>
  );
}