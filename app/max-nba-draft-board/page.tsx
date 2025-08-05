"use client";
import React, { useState, useMemo, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import { LucideUser, ChevronDown, ChevronUp, X, SlidersHorizontal, } from 'lucide-react';
import Papa from 'papaparse';
import { Barlow } from 'next/font/google';
import { AnimatePresence, motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Cell, Bar, BarChart, LabelList } from 'recharts';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
//import Link from 'next/link';
import { Search, Table as TableIcon, LockIcon, UnlockIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { TooltipProps } from 'recharts';
//import ComingSoon from '@/components/ui/ComingSoon'; // Import the ComingSoon component
import NavigationHeader from '@/components/NavigationHeader';
import DraftPageHeader from '@/components/DraftPageHeader';
import Head from 'next/head';
import { GoogleAnalytics } from '@next/third-parties/google';
import { ColumnConfig } from '@/components/CustomSelector';
import { BaseProspectCard } from '@/components/BaseProspectCard';
import { ProspectTable } from '@/components/ProspectTable';


type PositionRanks = {
  Y1: number;
  Y2: number;
  Y3: number;
  Y4: number;
  Y5: number;
  Y1Y3: number;
  Y1Y5: number;
};

export interface DraftProspect {
  Name: string;
  'Actual Pick': string;
  ABV: string;
  'NBA Team': string;
  'Pre-NBA': string;
  Position: string;
  Age: string;
  'Team Color': string;
  'G Played Issue': string;
  'League': string;
  // 'Pred. Y1 Rank': number;
  // 'Pred. Y2 Rank': number;
  // 'Pred. Y3 Rank': number;
  // 'Avg. Rank Y1-Y3': string;
  // 'Pred. Y4 Rank': number;
  // 'Pred. Y5 Rank': number;
  // 'Avg. Rank Y1-Y5': string;
  'Pred. Y1 EPM': number;
  'Pred. Y2 EPM': number;
  'Pred. Y3 EPM': number;
  'Pred. Y4 EPM': number;
  'Pred. Y5 EPM': number;
  'Avg. EPM Y1-Y3': number;
  'Avg. EPM Y1-Y5': number;
  'Height': string;
  'Height (in)': string;
  'Wingspan': string;
  'Wingspan (in)': string;
  'Wing - Height': string;
  'Weight (lbs)': string;
  'Role': string;
  Summary?: string;
  originalRank?: string;
  Size: number;
  Athleticism: number;
  Defense: number;
  Rebounding: number;
  Scoring: number;
  Passing: number;
  Shooting: number;
  Efficiency: number;
  'Tier': string;
  'Comp1': string;
  'Similarity1': number;
  'Comp2': string;
  'Similarity2': number;
  'Comp3': string;
  'Similarity3': number;
  'Comp4': string;
  'Similarity4': number;
  'Comp5': string;
  'Similarity5': number;

  positionRanks: {
    Y1: number;
    Y2: number;
    Y3: number;
    Y4: number;
    Y5: number;
    Y1Y3: number; // Position-specific 3-year average rank
    Y1Y5: number; // Position-specific 5-year average rank
  };
  avg3YEPM: number; // Global 3-year average EPM value
  avg5YEPM: number; // Global 5-year average EPM value
  globalRank3Y: number; // Global 3-year average EPM rank
  globalRank5Y: number; // Global 5-year average EPM rank

  // These are the keys you're using for sorting and display
  'Rank Y1-Y3': number; // Global 3-year average EPM rank
  'Rank Y1-Y5': number; // Global 5-year average EPM rank
}

const tierColors: { [key: string]: string } = {
  'All-Time Great': '#FF66C4',
  'All-NBA Caliber': '#E9A2FF',
  'Fringe All-Star': '#5CE1E6',
  'Quality Starter': '#7ED957',
  'Solid Rotation': '#FFDE59',
  'Bench Reserve': '#FFA455',
  'Fringe NBA': '#FF5757',
};

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

// ALL GRAPHING NECESSITIES ARE HERE
interface EPMModelProps {
  isOpen: boolean;
  onClose: () => void;
  prospects: DraftProspect[]; // All prospects.
  selectedPosition: string | null;
  selectedProspect?: DraftProspect; // Pass the selected prospect
  allProspects: DraftProspect[];
  graphType?: 'EPM' | 'rankings'; // Optional prop to determine graph type
  setGraphType?: (type: 'EPM' | 'rankings') => void; // Make optional
}

interface PayloadItem {
  dataKey: string;
  color: string;
  value: string | number;
}

type CustomTooltipProps = TooltipProps<number | string, string> & {
  active?: boolean;
  payload?: PayloadItem[];
  label?: string;
};

interface TimelineFilterProps {
  selectedSortKey: string;
  setSelectedSortKey: (key: string) => void;
  selectedPosition: string | null;
  setSelectedPosition: (position: string | null) => void;
  selectedTier: string | null;
  setSelectedTier: (tier: string | null) => void;
  tierRankActive: boolean;
  setTierRankActive: (active: boolean) => void;
  filteredProspects: DraftProspect[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: 'cards' | 'table';
  setViewMode: (mode: 'cards' | 'table') => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
}

const TimelineFilter = ({
  selectedSortKey,
  setSelectedSortKey,
  selectedPosition,
  setSelectedPosition,
  selectedTier,
  setSelectedTier,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  tierRankActive,
  setTierRankActive,
  selectedYear,
  setSelectedYear,
}: TimelineFilterProps) => {
  const [showFilterSection, setShowFilterSection] = useState(() => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      // Return true for desktop (768px and above), false for mobile
      return window.innerWidth >= 768;
    }
    // Default to true for SSR
    return true;
  });

  const getYearSortKeys = () => {
    if (selectedYear === 2025) {
      return [
        { key: 'Actual Pick', label: 'Draft' }, // Changed from 'Rank' to 'Consensus'
        { key: 'Pred. Y1 Rank', label: 'Y1' },
        { key: 'Pred. Y2 Rank', label: 'Y2' },
        { key: 'Pred. Y3 Rank', label: 'Y3' },
        { key: 'Pred. Y4 Rank', label: 'Y4' },
        { key: 'Pred. Y5 Rank', label: 'Y5' }
      ];
    } else {
      return [
        { key: 'Actual Pick', label: 'Draft' },
        { key: 'Pred. Y1 Rank', label: 'Y1' },
        { key: 'Pred. Y2 Rank', label: 'Y2' },
        { key: 'Pred. Y3 Rank', label: 'Y3' },
        { key: 'Pred. Y4 Rank', label: 'Y4' },
        { key: 'Pred. Y5 Rank', label: 'Y5' }
      ];
    }
  };

  const yearSortKeys = getYearSortKeys();


  // Button titles
  const averageKeys = [
    { key: 'Avg. Rank Y1-Y3', label: '3Y Avg' },
    { key: 'Avg. Rank Y1-Y5', label: '5Y Avg' },
  ];

  // For the summary by the filters - updated to handle both years
  const getSummaryLabels = () => {
    const baseLabels: { [key: string]: string } = {
      'Pred. Y1 Rank': 'Year 1',
      'Pred. Y2 Rank': 'Year 2',
      'Pred. Y3 Rank': 'Year 3',
      'Pred. Y4 Rank': 'Year 4',
      'Pred. Y5 Rank': 'Year 5',
      'Avg. Rank Y1-Y3': '3 Year Average',
      'Avg. Rank Y1-Y5': '5 Year Average',
    };

    // Always use 'Draft Order' for Actual Pick regardless of year
    baseLabels['Actual Pick'] = 'Draft Order';

    return baseLabels;
  };

  const summaryLabels = getSummaryLabels();

  // Position labels
  const positions = [
    { key: 'Guard', label: 'Guards' },
    { key: 'Wing', label: 'Wings' },
    { key: 'Big', label: 'Bigs' }
  ];

  // Tier labels - added new tier options
  const tiers = [
    { key: 'All-Time Great', label: 'All-Time Great' },
    { key: 'All-NBA Caliber', label: 'All-NBA Caliber' },
    { key: 'Fringe All-Star', label: 'Fringe All-Star' },
    { key: 'Quality Starter', label: 'Quality Starter' },
    { key: 'Solid Rotation', label: 'Solid Rotation' },
    { key: 'Bench Reserve', label: 'Bench Reserve' },
    { key: 'Fringe NBA', label: 'Fringe NBA' }
  ];

  summaryLabels['Tier Ranked'] = 'Tier Ranking';

  const getDefaultSortKey = () => {
    return 'Actual Pick'; // Always use Actual Pick for draft order
  };

  // Function to reset all filters
  const resetFilters = () => {
    // Set the default sort key to Actual Pick for both years
    setSelectedSortKey('Actual Pick');
    setSelectedPosition(null); // Clear position filter
    setSelectedTier(null); // Clear tier filter
    setSearchQuery(''); // Clear search
    setTierRankActive(false); // Reset tier ranking state
  };

  // Handle year change - reset sort key to Actual Pick for both years
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    // Reset sort key to Actual Pick for both years
    setSelectedSortKey('Actual Pick');
  };

  const shouldHighlight = (itemKey: string) => {
    if (selectedSortKey === 'Avg. Rank Y1-Y3') {
      return ['Pred. Y1 Rank', 'Pred. Y2 Rank', 'Pred. Y3 Rank'].includes(itemKey);
    }
    if (selectedSortKey === 'Avg. Rank Y1-Y5') {
      return ['Pred. Y1 Rank', 'Pred. Y2 Rank', 'Pred. Y3 Rank', 'Pred. Y4 Rank', 'Pred. Y5 Rank'].includes(itemKey);
    }
    return selectedSortKey === itemKey;
  };

  const handlePositionClick = (position: string) => {
    if (selectedPosition === position) {
      setSelectedPosition(null);
    } else {
      setSelectedPosition(position);
    }
  };

  // New handler for tier clicks
  const handleTierClick = (tier: string) => {
    if (selectedTier === tier) {
      setSelectedTier(null);
    } else {
      setSelectedTier(tier);
      setTierRankActive(false); // Unselect tier ranking when a specific tier is selected
    }
  };

  // Update the tier ranking toggle handler
  const handleTierRankToggle = () => {
    setTierRankActive(!tierRankActive);
    if (!tierRankActive) {
      setSelectedTier(null); // Unselect specific tier when tier ranking is activated
    }
  };

  // Get active filter summary text
  const getFilterSummary = () => {
    const parts = [];

    // Add tier ranking status first if active
    if (tierRankActive) {
      parts.push('Tiers');
    }

    // Add selected tier if any
    if (selectedTier) {
      parts.push(`Tier: ${selectedTier}`);
    }

    // Add sort method if not tier-related
    if (selectedSortKey && selectedSortKey !== 'Tier Ranked') {
      parts.push(summaryLabels[selectedSortKey] || selectedSortKey);
    }

    // Add position if selected
    if (selectedPosition) {
      parts.push(positions.find(p => p.key === selectedPosition)?.label || selectedPosition);
    }

    // Add search query if present
    if (searchQuery) {
      parts.push(`"${searchQuery}"`);
    }

    return parts.join(' • ');
  };

  // Check if any filters are applied (for conditionally showing reset button)
  const hasActiveFilters = () => {
    const defaultSortKey = getDefaultSortKey();
    // Check if any filter is different from default values
    return selectedSortKey !== defaultSortKey || selectedPosition !== null || selectedTier !== null || searchQuery.trim() !== '';
  };

  return (
    <div className="sticky top-14 z-30 bg-[#19191A] border-b border-gray-800 max-w-6xl mx-auto">
      {/* Collapsible trigger button */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/50">
        <div className="flex items-center space-x-2">
          <motion.button
            onClick={() => setShowFilterSection(!showFilterSection)}
            className="flex items-center gap-2 bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700 px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SlidersHorizontal className="h-3 w-3 md:h-4 md:w-4" />
            <span>Filter</span>
            {showFilterSection ? <ChevronUp className="h-3 w-3 md:h-4 md:w-4 ml-1" /> : <ChevronDown className="h-3 w-3 md:h-4 md:w-4 ml-1" />}
          </motion.button>

          {/* Mobile Reset Button - only show when filters are active */}
          {hasActiveFilters() && (
            <motion.button
              onClick={resetFilters}
              className="md:hidden flex items-center text-red-400 hover:text-red-300 bg-gray-800/20 border border-gray-800 hover:border-red-700/30 p-1.5 rounded-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="h-3 w-3" />
            </motion.button>
          )}

          {/* Filter summary text - shows when collapsed */}
          {!showFilterSection && (
            <div className="hidden md:flex text-sm text-gray-400 items-center ml-2">
              {getFilterSummary() || "No filters applied"}

              {/* Reset button when filter is collapsed */}
              {hasActiveFilters() && (
                <motion.button
                  onClick={resetFilters}
                  className="ml-2 flex items-center text-red-400 hover:text-red-300 bg-gray-800/20 border border-gray-800 hover:border-red-700/30 px-3 py-2 rounded-lg text-xs"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="h-4 w-4" />
                  Reset
                </motion.button>
              )}
            </div>
          )}
        </div>

        {/* View mode toggle and Year dropdown */}
        <div className="flex items-center space-x-1 md:space-x-2">
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
                {selectedYear}
                <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-32 bg-[#19191A] border-gray-700">
              <DropdownMenuItem
                className="text-gray-400 hover:bg-gray-800/50 cursor-pointer"
                onClick={() => handleYearChange(2024)}
              >
                2024
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-gray-400 hover:bg-gray-800/50 cursor-pointer"
                onClick={() => handleYearChange(2025)}
              >
                2025
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Divider */}
          <div className="h-6 md:h-8 w-px bg-gray-700/30 mx-1 md:mx-2" />

          {/* View Mode Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                className="px-2 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium flex items-center transition-all duration-300 bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Only show icons on desktop, not on mobile */}
                <span className="sm:hidden">{viewMode === 'cards' ? 'Card View' : viewMode === 'table' ? 'Table View' : 'Card View'}</span>
                <span className="hidden sm:flex items-center">
                  {viewMode === 'cards' ? (
                    <>
                      <LucideUser className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                      Card View
                    </>
                  ) : viewMode === 'table' ? (
                    <>
                      <TableIcon className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                      Table View
                    </>
                  ) : (
                    <>
                      <LucideUser className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                      Card View
                    </>
                  )}
                </span>
                <ChevronDown className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#19191A] border-gray-700">
              {/* Mobile: No icons, single-line text */}
              <DropdownMenuItem
                className={`text-gray-400 hover:bg-gray-800/50 cursor-pointer rounded-md sm:hidden ${viewMode === 'cards' ? 'bg-blue-500/20 text-blue-400' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setViewMode('cards');
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
                className={`hidden sm:flex text-gray-400 hover:bg-gray-800/50 cursor-pointer rounded-md ${viewMode === 'cards' ? 'bg-blue-500/20 text-blue-400' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setViewMode('cards');
                }}
              >
                <div className="flex items-center gap-2">
                  <LucideUser className="h-3 w-3 md:h-4 md:w-4" />
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
                  <TableIcon className="h-3 w-3 md:h-4 md:w-4" />
                  Table View
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Collapsible content */}
      <AnimatePresence>
        {showFilterSection && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-2 md:px-4 py-4 md:py-6">
              <div className="relative">
                {/* Timeline Track - Responsive */}
                <div className="relative h-20 md:h-24 flex items-center justify-center mb-4 md:mb-8">
                  <div className="absolute w-full h-1 bg-gray-700/30" />

                  {selectedSortKey && (
                    <motion.div
                      className="absolute h-1 bg-white-500/4"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.5 }}
                    />
                  )}

                  <div className="relative w-full flex justify-between items-center px-2 md:px-12">
                    {yearSortKeys.map((item) => (
                      <motion.button
                        key={item.key}
                        onClick={() => setSelectedSortKey(item.key)}
                        className={`
                          relative flex flex-col items-center justify-center
                          transition-colors duration-300 rounded-full
                          ${shouldHighlight(item.key) ? 'z-20' : 'z-10'}
                        `}
                        whileHover={{ scale: 1.1 }}
                      >
                        <motion.div
                          className={`
                            rounded-full border-2 md:border-2 cursor-pointer
                            ${shouldHighlight(item.key)
                              ? 'bg-blue-500 border-blue-500 w-8 h-8 md:w-12 md:h-12'
                              : 'bg-gray-800 border-gray-700 w-6 h-6 md:w-8 md:h-8 hover:border-gray-600'
                            }
                          `}
                          animate={{
                            scale: shouldHighlight(item.key) ? 1.2 : 1,
                            rotate: shouldHighlight(item.key) ? 360 : 0,
                            transition: { duration: .75 }
                          }}
                        >
                          <Image
                            src="/icons/filter_basketball.png"
                            alt="Test Basketball"
                            width={48}
                            height={48}
                            className="w-full h-full rounded-full"
                          />
                        </motion.div>

                        <motion.span
                          className={`
                            absolute -bottom-6 whitespace-nowrap text-xs md:text-sm font-medium
                            ${shouldHighlight(item.key) ? 'text-blue-400' : 'text-gray-400'}
                          `}
                          animate={{
                            scale: shouldHighlight(item.key) ? 1.1 : 1,
                            transition: { duration: 0.3 }
                          }}
                        >
                          {item.label}
                        </motion.span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Desktop filter bar - hidden on mobile */}
                <div className="hidden md:flex justify-between items-center space-x-4 mt-4">
                  {/* Left section: Reset Button and Search */}
                  <div className="flex items-center space-x-2 flex-grow max-w-md">
                    {/* Search field */}
                    <div className="relative flex-grow">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full bg-gray-800/20 border-gray-800 text-gray-300 placeholder-gray-500 rounded-lg focus:border-blue-500/30 focus:ring-1 focus:ring-blue-500/30"
                      />
                    </div>
                  </div>

                  {/* Reset Button */}
                  <motion.button
                    onClick={resetFilters}
                    className={`
                      flex items-center gap-1 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all duration-200
                      ${hasActiveFilters()
                        ? 'bg-gray-800/20 text-red-400 hover:text-red-300 border border-gray-800 hover:border-red-700/30'
                        : 'bg-gray-800/10 text-gray-500 border border-gray-800/50 opacity-60'
                      }
                    `}
                    whileHover={{ scale: hasActiveFilters() ? 1.05 : 1 }}
                    whileTap={{ scale: hasActiveFilters() ? 0.95 : 1 }}
                    disabled={!hasActiveFilters()}
                  >
                    <X className="h-4 w-4" />
                    Reset
                  </motion.button>

                  {/* Divider */}
                  <div className="h-8 w-px bg-gray-700/30 mx-2" />

                  {/* Position Filters */}
                  {positions.map((position) => (
                    <motion.button
                      key={position.key}
                      onClick={() => handlePositionClick(position.key)}
                      className={`
                        px-3 py-2 rounded-lg text-sm font-medium
                        transition-all duration-300 justify-center
                        ${selectedPosition === position.key
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'
                        }
                      `}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {position.label}
                    </motion.button>
                  ))}

                  {/* Divider */}
                  <div className="h-8 w-px bg-gray-700/30 mx-2" />

                  {/* Average Filters */}
                  {averageKeys.map((item) => (
                    <motion.button
                      key={item.key}
                      onClick={() => setSelectedSortKey(item.key)}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium
                        transition-all duration-300
                        ${selectedSortKey === item.key
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'
                        }
                      `}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {item.label}
                    </motion.button>
                  ))}

                  {/* Divider */}
                  <div className="h-8 w-px bg-gray-700/30 mx-2" />

                  {/* Right section: Tier buttons */}
                  <div className="flex items-center space-x-2">
                    {/* Tier Ranked button */}
                    <motion.button
                      onClick={handleTierRankToggle}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium
                        flex items-center gap-2
                        transition-all duration-300
                        ${tierRankActive
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'
                        }
                      `}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Tiers
                      {tierRankActive ? <LockIcon className="h-4 w-4" /> : <UnlockIcon className="h-4 w-4" />}
                    </motion.button>

                    {/* Tier Filters dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <motion.button
                          className={`
                            relative px-4 py-2 rounded-lg text-sm font-medium
                            flex items-center gap-2
                            transition-all duration-300
                            ${selectedTier
                              ? `bg-[${tierColors[selectedTier]}]/20 text-[${tierColors[selectedTier]}] border border-[${tierColors[selectedTier]}]/30`
                              : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'
                            }
                          `}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          style={selectedTier ? {
                            backgroundColor: `${tierColors[selectedTier]}20`,
                            color: tierColors[selectedTier],
                            borderColor: `${tierColors[selectedTier]}4D`
                          } : {}}
                        >
                          Filter Tiers
                          <ChevronDown className="h-4 w-4" />
                        </motion.button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-[#19191A] border-gray-700">
                        {tiers.map((tier) => (
                          <DropdownMenuItem
                            key={tier.key}
                            className={`
                              relative text-gray-400 hover:bg-gray-800/50 cursor-pointer rounded-md
                              ${selectedTier === tier.key ? 'bg-blue-500/20 text-blue-400' : ''}
                            `}
                            onClick={() => handleTierClick(tier.key)}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="w-4 h-4 rounded-sm"
                                style={{ backgroundColor: tierColors[tier.key] }}
                              ></span>
                              {tier.label}
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile search field */}
            <div className="md:hidden relative mx-2 my-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-gray-800/20 border-gray-800 text-gray-300 placeholder-gray-500 rounded-lg focus:border-blue-500/30 focus:ring-1 focus:ring-blue-500/30"
              />
            </div>

            {/* Mobile filter content */}
            <div className="md:hidden space-y-3 mb-4 p-3 bg-gray-800/10 rounded-lg border border-gray-800">
              {/* Tier Ranking Toggle for Mobile */}
              <div className="flex flex-wrap gap-2 mb-2">
                <div className="w-full text-xs text-gray-400 mb-1">Tiers:</div>
                <motion.button
                  onClick={handleTierRankToggle}
                  className={`
                    px-3 py-1 rounded-lg text-xs font-medium
                    transition-all duration-300
                    ${tierRankActive
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'
                    }
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {tierRankActive ? (
                    <div className="flex items-center gap-1">
                      <LockIcon className="h-3 w-3" />
                      Tiers
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <UnlockIcon className="h-3 w-3" />
                      Tiers
                    </div>
                  )}
                </motion.button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.button
                      className={`
                        relative px-3 py-1 rounded-lg text-xs font-medium
                        flex items-center gap-2
                        transition-all duration-300
                        ${selectedTier
                          ? `bg-[${tierColors[selectedTier]}]/20 text-[${tierColors[selectedTier]}] border border-[${tierColors[selectedTier]}]/30`
                          : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'
                        }
                      `}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={selectedTier ? {
                        backgroundColor: `${tierColors[selectedTier]}20`,
                        color: tierColors[selectedTier],
                        borderColor: `${tierColors[selectedTier]}4D`
                      } : {}}
                    >
                      Filter Tiers
                      <ChevronDown className="h-3 w-3" />
                    </motion.button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-[#19191A] border-gray-700">
                    {tiers.map((tier) => (
                      <DropdownMenuItem
                        key={tier.key}
                        className={`
                          relative text-gray-400 hover:bg-gray-800/50 cursor-pointer rounded-md
                          ${selectedTier === tier.key ? 'bg-blue-500/20 text-blue-400' : ''}
                        `}
                        onClick={() => handleTierClick(tier.key)}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-sm"
                            style={{ backgroundColor: tierColors[tier.key] }}
                          ></span>
                          {tier.label}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {/* Position Filters for Mobile */}
              <div className="flex flex-wrap gap-2 mb-2">
                <div className="w-full text-xs text-gray-400 mb-1">Position:</div>
                {positions.map((position) => (
                  <motion.button
                    key={position.key}
                    onClick={() => handlePositionClick(position.key)}
                    className={`
                      px-3 py-1 rounded-lg text-xs font-medium
                      transition-all duration-300
                      ${selectedPosition === position.key
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'
                      }
                    `}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {position.label}
                  </motion.button>
                ))}
              </div>

              {/* Average Filters for Mobile */}
              <div className="flex flex-wrap gap-2">
                <div className="w-full text-xs text-gray-400 mb-1">Average:</div>
                {averageKeys.map((item) => (
                  <motion.button
                    key={item.key}
                    onClick={() => setSelectedSortKey(item.key)}
                    className={`
                      px-3 py-1 rounded-lg text-xs font-medium
                      transition-all duration-300
                      ${selectedSortKey === item.key
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'
                      }
                    `}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

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
        className={`object-contain ${NBA === 'Duke' ? 'brightness-125' : ''}`}
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

const IndividualProspectGraphs: React.FC<EPMModelProps> = ({
  isOpen,
  onClose,
  selectedProspect,
  allProspects, // This should be the initial unfiltered prospects
  graphType = 'rankings',
  setGraphType,
}) => {
  // Use allProspects instead of filteredProspects for graph data
  const filteredProspects = useMemo(() => {
    if (!selectedProspect) return [];
    // Filter prospects with the same position as the selected prospect
    return allProspects.filter(p => p.Role === selectedProspect.Role);
  }, [allProspects, selectedProspect]);

  const prepareRankingsChartData = () => {
    const yearData: { year: string | number;[key: string]: string | number }[] = [];

    for (let year = 1; year <= 5; year++) {
      const yearObj: { year: string | number;[key: string]: string | number } = { year };

      filteredProspects.forEach((prospect) => {
        // Get the rank value for the current year
        const rankKey = `Pred. Y${year} Rank` as keyof DraftProspect;
        const rankValue = prospect[rankKey];

        // Convert to number and check if it's valid
        const numValue = Number(rankValue);

        // Only add valid numerical values to the chart data
        if (!isNaN(numValue)) {
          yearObj[prospect.Name] = numValue;
        }
      });

      yearData.push(yearObj);
    }

    return yearData;
  };

  const prepareEpmChartData = () => {
    const yearData: { year: string | number;[key: string]: string | number }[] = [];

    for (let year = 1; year <= 5; year++) {
      const yearObj: { year: string | number;[key: string]: string | number } = { year };

      filteredProspects.forEach((prospect) => {
        // Get the EPM value for the current year
        const epmKey = `Pred. Y${year} EPM` as keyof DraftProspect;
        const epmValue = prospect[epmKey];

        // Convert to number and check if it's valid
        const numValue = Number(epmValue);

        // Only add valid numerical values to the chart data
        if (!isNaN(numValue)) {
          yearObj[prospect.Name] = numValue;
        }
      });

      yearData.push(yearObj);
    }

    return yearData;
  };

  // Calculate chart data
  const rankingsChartData = prepareRankingsChartData();
  const epmChartData = prepareEpmChartData();

  // Use the appropriate data based on the selected graph type
  const chartData = graphType === 'rankings' ? rankingsChartData : epmChartData;

  // Determine Y-axis domain based on data
  const getYAxisDomain = () => {
    if (graphType === 'rankings') {
      // For rankings, lower is better (1 is best)
      return [60, 1]; // Reversed domain for rankings (1 at top, 60 at bottom)
    } else {
      // For EPM, find min and max values with minimal padding
      let min = Infinity;
      let max = -Infinity;

      epmChartData.forEach(yearData => {
        Object.entries(yearData).forEach(([key, value]) => {
          if (key !== 'year' && typeof value === 'number') {
            min = Math.min(min, value);
            max = Math.max(max, value);
          }
        });
      });

      // Add a small padding (5% of the range) to prevent points from touching the edges
      const range = max - min;
      const padding = range * 0.05;

      // Round to 1 decimal place for cleaner numbers
      return [
        Math.floor((min - padding) * 10) / 10,
        Math.ceil((max + padding) * 10) / 10
      ];
    }
  };

  const yAxisDomain = getYAxisDomain();

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      // Find which point is actually being hovered by checking the activeDot state 
      // (usually that's the point actively being hovered)
      const activePointIndex = payload.findIndex(entry => entry.payload.activePayload);
      // If we can't determine which one is active, use the last mouse event target
      const activeEntry = activePointIndex >= 0 ? payload[activePointIndex] : payload[payload.length - 1];

      return (
        <div className="bg-gray-800/90 p-4 rounded-lg shadow-lg border border-gray-700">
          <p className="font-bold text-white">{activeEntry.dataKey}</p>
          <p className="text-white">Year {label}</p>
          <p className="text-white text-sm font-bold">
            {graphType === 'rankings' ? 'Rank' : 'EPM'}: {
              typeof activeEntry.value === 'number' ?
                graphType === 'rankings' ? activeEntry.value.toFixed(0) : activeEntry.value.toFixed(2)
                : 'N/A'
            }
          </p>
        </div>
      );
    }
    return null;
  };

  // Check if we have valid data to display
  const hasValidData = chartData.some(yearData => {
    return Object.keys(yearData).some(key => key !== 'year');
  });

  // Extract the complex expression to a variable
  const prospectName = selectedProspect?.Name;

  // Sort prospects to ensure selected player is rendered last (appears on top)
  const sortedProspects = useMemo(() => {
    // Create a copy to avoid modifying the original array
    return [...filteredProspects].sort((a, b) => {
      // If a is the selected prospect, it should come last (after b)
      if (a.Name === prospectName) return 1;
      // If b is the selected prospect, it should come last (after a)
      if (b.Name === prospectName) return -1;
      // Otherwise, maintain original order
      return 0;
    });
  }, [filteredProspects, prospectName]); // Now includes the extracted variable

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader className="flex flex-row items-center justify-between">
          <AlertDialogTitle className="text-xl">
            {selectedProspect
              ? `${selectedProspect.Name} Projected ${graphType === 'rankings' ? 'Rank' : 'EPM'} vs ${selectedProspect.Role}s`
              : 'Select a Prospect'}
          </AlertDialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </AlertDialogHeader>

        <CardContent className="space-y-6">
          {setGraphType && (
            <div className="flex justify-center space-x-4 mb-4">
              <Button
                variant={graphType === 'rankings' ? "default" : "outline"}
                onClick={() => setGraphType('rankings')}
                className="w-32"
              >
                Rankings
              </Button>
              <Button
                variant={graphType === 'EPM' ? "default" : "outline"}
                onClick={() => setGraphType('EPM')}
                className="w-32"
              >
                Projected EPM
              </Button>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>
                {graphType === 'rankings'
                  ? 'Rankings Progression By Player'
                  : 'EPM Progression By Player'}
              </CardTitle>
              <CardDescription>
                {graphType === 'rankings'
                  ? 'Lower ranking numbers are better (1 = best, displayed at top of chart)'
                  : 'Higher EPM values indicate better performance (displayed higher on chart)'}
              </CardDescription>
            </CardHeader>

            {hasValidData ? (
              <ResponsiveContainer width="100%" height={500}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                  <XAxis
                    dataKey="year"
                    type="number"
                    stroke="#888"
                    domain={[1, 5]}
                    tickCount={5}
                    label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis
                    type="number"
                    stroke="#888"
                    domain={yAxisDomain}
                    tickCount={graphType === 'rankings' ? 6 : 8}
                    tickFormatter={(value) => Math.round(value).toString()}
                    reversed={graphType === 'rankings'} // Set reversed to true for rankings chart
                    label={{
                      value: graphType === 'rankings' ? 'Ranking' : 'EPM Value',
                      angle: -90,
                      position: 'insideLeft'
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
                  {sortedProspects.map((prospect) => (
                    <Line
                      key={prospect.Name}
                      type="monotone"
                      dataKey={prospect.Name}
                      stroke={prospect.Name === prospectName ? (prospect['Team Color'] || '#ff0000') : '#cccccc'}
                      strokeWidth={prospect.Name === prospectName ? 3 : 1.5}
                      dot={{ r: 4 }}
                      activeDot={{ r: 8 }}
                      // Ensure selected player has higher z-index
                      z={prospect.Name === prospectName ? 10 : 1}
                      // Only show tooltip for this specific line
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center p-12 text-gray-400">
                <p>No valid data available for this graph type</p>
              </div>
            )}
          </Card>
        </CardContent>
      </AlertDialogContent>
    </AlertDialog>
  );
};

interface ComparisonPlayerData {
  Name: string;
  Tier?: string; // Tier is optional because it might be missing
}

interface ComparisonData {
  name: string;
  similarity: number;
  tier?: string; // Tier is optional
}

interface CustomLabelProps {
  x: number;         // X-coordinate provided by Recharts
  y: number;         // Y-coordinate provided by Recharts
  width: number;     // Width of the bar/area provided by Recharts
  height: number;    // Height of the bar/area provided by Recharts
  value: string;     // The value being displayed (in your case, dataKey="name")
  index: number;     // The index of the data item in the compData array
  // Recharts might pass other properties, but these are the ones you're using.
}

const PlayerComparisonChart: React.FC<{ prospect: DraftProspect }> = ({ prospect }) => {
  const [compData, setCompData] = useState<ComparisonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comparisonPlayerData, setComparisonPlayerData] = useState<ComparisonPlayerData[]>([]);

  const fetchCSVData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('NBA_Draft_EPM - NBA_Draft_Standardized.csv');
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.status}`);
      }
      const text = await response.text();

      const results = Papa.parse<ComparisonPlayerData>(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim()
      });

      if (results.errors.length) {
        throw new Error(`CSV Parse Error: ${results.errors.map(e => e.message).join(', ')}`);
      }

      setComparisonPlayerData(results.data);
      return results.data;
    } catch (err: unknown) {
      console.error("Error fetching comparison data:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError("An unknown error occurred while fetching data.");
      }
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCSVData();
  }, []);

  useEffect(() => {
    if (comparisonPlayerData.length === 0 || !prospect) return;

    const comps: ComparisonData[] = [];
    for (let i = 1; i <= 5; i++) {
      const compNameKey = `Comp${i}` as keyof DraftProspect;
      const similarityKey = `Similarity${i}` as keyof DraftProspect;

      const compName = prospect[compNameKey] as string | undefined;
      const similarity = prospect[similarityKey] as number | undefined;

      if (compName && similarity !== undefined && compName !== '' && similarity > 0 && compName !== prospect.Name) {
        const comparisonPlayer = comparisonPlayerData.find(player =>
          player.Name && player.Name.trim() === compName.trim());
        const tier = comparisonPlayer?.Tier;

        comps.push({
          name: compName,
          similarity: similarity,
          tier: tier
        });
      }
    }

    const sortedComps = comps
      .sort((a, b) => b.similarity - a.similarity)
      .filter(comp => comp.name !== '');

    setCompData(sortedComps);
  }, [prospect, comparisonPlayerData]);

  // Use the new CustomTooltipProps interface
  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data: ComparisonData = payload[0].payload; // data is now typed as ComparisonData
      return (
        <div className="bg-gray-800/90 p-3 rounded-lg shadow-lg border border-gray-700">
          <p className="text-white font-semibold">{data.name}</p>
          <p className="text-gray-300">Similarity: {data.similarity}%</p>
          {data.tier && <p className="text-gray-300">Tier: {data.tier}</p>}
        </div>
      );
    }
    return null;
  };

  const getColorForTier = (tier?: string): string => {
    if (!tier) return tierColors['Default'] || '#808080'; // Default gray if no tier
    return tierColors[tier] || tierColors['Default'] || '#808080'; // Use the tier color or default
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-400">Loading comparison data...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-400">Error: {error}</div>;
  }

  if (compData.length === 0) {
    return <div className="text-gray-400 text-center py-4">No comparison data available</div>;
  }

  // Use the new CustomLabelProps interface
  const CustomLabel: React.FC<CustomLabelProps> = (props) => {
    const { x, y, height, value } = props;
    const color = getColorForTier(compData[props.index]?.tier);

    return (
      <text
        x={x + 10}
        y={y + height / 2}
        fill={color}
        fontWeight="bold"
        fontSize={12}
        textAnchor="start"
        dominantBaseline="central"
      >
        {value}
      </text>
    );
  };

  return (
    <div className="w-full">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={compData}
            margin={{
              top: 15,
              right: 20,
              bottom: -4,
              left: 5
            }}
          >
            <XAxis
              type="number"
              domain={[0, 100]}
              hide={true}
            />
            <YAxis
              dataKey="name"
              type="category"
              hide={true}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={false}
              isAnimationActive={false}
            />
            <Bar
              dataKey="similarity"
              radius={[4, 4, 4, 4]}
              strokeWidth={2}
              isAnimationActive={true}
              animationDuration={500}
              animationBegin={0}
              animationEasing="ease-out"
              activeBar={false}
              cursor="default"
              barSize={40}
            >
              {compData.map((entry, index) => {
                const color = getColorForTier(entry.tier);
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={color}
                    fillOpacity={0.3}
                    stroke={color}
                    cursor="default"
                    onMouseEnter={() => { }}
                    onMouseLeave={() => { }}
                  />
                );
              })}
              <LabelList
                dataKey="name"
                content={<CustomLabel x={0} y={0} width={0} height={0} value={''} index={0} />}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// First, update the SpiderChart component props to include selectedYear
