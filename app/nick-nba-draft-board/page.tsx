"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { LucideUser, X, ChevronDown, SlidersHorizontal } from 'lucide-react';
import Papa from 'papaparse';
import { motion } from 'framer-motion';
// import Link from 'next/link';
import { Search, Table as TableIcon } from 'lucide-react';
import { Input } from '@/components/ui/input'; // Import the Input component
import NavigationHeader from '@/components/NavigationHeader';
import DraftPageHeader from '@/components/DraftPageHeader';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { GoogleAnalytics } from '@next/third-parties/google';
import { ColumnConfig, ProspectTable } from '@/components/ProspectTable';
import { BaseProspectCard } from '@/components/BaseProspectCard';


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

const NickPageProspectCard: React.FC<{
  prospect: DraftProspect;
  filteredProspects: DraftProspect[];
  allProspects: DraftProspect[];
  selectedSortKey: string;
  draftYear: '2025' | '2024';
  rankingSystem: Map<string, number>;
}> = ({ prospect, draftYear, rankingSystem }) => {
  const [, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Get the original rank from the ranking system
  const actualRank = rankingSystem.get(prospect.Name) || 1;

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

  const handleExpand = (expanded: boolean) => {
    setIsExpanded(expanded);
  };

  return (
    <BaseProspectCard
      prospect={prospect}
      rank={actualRank}
      selectedYear={parseInt(draftYear)}
      isMobile={isMobile}
      onExpand={handleExpand}
    >
      {/* No dropdown content - Nick's page just shows the card */}
    </BaseProspectCard>
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
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
              <Input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-gray-800/20 border-gray-800 text-gray-300 placeholder-gray-500 rounded-lg focus:border-blue-500/30 focus:ring-1 focus:ring-blue-500/30 sm:hidden"
              />
              <Input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-gray-800/20 border-gray-800 text-gray-300 placeholder-gray-500 rounded-lg focus:border-blue-500/30 focus:ring-1 focus:ring-blue-500/30 hidden sm:block"
              />
            </div>
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
              className={`w-20 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${roleFilter === 'Guard' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Guards
            </motion.button>
            <motion.button
              onClick={() => setRoleFilter(roleFilter === 'Wing' ? 'all' : 'Wing')}
              className={`w-20 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${roleFilter === 'Wing' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Wings
            </motion.button>
            <motion.button
              onClick={() => setRoleFilter(roleFilter === 'Big' ? 'all' : 'Big')}
              className={`w-20 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${roleFilter === 'Big' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'}`}
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
  const [loadedProspects, setLoadedProspects] = useState<number>(5);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [selectedSortKey,] = useState<string>('Actual Pick');
  const [filterState, setFilterState] = useState<{ filter: 'NCAA' | 'Int', roleFilter: 'all' | 'Guard' | 'Wing' | 'Big' }>({
    filter: 'NCAA',
    roleFilter: 'all'
  });

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

  // Replace the existing NickProspectTable component with:
  const NickProspectTable = ({ prospects, rankingSystem }: { prospects: DraftProspect[], rankingSystem: Map<string, number> }) => {
    const initialColumns: ColumnConfig[] = [
        { key: 'Rank', label: 'Rank', category: 'Basic Info', visible: true, sortable: true },
        { key: 'Name', label: 'Name', category: 'Basic Info', visible: true, sortable: true },
        { key: 'Role', label: 'Position', category: 'Basic Info', visible: true, sortable: true },
        { key: 'League', label: 'League', category: 'Team Info', visible: true, sortable: true },
        { key: 'Pre-NBA', label: 'Pre-NBA', category: 'Team Info', visible: true, sortable: true },
        { key: 'Actual Pick', label: 'Draft Pick', category: 'Team Info', visible: true, sortable: true },
        { key: 'NBA Team', label: 'NBA Team', category: 'Team Info', visible: true, sortable: true },
        { key: 'Age', label: 'Draft Age', category: 'Basic Info', visible: false, sortable: true },
        { key: 'Height', label: 'Height', category: 'Physical', visible: false, sortable: true },
        { key: 'Wingspan', label: 'Wingspan', category: 'Physical', visible: false, sortable: true },
        { key: 'Wing - Height', label: 'Wing-Height', category: 'Physical', visible: false, sortable: true },
        { key: 'Weight (lbs)', label: 'Weight', category: 'Physical', visible: false, sortable: true },
    ];

    return (
        <ProspectTable
            prospects={prospects.map(p => ({ ...p, Tier: (p as { Tier?: string; }).Tier ?? '' }))}
            rankingSystem={rankingSystem}
            initialColumns={initialColumns}
        />
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
      <GoogleAnalytics gaId="G-X22HKJ13B7" />
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
                <NickPageProspectCard
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
            <NickProspectTable
              prospects={filteredProspects}
              rankingSystem={rankingSystem}
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