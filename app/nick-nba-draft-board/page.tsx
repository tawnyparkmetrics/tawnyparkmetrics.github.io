"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { LucideUser, X, ChevronDown, SlidersHorizontal } from 'lucide-react';
import Papa from 'papaparse';
import { Barlow } from 'next/font/google';
import { motion } from 'framer-motion';
// import Link from 'next/link';
import { Search, Table as TableIcon } from 'lucide-react';
import { Input } from '@/components/ui/input'; // Import the Input component
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import NavigationHeader from '@/components/NavigationHeader';
import DraftPageHeader from '@/components/DraftPageHeader';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { GoogleAnalytics } from '@next/third-parties/google';
import CustomSelector, { ColumnConfig } from '@/components/CustomSelector';


export interface DraftProspect {
  Name: string;
  'Actual Pick': string;
  'NBA Team': string;
  'Pre-NBA': string;
  'League': string; 

  'Height': string;
  'Height (in)': string;
  'Weight (lbs)': string;
  'Role': string;
  'Age': string;
  'Wingspan': string;
  'Wingspan (in)': string;
  'Wing - Height': string;

  "NCAAM": string;

  Summary?: string;
  originalRank?: number;

  'ABV': string;

}

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['700'], // Use 700 for bold text
});

const collegeNames: { [key: string]: string } = {
  "UC Santa Barbara": "UCSB",
  "G League Ignite": "Ignite",
  "JL Bourg-en-Bresse": "JL Bourg",
  "Cholet Basket": "Cholet",
  "KK Crvena Zvezda": "KK Crvena",
  "Ratiopharm Ulm": "Ulm",
  "Washington State": "Washington St.",
  "KK Mega Basket": "KK Mega",
  "Melbourne United": "Melbourne Utd",
  "Eastern Kentucky": "EKU",
  "Western Carolina": "WCU",
  "KK Cedevita Olimpija": "KK C. Olimpija",
  "North Dakota State": "NDSU",
  "Delaware Blue Coats": "Del. Blue Coats",
  "Pallacanestro Reggiana": "Reggiana"
}

const draftShort: { [key: string]: string } = {
  "G League Elite Camp": "G League Elite",
  "Portsmouth Invitational": "P.I.T."
}

// interface MenuItem {
//   name: string;
//   href: string;
//   available: boolean;
//   stage?: 'brainstorming' | 'development' | 'testing';
// }

const NBATeamLogo = ({ NBA }: { NBA: string }) => {
  const [logoError, setNBALogoError] = useState(false);
  const teamLogoUrl = `/nbateam_logos/${NBA}.png`;

  if (logoError) {
    return <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
      <span className="text-xs text-gray-400">{NBA}</span>
    </div>;
  }

  return (
    <div className="h-16 w-16 relative">
      <Image
        src={teamLogoUrl}
        alt={`${NBA} logo`}
        fill
        className="object-contain"
        onError={() => setNBALogoError(true)}
      />
    </div>
  );
};

const PreNBALogo = ({ preNBA }: { preNBA: string }) => {
  const [logoError, setPreNBALogoError] = useState(false);
  const teamLogoUrl = `/prenba_logos/${preNBA}.png`;

  if (logoError) {
    return <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
      <span className="text-xs text-gray-400">{preNBA}</span>
    </div>;
  }

  return (
    <div className="h-6 w-6 relative">
      <Image
        src={teamLogoUrl}
        alt={`${preNBA} logo`}
        fill
        className="object-contain"
        onError={() => setPreNBALogoError(true)}
      />
    </div>
  );
};

const TableTeamLogo = ({ NBA }: { NBA: string }) => {
  const [logoError, setNBALogoError] = useState(false);
  const teamLogoUrl = `/nbateam_logos/${NBA}.png`;

  if (logoError) {
    return <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
      <span className="text-xs text-gray-400">{NBA}</span>
    </div>;
  }

  return (
    <div className="h-6 w-6 relative">
      <Image
        src={teamLogoUrl}
        alt={`${NBA} logo`}
        fill
        className="object-contain"
        onError={() => setNBALogoError(true)}
      />
    </div>
  );
};

// Add LeagueLogo component after the existing logo components
const LeagueLogo = ({ league }: { league: string }) => {
  const [logoError, setLogoError] = useState(false);
  const logoUrl = `/league_logos/${league}.png`;

  if (logoError) {
    return <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
      <span className="text-xs text-gray-400">{league}</span>
    </div>;
  }

  return (
    <div className="h-6 w-6 relative">
      <Image
        src={logoUrl}
        alt={`${league} logo`}
        fill
        className="object-contain"
        onError={() => setLogoError(true)}
      />
    </div>
  );
};

