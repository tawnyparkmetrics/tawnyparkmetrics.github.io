"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LucideUser, X, ChevronDown, SlidersHorizontal } from 'lucide-react';
import Papa from 'papaparse';
import { motion } from 'framer-motion';
// import Link from 'next/link';
import { Search, Table as TableIcon } from 'lucide-react';
import { Input } from '@/components/ui/input'; // Import the Input component
import NavigationHeader from '@/components/NavigationHeader';
import DraftPageHeader from '@/components/DraftPageHeader';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
    'Age Score': string;
    'Athletic Score': string;
    'Scoring Score': string;
    'Defense Score': string;
    'Measurables Score': string;
    'Self Creation Score': string;
    'Touch Score': string;
    'IQ Score': string;
    'Usage Score': string;
    'Cumulative Prospect Score': string;
    'Cumulative PS/1000': string;
    'Tier': string;

    Summary?: string;
    originalRank?: number;

    'ABV': string;

}

const tierColors: { [key: string]: string } = {
    '10': '#FF66C4',
    '9': '#E9A2FF',
    '8': '#5CE1E6',
    '7': '#7089FF',
    '6': '#CBFD82',
    '5': '#7ED957',
    '4': '#FFDE59',
    '3': '#FFA455',
    '2': '#FF8F8F',
    '1': '#FF5757',
};

const tiers = [
    { key: '10', label: 'Tier 10' },
    { key: '9', label: 'Tier 9' },
    { key: '8', label: 'Tier 8' },
    { key: '7', label: 'Tier 7' },
    { key: '6', label: 'Tier 6' },
    { key: '5', label: 'Tier 5' },
    { key: '4', label: 'Tier 4' },
    { key: '3', label: 'Tier 3' },
    { key: '2', label: 'Tier 2' },
    { key: '1', label: 'Tier 1' },
];

