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
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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


const ProspectCard: React.FC<{
    prospect: DraftProspect;
    rank: RankType;
    filteredProspects: DraftProspect[];
    allProspects: DraftProspect[];
    selectedSortKey: string;
    selectedYear: number;
}> = ({ prospect, filteredProspects, selectedSortKey, selectedYear }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [logoError, setLogoError] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isMobileInfoExpanded, setIsMobileInfoExpanded] = useState(false);
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

    // Update hover state when dropdown is expanded
    useEffect(() => {
        if (isExpanded && !isMobile) {
            setIsHovered(true);
        }
    }, [isExpanded, isMobile]);

    const playerImageUrl = `/player_images2025/${prospect.Name} BG Removed.png`;
    const prenbalogoUrl = `/prenba_logos/${prospect['Pre-NBA']}.png`;

    // First, extract the complex expression to a variable
    const pickNumber = Number(prospect['Actual Pick']);

    // Then modify the useMemo hook
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
            // For other sorting methods, use the array index
            const index = filteredProspects.findIndex(p => p.Name === prospect.Name);
            return index + 1;
        }
    }, [prospect, filteredProspects, selectedSortKey, pickNumber]);

    // Helper function to get draft display text
const getDraftDisplayText = (isMobileView: boolean = false) => {
    const actualPick = prospect['Actual Pick'];
    const team = isMobileView ? (prospect['ABV'] || prospect['NBA Team']) : prospect['NBA Team'];
    
    // Check if actualPick exists and is not empty/whitespace
    if (actualPick && actualPick.toString().trim() !== '') {
        // Show "Pick - Team"
        const pickTeam = `${actualPick} - ${team}`;
        if (isMobileView) {
            return Object.keys(draftShort).reduce((name, longName) => {
                return name.replace(longName, draftShort[longName]);
            }, pickTeam);
        }
        return pickTeam;
    } else {
        // Show just the team (fallback to current behavior)
        if (isMobileView) {
            return Object.keys(draftShort).reduce((name, longName) => {
                return name.replace(longName, draftShort[longName]);
            }, team);
        }
        return team;
    }
};
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

    return (
        <div className={`mx-auto px-4 mb-4 ${isMobile ? 'max-w-sm' : 'max-w-5xl'}`}>
            <motion.div layout="position" transition={{ layout: { duration: 0.3, ease: "easeInOut" } }}>
                <div className="relative">
                    {/* Main card container - add mouse event handlers here */}
                    <div
                        className={`
            relative overflow-hidden transition-all duration-300 border rounded-xl border-gray-700/50 shadow-[0_0_15px_rgba(255,255,255,0.07)]
            ${!isMobile ? 'h-[400px] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:border-gray-600/50 cursor-pointer' : 'h-[100px] cursor-pointer'}
          `}
                        style={{ backgroundColor: '#19191A' }}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => {
                            if (isMobile) {
                                if (isMobileInfoExpanded) {
                                    setIsMobileInfoExpanded(false);
                                } else {
                                    setIsExpanded(!isExpanded);
                                }
                            } else {
                                setIsExpanded(!isExpanded);
                                if (!isExpanded) {
                                    setIsHovered(true);
                                }
                            }
                        }}
                    >
                        {/* Rank Number - Now using the dynamic currentRank */}
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
                                {currentRank}
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
                                            src={playerImageUrl}  // Use the dynamic playerImageUrl instead of hardcoded path
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
                        {isMobile ? (
                            isExpanded && (
                                <div style={{ backgroundColor: 'rgba(25, 25, 26, 0.9)' }}></div>
                            )
                        ) : (
                            // Desktop hover info panel
                            <div
                                className={`absolute top-0 right-0 h-full w-[300px] backdrop-blur-sm transition-all duration-300 rounded-r-lg ${(isHovered || isExpanded) ? 'opacity-100' : 'opacity-0 translate-x-4 pointer-events-none'
                                    }`}
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
                                                {getDraftDisplayText(false)}
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

                    {/* Click to View Text - Now properly positioned under the card, desktop only */}
                    {!isExpanded && !isMobile && (
                        <div className="text-center mt-2">
                            <p className={`text-gray-500 text-sm font-bold ${isHovered ? 'animate-pulse' : ''}`}>
                                Click Card to View More Information
                            </p>
                        </div>
                    )}

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
                                            {collegeNames.hasOwnProperty(prospect['Pre-NBA'])
                                                ? collegeNames[prospect['Pre-NBA']]  // Fixed: Use dynamic key instead of hardcoded 'Duke'
                                                : prospect['Pre-NBA']}
                                        </div>
                                        <div><span className="font-bold text-white">Position </span> {prospect.Role}</div>
                                        <div><span className="font-bold text-white">Draft Age </span> {prospect.Age}</div>
                                        <div>
                                            <span className="font-bold text-white">Draft </span>
                                            {getDraftDisplayText(true)}
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

                    {/* Expanded View - Charts and Rankings */}
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="rounded-xl backdrop-blur-sm p-4 mt-2 border border-gray-700/50 shadow-[0_0_15px_rgba(255,255,255,0.07)]"
                            style={{ backgroundColor: '#19191A' }}
                        >

                            {/* Expanded View Content */}
                            <div className={`${isMobile ? '' : 'grid grid-cols-2 gap-4'}`}>
                                {/* Charts Column - Now on the left (first column) */}
                                <div className="text-gray-300 px-2">
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

                                    {/* Chart Container */}
                                    <div className={`mb-4 ${!isMobile ? 'h-64' : 'h-[300px]'}`}>
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
                                        <div className="grid grid-cols-2 gap-4 text-sm h-64">
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
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* Divider */}
            {typeof window !== 'undefined' && window.innerWidth > 768 && (
                <div>
                    {/* Kept only the faded divider */}
                    <div className="h-px w-full bg-gray-700/30 my-8" />
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
    onViewModeChange?: (mode: 'card' | 'table') => void;
}

const ProspectFilter: React.FC<ProspectFilterProps> = ({
    prospects,
    onFilteredProspectsChange,
    onViewModeChange
}) => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'Guard' | 'Wing' | 'Big'>('all');
    const [selectedTier, setSelectedTier] = useState<string | null>(null); // New state for tier filter
    const [, setLocalFilteredProspects] = useState(prospects);
    const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    useEffect(() => {
        if (onViewModeChange) {
            onViewModeChange(viewMode);
        }
    }, [viewMode, onViewModeChange]);

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
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full bg-gray-800/20 border-gray-800 text-gray-300 placeholder-gray-500 rounded-lg focus:border-blue-500/30 focus:ring-1 focus:ring-blue-500/30"
                        />
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
    const [sortConfig, setSortConfig] = useState<{
        key: keyof DraftProspect | 'Rank';
        direction: 'ascending' | 'descending';
    } | null>(null);
    const [loadedProspects, setLoadedProspects] = useState<number>(5);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [selectedSortKey,] = useState<string>('Actual Pick');
    const tableContainerRef = useRef<HTMLDivElement>(null);

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

    // Function to handle sorting
    const handleSort = (key: keyof DraftProspect | 'Rank') => {
        // Preserve current scroll position
        const currentScrollLeft = tableContainerRef.current?.scrollLeft || 0;

        let direction: 'ascending' | 'descending' = 'ascending';

        // If already sorting by this key, toggle direction
        if (sortConfig && sortConfig.key === key) {
            direction = sortConfig.direction === 'ascending' ? 'descending' : 'ascending';
        }

        setSortConfig({ key, direction });

        // Restore scroll position after state update using requestAnimationFrame
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (tableContainerRef.current) {
                    tableContainerRef.current.scrollLeft = currentScrollLeft;
                }
            });
        });
    };

    useEffect(() => {
        if (tableContainerRef.current && sortConfig) {
            // This runs after sorting state change
            const preservedScrollLeft = tableContainerRef.current.scrollLeft;
            requestAnimationFrame(() => {
                if (tableContainerRef.current) {
                    tableContainerRef.current.scrollLeft = preservedScrollLeft;
                }
            });
        }
    }, [sortConfig]);

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

            if (sortConfig.key === 'Weight (lbs)') {
                const aNum = parseInt(aValue as string) || 0;
                const bNum = parseInt(bValue as string) || 0;
                return sortConfig.direction === 'ascending' ? aNum - bNum : bNum - aNum;
            }

            if (sortConfig.key === 'Tier') {
                const aNum = parseInt(aValue as string) || 0;
                const bNum = parseInt(bValue as string) || 0;
                return sortConfig.direction === 'ascending' ? aNum - bNum : bNum - aNum;
            }


            // Default string comparison
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
    }: {
        prospects: DraftProspect[],
        rank: Record<string, RankType>
    }) => {
        const [columnSelectorOpen, setColumnSelectorOpen] = useState(false);
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
        ]);

        return (
            <div className="max-w-6xl mx-auto px-4 pt-2">
                {/* Column Selector */}
                <div className="mb-2">
                    <CustomSelector
                        columns={columns}
                        onColumnsChange={setColumns}
                        isOpen={columnSelectorOpen}
                        onToggle={() => setColumnSelectorOpen(!columnSelectorOpen)}
                    />
                </div>
                <div
                    ref={tableContainerRef}
                    className="w-full overflow-x-auto bg-[#19191A] rounded-lg border border-gray-800">
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
                                // Find the original rank of the prospect in the filtered prospects array
                                const originalRank = filteredProspects.findIndex(p => p.Name === prospect.Name) + 1;

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
                                                    <TableCell key={column.key} className="text-gray-300 whitespace-nowrap">
                                                        {(() => {
                                                            const actualPick = prospect['Actual Pick'];
                                                            if (actualPick && actualPick.trim() !== '') {
                                                                return actualPick;
                                                            } else {
                                                                return "Undrafted";
                                                            }
                                                        })()}
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
                                            
                                            if (column.key === 'Tier') {
                                                return (
                                                    <TableCell key={column.key} className="text-gray-300 whitespace-nowrap">
                                                        <span
                                                            className="px-2 py-1 rounded text-sm font-medium"
                                                            style={{
                                                                backgroundColor: `${tierColors[prospect.Tier] ? tierColors[prospect.Tier] + '4D' : 'transparent'}`,
                                                                color: tierColors[prospect.Tier] || 'inherit',
                                                                border: `1px solid ${tierColors[prospect.Tier] || 'transparent'}`,
                                                            }}
                                                        >
                                                            Tier {prospect.Tier}
                                                        </span>
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
            <NavigationHeader activeTab="Andre Liu" />
            <DraftPageHeader author="Andre Liu" />
            <GoogleAnalytics  gaId="G-X22HKJ13B7" />
            <ProspectFilter
                prospects={prospects}
                onFilteredProspectsChange={setFilteredProspects}
                rank={{}}
                onViewModeChange={setViewMode}
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
                                    selectedSortKey={selectedSortKey} rank={0} selectedYear={0} />
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