const ProspectCard: React.FC<{
  prospect: DraftProspect;
  filteredProspects: DraftProspect[];
  allProspects: DraftProspect[];
  selectedSortKey: string;
  draftYear: '2025' | '2024'; // Add this prop
  rankingSystem: Map<string, number>; // Add ranking system prop
}> = ({ prospect, draftYear, rankingSystem }) => {
  // Get the original rank from the ranking system
  const actualRank = rankingSystem.get(prospect.Name) || 1;

  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [, setIsDropdownOpen] = useState(false);
  const DraftDropdownRef = useRef<HTMLDivElement>(null);
  const NBADropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (DraftDropdownRef.current && !DraftDropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (NBADropdownRef.current && !NBADropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Set initial value
    checkMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile && !isExpanded) {
      setIsHovered(false);
    }
  };

  // Handle card click for mobile
  const handleCardClick = () => {
    if (isMobile) {
      setIsExpanded(!isExpanded);
    }
  };

  // Update hover state when dropdown is expanded
  useEffect(() => {
    if (isExpanded && !isMobile) {
      setIsHovered(true);
    }
  }, [isExpanded, isMobile]);

  // Dynamic image path based on draft year
  const playerImageUrl = `/player_images${draftYear}/${prospect.Name} BG Removed.png`;
  const prenbalogoUrl = `/prenba_logos/${prospect['Pre-NBA']}.png`;

  // Helper function to get draft display text
  const getDraftDisplayText = () => {
    const actualPick = prospect['Actual Pick'];
    const team = isMobile ? prospect.ABV : prospect['NBA Team'];
    if (actualPick && actualPick.trim() !== '') {
      return `${actualPick} - ${team}`;
    } else {
      // Fallback to current logic
      return Number(prospect['Actual Pick']) >= 59 ? "Undrafted" :
        `${prospect['Actual Pick']}${draftYear === '2024' ? ' - ' : ' '}${prospect['NBA Team'] !== 'NCAA' ? (draftShort[prospect['NBA Team']] || prospect['NBA Team']) : 'Unsigned'}`;
    }
  };

  return (
    <div className={`mx-auto px-4 mb-4 ${isMobile ? 'max-w-sm' : 'max-w-5xl'}`}>
      <motion.div layout="position" transition={{ layout: { duration: 0.3, ease: "easeInOut" } }}>
        <div className="relative">
          {/* Main card container */}
          <div
            className={`
              relative overflow-hidden transition-all duration-300 border rounded-xl border-gray-700/50 shadow-[0_0_15px_rgba(255,255,255,0.07)] 
              ${!isMobile ? 'h-[400px] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:border-gray-600/50' : 'h-[100px]'}
            `}
            style={{ backgroundColor: '#19191A' }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleCardClick}
          >
            {/* Rank Number */}
            <motion.div
              layout="position"
              className={`
                ${barlow.className}
                ${isMobile ? 'absolute top-1 right-3 z-20' : 'absolute top-6 right-8 z-20 transition-opacity duration-300'}
                ${((isHovered && !isMobile) || isExpanded) ? 'opacity-100' : 'opacity-100'}
              `}
            >
              <div className={`
                ${barlow.className} 
                ${isMobile ? 'text-1xl' : 'text-6xl'} 
                font-bold
                text-white
                select-none
                ${((isHovered && !isMobile) || isExpanded) ? (!isMobile ? 'mr-[300px]' : '') : ''} 
              `}>
                {actualRank}
              </div>
            </motion.div>

            {/* Background Pre-NBA Logo */}
            <div className={`
              absolute inset-0 flex items-center justify-start 
              ${isMobile ? 'pl-4' : 'pl-12'} 
              transition-opacity duration-300 
              ${((isHovered && !isMobile) || isExpanded) ? 'opacity-90' : 'opacity-20'}
            `}>
              {!logoError ? (
                <Image
                  src={prenbalogoUrl}
                  alt={prospect['Pre-NBA']}
                  width={isMobile ? 70 : 200}
                  height={isMobile ? 70 : 200}
                  className={`object-contain transition-transform duration-300 ${((isHovered && !isMobile) || isExpanded) ? 'scale-105 grayscale-0' : 'grayscale'}`}
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className={`${isMobile ? 'w-24 h-24' : 'w-48 h-48'} bg-gray-800 rounded-full flex items-center justify-center`}>
                  <span className={`${isMobile ? 'text-sm' : 'text-xl'} text-gray-400`}>{prospect['Pre-NBA']}</span>
                </div>
              )}
            </div>

            {/* Player Image */}
            <div className="absolute inset-0 flex justify-center items-end overflow-hidden">
              <div className={`relative ${isMobile ? 'w-[90%] h-[90%]' : 'w-[90%] h-[90%]'}`}>
                {!imageError ? (
                  <div className="relative w-full h-full flex items-end justify-center">
                    <Image
                      src={playerImageUrl}
                      alt={prospect.Name}
                      fill
                      className={`
                        object-contain 
                        object-bottom
                        transition-all duration-300 
                        ${((isHovered && !isMobile) || isExpanded) ? 'scale-105 grayscale-0' : 'grayscale'}
                      `}
                      onError={() => setImageError(true)}
                      sizes={isMobile ? "400px" : "800px"}
                      priority
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <LucideUser className="text-gray-500" size={isMobile ? 32 : 48} />
                  </div>
                )}
              </div>
            </div>

            {/* Large Centered Name */}
            <motion.div
              layout="position"
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${((isHovered && !isMobile) || isExpanded) ? 'opacity-0' : 'opacity-100'}`}
            >
              <div className="text-center z-10">
                <h2 className={`
                  ${barlow.className} 
                  ${isMobile ? 'text-1xl' : 'text-7xl'}
                  font-bold 
                  text-white 
                  uppercase 
                  tracking-wider
                  [text-shadow:_0_1px_2px_rgb(0_0_0_/_0.4),_0_2px_4px_rgb(0_0_0_/_0.3),_0_4px_8px_rgb(0_0_0_/_0.5),_0_8px_16px_rgb(0_0_0_/_0.2)]
                `}>
                  {prospect.Name}
                </h2>
              </div>
            </motion.div>

            {/* Info panel - different for mobile/desktop */}
            {!isMobile && (
              // Desktop hover info panel
              <div
                className={`absolute top-0 right-0 h-full w-[300px] backdrop-blur-sm transition-all duration-300 rounded-r-lg ${(isHovered || isExpanded) ? 'opacity-100' : 'opacity-0 translate-x-4 pointer-events-none'}`}
                style={{ backgroundColor: 'rgba(25, 25, 26, 0.9)' }}
              >
                <div className="p-6 space-y-4 flex flex-col">
                  <h3 className="text-lg font-semibold text-white">{prospect.Name}</h3>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div><span className="font-bold text-white">Height  </span> {prospect.Height}</div>
                    <div><span className="font-bold text-white">Wingspan  </span> {prospect.Wingspan}</div>
                    <div><span className="font-bold text-white">Wing - Height  </span> {prospect['Wing - Height']}</div>
                    <div><span className="font-bold text-white">Weight </span> {prospect['Weight (lbs)']}</div>
                  </div>

                  <div className="pt-4 border-t border-gray-700">
                    <div className="space-y-2 text-sm text-gray-300">
                      <div><span className="font-bold text-white">Pre-NBA  </span> {prospect['Pre-NBA']}</div>
                      <div><span className="font-bold text-white">Position  </span> {prospect.Role}</div>
                      <div><span className="font-bold text-white">Draft Age  </span> {prospect.Age}</div>
                      <div>
                        <span className="font-bold text-white">Draft  </span>
                        {getDraftDisplayText()}
                      </div>
                    </div>
                  </div>

                  {/* NBA Team logo */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                    <NBATeamLogo NBA={prospect['NBA Team']} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Info Dropdown */}
          {isMobile && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-2 p-4 rounded-xl border border-gray-700/50 shadow-[0_0_15px_rgba(255,255,255,0.07)] relative"
              style={{ backgroundColor: 'rgba(25, 25, 26, 0.9)' }}
            >
              <h3 className="text-lg font-semibold text-white mb-2">{prospect.Name}</h3>
              <div className="grid grid-cols-2 gap-2">
                {/* Draft Information Column */}
                <div>
                  <h4 className="font-semibold text-white text-sm mb-1">Draft Information</h4>
                  <div className="space-y-1 text-xs text-gray-300">
                    <div>
                      <span className="font-bold text-white">Pre-NBA </span>
                      {collegeNames[prospect['Pre-NBA']]
                        ? collegeNames[prospect['Pre-NBA']]
                        : prospect['Pre-NBA']}
                    </div>
                    <div><span className="font-bold text-white">Position </span> {prospect.Role}</div>
                    <div><span className="font-bold text-white">Draft Age </span> {prospect.Age}</div>
                    <div>
                      <span className="font-bold text-white">Draft </span>
                      {getDraftDisplayText()}
                    </div>
                  </div>
                </div>

                {/* Physicals Column */}
                <div className="ml-2">
                  <h4 className="font-semibold text-white text-sm mb-1">Physicals</h4>
                  <div className="space-y-1 text-xs text-gray-300">
                    <div><span className="font-bold text-white">Height </span> {prospect.Height}</div>
                    <div><span className="font-bold text-white">Wingspan </span> {prospect.Wingspan}</div>
                    <div><span className="font-bold text-white">Wing - Height </span> {prospect['Wing - Height']}</div>
                    <div><span className="font-bold text-white">Weight </span> {prospect['Weight (lbs)']}</div>
                  </div>
                </div>
              </div>
              {/* Team Logo in Top Right */}
              <div className="absolute top-3.5 right-3.5 transform scale-50 origin-top-right">
                <NBATeamLogo NBA={prospect['NBA Team']} />
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Divider - only show for desktop */}
      {!isMobile && (
        <div>
          <div className="h-px w=3/4 bg-gray my-5" />
          <div className="h-px w-full bg-gray-700/30 my -8" />
          <div className="h-px w=3/4 bg-gray my-5" />
        </div>
      )}
    </div>
  );
};

type RankType = number | 'N/A';

interface ProspectFilterProps {
  prospects: DraftProspect[];
  onFilteredProspectsChange?: (filteredProspects: DraftProspect[]) => void;
  rank: Record<string, RankType>;
  onViewModeChange?: (mode: 'card' | 'table') => void; // New prop
  draftYear: '2025' | '2024';
  onDraftYearChange: (year: '2025' | '2024') => void;
  onFilterStateChange?: (filterState: { filter: 'NCAA' | 'Int', roleFilter: 'all' | 'Guard' | 'Wing' | 'Big' }) => void;
}

const ProspectFilter: React.FC<ProspectFilterProps> = ({
  prospects,
  onFilteredProspectsChange,
  onViewModeChange,
  draftYear,
  onDraftYearChange,
  onFilterStateChange
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filter, setFilter] = useState<'NCAA' | 'Int'>('NCAA');
  const [roleFilter, setRoleFilter] = useState<'all' | 'Guard' | 'Wing' | 'Big'>('all');
  const [, setLocalFilteredProspects] = useState(prospects);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  // const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (onViewModeChange) {
      onViewModeChange(viewMode);
    }
  }, [viewMode, onViewModeChange]);

  // Notify parent component of filter state changes (excluding search)
  useEffect(() => {
    if (onFilterStateChange) {
      onFilterStateChange({ filter, roleFilter });
    }
  }, [filter, roleFilter, onFilterStateChange]);

  const hasActiveFilters = () => {
    return (
      roleFilter !== 'all' ||
      searchQuery !== ''
    );
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilter('NCAA');
    setRoleFilter('all');
    setLocalFilteredProspects(prospects);
    setIsMobileFilterOpen(false);

    if (onFilteredProspectsChange) {
      onFilteredProspectsChange(prospects);
    }
  };

  useEffect(() => {
    let results = prospects;

    if (filter === 'NCAA') {
      results = results.filter((prospect) => prospect.NCAAM === '1');
    } else if (filter === 'Int') {
      results = results.filter((prospect) => prospect.NCAAM === '0');
    }

    if (roleFilter !== 'all') {
      results = results.filter((prospect) => prospect.Role === roleFilter);
    }

    if (searchQuery) {
      const searchTermLower = searchQuery.toLowerCase();
      results = results.filter(
        (prospect) =>
          prospect.Name.toLowerCase().includes(searchTermLower) ||
          (prospect['Pre-NBA'] && prospect['Pre-NBA'].toLowerCase().includes(searchTermLower)) ||
          (prospect['NBA Team'] && prospect['NBA Team'].toLowerCase().includes(searchTermLower))
      );
    }

    setLocalFilteredProspects(results);

    if (onFilteredProspectsChange) {
      onFilteredProspectsChange(results);
    }
  }, [prospects, filter, searchQuery, roleFilter, onFilteredProspectsChange]);

  function handleYearChange(year: '2025' | '2024'): void {
    onDraftYearChange(year);
  }

  return (
    <div className="sticky top-14 z-30 bg-[#19191A] border-b border-gray-800 max-w-6xl mx-auto">
      {/* Mobile Initial Filter Section */}
      <div className="sm:hidden px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Filter Toggle Button - Left Side */}
          <motion.button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="flex items-center bg-gray-800/20 text-gray-300 border border-gray-800 rounded-lg px-3 py-2 text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SlidersHorizontal className="mr-1 h-4 w-4" />
            Filters
            <ChevronDown className={`ml-1 h-4 w-4 transform transition-transform ${isMobileFilterOpen ? 'rotate-180' : ''}`} />
          </motion.button>

          {/* Year Dropdown and View Mode Toggle Container */}
          <div className="flex items-center gap-2">
            {/* Year Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button
                  className={`
                    px-2 py-2 rounded-lg text-sm font-medium
                    transition-all duration-300
                    bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700
                    flex items-center gap-1
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {draftYear}
                  <ChevronDown className="h-4 w-4" />
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-32 bg-[#19191A] border-gray-700">
                <DropdownMenuItem
                  className="text-gray-400 hover:bg-gray-800/50 cursor-pointer"
                  onClick={() => handleYearChange('2025')}
                >
                  2025
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-gray-400 hover:bg-gray-800/50 cursor-pointer"
                  onClick={() => handleYearChange('2024')}
                >
                  2024
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Mode Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button
                  className="px-3 py-2 rounded-lg text-sm font-medium flex items-center transition-all duration-300 bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Only show icons on desktop, not on mobile */}
                  <span className="sm:hidden">{viewMode === 'card' ? 'Card View' : viewMode === 'table' ? 'Table View' : 'Card View'}</span>
                  <span className="hidden sm:flex items-center">
                  {viewMode === 'card' ? (
                    <>
                      <LucideUser className="mr-1 h-4 w-4" />
                      Card View
                    </>
                  ) : viewMode === 'table' ? (
                    <>
                      <TableIcon className="mr-1 h-4 w-4" />
                      Table View
                    </>
                  ) : (
                    <>
                      <LucideUser className="mr-1 h-4 w-4" />
                      Card View
                    </>
                  )}
                  </span>
                  <ChevronDown className="ml-1 h-4 w-4" />
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#19191A] border-gray-700">
                {/* Mobile: No icons, single-line text */}
                <DropdownMenuItem
                  className={`text-gray-400 hover:bg-gray-800/50 cursor-pointer rounded-md sm:hidden ${viewMode === 'card' ? 'bg-blue-500/20 text-blue-400' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setViewMode('card');
                  }}
                >
                  Card View
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={`text-gray-400 hover:bg-gray-800/50 cursor-pointer rounded-md sm:hidden ${viewMode === 'table' ? 'bg-blue-500/20 text-blue-400' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setViewMode('table');
                  }}
                >
                  Table View
                </DropdownMenuItem>
                {/* Desktop: With icons */}
                <DropdownMenuItem
                  className={`hidden sm:flex text-gray-400 hover:bg-gray-800/50 cursor-pointer rounded-md ${viewMode === 'card' ? 'bg-blue-500/20 text-blue-400' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setViewMode('card');
                  }}
                >
                  <div className="flex items-center gap-2">
                    <LucideUser className="h-4 w-4" />
                    Card View
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={`hidden sm:flex text-gray-400 hover:bg-gray-800/50 cursor-pointer rounded-md ${viewMode === 'table' ? 'bg-blue-500/20 text-blue-400' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setViewMode('table');
                  }}
                >
                  <div className="flex items-center gap-2">
                    <TableIcon className="h-4 w-4" />
                    Table View
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Filter Content (Desktop and Mobile Dropdown) */}
      <div className={`
        px-4 py-3 
        sm:grid sm:grid-cols-[1fr_auto] sm:gap-4 
        flex flex-col
        ${isMobileFilterOpen ? 'block' : 'hidden sm:grid'}
      `}>
        {/* Search and Reset Section */}
        <div className="flex flex-wrap items-center w-full mb-3 sm:mb-0">
          <div className="relative flex-grow max-w-full mr-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-gray-800/20 border-gray-800 text-gray-300 placeholder-gray-500 rounded-lg focus:border-blue-500/30 focus:ring-1 focus:ring-blue-500/30"
            />
          </div>

          {/* Reset button - always visible */}
          <motion.button
            onClick={resetFilters}
            className={`
              ml-2 flex items-center px-3 py-2 rounded-lg text-xs
              transition-all duration-300
              ${hasActiveFilters()
                ? 'text-red-400 hover:text-red-300 bg-gray-800/20 border border-gray-800 hover:border-red-700/30'
                : 'text-gray-500 bg-gray-800/10 border border-gray-800/50 cursor-not-allowed'
              }
            `}
            whileHover={{ scale: hasActiveFilters() ? 1.05 : 1 }}
            whileTap={{ scale: hasActiveFilters() ? 0.95 : 1 }}
            disabled={!hasActiveFilters()}
          >
            <X className="h-4 w-4" />
            Reset
          </motion.button>
        </div>

        {/* Filters and View Mode Container */}
        <div className="w-full sm:hidden mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {/* League Filters */}
            <motion.button
              onClick={() => setFilter(filter === 'NCAA' ? 'Int' : 'NCAA')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${filter === 'NCAA' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              NCAA
            </motion.button>
            <motion.button
              onClick={() => setFilter(filter === 'Int' ? 'NCAA' : 'Int')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${filter === 'Int' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Int.+
            </motion.button>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-700/30 mx-1" />

            {/* Position Filters */}
            <motion.button
              onClick={() => setRoleFilter(roleFilter === 'Guard' ? 'all' : 'Guard')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${roleFilter === 'Guard' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Guards
            </motion.button>
            <motion.button
              onClick={() => setRoleFilter(roleFilter === 'Wing' ? 'all' : 'Wing')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${roleFilter === 'Wing' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Wings
            </motion.button>
            <motion.button
              onClick={() => setRoleFilter(roleFilter === 'Big' ? 'all' : 'Big')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${roleFilter === 'Big' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Bigs
            </motion.button>
          </div>
        </div>

        {/* Desktop Filters (unchanged) */}
        <div className="hidden sm:flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end space-x-2">
          {/* League Filters */}
          <div className="flex items-center space-x-2 mb-2 sm:mb-0">
            <motion.button
              onClick={() => setFilter(filter === 'NCAA' ? 'Int' : 'NCAA')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${filter === 'NCAA' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              NCAA
            </motion.button>
            <motion.button
              onClick={() => setFilter(filter === 'Int' ? 'NCAA' : 'Int')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${filter === 'Int' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Int. & G League
            </motion.button>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-700/30 mx-2" />

          {/* Position Filters */}
          <div className="flex items-center space-x-2 mb-2 sm:mb-0">
            <motion.button
              onClick={() => setRoleFilter(roleFilter === 'Guard' ? 'all' : 'Guard')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${roleFilter === 'Guard' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Guards
            </motion.button>
            <motion.button
              onClick={() => setRoleFilter(roleFilter === 'Wing' ? 'all' : 'Wing')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${roleFilter === 'Wing' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Wings
            </motion.button>
            <motion.button
              onClick={() => setRoleFilter(roleFilter === 'Big' ? 'all' : 'Big')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${roleFilter === 'Big' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Bigs
            </motion.button>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-700/30 mx-2" />

          {/* Draft Year Dropdown */}
          {/* Year Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                className={`
                    px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium
                    transition-all duration-300
                    bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700
                    flex items-center gap-1 md:gap-2
                  `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {draftYear}
                <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-32 bg-[#19191A] border-gray-700">
              <DropdownMenuItem
                className="text-gray-400 hover:bg-gray-800/50 cursor-pointer"
                onClick={() => handleYearChange('2025')}
              >
                2025
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-gray-400 hover:bg-gray-800/50 cursor-pointer"
                onClick={() => handleYearChange('2024')}
              >
                2024
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-700/30 mx-2" />

          {/* Desktop View Mode Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                className="px-3 py-2 rounded-lg text-sm font-medium flex items-center transition-all duration-300 bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {viewMode === 'card' ? (
                  <>
                    <LucideUser className="mr-2 h-4 w-4" />
                    Card View
                  </>
                ) : (
                  <>
                    <TableIcon className="mr-2 h-4 w-4" />
                    Table View
                  </>
                )}
                <ChevronDown className="ml-2 h-4 w-4" />
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#19191A] border-gray-700">
              <DropdownMenuItem
                className={`text-gray-400 hover:bg-gray-800/50 cursor-pointer rounded-md ${viewMode === 'card' ? 'bg-blue-500/20 text-blue-400' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setViewMode('card');
                }}
              >
                <div className="flex items-center gap-2">
                  <LucideUser className="h-4 w-4" />
                  Card View
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                className={`text-gray-400 hover:bg-gray-800/50 cursor-pointer rounded-md ${viewMode === 'table' ? 'bg-blue-500/20 text-blue-400' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setViewMode('table');
                }}
              >
                <div className="flex items-center gap-2">
                  <TableIcon className="h-4 w-4" />
                  Table View
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default function NickDraftPage() {
  const [prospects, setProspects] = useState<DraftProspect[]>([]);
  const [filteredProspects, setFilteredProspects] = useState<DraftProspect[]>([]);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [draftYear, setDraftYear] = useState<'2025' | '2024'>('2025');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof DraftProspect | 'Rank';
    direction: 'ascending' | 'descending';
  } | null>(null);
  const [loadedProspects, setLoadedProspects] = useState<number>(5);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [selectedSortKey,] = useState<string>('Actual Pick');
  const [filterState, setFilterState] = useState<{ filter: 'NCAA' | 'Int', roleFilter: 'all' | 'Guard' | 'Wing' | 'Big' }>({
    filter: 'NCAA',
    roleFilter: 'all'
  });
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { key: 'Rank', label: 'Rank', category: 'Basic Info', visible: true, sortable: true },
    { key: 'Name', label: 'Name', category: 'Basic Info', visible: true, sortable: true },
    { key: 'Role', label: 'Position', category: 'Basic Info', visible: true, sortable: true },
    { key: 'League', label: 'League', category: 'Team Info', visible: true, sortable: true },
    { key: 'Pre-NBA', label: 'Pre-NBA', category: 'Team Info', visible: true, sortable: true },
    { key: 'Actual Pick', label: 'Draft Pick', category: 'Team Info', visible: true, sortable: true },
    { key: 'NBA Team', label: 'NBA Team', category: 'Team Info', visible: true, sortable: true },
    { key: 'Age', label: 'Age', category: 'Basic Info', visible: false, sortable: true },
    { key: 'Height', label: 'Height', category: 'Physical', visible: false, sortable: true },
    { key: 'Wingspan', label: 'Wingspan', category: 'Physical', visible: false, sortable: true },
    { key: 'Wing - Height', label: 'Wing-Height', category: 'Physical', visible: false, sortable: true },
    { key: 'Weight (lbs)', label: 'Weight', category: 'Physical', visible: false, sortable: true },
  ]);
  const [columnSelectorOpen, setColumnSelectorOpen] = useState(false);

  // Create a separate ranking system that's independent of search filters but includes position and other filters
  const rankingSystem = useMemo(() => {
    // Apply the same filters as the ProspectFilter component (excluding search)
    let validProspects = [...prospects];

    // Apply NCAA/Int filter
    if (filterState.filter === 'NCAA') {
      validProspects = validProspects.filter((prospect) => prospect.NCAAM === '1');
    } else if (filterState.filter === 'Int') {
      validProspects = validProspects.filter((prospect) => prospect.NCAAM === '0');
    }

    // Apply role filter
    if (filterState.roleFilter !== 'all') {
      validProspects = validProspects.filter((prospect) => prospect.Role === filterState.roleFilter);
    }

    // Create a ranking map based on the filtered prospects order
    const rankingMap = new Map<string, number>();
    validProspects.forEach((prospect, index) => {
      rankingMap.set(prospect.Name, index + 1);
    });
    return rankingMap;
  }, [prospects, filterState]); // Include filterState but NOT searchQuery

  useEffect(() => {
    document.title = `Nick NBA Draft Board`;
  }, [draftYear]);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Set initial value
    checkMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    async function fetchDraftProspects() {
      try {
        // Reset state when switching years
        setLoadedProspects(5);
        setHasMore(true);

        const response = await fetch(`/Nick Kalinowski ${draftYear} NBA Draft Results.csv`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const csvText = await response.text();

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const prospectData = results.data as DraftProspect[];
            console.log(`Loaded ${prospectData.length} prospects for ${draftYear}`);
            setProspects(prospectData);
            setFilteredProspects(prospectData);
          },
        });
      } catch (error) {
        console.error(`Error fetching ${draftYear} draft prospects:`, error);
      }
    }

    fetchDraftProspects();
  }, [draftYear]);

  // Function to handle sorting
  const handleSort = (key: keyof DraftProspect | 'Rank') => {
    let direction: 'ascending' | 'descending' = 'ascending';

    // If already sorting by this key, toggle direction
    if (sortConfig && sortConfig.key === key) {
      direction = sortConfig.direction === 'ascending' ? 'descending' : 'ascending';
    }

    setSortConfig({ key, direction });
  };

  // Apply sorting to the filtered prospects
  const sortedProspects = useMemo(() => {
    const sortableProspects = [...filteredProspects];

    if (!sortConfig) {
      return sortableProspects;
    }

    sortableProspects.sort((a, b) => {
      // Handle Rank column specially
      if (sortConfig.key === 'Rank') {
        const aIndex = filteredProspects.findIndex(p => p.Name === a.Name);
        const bIndex = filteredProspects.findIndex(p => p.Name === b.Name);
        return sortConfig.direction === 'ascending' ? aIndex - bIndex : bIndex - aIndex;
      }

      let aValue = a[sortConfig.key as keyof DraftProspect];
      let bValue = b[sortConfig.key as keyof DraftProspect];

      // Helper function to check if a value is N/A, empty, or undefined
      const isNAValue = (value: string | number | undefined | null): boolean => {
        return value === undefined || 
               value === null || 
               value === '' || 
               String(value).toLowerCase() === 'n/a' ||
               String(value).toLowerCase() === 'na';
      };

      // Check if either value is N/A - N/A values always go to the end
      const aIsNA = isNAValue(aValue);
      const bIsNA = isNAValue(bValue);

      if (aIsNA && !bIsNA) return 1;  // a goes after b
      if (!aIsNA && bIsNA) return -1; // a goes before b
      if (aIsNA && bIsNA) return 0;   // both are N/A, maintain order

      // Handle specific columns
      if (sortConfig.key === 'Actual Pick') {
        const aNum = parseInt(aValue as string) || 99;
        const bNum = parseInt(bValue as string) || 99;
        return sortConfig.direction === 'ascending' ? aNum - bNum : bNum - aNum;
      }

      if (sortConfig.key === 'Height') {
        // Use Height (in) for sorting instead of Height
        const aNum = parseFloat(a['Height (in)'] as string) || 0;
        const bNum = parseFloat(b['Height (in)'] as string) || 0;
        return sortConfig.direction === 'ascending' ? aNum - bNum : bNum - aNum;
      }

      if (sortConfig.key === 'Wingspan') {
        // Use Wingspan (in) for sorting instead of Wingspan
        const aNum = parseFloat(a['Wingspan (in)'] as string) || 0;
        const bNum = parseFloat(b['Wingspan (in)'] as string) || 0;
        return sortConfig.direction === 'ascending' ? aNum - bNum : bNum - aNum;
      }

      if (sortConfig.key === 'Weight (lbs)') {
        const aNum = parseInt(aValue as string) || 0;
        const bNum = parseInt(bValue as string) || 0;
        return sortConfig.direction === 'ascending' ? aNum - bNum : bNum - aNum;
      }

      // For numeric columns, try to parse as numbers
      const aNum = parseFloat(aValue as string);
      const bNum = parseFloat(bValue as string);
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        // Both are valid numbers
        return sortConfig.direction === 'ascending' ? aNum - bNum : bNum - aNum;
      }

      // Default string comparison for non-numeric values
      if (aValue === undefined) aValue = '';
      if (bValue === undefined) bValue = '';

      if (sortConfig.direction === 'ascending') {
        return String(aValue).localeCompare(String(bValue));
      } else {
        return String(bValue).localeCompare(String(aValue));
      }
    });

    return sortableProspects;
  }, [filteredProspects, sortConfig]);

  // Render the table with sorting functionality
  const ProspectTable = ({
    rankingSystem,
    columns,
    setColumns,
    isOpen,
    onToggle
  }: {
    prospects: DraftProspect[],
    rank: Record<string, RankType>,
    rankingSystem: Map<string, number>,
    columns: ColumnConfig[],
    setColumns: React.Dispatch<React.SetStateAction<ColumnConfig[]>>,
    isOpen: boolean,
    onToggle: () => void
  }) => {
    // Helper function to get draft display text for table
    const getTableDraftText = (prospect: DraftProspect) => {
      const actualPick = prospect['Actual Pick'];
      if (actualPick && actualPick.trim() !== '') {
        return actualPick;
      } else {
        return Number(prospect['Actual Pick']) >= 59 ? "Undrafted" : prospect['Actual Pick'];
      }
    };

    return (
      <div className="max-w-6xl mx-auto px-4 pt-2">
        {/* Column Selector */}
        <div className="mb-2">
          <CustomSelector
            columns={columns}
            onColumnsChange={setColumns}
            isOpen={isOpen}
            onToggle={onToggle}
          />
        </div>
        
        <div className="w-full overflow-x-auto bg-[#19191A] rounded-lg border border-gray-800">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.filter(col => col.visible).map((column) => (
                  <TableHead
                    key={column.key}
                    className={`text-gray-400 cursor-pointer hover:text-gray-200 whitespace-nowrap ${column.sortable ? '' : 'cursor-default'}`}
                    onClick={() => column.sortable && handleSort(column.key as keyof DraftProspect | 'Rank')}
                  >
                    {column.label}
                    {column.sortable && sortConfig?.key === column.key && (
                      <span className="ml-1">
                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                      </span>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProspects.map((prospect) => {
                // Get the original rank from the ranking system
                const originalRank = rankingSystem.get(prospect.Name) || 1;

                return (
                  <TableRow
                    key={prospect.Name}
                    className="hover:bg-gray-800/20"
                  >
                    {columns.filter(col => col.visible).map((column) => {
                      const key = column.key as keyof DraftProspect;
                      
                      // Handle special cases for different column types
                      if (column.key === 'Rank') {
                        return (
                          <TableCell key={column.key} className="text-gray-300">
                            {originalRank}
                          </TableCell>
                        );
                      }
                      
                      if (column.key === 'Name') {
                        return (
                          <TableCell key={column.key} className="font-medium text-gray-300 whitespace-nowrap">
                            {prospect.Name}
                          </TableCell>
                        );
                      }
                      
                      if (column.key === 'League') {
                        return (
                          <TableCell key={column.key} className="text-gray-300 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <LeagueLogo league={prospect.League} />
                              <span>{prospect.League}</span>
                            </div>
                          </TableCell>
                        );
                      }
                      
                      if (column.key === 'Pre-NBA') {
                        return (
                          <TableCell key={column.key} className="text-gray-300 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <PreNBALogo preNBA={prospect['Pre-NBA']} />
                              <span>{prospect['Pre-NBA']}</span>
                            </div>
                          </TableCell>
                        );
                      }
                      
                      if (column.key === 'Actual Pick') {
                        return (
                          <TableCell key={column.key} className="text-gray-300">
                            {getTableDraftText(prospect)}
                          </TableCell>
                        );
                      }
                      
                      if (column.key === 'NBA Team') {
                        return (
                          <TableCell key={column.key} className="text-gray-300 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <TableTeamLogo NBA={prospect['NBA Team']} />
                              <span>{prospect['NBA Team']}</span>
                            </div>
                          </TableCell>
                        );
                      }
                      
                      // Default case for other columns
                      const cellValue = prospect[key];
                      return (
                        <TableCell key={column.key} className="text-gray-300">
                          {String(cellValue || '')}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  // Handle scroll event for infinite loading - only on desktop
  useEffect(() => {
    if (viewMode !== 'card' || isLoading || !hasMore || isMobile) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (documentHeight - scrollPosition < 100) {
        setIsLoading(true);

        requestAnimationFrame(() => {
          setLoadedProspects(prev => {
            const newCount = prev + 5;
            setHasMore(newCount < filteredProspects.length);
            return newCount;
          });
          setIsLoading(false);
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [viewMode, isLoading, hasMore, filteredProspects.length, isMobile]);

  // Reset loaded prospects when filters change
  useEffect(() => {
    if (isMobile) {
      // On mobile, show all prospects
      setLoadedProspects(filteredProspects.length);
      setHasMore(false);
    } else {
      // On desktop, start with 5 prospects
      setLoadedProspects(5);
      setHasMore(filteredProspects.length > 5);
    }
  }, [filteredProspects, isMobile]);

  return (
    <div className="min-h-screen bg-[#19191A]">
      <NavigationHeader activeTab="Nick Kalinowski" />
      <DraftPageHeader author="Nick Kalinowski" />
      <GoogleAnalytics  gaId="G-X22HKJ13B7" />
      <ProspectFilter
        prospects={prospects}
        onFilteredProspectsChange={setFilteredProspects}
        rank={{}}
        onViewModeChange={setViewMode}
        draftYear={draftYear}
        onDraftYearChange={setDraftYear}
        onFilterStateChange={setFilterState}
      />

      <div className="max-w-6xl mx-auto px-4 pt-8">
        {filteredProspects.length > 0 ? (
          viewMode === 'card' ? (
            <div className="space-y-4">
              {filteredProspects.slice(0, isMobile ? filteredProspects.length : loadedProspects).map((prospect) => (
                <ProspectCard
                  key={prospect.Name}
                  prospect={prospect}
                  filteredProspects={filteredProspects}
                  allProspects={prospects}
                  selectedSortKey={selectedSortKey}
                  draftYear={draftYear}
                  rankingSystem={rankingSystem}
                />
              ))}
              {isLoading && !isMobile && (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
                </div>
              )}
            </div>
          ) : (
            <ProspectTable
              prospects={filteredProspects}
              rank={Object.fromEntries(
                filteredProspects.map((prospect) => [
                  prospect.Name,
                  prospect.originalRank ?? 'N/A'
                ])
              )}
              rankingSystem={rankingSystem}
              columns={columns}
              setColumns={setColumns}
              isOpen={columnSelectorOpen}
              onToggle={() => setColumnSelectorOpen(!columnSelectorOpen)}
            />
          )
        ) : (
          <div className="text-center py-8 text-gray-400">
            No prospects found matching your search criteria
          </div>
        )}
      </div>
    </div>
  );
}