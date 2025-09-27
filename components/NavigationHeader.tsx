"use client";
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
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
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
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
      name: 'Draft History',
      href: '/nba-draft-history',
      available: true
    },
    {
      name: 'Consensus',
      href: '#',
      available: true,
      subItems: [
        { name: 'Write Up', href: '/consensus-nba-draft-board-write-up', available: true },
        { name: 'Consensus Board', href: '/consensus-nba-draft-board', available: true }
      ]
    },
    {
      name: 'Max Savin',
      href: '#',
      available: true,
      subItems: [
        { name: 'Write Up', href: '/max-nba-draft-model-write-up', available: true },
        { name: 'Draft Board', href: '/max-nba-draft-board', available: true }
      ]
    },
    {
      name: 'Nick Kalinowski',
      href: '#',
      available: true,
      subItems: [
        { name: 'Write Up', href: 'https://medium.com/@kalidrafts/modeling-the-draft-building-a-predictive-big-board-for-future-nba-prospects-75f3122f3300', available: true },
        { name: 'Draft Board', href: '/nick-nba-draft-board', available: true }
      ]
    },
    {
      name: 'Andre Liu',
      href: '#',
      available: true,
      subItems: [
        { name: 'Write Up', href: 'https://medium.com/@andrelliu1/the-flagg-plant-score-a-predictive-evaluation-of-nba-prospects-42e8dd56cc9b', available: true },
        { name: 'Draft Board', href: '/andre-nba-draft-board', available: true }
      ]
    }
  ];

  // Models dropdown items
  const NBADropdownItems = [
    { name: 'Max Savin', href: '/TPM_FVC', available: false, stage: 'testing' as const },
  ];

  // Unified button styling classes
  const buttonBaseClasses = "px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-300";
  const buttonInactiveClasses = "bg-gray-800/20 text-gray-300 border border-gray-800 hover:border-gray-700";
  const buttonActiveClasses = "bg-blue-500/20 text-blue-400 border border-blue-500/30";

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (DraftDropdownRef.current && !DraftDropdownRef.current.contains(event.target as Node)) {
        setTpmDropdownOpen(false);
        setExpandedSection(null);
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
    setExpandedSection(null);
    if (NBADropdownOpen) setModelsDropdownOpen(false);
  };

  const toggleSection = (sectionName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedSection(expandedSection === sectionName ? null : sectionName);
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
    } else {
      // For internal links, close dropdown
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
          <div className="flex justify-between items-center h-16 relative">

            {/* Left Navigation */}
            <div className="flex space-x-4">
              {/* Home tab */}
              <Link
                href={homeTab.href}
                className={`${buttonBaseClasses} ${buttonInactiveClasses}`}
              >
                {homeTab.name}
              </Link>

              {/* Draft Dropdown */}
              <div className="relative" ref={DraftDropdownRef}>
                <button
                  onClick={toggleTpmDropdown}
                  className={`
                    ${buttonBaseClasses}
                    ${activeTab === 'Draft' ? buttonActiveClasses : buttonInactiveClasses}
                    flex items-center gap-1 md:gap-2
                  `}
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={DraftDropdownOpen}
                >
                  Draft
                  <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />
                </button>

                {/* Draft Dropdown menu */}
                {DraftDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-[#19191A] border border-gray-700 z-50">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      {DraftDropdownItems.map((item) => (
                        <div key={item.name}>
                          {/* Check if item has subItems to determine if it's expandable */}
                          {item.subItems ? (
                            <>
                              {/* Main section header */}
                              <button
                                className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-400 hover:bg-gray-800/50 transition-colors duration-200"
                                onClick={(e) => toggleSection(item.name, e)}
                              >
                                <span>{item.name}</span>
                                <ChevronDown
                                  className={`h-4 w-4 transition-transform duration-200 ${expandedSection === item.name ? 'rotate-180' : ''
                                    }`}
                                />
                              </button>

                              {/* Expanded sub-items */}
                              {expandedSection === item.name && (
                                <div className="bg-gray-800/30 border-t border-gray-700">
                                  {item.subItems.map((subItem) => (
                                    <Link
                                      key={subItem.name}
                                      href={subItem.available ? subItem.href : '#'}
                                      className="block px-8 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors duration-200"
                                      role="menuitem"
                                      onClick={(e) => handleItemClick(e, subItem)}
                                    >
                                      {subItem.name}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </>
                          ) : (
                            /* Direct link item (like Consensus) */
                            <Link
                              href={item.available ? item.href : '#'}
                              className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white transition-colors duration-200"
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

              {/* NBA Dropdown - keeping the same structure for consistency */}
              <div className="relative" ref={NBADropdownRef}>
                {/* NBA button is commented out in original, keeping it that way */}
                {NBADropdownOpen && (
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-[#19191A] border border-gray-700 z-50">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      {NBADropdownItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.available ? item.href : '#'}
                          className={`
                            block px-4 py-2 text-sm transition-colors duration-200
                            ${item.available
                              ? 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                              : 'text-gray-500 hover:bg-gray-800/50'
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

            {/* Centered Brand Text Only */}
            <Link
              href="/"
              className="absolute left-1/2 transform -translate-x-1/2 group cursor-pointer"
            >
              {/* Animated text */}
              <div className="hidden md:block">
                <div className="text-2xl font-bold text-gray-500 tracking-wide
                  transition-all duration-500 ease-out relative overflow-hidden
                  group-hover:text-white group-hover:drop-shadow-glow">
                  TAWNY PARK METRICS
                </div>
              </div>

              {/* Mobile version - just TPM */}
              <div className="md:hidden text-2xl font-bold text-gray-500 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:via-white group-hover:to-white group-hover:bg-clip-text transition-all duration-500 ease-out">
                TPM
              </div>
            </Link>

            {/* Right side - Support button and Logo */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSupportClick}
                className={`${buttonBaseClasses} ${buttonInactiveClasses}`}
              >
                Support
              </button>
              <Link href="/" className="flex items-center group">
                <Image
                  src="/TPM_logo_designs/TPM Square (Dark with Map - no wordmark).png"
                  alt="TPM Logo"
                  width={60}
                  height={60}
                  className="transition-transform duration-300 cursor-pointer"
                />
              </Link>
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