const SpiderChart: React.FC<{
    prospect: DraftProspect;
    selectedYear: number;
}> = ({ prospect, selectedYear }) => {
    const [showComparison, setShowComparison] = useState(false);
    const [comparisonPlayer, setComparisonPlayer] = useState<DraftProspect | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [allPlayers, setAllPlayers] = useState<DraftProspect[]>([]);
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

    // Updated useEffect to fetch all players regardless of role
    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const csvFile = '/Andre Liu Flagg Plant Model - Andre Liu 2025 Model Board.csv';
                const response = await fetch(csvFile);
                const csvText = await response.text();
                Papa.parse(csvText, {
                    header: true,
                    complete: (results) => {
                        const allPlayersData = results.data as DraftProspect[];
                        // Filter out only the current prospect, but keep all other players regardless of role
                        const availablePlayers = allPlayersData.filter(
                            p => p.Name !== prospect.Name
                        );
                        setAllPlayers(availablePlayers);
                    }
                });
            } catch (error) {
                console.error('Error fetching players:', error);
            }
        };
        fetchPlayers();
    }, [prospect.Name, selectedYear]);

    const getAttributeValue = (value: string | number | undefined): number => {
        if (value === undefined) return 0;
        if (value === '') return 0;
        if (typeof value === 'string') {
            value = value.trim();
        }
        const numValue = Number(value);
        return !isNaN(numValue) ? numValue : 0;
    };

    // Helper function to get comparison player's attribute value
    const getComparisonAttributeValue = (comparisonPlayer: DraftProspect, attributeName: string): number => {
        const attributeMap: { [key: string]: keyof DraftProspect } = {
            'Age': 'Age Score',
            'Athleticism': 'Athletic Score',
            'Scoring': 'Scoring Score',
            'Defense': 'Defense Score',
            'Measurables': 'Measurables Score',
            'Self Creation': 'Self Creation Score',
            'Touch': 'Touch Score',
            'IQ': 'IQ Score',
            'Usage': 'Usage Score',
            'Cumulative': 'Cumulative PS/1000',
        };

        const csvFieldName = attributeMap[attributeName];
        if (!csvFieldName) return 0;

        return getAttributeValue(comparisonPlayer[csvFieldName] as string | number | undefined);
    };

    // Create combined data array for the radar chart
    const chartData = useMemo(() => {
        const attributes = [
            { name: 'Cumulative', value: getAttributeValue(prospect['Cumulative PS/1000']) },
            { name: 'Measurables', value: getAttributeValue(prospect['Measurables Score']) },
            { name: 'Athelticism', value: getAttributeValue(prospect['Athletic Score']) },
            { name: 'Defense', value: getAttributeValue(prospect['Defense Score']) },
            { name: 'Usage', value: getAttributeValue(prospect['Usage Score']) },
            { name: 'Scoring', value: getAttributeValue(prospect['Scoring Score']) },
            { name: 'Self Creation', value: getAttributeValue(prospect['Self Creation Score']) },
            { name: 'Touch', value: getAttributeValue(prospect['Touch Score']) },
            { name: 'IQ', value: getAttributeValue(prospect['IQ Score']) },
            { name: 'Age', value: getAttributeValue(prospect['Age Score']) },
        ];

        if (showComparison && comparisonPlayer) {
            return attributes.map(attr => ({
                name: attr.name,
                [prospect.Name]: attr.value,
                [comparisonPlayer.Name]: getComparisonAttributeValue(comparisonPlayer, attr.name)
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
                        <div className="absolute top-full left-0 mt-1 w-48 bg-gray-800/90 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto z-20">
                            {allPlayers.map((player) => (
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

const AndrePageProspectCard: React.FC<{
    prospect: DraftProspect;
    rank: RankType;
    filteredProspects: DraftProspect[];
    allProspects: DraftProspect[];
    selectedSortKey: string;
    selectedYear: number;
    rankingSystem: Map<string, number>;
}> = ({ prospect, selectedSortKey, selectedYear, rankingSystem }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [, setIsHovered] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [activeChart] = useState('spider');

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

    // Update hover state when dropdown is expanded
    useEffect(() => {
        if (isExpanded && !isMobile) {
            setIsHovered(true);
        }
    }, [isExpanded, isMobile]);

    // First, extract the complex expression to a variable
    const pickNumber = Number(prospect['Actual Pick']);

    // Then modify the useMemo hook to use the ranking system
    const currentRank = useMemo(() => {
        if (selectedSortKey === 'Rank') {
            // For draft order, use the actual pick number
            if (!isNaN(pickNumber) && pickNumber <= 58) {
                return pickNumber;
            } else {
                // For UDFAs, return "UDFA" instead of a number
                return "UDFA";
            }
        } else {
            // For other sorting methods, use the ranking system
            return rankingSystem.get(prospect.Name) || 1;
        }
    }, [prospect, selectedSortKey, pickNumber, rankingSystem]);

    // Data for the new table (example values)
    const tableData = useMemo(() => ([
        { label: 'Cumulative', value: prospect['Cumulative PS/1000'] || 'N/A' },
        { label: 'Age', value: prospect['Age Score'] || 'N/A' },
        { label: 'Measurables', value: prospect['Measurables Score'] || 'N/A' },
        { label: 'Athleticism', value: prospect['Athletic Score'] || 'N/A' },
        { label: 'Defense', value: prospect['Defense Score'] || 'N/A' },
        { label: 'Usage', value: prospect['Usage Score'] || 'N/A' },
        { label: 'Scoring', value: prospect['Scoring Score'] || 'N/A' },
        { label: 'Self Creation', value: prospect['Self Creation Score'] || 'N/A' },
        { label: 'Touch', value: prospect['Touch Score'] || 'N/A' },
        { label: 'IQ', value: prospect['IQ Score'] || 'N/A' },
    ]), [prospect]);

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
            {/* Andre's specific dropdown content with layout optimization */}
            {/* Expanded View Content with pre-allocated space */}
                            <div className={`${isMobile ? '' : 'grid grid-cols-2 gap-4'}`}>
                                {/* Charts Column - Now on the left (first column) */}
                    <div className="text-gray-300 px-2 space-y-4 flex flex-col justify-start">
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
                                            Tier {prospect.Tier}
                                        </span>
                                    </h3>

                        {/* Chart Container - Allow natural height */}
                        <div className="mb-4 min-h-[250px]">
                                        {activeChart === 'spider' && (
                                            <SpiderChart
                                                prospect={prospect}
                                                selectedYear={selectedYear}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Prospect Scores Table - Now shows on both mobile and desktop */}
                                <div className="text-gray-300 px-2">
                                    <h3 className="font-semibold text-lg mb-3 text-white mt-2">
                                        Prospect Scores
                                    </h3>

                                    {/* Mobile version - single column layout */}
                                    {isMobile ? (
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between font-bold text-gray-400 mb-2 border-b border-gray-600 pb-1">
                                                <span className="text-left">Category</span>
                                                <span className="text-center">Score</span>
                                            </div>
                                            {tableData.map((item, index) => (
                                                <div key={index} className="flex justify-between py-1 border-b border-gray-700">
                                                    <span className="font-bold text-white">{item.label}</span>
                                                    <span className="text-gray-300">{item.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        /* Desktop version - two column layout */
                                        <div className="grid grid-cols-2 gap-4 text-sm h-72">
                                            {/* First 5x2 table */}
                                            <div className="flex flex-col justify-around">
                                                {/* Subheaders for the first column group */}
                                                <div className="flex justify-between font-bold text-gray-400 mb-2">
                                                    <span className="text-left w-1/2">Category</span>
                                                    <span className="text-center w-1/2">Score</span>
                                                </div>
                                                {tableData.slice(0, 5).map((item, index) => (
                                                    <div key={index} className="flex justify-between py-1 border-b border-gray-700">
                                                        <span className="font-bold text-white w-1/2">{item.label}</span>
                                                        <span className="text-gray-300 text-center w-1/2">{item.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            {/* Second 5x2 table */}
                                            <div className="flex flex-col justify-around">
                                                {/* Subheaders for the second column group (empty and hidden for redundancy avoidance) */}
                                                <div className="flex justify-between font-bold text-white mb-2 opacity-0">
                                                    <span className="text-left w-1/2">Category</span>
                                                    <span className="text-center w-1/2">Score</span>
                                                </div>
                                                {tableData.slice(5, 10).map((item, index) => (
                                                    <div key={index} className="flex justify-between py-1 border-b border-gray-700">
                                                        <span className="font-bold text-white w-1/2">{item.label}</span>
                                                        <span className="text-gray-300 text-center w-1/2">{item.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
        </BaseProspectCard>
    );
};

type RankType = number | 'N/A';


interface ProspectFilterProps {
    prospects: DraftProspect[];
    onFilteredProspectsChange?: (filteredProspects: DraftProspect[]) => void;
    rank: Record<string, RankType>;
    onViewModeChange?: (mode: 'card' | 'table') => void;
    onFilterStateChange?: (filterState: { roleFilter: 'all' | 'Guard' | 'Wing' | 'Big', selectedTier: string | null }) => void;
}

const ProspectFilter: React.FC<ProspectFilterProps> = ({
    prospects,
    onFilteredProspectsChange,
    onViewModeChange,
    onFilterStateChange
}) => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'Guard' | 'Wing' | 'Big'>('all');
    const [selectedTier, setSelectedTier] = useState<string | null>(null); // New state for tier filter
    const [, setLocalFilteredProspects] = useState(prospects);
    const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Use useCallback to prevent infinite re-renders
    const handleViewModeChange = useCallback((mode: 'card' | 'table') => {
        setViewMode(mode);
        if (onViewModeChange) {
            onViewModeChange(mode);
        }
    }, [onViewModeChange]);

    // Use useCallback for filter state changes
    const handleFilterStateChange = useCallback((newRoleFilter: 'all' | 'Guard' | 'Wing' | 'Big', newSelectedTier: string | null) => {
        if (onFilterStateChange) {
            onFilterStateChange({ roleFilter: newRoleFilter, selectedTier: newSelectedTier });
        }
    }, [onFilterStateChange]);

    // Update view mode when it changes
    useEffect(() => {
        handleViewModeChange(viewMode);
    }, [viewMode, handleViewModeChange]);

    // Update filter state when role or tier changes
    useEffect(() => {
        handleFilterStateChange(roleFilter, selectedTier);
    }, [roleFilter, selectedTier, handleFilterStateChange]);

    const hasActiveFilters = () => {
        return (
            roleFilter !== 'all' ||
            searchQuery !== '' ||
            selectedTier !== null // Check if a tier is selected
        );
    };

    const resetFilters = () => {
        setSearchQuery('');
        setRoleFilter('all');
        setSelectedTier(null); // Reset tier filter
        setLocalFilteredProspects(prospects);
        setIsMobileFilterOpen(false);

        if (onFilteredProspectsChange) {
            onFilteredProspectsChange(prospects);
        }
    };

    // Function to handle tier click
    const handleTierClick = (tierKey: string) => {
        setSelectedTier(prevTier => (prevTier === tierKey ? null : tierKey)); // Toggle selection
    };

    useEffect(() => {
        let results = prospects;

        if (roleFilter !== 'all') {
            results = results.filter((prospect) => prospect.Role === roleFilter);
        }

        if (selectedTier !== null) { // Apply tier filter
            results = results.filter((prospect) => prospect.Tier === selectedTier);
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
    }, [prospects, searchQuery, roleFilter, selectedTier, onFilteredProspectsChange]); // Add selectedTier to dependencies

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

                    {/* View Mode Dropdown - Right Side */}
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
                                placeholder="Search by name, pre-NBA team, or NBA team"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full bg-gray-800/20 border-gray-800 text-gray-300 placeholder-gray-500 rounded-lg focus:border-blue-500/30 focus:ring-1 focus:ring-blue-500/30 hidden sm:block"
                            />
                        </div>
                    </div>

                    {/* Reset button - Always visible */}
                    <motion.button
                        onClick={resetFilters}
                        className={`ml-2 flex items-center px-3 py-2 rounded-lg text-xs transition-all duration-300 ${hasActiveFilters()
                            ? 'text-red-400 hover:text-red-300 bg-gray-800/20 border border-gray-800 hover:border-red-700/30'
                            : 'text-gray-500 bg-gray-800/10 border border-gray-800/50 cursor-not-allowed opacity-50'
                            }`}
                        whileHover={hasActiveFilters() ? { scale: 1.05 } : {}}
                        whileTap={hasActiveFilters() ? { scale: 0.95 } : {}}
                        disabled={!hasActiveFilters()}
                    >
                        <X className="h-4 w-4" />
                        Reset
                    </motion.button>
                </div>

                {/* Filters and View Mode Container */}
                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end space-x-2">
                    {/* Mobile Only: Position Section */}
                    <div className="w-full sm:hidden mb-4">
                        <div className="text-sm text-gray-400 mb-3"></div>
                        <div className="flex items-center gap-2">
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

                            {/* Divider */}
                            <div className="h-8 w-px bg-gray-700/30 mx-2" />

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <motion.button
                                        className={`
                  relative px-3 py-2 rounded-lg text-sm font-medium
                  flex items-center gap-2 w-fit
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
                    </div>

                    {/* Desktop Filters */}
                    <div className="hidden sm:flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end space-x-2">
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

                        {/* Desktop Tier Filter */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <motion.button
                                    className={`
                      relative px-3 py-2 rounded-lg text-sm font-medium
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
                                                className="w-3 h-3 rounded-sm"
                                                style={{ backgroundColor: tierColors[tier.key] }}
                                            ></span>
                                            {tier.label}
                                        </div>
                                    </DropdownMenuItem>
                                ))}
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
        </div >
    );
};

export default function AndreDraftPage() {
    const [prospects, setProspects] = useState<DraftProspect[]>([]);
    const [filteredProspects, setFilteredProspects] = useState<DraftProspect[]>([]);
    const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
    const [loadedProspects, setLoadedProspects] = useState<number>(5);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [filterState, setFilterState] = useState<{
        selectedSortKey: string;
        roleFilter: 'all' | 'Guard' | 'Wing' | 'Big';
        selectedTier: string | null;
    }>({
        selectedSortKey: 'Actual Pick',
        roleFilter: 'all',
        selectedTier: null
    });


    // Create a separate ranking system that's independent of search filters but includes position and tier filters
    const rankingSystem = useMemo(() => {
        // Apply the same filters as the ProspectFilter component (excluding search)
        let validProspects = [...prospects];

        // Apply role filter
        if (filterState.roleFilter !== 'all') {
            validProspects = validProspects.filter((prospect) => prospect.Role === filterState.roleFilter);
        }

        // Apply tier filter
        if (filterState.selectedTier !== null) {
            validProspects = validProspects.filter((prospect) => prospect.Tier === filterState.selectedTier);
        }

        // Create a ranking map based on the filtered prospects order
        const rankingMap = new Map<string, number>();
        validProspects.forEach((prospect, index) => {
            rankingMap.set(prospect.Name, index + 1);
        });
        return rankingMap;
    }, [prospects, filterState]); // Include filterState but NOT searchQuery

    useEffect(() => {
        document.title = 'Andre NBA Draft Board';
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

    useEffect(() => {
        async function fetchDraftProspects() {
            try {
                const response = await fetch('/Andre Liu Flagg Plant Model - Andre Liu 2025 Model Board.csv');
                const csvText = await response.text();

                Papa.parse(csvText, {
                    header: true,
                    complete: (results) => {
                        const prospectData = results.data as DraftProspect[];
                        setProspects(prospectData);
                        setFilteredProspects(prospectData);
                    }
                });
            } catch (error) {
                console.error('Error fetching draft prospects:', error);
            }
        }

        fetchDraftProspects();
    }, []);

    const AndreProspectTable = ({ prospects, rankingSystem }: { prospects: DraftProspect[], rankingSystem: Map<string, number> }) => {
        const initialColumns: ColumnConfig[] = [
            { key: 'Rank', label: 'Rank', category: 'Player Information', visible: true, sortable: true },
            { key: 'Name', label: 'Name', category: 'Player Information', visible: true, sortable: true },
            { key: 'Role', label: 'Position', category: 'Player Information', visible: true, sortable: true },
            { key: 'League', label: 'League', category: 'Player Information', visible: true, sortable: true },
            { key: 'Pre-NBA', label: 'Pre-NBA', category: 'Player Information', visible: true, sortable: true },
            { key: 'Actual Pick', label: 'Draft Pick', category: 'Player Information', visible: true, sortable: true },
            { key: 'NBA Team', label: 'NBA Team', category: 'Player Information', visible: true, sortable: true },
            { key: 'Tier', label: 'Tier', category: 'Player Information', visible: true, sortable: true },
            { key: 'Age', label: 'Draft Age', category: 'Player Information', visible: false, sortable: true },
            { key: 'Height', label: 'Height', category: 'Player Information', visible: false, sortable: true },
            { key: 'Wingspan', label: 'Wingspan', category: 'Player Information', visible: false, sortable: true },
            { key: 'Wing - Height', label: 'Wing-Height', category: 'Player Information', visible: false, sortable: true },
            { key: 'Weight (lbs)', label: 'Weight', category: 'Player Information', visible: false, sortable: true },
            { key: 'Age Score', label: 'Age Score', category: 'Scoring Information', visible: false, sortable: true },
            { key: 'Athletic Score', label: 'Athletic Score', category: 'Scoring Information', visible: false, sortable: true },
            { key: 'Scoring Score', label: 'Scoring Score', category: 'Scoring Information', visible: false, sortable: true },
            { key: 'Defense Score', label: 'Defense Score', category: 'Scoring Information', visible: false, sortable: true },
            { key: 'Measurables Score', label: 'Measurables Score', category: 'Scoring Information', visible: false, sortable: true },
            { key: 'Self Creation Score', label: 'Self Creation Score', category: 'Scoring Information', visible: false, sortable: true },
            { key: 'Touch Score', label: 'Touch Score', category: 'Scoring Information', visible: false, sortable: true },
            { key: 'IQ Score', label: 'IQ Score', category: 'Scoring Information', visible: false, sortable: true },
            { key: 'Usage Score', label: 'Usage Score', category: 'Scoring Information', visible: false, sortable: true },
            { key: 'Cumulative Prospect Score', label: 'Cumulative Prospect Score', category: 'Scoring Information', visible: false, sortable: true },
            { key: 'Cumulative PS/1000', label: 'Cumulative PS/1000', category: 'Scoring Information', visible: false, sortable: true },
        ];

        return (
            <ProspectTable
                prospects={prospects}
                rankingSystem={rankingSystem}
                initialColumns={initialColumns}
                showTierPrefix={true} 
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

    // Fix the filter state management to prevent infinite loops
    const handleFilterStateChange = useCallback((newFilterState: { roleFilter: 'all' | 'Guard' | 'Wing' | 'Big', selectedTier: string | null }) => {
        setFilterState(prev => {
            // Only update if the values actually changed
            if (prev.roleFilter !== newFilterState.roleFilter || prev.selectedTier !== newFilterState.selectedTier) {
                return {
                    ...prev,
                    ...newFilterState,
                };
            }
            return prev;
        });
    }, []);

    return (
        <div className="min-h-screen bg-[#19191A]">
            <NavigationHeader activeTab="Andre Liu" />
            <DraftPageHeader author="Andre Liu" />
            <GoogleAnalytics gaId="G-X22HKJ13B7" />
            <ProspectFilter
                prospects={prospects}
                onFilteredProspectsChange={setFilteredProspects}
                rank={{}}
                onViewModeChange={setViewMode}
                onFilterStateChange={handleFilterStateChange}
            />

            <div className="max-w-6xl mx-auto px-4 pt-8">
                {filteredProspects.length > 0 ? (
                    viewMode === 'card' ? (
                        <motion.div layout className="space-y-4">
                            {/* AnimatePresence is removed as it's not used in the new ProspectTable */}
                            {filteredProspects.slice(0, isMobile ? filteredProspects.length : loadedProspects).map((prospect, index) => (
                                    <motion.div
                                    key={prospect.Name}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <AndrePageProspectCard
                                    prospect={prospect}
                                            rank={rankingSystem.get(prospect.Name) || (index + 1)}
                                            filteredProspects={filteredProspects}
                                            allProspects={prospects}
                                            selectedSortKey={filterState.selectedSortKey || 'default'}
                                            selectedYear={2025}
                                    rankingSystem={rankingSystem}
                                />
                                    </motion.div>
                            ))}
                            {isLoading && !isMobile && (
                                <div className="flex justify-center py-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <AndreProspectTable
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