const SpiderChart: React.FC<{
  prospect: DraftProspect;
  selectedYear: number;
}> = ({ prospect, selectedYear }) => {
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonPlayer, setComparisonPlayer] = useState<DraftProspect | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [samePositionPlayers, setSamePositionPlayers] = useState<DraftProspect[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  // Add useEffect to check for mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update the useEffect to fetch players from the correct year and filter out G Played Issue = 1
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const csvFile = selectedYear === 2025 ? '/2025_Draft_Class.csv' : '/2024_Draft_Class.csv';
        const response = await fetch(csvFile);
        const csvText = await response.text();
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            const allPlayers = results.data as DraftProspect[];
            const playersInSamePosition = allPlayers.filter(
              p => p.Role === prospect.Role &&
                p.Name !== prospect.Name &&
                p['G Played Issue'] !== '1' // Filter out prospects with G Played Issue = 1
            );
            setSamePositionPlayers(playersInSamePosition);
          }
        });
      } catch (error) {
        console.error('Error fetching players:', error);
      }
    };
    fetchPlayers();
  }, [prospect.Role, prospect.Name, selectedYear]); // Add selectedYear to dependencies

  const getAttributeValue = (value: string | number | undefined): number => {
    if (value === undefined) return 0;
    if (value === '') return 0;
    if (typeof value === 'string') {
      value = value.trim();
    }
    const numValue = Number(value);
    return !isNaN(numValue) ? numValue : 0;
  };

  // Create combined data array for the radar chart
  const chartData = useMemo(() => {
    const attributes = [
      { name: 'Size', value: getAttributeValue(prospect.Size) },
      { name: 'Athleticism', value: getAttributeValue(prospect.Athleticism) },
      { name: 'Defense', value: getAttributeValue(prospect.Defense) },
      { name: 'Rebounding', value: getAttributeValue(prospect.Rebounding) },
      { name: 'Scoring', value: getAttributeValue(prospect.Scoring) },
      { name: 'Passing', value: getAttributeValue(prospect.Passing) },
      { name: 'Shooting', value: getAttributeValue(prospect.Shooting) },
      { name: 'Efficiency', value: getAttributeValue(prospect.Efficiency) }
    ];

    if (showComparison && comparisonPlayer) {
      return attributes.map(attr => ({
        name: attr.name,
        [prospect.Name]: attr.value,
        [comparisonPlayer.Name]: getAttributeValue(comparisonPlayer[attr.name as keyof DraftProspect] as string | number | undefined)
      }));
    }

    return attributes.map(attr => ({
      name: attr.name,
      [prospect.Name]: attr.value
    }));
  }, [prospect, comparisonPlayer, showComparison]);

  // Add custom tick formatter for mobile
  const customTickFormatter = (value: string) => {
    if (!isMobile) return value;

    // Adjust positioning for specific labels on mobile
    if (value === 'Shooting') {
      return '  Shooting'; // Add extra space at the start
    }
    if (value === 'Defense') {
      return '  Defense'; // Add extra space at the start
    }
    return value;
  };

  return (
    <div className="w-full h-[300px] relative">
      <div className="absolute top-0 left-0 z-10">
        <div className="relative flex items-center gap-2">
          <button
            onClick={() => {
              setIsDropdownOpen(!isDropdownOpen);
            }}
            className="px-3 py-1.5 text-sm font-medium rounded-md border transition-all duration-200 bg-gray-800/20 text-gray-400 border-gray-800 hover:border-gray-700"
          >
            {showComparison && comparisonPlayer ? comparisonPlayer.Name : 'Compare'}
          </button>
          {showComparison && comparisonPlayer && (
            <button
              onClick={() => {
                setShowComparison(false);
                setComparisonPlayer(null);
              }}
              className="w-8 py-1.5 rounded-md border border-gray-800 hover:border-gray-700 bg-gray-800/20 text-gray-400 hover:text-gray-300 transition-all duration-200 flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-gray-800/90 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {samePositionPlayers.map((player) => (
                <button
                  key={player.Name}
                  onClick={() => {
                    if (showComparison && comparisonPlayer?.Name === player.Name) {
                      setShowComparison(false);
                      setComparisonPlayer(null);
                    } else {
                      setComparisonPlayer(player);
                      setShowComparison(true);
                    }
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-sm text-left ${showComparison && comparisonPlayer?.Name === player.Name
                    ? 'bg-gray-700/50 text-gray-200'
                    : 'text-gray-300 hover:bg-gray-700/50'
                    }`}
                >
                  {player.Name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <RadarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <PolarGrid stroke="#999" />
          <PolarAngleAxis
            dataKey="name"
            fontSize={isMobile ? 10 : 12}
            tick={{ fill: '#fff' }}
            tickFormatter={customTickFormatter}
          />
          <Radar
            name={prospect.Name}
            dataKey={prospect.Name}
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.4}
          />
          {showComparison && comparisonPlayer && (
            <Radar
              name={comparisonPlayer.Name}
              dataKey={comparisonPlayer.Name}
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.2}
            />
          )}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

const MaxPageProspectCard: React.FC<{
  prospect: DraftProspect;
  rank: RankType;
  filteredProspects: DraftProspect[];
  allProspects: DraftProspect[];
  selectedSortKey: string;
  selectedYear: number;
}> = ({ prospect, rank, filteredProspects, allProspects, selectedSortKey, selectedYear }) => {
  const [isGraphModelOpen, setIsGraphModelOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [graphType, setGraphType] = useState<'rankings' | 'EPM'>('rankings');
  const [isMobileInfoExpanded, setIsMobileInfoExpanded] = useState(false);
  const [activeChart, setActiveChart] = useState('spider');
  const [isExpanded, setIsExpanded] = useState(false);

  // Create validProspects filter that will be used throughout the component
  const validProspects = useMemo(() => {
    return allProspects.filter(p => p['G Played Issue'] !== '1');
  }, [allProspects]);

  // Calculate original rankings based on valid prospects only
  const originalRankings = useMemo(() => {
    // If this prospect is not valid, return N/A for all rankings
    if (prospect['G Played Issue'] === '1') {
      return {
        overall3Y: 'N/A',
        overall5Y: 'N/A',
        position3Y: 'N/A',
        position5Y: 'N/A'
      };
    }

    // Only use validProspects for all ranking calculations
    const sortedBy3YAvg = [...validProspects].sort(
      (a, b) => Number(b['Avg. EPM Y1-Y3']) - Number(a['Avg. EPM Y1-Y3'])
    );
    const sortedBy5YAvg = [...validProspects].sort(
      (a, b) => Number(b['Avg. EPM Y1-Y5']) - Number(a['Avg. EPM Y1-Y5'])
    );

    // Find the current prospect's position in these sorted arrays
    const rank3Y = sortedBy3YAvg.findIndex(p => p.Name === prospect.Name);
    const rank5Y = sortedBy5YAvg.findIndex(p => p.Name === prospect.Name);

    // Get position-specific rankings from valid prospects only
    const samePositionValidProspects = validProspects.filter(p => p.Role === prospect.Role);

    const sortedBy3YAvgPosition = [...samePositionValidProspects].sort(
      (a, b) => Number(b['Avg. EPM Y1-Y3']) - Number(a['Avg. EPM Y1-Y3'])
    );
    const sortedBy5YAvgPosition = [...samePositionValidProspects].sort(
      (a, b) => Number(b['Avg. EPM Y1-Y5']) - Number(a['Avg. EPM Y1-Y5'])
    );

    const positionRank3Y = sortedBy3YAvgPosition.findIndex(p => p.Name === prospect.Name);
    const positionRank5Y = sortedBy5YAvgPosition.findIndex(p => p.Name === prospect.Name);

    return {
      overall3Y: rank3Y !== -1 ? (rank3Y + 1) : 'N/A',
      overall5Y: rank5Y !== -1 ? (rank5Y + 1) : 'N/A',
      position3Y: positionRank3Y !== -1 ? (positionRank3Y + 1) : 'N/A',
      position5Y: positionRank5Y !== -1 ? (positionRank5Y + 1) : 'N/A'
    };
  }, [prospect.Name, validProspects, prospect.Role, prospect['G Played Issue']]);

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

  const getPositionRank = (year: string): string => {
    if (!prospect.positionRanks) return 'N/A';
    const yearKey = year as keyof PositionRanks;
    const rank = prospect.positionRanks[yearKey];
    return rank ? rank.toString() : 'N/A';
  };

  // First, extract the complex expression to a variable
  const pickNumber = Number(prospect['Actual Pick']);

  // Then modify the useMemo hook to use the rank prop when available
  const currentRank = useMemo(() => {
    // If we have a valid rank prop, use it (this comes from TimelineSlider)
    if (rank !== undefined && rank !== null && rank !== '') {
      return rank;
    }

    // Fallback to the original logic if no rank prop is provided
    if (selectedSortKey === 'Actual Pick') {
      // For draft order, use the actual pick number
      if (selectedYear === 2025) {
        // 2025: picks 1-59 are drafted, 60+ are UDFA
        if (!isNaN(pickNumber) && pickNumber <= 59) {
          return pickNumber.toString();
        } else {
          return "UDFA";
        }
      } else {
        // 2024: picks 1-58 are drafted, 59+ are UDFA
        if (!isNaN(pickNumber) && pickNumber <= 58) {
          return pickNumber.toString();
        } else {
          return "UDFA";
        }
      }
    } else {
      // For other sorting methods, use the array index
      const index = filteredProspects.findIndex(p => p.Name === prospect.Name);
      return (index + 1).toString();
    }
  }, [prospect, filteredProspects, selectedSortKey, pickNumber, rank, selectedYear]);

  const handleExpand = (expanded: boolean) => {
    setIsExpanded(expanded);
  };

  return (
    <BaseProspectCard
      prospect={prospect}
      rank={currentRank}
      selectedYear={selectedYear}
      isMobile={isMobile}
      onExpand={handleExpand}
    >
      {/* Max's specific dropdown content */}
      {/* Mobile - Chart Toggle tabs */}
      {isMobile && (
        <div className="mb-4 border-b border-gray-700">
          <div className="flex space-x-2 mb-2">
            <button
              onClick={() => setActiveChart('spider')}
              className={`py-2 px-3 text-xs font-medium rounded-t-md transition-all duration-200
              ${activeChart === 'spider'
                  ? 'bg-gray-800 text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-300'}`}
            >
              Skills
            </button>
            <button
              onClick={() => setActiveChart('comparison')}
              className={`py-2 px-3 text-xs font-medium rounded-t-md transition-all duration-200
              ${activeChart === 'comparison'
                  ? 'bg-gray-800 text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-300'}`}
            >
              Comps
            </button>
          </div>
        </div>
      )}

      {/* Expanded View Content */}
      <div className={`${isMobile ? '' : 'grid grid-cols-2 gap-4'}`}>
        {/* Charts Column - Always show on mobile, above rankings */}
        <div className="text-gray-300 px-2"> {/* Added px-2 for side margins */}
          {/* Tier display with color border */}
          <h3 className="font-semibold text-lg mb-3 text-white mt-2">
            Prospect Tier: <span
              className="px-2 py-1 rounded text-sm"
              style={{
                backgroundColor: `${tierColors[prospect.Tier] ? tierColors[prospect.Tier] + '4D' : 'transparent'}`,
                color: tierColors[prospect.Tier] || 'inherit',
                border: `1px solid ${tierColors[prospect.Tier] || 'transparent'}`,
              }}
            >
              {prospect.Tier}
            </span>
          </h3>

          {/* Chart Container */}
          <div className={`mb-4 ${!isMobile ? 'h-64' : 'h-[300px]'}`}>
            {activeChart === 'spider' ? (
              <SpiderChart
                prospect={prospect}
                selectedYear={selectedYear}
              />
            ) : (
              <PlayerComparisonChart
                prospect={prospect}
              />
            )}
          </div>
        </div>

        {/* Rankings Column */}
        <div className="space-y-4 flex flex-col justify-start px-2">
          <h3 className="font-semibold text-lg mb-3 text-white mt-2">
            Projected EPM Rankings
          </h3>
          {/* Rankings Table */}
          <div className="w-full">
            <div className="grid grid-cols-3 gap-4 mb-2 text-sm font-semibold text-gray-400 border-b border-gray-700 pb-2">
              <div>Year</div>
              <div className="text-center">Overall</div>
              <div className="text-center">Position</div>
            </div>
            <div className="space-y-3">
              {/* Show individual years */}
              {['Y1', 'Y2', 'Y3'].map((year) => (
                <div key={year} className="grid grid-cols-3 gap-4 text-sm text-gray-300">
                  <div>Year {year.slice(1)}</div>
                  <div className="text-center">
                    {(() => {
                      const rankKey = `Pred. ${year} Rank` as keyof DraftProspect;
                      const rankValue = prospect[rankKey];
                      const numValue = Number(rankValue);
                      return !isNaN(numValue) ? numValue : 'N/A';
                    })()}
                  </div>
                  <div className="text-center">{getPositionRank(year)}</div>
                </div>
              ))}

              {/* 3 Year Average */}
              <div className="grid grid-cols-3 gap-4 text-sm text-blue-400">
                <div>3 Year Avg</div>
                <div className="text-center">
                  {originalRankings.overall3Y}
                </div>
                <div className="text-center">{originalRankings.position3Y}</div>
              </div>

              {/* Show remaining individual years */}
              {['Y4', 'Y5'].map((year) => (
                <div key={year} className="grid grid-cols-3 gap-4 text-sm text-gray-300">
                  <div>Year {year.slice(1)}</div>
                  <div className="text-center">
                    {(() => {
                      const rankKey = `Pred. ${year} Rank` as keyof DraftProspect;
                      const rankValue = prospect[rankKey];
                      const numValue = Number(rankValue);
                      return !isNaN(numValue) ? numValue : 'N/A';
                    })()}
                  </div>
                  <div className="text-center">{getPositionRank(year)}</div>
                </div>
              ))}

              {/* 5 Year Average */}
              <div className="grid grid-cols-3 gap-4 text-sm text-blue-400">
                <div>5 Year Avg</div>
                <div className="text-center">
                  {originalRankings.overall5Y}
                </div>
                <div className="text-center">{originalRankings.position5Y}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop - All buttons row - spans full width below both columns */}
        {!isMobile && (
          <div className="col-span-2 mt-2">
            <div className="grid grid-cols-4 gap-2">
              {/* Chart Toggle Buttons */}
              <button
                onClick={() => setActiveChart('spider')}
                className={`text-sm font-medium py-2 px-4 rounded-md border transition-all duration-200 shadow-sm ${activeChart === 'spider'
                  ? 'text-blue-400 border-blue-500/30 bg-blue-500/20'
                  : 'text-gray-400 border-gray-800 hover:border-blue-500/30 bg-gray-800/20 hover:bg-gray-700'
                  }`}
              >
                Skills Chart
              </button>
              <button
                onClick={() => setActiveChart('comparison')}
                className={`text-sm font-medium py-2 px-4 rounded-md border transition-all duration-200 shadow-sm ${activeChart === 'comparison'
                  ? 'text-blue-400 border-blue-500/30 bg-blue-500/20'
                  : 'text-gray-400 border-gray-800 hover:border-blue-500/30 bg-gray-800/20 hover:bg-gray-700'
                  }`}
              >
                Player Comparisons
              </button>

              {/* Graph Buttons */}
              <motion.button
                onClick={() => {
                  setGraphType('rankings');
                  setIsGraphModelOpen(true);
                }}
                className="bg-gray-800/20 hover:bg-gray-700 text-gray-400 text-sm font-medium py-2 px-4 rounded-md border border-gray-800 hover:border-blue-500/30 transition-all duration-200 shadow-sm"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                Rankings Graph
              </motion.button>
              <motion.button
                onClick={() => {
                  setGraphType('EPM');
                  setIsGraphModelOpen(true);
                }}
                className="bg-gray-800/20 hover:bg-gray-700 text-gray-400 text-sm font-medium py-2 px-4 rounded-md border border-gray-800 hover:border-blue-500/30 transition-all duration-200 shadow-sm"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                EPM Graph
              </motion.button>
            </div>
          </div>
        )}
      </div>

      {/* Graph Model */}
      {isGraphModelOpen && (
        <IndividualProspectGraphs
          isOpen={isGraphModelOpen}
          onClose={() => setIsGraphModelOpen(false)}
          prospects={allProspects}
          selectedPosition={prospect.Role}
          selectedProspect={prospect}
          allProspects={allProspects}
          graphType={graphType}
          setGraphType={setGraphType}
        />
      )}
    </BaseProspectCard>
  );
};

// Replace the existing ProspectTable component with:
const MaxProspectTable = ({ prospects, rankingSystem }: { prospects: DraftProspect[], rankingSystem: Map<string, number> }) => {
    const [columns, setColumns] = useState<ColumnConfig[]>([
        { key: 'Rank', label: 'Rank', category: 'Player Information', visible: true, sortable: true },
        { key: 'Name', label: 'Name', category: 'Player Information', visible: true, sortable: true },
        { key: 'Role', label: 'Position', category: 'Player Information', visible: true, sortable: true },
        { key: 'League', label: 'League', category: 'Player Information', visible: true, sortable: true },
        { key: 'Pre-NBA', label: 'Pre-NBA', category: 'Player Information', visible: true, sortable: true },
        { key: 'Actual Pick', label: 'Draft Pick', category: 'Player Information', visible: true, sortable: true },
        { key: 'NBA Team', label: 'NBA Team', category: 'Player Information', visible: true, sortable: true },
        { key: 'Tier', label: 'Tier', category: 'Player Information', visible: true, sortable: true },
        { key: 'Age', label: 'Age', category: 'Player Information', visible: false, sortable: true },
        { key: 'Height', label: 'Height', category: 'Player Information', visible: false, sortable: true },
        { key: 'Wingspan', label: 'Wingspan', category: 'Player Information', visible: false, sortable: true },
        { key: 'Wing - Height', label: 'Wing-Height', category: 'Player Information', visible: false, sortable: true },
        { key: 'Weight (lbs)', label: 'Weight', category: 'Player Information', visible: false, sortable: true },
        { key: 'Pred. Y1 Rank', label: 'Y1 Rank', category: 'EPM Rank Information', visible: false, sortable: true },
        { key: 'Pred. Y2 Rank', label: 'Y2 Rank', category: 'EPM Rank Information', visible: false, sortable: true },
        { key: 'Pred. Y3 Rank', label: 'Y3 Rank', category: 'EPM Rank Information', visible: false, sortable: true },
        { key: 'Pred. Y4 Rank', label: 'Y4 Rank', category: 'EPM Rank Information', visible: false, sortable: true },
        { key: 'Pred. Y5 Rank', label: 'Y5 Rank', category: 'EPM Rank Information', visible: false, sortable: true },
        { key: 'Rank Y1-Y3', label: '3Y Avg Rank', category: 'EPM Rank Information', visible: false, sortable: true },
        { key: 'Rank Y1-Y5', label: '5Y Avg Rank', category: 'EPM Rank Information', visible: false, sortable: true },
        { key: 'Comp1', label: 'Comp 1', category: 'Player Comparisons', visible: false, sortable: true },
        { key: 'Comp2', label: 'Comp 2', category: 'Player Comparisons', visible: false, sortable: true },
        { key: 'Comp3', label: 'Comp 3', category: 'Player Comparisons', visible: false, sortable: true },
        { key: 'Comp4', label: 'Comp 4', category: 'Player Comparisons', visible: false, sortable: true },
        { key: 'Comp5', label: 'Comp 5', category: 'Player Comparisons', visible: false, sortable: true },
    ]);

    const tierRankMap = {
        'All-Time Great': 1,
        'All-NBA Caliber': 2,
        'Fringe All-Star': 3,
        'Quality Starter': 4,
        'Solid Rotation': 5,
        'Bench Reserve': 6,
        'Fringe NBA': 7
    };

    return (
        <ProspectTable
            prospects={prospects}
            rankingSystem={rankingSystem}
            columns={columns}
            tierRankMap={tierRankMap}
        />
    );
};

type RankType = string;
{/* Filters */ }
function TimelineSlider({ initialProspects, selectedYear, setSelectedYear }: {
  initialProspects: DraftProspect[];
  selectedYear: number;
  setSelectedYear: (year: number) => void;
}) {
  // Update initial state to use 'Avg. Rank Y1-Y5' (5Y Avg) instead of 'Actual Pick'
  const [selectedSortKey, setSelectedSortKey] = useState<string>('Avg. Rank Y1-Y5');
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [displayedProspects, setDisplayedProspects] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(false);
  const [, setIsMobile] = useState(false);
  const [tierRankActive, setTierRankActive] = useState(true); // Always start with tiers active

  // Update the effect to use 'Avg. Rank Y1-Y5' for both years
  useEffect(() => {
    if (selectedYear === 2025) {
      setSelectedSortKey('Avg. Rank Y1-Y5'); // Use 5Y Avg for 2025
      setTierRankActive(true);
    } else {
      setSelectedSortKey('Avg. Rank Y1-Y5'); // Use 5Y Avg for 2024
      setTierRankActive(true);
    }
  }, [selectedYear]);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle scroll event for infinite loading
  useEffect(() => {
    const handleScroll = () => {
      if (viewMode !== 'cards' || isLoading) return;

      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Load more when user is near bottom (within 100px)
      if (documentHeight - scrollPosition < 100) {
        setIsLoading(true);
        // Simulate loading delay
        setTimeout(() => {
          setDisplayedProspects(prev => prev + 5);
          setIsLoading(false);
        }, 500);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [viewMode, isLoading]);

  // Reset displayed prospects when filters change
  useEffect(() => {
    setDisplayedProspects(5);
  }, [selectedSortKey, selectedPosition, searchQuery, tierRankActive]); // Include tierRankActive

  // Create a separate ranking system that's independent of search filters but includes position and tier filters
  const rankingSystem = useMemo(() => {
    // Filter out invalid prospects for ranking calculations
    let validProspects = initialProspects.filter(prospect =>
      prospect.Name !== 'Ulrich Chomche' &&
      prospect['G Played Issue'] !== '1'
    );

    // Apply position filter if selected (this affects ranking)
    if (selectedPosition) {
      validProspects = validProspects.filter(prospect => prospect.Role === selectedPosition);
    }

    // Apply tier filter if selected (this affects ranking)
    if (selectedTier) {
      validProspects = validProspects.filter(prospect => prospect.Tier === selectedTier);
    }

    // Define tierRankMap for sorting
    const tierRankMap = {
      'All-Time Great': 1,
      'All-NBA Caliber': 2,
      'Fringe All-Star': 3,
      'Quality Starter': 4,
      'Solid Rotation': 5,
      'Bench Reserve': 6,
      'Fringe NBA': 7
    };

    // Sort prospects based on current sort key and tier ranking
    const sortedProspects = [...validProspects].sort((a, b) => {
      // If tier ranking is active, always sort by tier first
      if (tierRankActive) {
        const aTierRank = tierRankMap[a.Tier as keyof typeof tierRankMap] || 999;
        const bTierRank = tierRankMap[b.Tier as keyof typeof tierRankMap] || 999;

        // If tiers are different, sort by tier
        if (aTierRank !== bTierRank) {
          return aTierRank - bTierRank;
        }

        // If tiers are the same, sort by the selected metric
        if (selectedSortKey === 'Avg. Rank Y1-Y3') {
          const aValue = Number(a['Avg. EPM Y1-Y3']) || 0;
          const bValue = Number(b['Avg. EPM Y1-Y3']) || 0;
          return bValue - aValue; // Higher EPM is better
        } else if (selectedSortKey === 'Avg. Rank Y1-Y5') {
          const aValue = Number(a['Avg. EPM Y1-Y5']) || 0;
          const bValue = Number(b['Avg. EPM Y1-Y5']) || 0;
          return bValue - aValue; // Higher EPM is better
        } else if (selectedSortKey.includes('EPM')) {
          const aValue = Number(a[selectedSortKey as keyof DraftProspect]) || 0;
          const bValue = Number(b[selectedSortKey as keyof DraftProspect]) || 0;
          return bValue - aValue;
        } else if (selectedSortKey.includes('Rank')) {
          const aValue = Number(a[selectedSortKey as keyof DraftProspect]) || 999;
          const bValue = Number(b[selectedSortKey as keyof DraftProspect]) || 999;
          return aValue - bValue;
        } else if (selectedSortKey === 'Actual Pick') {
          const aPick = Number(a['Actual Pick']) || 999;
          const bPick = Number(b['Actual Pick']) || 999;
          return aPick - bPick;
        }
      } else {
        // If tier ranking is not active, use normal sorting
        if (selectedSortKey === 'Avg. Rank Y1-Y3') {
          const aValue = Number(a['Avg. EPM Y1-Y3']) || 0;
          const bValue = Number(b['Avg. EPM Y1-Y3']) || 0;
          return bValue - aValue; // Higher EPM is better
        } else if (selectedSortKey === 'Avg. Rank Y1-Y5') {
          const aValue = Number(a['Avg. EPM Y1-Y5']) || 0;
          const bValue = Number(b['Avg. EPM Y1-Y5']) || 0;
          return bValue - aValue; // Higher EPM is better
        } else if (selectedSortKey.includes('EPM')) {
          const aValue = Number(a[selectedSortKey as keyof DraftProspect]) || 0;
          const bValue = Number(b[selectedSortKey as keyof DraftProspect]) || 0;
          return bValue - aValue;
        } else if (selectedSortKey.includes('Rank')) {
          const aValue = Number(a[selectedSortKey as keyof DraftProspect]) || 999;
          const bValue = Number(b[selectedSortKey as keyof DraftProspect]) || 999;
          return aValue - bValue;
        } else if (selectedSortKey === 'Actual Pick') {
          const aPick = Number(a['Actual Pick']) || 999;
          const bPick = Number(b['Actual Pick']) || 999;
          return aPick - bPick;
        }
      }
      return 0;
    });

    // Create a map of prospect names to their ranks
    const rankingMap = new Map<string, number>();
    sortedProspects.forEach((prospect, index) => {
      rankingMap.set(prospect.Name, index + 1);
    });

    return rankingMap;
  }, [initialProspects, selectedSortKey, selectedPosition, selectedTier, tierRankActive, selectedYear]); // Include position and tier filters, but NOT searchQuery

  const filteredProspects = useMemo(() => {
    // Apply filters
    let filtered = initialProspects.filter(prospect =>
      prospect.Name !== 'Ulrich Chomche' && // Filter out Ulrich Chomche
      prospect['G Played Issue'] !== '1' // Filter out prospects with G Played Issue = 1
    );

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(prospect => {
        const fullName = prospect.Name.toLowerCase();
        const nameMatch = fullName.includes(query);
        const preNBAMatch = prospect['Pre-NBA'].toLowerCase().includes(query);

        // Handle team name search - use the NBA column directly for both years
        let teamMatch = false;
        if (selectedYear === 2025) {
          // For 2025, use 'NBA Team' field (assuming it contains abbreviated names)
          const teamAbbrev = prospect['NBA Team'].toLowerCase();
          teamMatch = teamAbbrev.includes(query);
        } else {
          // For 2024, use 'NBA' field (contains abbreviations)
          const teamAbbrev = prospect['NBA Team'].toLowerCase();
          teamMatch = teamAbbrev.includes(query);
        }

        return nameMatch || preNBAMatch || teamMatch;
      });
    }

    // Apply position filter if selected
    if (selectedPosition) {
      filtered = filtered.filter(prospect => prospect.Role === selectedPosition);
    }

    if (selectedTier) {
      filtered = filtered.filter(prospect => prospect.Tier === selectedTier);
    }

    // Sort the filtered prospects using the same logic as the ranking system
    const tierRankMap = {
      'All-Time Great': 1,
      'All-NBA Caliber': 2,
      'Fringe All-Star': 3,
      'Quality Starter': 4,
      'Solid Rotation': 5,
      'Bench Reserve': 6,
      'Fringe NBA': 7
    };

    const sortedFiltered = [...filtered].sort((a, b) => {
      // If tier ranking is active, always sort by tier first
      if (tierRankActive) {
        const aTierRank = tierRankMap[a.Tier as keyof typeof tierRankMap] || 999;
        const bTierRank = tierRankMap[b.Tier as keyof typeof tierRankMap] || 999;

        // If tiers are different, sort by tier
        if (aTierRank !== bTierRank) {
          return aTierRank - bTierRank;
        }

        // If tiers are the same, sort by the selected metric
        if (selectedSortKey === 'Avg. Rank Y1-Y3') {
          const aValue = Number(a['Avg. EPM Y1-Y3']) || 0;
          const bValue = Number(b['Avg. EPM Y1-Y3']) || 0;
          return bValue - aValue; // Higher EPM is better
        } else if (selectedSortKey === 'Avg. Rank Y1-Y5') {
          const aValue = Number(a['Avg. EPM Y1-Y5']) || 0;
          const bValue = Number(b['Avg. EPM Y1-Y5']) || 0;
          return bValue - aValue; // Higher EPM is better
        } else if (selectedSortKey.includes('EPM')) {
          const aValue = Number(a[selectedSortKey as keyof DraftProspect]) || 0;
          const bValue = Number(b[selectedSortKey as keyof DraftProspect]) || 0;
          return bValue - aValue;
        } else if (selectedSortKey.includes('Rank')) {
          const aValue = Number(a[selectedSortKey as keyof DraftProspect]) || 999;
          const bValue = Number(b[selectedSortKey as keyof DraftProspect]) || 999;
          return aValue - bValue;
        } else if (selectedSortKey === 'Actual Pick') {
          const aPick = Number(a['Actual Pick']) || 999;
          const bPick = Number(b['Actual Pick']) || 999;
          return aPick - bPick;
        }
      } else {
        // If tier ranking is not active, use normal sorting
        if (selectedSortKey === 'Avg. Rank Y1-Y3') {
          const aValue = Number(a['Avg. EPM Y1-Y3']) || 0;
          const bValue = Number(b['Avg. EPM Y1-Y3']) || 0;
          return bValue - aValue; // Higher EPM is better
        } else if (selectedSortKey === 'Avg. Rank Y1-Y5') {
          const aValue = Number(a['Avg. EPM Y1-Y5']) || 0;
          const bValue = Number(b['Avg. EPM Y1-Y5']) || 0;
          return bValue - aValue; // Higher EPM is better
        } else if (selectedSortKey.includes('EPM')) {
          const aValue = Number(a[selectedSortKey as keyof DraftProspect]) || 0;
          const bValue = Number(b[selectedSortKey as keyof DraftProspect]) || 0;
          return bValue - aValue;
        } else if (selectedSortKey.includes('Rank')) {
          const aValue = Number(a[selectedSortKey as keyof DraftProspect]) || 999;
          const bValue = Number(b[selectedSortKey as keyof DraftProspect]) || 999;
          return aValue - bValue;
        } else if (selectedSortKey === 'Actual Pick') {
          const aPick = Number(a['Actual Pick']) || 999;
          const bPick = Number(b['Actual Pick']) || 999;
          return aPick - bPick;
        }
      }
      return 0;
    });

    // Map the sorted and filtered prospects to include their original rank from the ranking system
    return sortedFiltered.map(prospect => {
      let rank: RankType;

      if (selectedSortKey === 'Actual Pick') {
        // When sorting by Actual Pick, use the actual draft pick number
        const pickNumber = Number(prospect['Actual Pick']);
        if (selectedYear === 2025) {
          // 2025: picks 1-59 are drafted, 60+ are UDFA
          if (!isNaN(pickNumber) && pickNumber <= 59) {
            rank = pickNumber.toString();
          } else {
            rank = 'UDFA';
          }
        } else {
          // 2024: picks 1-58 are drafted, 59+ are UDFA
          if (!isNaN(pickNumber) && pickNumber <= 58) {
            rank = pickNumber.toString();
          } else {
            rank = 'UDFA';
          }
        }
      } else {
        // For other sorting methods, use the rank from the ranking system
        const originalRank = rankingSystem.get(prospect.Name);
        rank = originalRank ? originalRank.toString() : 'N/A';
      }

      return {
        prospect,
        originalRank: rank
      };
    });

  }, [initialProspects, selectedSortKey, selectedPosition, searchQuery, selectedTier, tierRankActive, selectedYear, rankingSystem]); // Include rankingSystem in dependencies

  // const handleTierRankClick = () => {
  //   setTierRankActive(prev => !prev); // Toggle Tier Ranked state
  //   setSelectedSortKey('Actual Pick'); // Keep sort key as Actual Pick.
  // };

  return (
    <div className="bg-[#19191A] min-h-screen">
      <TimelineFilter
        selectedSortKey={selectedSortKey}
        setSelectedSortKey={setSelectedSortKey}
        selectedPosition={selectedPosition}
        setSelectedPosition={setSelectedPosition}
        selectedTier={selectedTier}
        setSelectedTier={setSelectedTier}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
        setViewMode={setViewMode}
        tierRankActive={tierRankActive}
        setTierRankActive={setTierRankActive}
        filteredProspects={filteredProspects.map(item => item.prospect)}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
      />

      <div className="max-w-6xl mx-auto px-4 pt-8">
        {filteredProspects.length > 0 ? (
          viewMode === 'cards' ? (
            <div className="space-y-4">
              {filteredProspects.slice(0, displayedProspects).map(({ prospect, originalRank }) => (
                <MaxPageProspectCard
                  key={prospect.Name}
                  prospect={prospect}
                  rank={originalRank ?? 'N/A'}
                  filteredProspects={filteredProspects.map(item => item.prospect)}
                  allProspects={initialProspects} // Pass all prospects
                  selectedSortKey={selectedSortKey}
                  selectedYear={selectedYear}
                />
              ))}
              {isLoading && (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
                </div>
              )}
            </div>
          ) : (
            <MaxProspectTable
              prospects={filteredProspects.map(item => item.prospect)}
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

// Add a new component for league logos
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

export default function DraftProspectsPage() {
  const [prospects, setProspects] = useState<DraftProspect[]>([]);
  const [selectedYear, setSelectedYear] = useState(2025);

  useEffect(() => {
    document.title = 'Max NBA Draft Board';
  }, []);

  useEffect(() => {
    async function fetchDraftProspects() {
      try {
        const csvFile = selectedYear === 2025 ? '/2025_Draft_Class.csv' : '/2024_Draft_Class.csv';
        const response = await fetch(csvFile);
        const csvText = await response.text();

        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            const prospectData = results.data as DraftProspect[];

            // Filter out prospects with G Played Issue = '1' for all ranking calculations
            const validProspects = prospectData.filter(p => p['G Played Issue'] !== '1');

            // Calculate position rankings for all prospects
            const prospectsWithRanks = prospectData.map(prospect => {
              // If this prospect has G Played Issue, skip ranking calculations
              if (prospect['G Played Issue'] === '1') {
                return {
                  ...prospect,
                  positionRanks: { Y1: 0, Y2: 0, Y3: 0, Y4: 0, Y5: 0, Y1Y3: 0, Y1Y5: 0 },
                  avg3YEPM: 0,
                  avg5YEPM: 0,
                  globalRank3Y: 0,
                  globalRank5Y: 0,
                  'Avg. EPM Y1-Y3': 0,
                  'Avg. EPM Y1-Y5': 0,
                  'Rank Y1-Y3': 0,
                  'Rank Y1-Y5': 0
                };
              }

              // Get all VALID prospects with the same role
              const samePositionValidProspects = validProspects.filter(p => p.Role === prospect.Role);

              // Calculate position ranks for each year
              const positionRanks = {
                Y1: 0,
                Y2: 0,
                Y3: 0,
                Y4: 0,
                Y5: 0,
                Y1Y3: 0,
                Y1Y5: 0
              };

              // Calculate position ranks for each year using only valid prospects
              ['Y1', 'Y2', 'Y3', 'Y4', 'Y5'].forEach(year => {
                const yearKey = `Pred. ${year} EPM` as keyof DraftProspect;
                const sortedByYear = [...samePositionValidProspects].sort((a, b) => {
                  const aEPM = Number(a[yearKey]) || 0;
                  const bEPM = Number(b[yearKey]) || 0;
                  return bEPM - aEPM;
                });
                positionRanks[year as keyof typeof positionRanks] =
                  sortedByYear.findIndex(p => p.Name === prospect.Name) + 1;
              });

              // Calculate 3-year average EPM
              const avg3YEPM = (
                Number(prospect['Pred. Y1 EPM'] || 0) +
                Number(prospect['Pred. Y2 EPM'] || 0) +
                Number(prospect['Pred. Y3 EPM'] || 0)
              ) / 3;

              // Calculate 5-year average EPM
              const avg5YEPM = (
                Number(prospect['Pred. Y1 EPM'] || 0) +
                Number(prospect['Pred. Y2 EPM'] || 0) +
                Number(prospect['Pred. Y3 EPM'] || 0) +
                Number(prospect['Pred. Y4 EPM'] || 0) +
                Number(prospect['Pred. Y5 EPM'] || 0)
              ) / 5;

              // Calculate 3-year average rankings using only valid prospects
              const validProspectsWith3YAvg = [...validProspects].map(p => {
                const p3YAvg = (
                  Number(p['Pred. Y1 EPM'] || 0) +
                  Number(p['Pred. Y2 EPM'] || 0) +
                  Number(p['Pred. Y3 EPM'] || 0)
                ) / 3;
                return { ...p, avg3YEPM: p3YAvg };
              });

              // Calculate 5-year average rankings using only valid prospects
              const validProspectsWith5YAvg = [...validProspects].map(p => {
                const p5YAvg = (
                  Number(p['Pred. Y1 EPM'] || 0) +
                  Number(p['Pred. Y2 EPM'] || 0) +
                  Number(p['Pred. Y3 EPM'] || 0) +
                  Number(p['Pred. Y4 EPM'] || 0) +
                  Number(p['Pred. Y5 EPM'] || 0)
                ) / 5;
                return { ...p, avg5YEPM: p5YAvg };
              });

              // Get global rankings (all positions) using only valid prospects
              const sortedBy3YAvgAll = [...validProspectsWith3YAvg].sort((a, b) => b.avg3YEPM - a.avg3YEPM);
              const globalRank3Y = sortedBy3YAvgAll.findIndex(p => p.Name === prospect.Name) + 1;

              const sortedBy5YAvgAll = [...validProspectsWith5YAvg].sort((a, b) => b.avg5YEPM - a.avg5YEPM);
              const globalRank5Y = sortedBy5YAvgAll.findIndex(p => p.Name === prospect.Name) + 1;

              // Get position-specific rankings using only valid prospects
              const samePositionValidProspectsWith3YAvg = validProspectsWith3YAvg.filter(p => p.Role === prospect.Role);
              const sortedBy3YAvgPosition = [...samePositionValidProspectsWith3YAvg].sort((a, b) => b.avg3YEPM - a.avg3YEPM);
              positionRanks.Y1Y3 = sortedBy3YAvgPosition.findIndex(p => p.Name === prospect.Name) + 1;

              const samePositionValidProspectsWith5YAvg = validProspectsWith5YAvg.filter(p => p.Role === prospect.Role);
              const sortedBy5YAvgPosition = [...samePositionValidProspectsWith5YAvg].sort((a, b) => b.avg5YEPM - a.avg5YEPM);
              positionRanks.Y1Y5 = sortedBy5YAvgPosition.findIndex(p => p.Name === prospect.Name) + 1;

              // Calculate individual year rankings for both overall and position
              const yearRankings: { [key: string]: number } = {};
              ['Y1', 'Y2', 'Y3', 'Y4', 'Y5'].forEach(year => {
                const yearKey = `Pred. ${year} EPM` as keyof DraftProspect;

                // Overall ranking (all positions) using only valid prospects
                const sortedByYearOverall = [...validProspects].sort((a, b) => {
                  const aEPM = Number(a[yearKey]) || 0;
                  const bEPM = Number(b[yearKey]) || 0;
                  return bEPM - aEPM;
                });
                const overallYearRank = sortedByYearOverall.findIndex(p => p.Name === prospect.Name) + 1;
                yearRankings[`Pred. ${year} Rank`] = overallYearRank;

                // Position ranking using only valid prospects
                const sortedByYearPosition = [...samePositionValidProspects].sort((a, b) => {
                  const aEPM = Number(a[yearKey]) || 0;
                  const bEPM = Number(b[yearKey]) || 0;
                  return bEPM - aEPM;
                });
                const positionYearRank = sortedByYearPosition.findIndex(p => p.Name === prospect.Name) + 1;
                yearRankings[`Pred. ${year} Position Rank`] = positionYearRank;
              });

              return {
                ...prospect,
                ...yearRankings,
                positionRanks,
                avg3YEPM,
                avg5YEPM,
                globalRank3Y,
                globalRank5Y,
                'Avg. EPM Y1-Y3': avg3YEPM,
                'Avg. EPM Y1-Y5': avg5YEPM,
                'Rank Y1-Y3': globalRank3Y,
                'Rank Y1-Y5': globalRank5Y
              };
            });

            setProspects(prospectsWithRanks);
          }
        });
      } catch (error) {
        console.error('Error fetching draft prospects:', error);
      }
    }

    fetchDraftProspects();
  }, [selectedYear]);

  return (
    <>
      <Head>
        <title>Draft Board - Max</title>
      </Head>
      <div className="min-h-screen bg-[#19191A]">
        <NavigationHeader activeTab="Max Savin" />
        <DraftPageHeader author="Max Savin" />
        <GoogleAnalytics gaId="G-X22HKJ13B7" />
        <TimelineSlider
          initialProspects={prospects}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
        />
      </div>
    </>
  );
}