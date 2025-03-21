"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface NavigationHeaderProps {
  activeTab?: string;
}

const NavigationHeader: React.FC<NavigationHeaderProps> = ({ activeTab }) => {
  const [DraftDropdownOpen, setTpmDropdownOpen] = useState(false);
  const [NBADropdownOpen, setModelsDropdownOpen] = useState(false);
  const DraftDropdownRef = useRef<HTMLDivElement>(null);
  const NBADropdownRef = useRef<HTMLDivElement>(null);
  
  // Only Home as regular tab
  const homeTab = { name: 'Home', href: '/' };
  
  // TPM dropdown items
  const DraftDropdownItems = [
    { name: 'Max Savin', href: '/TPM_Draft_Page' },
    { name: 'Nick Kalinowski', href: '/Nick_Draft_Page' },
  ];
  
  // Models dropdown items
  const NBADropdownItems = [
    { name: 'Max Savin', href: '/TPM_FVC' },
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

  return (
    <>
      {/* Fixed header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#19191A] border-b border-gray-800">
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
              
              {/* TPM Dropdown */}
              <div className="relative" ref={DraftDropdownRef}>
                <button 
                  onClick={toggleTpmDropdown}
                  className={`
                    px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                    ${activeTab === 'TPM' 
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
                          href={item.href}
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                          role="menuitem"
                          onClick={() => setTpmDropdownOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Models Dropdown */}
              <div className="relative" ref={NBADropdownRef}>
                <button 
                  onClick={toggleModelsDropdown}
                  className={`
                    px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                    ${activeTab === 'Models' 
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
                
                {/* Models Dropdown menu */}
                {NBADropdownOpen && (
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      {NBADropdownItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                          role="menuitem"
                          onClick={() => setModelsDropdownOpen(false)}
                        >
                          {item.name}
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
    </>
  );
};

export default function Home() {
  return (
    <main className="min-h-screen bg-[#19191A]">
      <NavigationHeader activeTab="Nick Kalinowski"/>
    </main>
  );
}