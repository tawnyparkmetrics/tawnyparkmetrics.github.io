"use client";
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { LucideUser, X, ChevronDown, SlidersHorizontal } from 'lucide-react';
import Papa from 'papaparse';
import { motion } from 'framer-motion';
import { Search, TrendingUp, Table as TableIcon } from 'lucide-react';
import { Input } from '@/components/ui/input'; // Import the Input component
import NavigationHeader from '@/components/NavigationHeader';
import DraftPageHeader from '@/components/DraftPageHeader';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    ChartContainer,
    ChartTooltip,
} from "@/components/ui/chart"
import { Bar, BarChart, Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { GoogleAnalytics } from '@next/third-parties/google';
import { ColumnConfig, ProspectTable } from '@/components/ProspectTable';
import { BaseProspectCard } from '@/components/BaseProspectCard';
import { ContributorEvaluationTable, BaseContributorEvaluation, ContributorColumnConfig } from '@/components/ContributorEvaluationTable';
import EvaluationExplanation from '@/components/EvaluationExplanation';

export interface DraftProspect {
    //Player info for hover
    'Name': string;
    'Height': string;
    'Height (in)': string;
    'Weight (lbs)': string;
    'Role': string;
    'Age': string;
    'Wingspan': string;
    'Wingspan (in)': string;
    'Wing - Height': string;
    'Pre-NBA': string;
    'NBA Team': string;
    'Actual Pick': string;
    'League': string;
    'ABV': string;

    //Style info
    'Team Color': string;

    //Consensus info
    'Rank': string;
    'MEAN': string;
    'MEDIAN': string;
    'MODE': string;
    'HIGH': string;
    'LOW': string;
    'RANGE': string;
    'STDEV': string;
    'COUNT': number;
    'Inclusion Rate': string;
    'SCORE': string;

    //Range Consensus info
    '1 - 3': string;
    '4 - 14': string;
    '15 - 30': string;
    '2nd Round': string;
    'Undrafted': string;

    Summary?: string;
    originalRank?: number;

}

export interface ConsensusColumns {
    Name: string;
    [key: string]: string | number; // This allows any contributor column
}

export interface DynamicConsensusColumns {
    Name: string;
    [contributorName: string]: string | number;
}

interface ConsensusHistogramProps {
    prospect: DraftProspect;
    consensusData: ConsensusColumns;
    isMobile?: boolean;
}

const getContributorColumns = (consensusData: ConsensusColumns): string[] => {
    // Exclude known prospect metadata columns
    const excludedColumns = new Set([
        'Name', 'Height', 'Height (in)', 'Weight (lbs)', 'Role', 'Age',
        'Wingspan', 'Wingspan (in)', 'Wing - Height', 'Pre-NBA', 'NBA Team',
        'Actual Pick', 'League', 'ABV', 'Team Color', 'Rank', 'MEAN',
        'MEDIAN', 'MODE', 'HIGH', 'LOW', 'RANGE', 'STDEV', 'COUNT',
        'Inclusion Rate', 'SCORE', '1 - 3', '4 - 14', '15 - 30',
        '2nd Round', 'Undrafted', 'Summary'
    ]);

    return Object.keys(consensusData).filter(key => !excludedColumns.has(key));
};

const ConsensusHistogram: React.FC<ConsensusHistogramProps> = ({
    prospect,
    consensusData,
}) => {
    // Get contributor columns dynamically
    const contributorColumns = useMemo(() => {
        return consensusData ? getContributorColumns(consensusData) : [];
    }, [consensusData]);

    // Use team color or fallback to blue
    const teamColor =
        typeof prospect['Team Color'] === 'string' &&
            /^#[0-9A-Fa-f]{6}$/.test(prospect['Team Color'])
            ? prospect['Team Color']
            : '#60A5FA';

    // Custom tooltip component for histogram
    interface HistogramTooltipProps {
        active?: boolean;
        payload?: Array<{ value: number; payload: { pick: number; count: number } }>;
        label?: string;
    }

    const CustomHistogramTooltip = ({ active, payload, label }: HistogramTooltipProps) => {
        if (!active || !payload || !payload.length) {
            return null;
        }

        const data = payload[0];
        return (
            <div className="bg-[#19191A] border border-gray-700 rounded-lg p-3 shadow-lg">
                <div className="text-sm text-gray-300 mb-1">
                    <span className="font-semibold">Rank:</span> {label}
                </div>
                <div className="text-sm text-gray-300">
                    <span className="font-semibold">Frequency:</span> {data.value.toFixed(1)}%
                </div>
            </div>
        );
    };

    // SPECIAL CASE: Victor Wembanyama - unanimous #1 pick
    if (prospect.Name === "Victor Wembanyama") {
        const victorData = [{
            pick: 1,
            count: contributorColumns.length,
            percentage: 100,
        }];

        return (
            <div>
                <ChartContainer config={{ percentage: { color: teamColor, label: "Percentage" } }}>
                    <BarChart data={victorData} barSize={60}>
                        <defs>
                            <linearGradient id="barGradient-VictorWembanyama" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={teamColor} stopOpacity={0.8} />
                                <stop offset="100%" stopColor={teamColor} stopOpacity={0.4} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="0"
                            stroke="#333"
                            strokeOpacity={0.2}
                            horizontal={true}
                            vertical={false}
                        />
                        <XAxis
                            dataKey="pick"
                            tick={{ fill: "#ccc", fontSize: 12 }}
                            domain={[0, 2]}
                            type="number"
                            ticks={[1]}
                        />
                        <YAxis
                            tick={{ fill: "#ccc", fontSize: 12 }}
                            allowDecimals={false}
                            domain={[0, 100]}
                            ticks={[0, 20, 40, 60, 80, 100]}
                            label={{ value: '', angle: 0, position: 'insideLeft' }}
                        />
                        <Bar
                            dataKey="percentage"
                            fill="url(#barGradient-VictorWembanyama)"
                            stroke={teamColor}
                            strokeWidth={1}
                            radius={[4, 4, 0, 0]}
                        />
                        <ChartTooltip content={<CustomHistogramTooltip />} />
                    </BarChart>
                </ChartContainer>
            </div>
        );
    }

    // Debug function to analyze data validity
    const analyzeDataValidity = useMemo(() => {
        const analysis = {
            prospect: prospect.Name,
            totalContributors: 0,
            validContributors: 0,
            invalidContributors: [] as string[],
            emptyContributors: [] as string[],
            invalidValues: [] as { contributor: string; value: string | number | null | undefined }[],
            validPicks: 0,
            totalPicks: 0
        };

        contributorColumns.forEach((contributor) => {
            const value = consensusData[contributor];
            analysis.totalContributors++;
            analysis.totalPicks++;

            // Check for empty or invalid values
            if (value === null || value === undefined || value === '') {
                analysis.emptyContributors.push(contributor);
                return;
            }

            // Try to parse the value
            let pick: number;
            if (typeof value === "number") {
                pick = value;
            } else if (typeof value === "string" && value.trim() !== "") {
                pick = parseInt(value);
            } else {
                analysis.invalidContributors.push(contributor);
                analysis.invalidValues.push({ contributor, value });
                return;
            }

            // Check if it's a valid NBA draft pick
            if (!isNaN(pick) && pick >= 1 && pick <= 60) {
                analysis.validContributors++;
                analysis.validPicks++;
            } else {
                analysis.invalidContributors.push(contributor);
                analysis.invalidValues.push({ contributor, value });
            }
        });

        return analysis;
    }, [consensusData, prospect.Name, contributorColumns]);

    // Build histogram data with proper counting and percentage conversion
    const histogramData = useMemo(() => {
        const counts: Record<number, number> = {};
        const picks: number[] = [];

        contributorColumns.forEach((contributor) => {
            const value = consensusData[contributor];
            let pick: number | undefined;

            if (typeof value === "number") {
                pick = value;
            } else if (typeof value === "string") {
                const cleaned = value.replace(/[^\d]/g, '');
                const parsed = parseInt(cleaned);
                if (!isNaN(parsed)) pick = parsed;
            }

            if (pick && pick >= 1 && pick <= 108) {
                counts[pick] = (counts[pick] || 0) + 1;
                picks.push(pick);
            }
        });

        if (picks.length === 0) return [];

        const minPick = Math.min(...picks);
        const maxPick = Math.max(...picks);
        const uniquePicks = new Set(picks);

        // Calculate total valid contributors for percentage calculation
        const totalContributors = contributorColumns.reduce((count, contributor) => {
            const value = consensusData[contributor];
            let pick: number | undefined;
            if (typeof value === "number") {
                pick = value;
            } else if (typeof value === "string") {
                const cleaned = value.replace(/[^\d]/g, '');
                const parsed = parseInt(cleaned);
                if (!isNaN(parsed)) pick = parsed;
            }
            return pick && pick >= 1 && pick <= 108 ? count + 1 : count;
        }, 0);

        const histogram =
            uniquePicks.size === 1
                ? Array.from({ length: 3 }, (_, i) => {
                    const x = minPick - 1 + i;
                    const count = counts[x] || 0;
                    return {
                        pick: x,
                        count: count,
                        percentage: totalContributors > 0 ? (count / totalContributors) * 100 : 0,
                    };
                })
                : Array.from({ length: maxPick - minPick + 1 }, (_, i) => {
                    const x = minPick + i;
                    const count = counts[x] || 0;
                    return {
                        pick: x,
                        count: count,
                        percentage: totalContributors > 0 ? (count / totalContributors) * 100 : 0,
                    };
                });

        return histogram;
    }, [consensusData, contributorColumns]);

    // Calculate data quality metrics
    const dataQuality = useMemo(() => {
        const totalContributors = contributorColumns.length;

        let actualValidPicks = 0;
        contributorColumns.forEach((contributor) => {
            const value = consensusData[contributor];

            let pick: number;
            if (typeof value === "number") {
                pick = value;
            } else if (typeof value === "string" && value.trim() !== "") {
                pick = parseInt(value);
            } else {
                return;
            }

            if (!isNaN(pick) && pick >= 1 && pick <= 60) {
                actualValidPicks++;
            }
        });

        const participationRate = totalContributors > 0 ? (actualValidPicks / totalContributors) * 100 : 0;
        const maxPercentage = Math.max(...histogramData.map(item => item.percentage));

        const uniquePickPositions = histogramData.filter(item => item.count > 0).length;
        const isSparseData = actualValidPicks <= 1 || (actualValidPicks === 2 && uniquePickPositions === 1);

        return {
            totalContributors,
            validPicks: actualValidPicks,
            participationRate,
            maxPercentage,
            isSparseData,
            uniquePickPositions
        };
    }, [histogramData, contributorColumns, consensusData]);

    // If no data, show message
    if (histogramData.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-gray-400">
                <p>No consensus data available for {prospect.Name}</p>
            </div>
        );
    }

    const xDomain = histogramData.length > 0
        ? [histogramData[0].pick, histogramData[histogramData.length - 1].pick]
        : [1, 60];

    // Calculate dynamic y-axis max based on the highest percentage
    const getYAxisMax = (maxPercentage: number): number => {
        if (maxPercentage <= 0) return 10; // Default if no data

        // Round up to the next reasonable tick (increments of 5)
        if (maxPercentage <= 5) return 5;
        if (maxPercentage <= 10) return 10;
        if (maxPercentage <= 15) return 15;
        if (maxPercentage <= 20) return 20;
        if (maxPercentage <= 25) return 25;
        if (maxPercentage <= 30) return 30;
        if (maxPercentage <= 35) return 35;
        if (maxPercentage <= 40) return 40;
        if (maxPercentage <= 45) return 45;
        if (maxPercentage <= 50) return 50;
        if (maxPercentage <= 55) return 55;
        if (maxPercentage <= 60) return 60;
        if (maxPercentage <= 65) return 65;
        if (maxPercentage <= 70) return 70;
        if (maxPercentage <= 75) return 75;
        if (maxPercentage <= 80) return 80;
        if (maxPercentage <= 85) return 85;
        if (maxPercentage <= 90) return 90;
        if (maxPercentage <= 95) return 95;
        return 100; // For very high percentages
    };

    const yAxisMax = getYAxisMax(dataQuality.maxPercentage);
    const yDomain = [0, yAxisMax];

    return (
        <div>
            <ChartContainer config={{ percentage: { color: teamColor, label: "Percentage" } }}>
                {dataQuality.isSparseData ? (
                    // Use bar chart for truly sparse data
                    <BarChart data={histogramData} barCategoryGap="20%">
                        <defs>
                            <linearGradient id={`barGradient-${prospect.Name.replace(/[^a-zA-Z0-9]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={teamColor} stopOpacity={0.8} />
                                <stop offset="100%" stopColor={teamColor} stopOpacity={0.4} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="0"
                            stroke="#333"
                            strokeOpacity={0.2}
                            horizontal={true}
                            vertical={false}
                        />
                        <XAxis
                            dataKey="pick"
                            tick={{ fill: "#ccc", fontSize: 12 }}
                            domain={xDomain}
                            type="number"
                            scale="linear"
                        />
                        <YAxis
                            tick={{ fill: "#ccc", fontSize: 12 }}
                            allowDecimals={false}
                            domain={yDomain}
                            ticks={Array.from({ length: Math.floor(yAxisMax / 5) + 1 }, (_, i) => i * 5).filter(tick => tick <= yAxisMax)}
                            label={{ value: '', angle: 0, position: 'insideLeft' }}
                        />
                        <Bar
                            dataKey="percentage"
                            fill={`url(#barGradient-${prospect.Name.replace(/[^a-zA-Z0-9]/g, '')})`}
                            stroke={teamColor}
                            strokeWidth={1}
                            radius={[2, 2, 0, 0]}
                        />
                        <ChartTooltip content={<CustomHistogramTooltip />} />
                    </BarChart>
                ) : (
                    // Use area chart for all other data (including later picks with fewer contributors)
                    <AreaChart data={histogramData}>
                        <defs>
                            <linearGradient id={`areaGradient-${prospect.Name.replace(/[^a-zA-Z0-9]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={teamColor} stopOpacity={0.8} />
                                <stop offset="100%" stopColor={teamColor} stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="0"
                            stroke="#333"
                            strokeOpacity={0.2}
                            horizontal={true}
                            vertical={false}
                        />
                        <XAxis
                            dataKey="pick"
                            tick={{ fill: "#ccc", fontSize: 12 }}
                            domain={xDomain}
                            type="number"
                            scale="linear"
                        />
                        <YAxis
                            tick={{ fill: "#ccc", fontSize: 12 }}
                            allowDecimals={false}
                            domain={yDomain}
                            ticks={Array.from({ length: Math.floor(yAxisMax / 5) + 1 }, (_, i) => i * 5).filter(tick => tick <= yAxisMax)}
                            label={{ value: '', angle: 0, position: 'insideLeft' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="percentage"
                            stroke={teamColor}
                            strokeWidth={2}
                            fill={`url(#areaGradient-${prospect.Name.replace(/[^a-zA-Z0-9]/g, '')})`}
                            isAnimationActive={false}
                        />
                        <ChartTooltip content={<CustomHistogramTooltip />} />
                    </AreaChart>
                )}
            </ChartContainer>
        </div>
    );
};

interface RangeConsensusProps {
    prospect: DraftProspect;
    consensusData?: ConsensusColumns;
    isMobile?: boolean;
}

interface RangeData {
    range: string;
    value: number;
    label: string;
    percentage: number;
}

interface BarShapeProps {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    fill?: string;
    stroke?: string;
    [key: string]: unknown;
}

const RangeConsensusGraph: React.FC<RangeConsensusProps> = ({
    prospect,

}) => {
    // Fix: Define isMobileDevice locally since it's not imported or defined elsewhere
    const isMobileDevice = (): boolean => {
        if (typeof window === 'undefined') return false;
        return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent);
    };
    const isMobile = isMobileDevice();
    const teamColor =
        typeof prospect['Team Color'] === 'string' &&
            /^#[0-9A-Fa-f]{6}$/.test(prospect['Team Color'])
            ? prospect['Team Color']
            : '#60A5FA';

    const rangeData = useMemo((): RangeData[] => {
        if (!prospect) return [];

        // Helper function to safely convert string to decimal
        const safeParseFloat = (value: string | undefined): number => {
            if (!value || value.trim() === '') return 0;
            const parsed = parseFloat(value.trim());
            return isNaN(parsed) ? 0 : parsed;
        };

        // Extract range consensus values and convert to decimals
        const ranges = [
            { label: '1-3', value: safeParseFloat(prospect['1 - 3']), range: '1-3' },
            { label: '4-14', value: safeParseFloat(prospect['4 - 14']), range: '4-14' },
            { label: '15-30', value: safeParseFloat(prospect['15 - 30']), range: '15-30' },
            {
                label: isMobile ? '2nd Rd' : '2nd Round',
                value: safeParseFloat(prospect['2nd Round']),
                range: '2nd Round'
            },
            {
                label: isMobile ? 'UDFA' : 'Undrafted',
                value: safeParseFloat(prospect['Undrafted']),
                range: 'Undrafted'
            }
        ];

        console.log('Graph range values:', ranges.map(r => ({ label: r.label, value: r.value }))); // Debug log

        // Filter out ranges with 0 values and convert to percentages
        return ranges
            .map(item => ({
                range: item.range,
                value: item.value,
                label: item.label,
                percentage: Math.round(item.value * 100) // Convert decimal to percentage
            }));
    }, [prospect, isMobile]);

    // Custom bar shape to avoid bottom stroke
    const CustomBarShape = (props: BarShapeProps) => {
        const { x = 0, y = 0, width = 0, height = 0, fill = '', stroke = '' } = props;
        return (
            <g>
                <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={fill}
                    stroke="none"
                    rx={4}
                    ry={4}
                />
                {/* Top line */}
                <line
                    x1={x}
                    y1={y}
                    x2={x + width}
                    y2={y}
                    stroke={stroke}
                    strokeWidth={2}
                />
                {/* Left line */}
                <line
                    x1={x}
                    y1={y}
                    x2={x}
                    y2={y + height}
                    stroke={stroke}
                    strokeWidth={2}
                />
                {/* Right line */}
                <line
                    x1={x + width}
                    y1={y}
                    x2={x + width}
                    y2={y + height}
                    stroke={stroke}
                    strokeWidth={2}
                />
            </g>
        );
    };

    // If no data, show a message
    if (rangeData.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-gray-400">
                <p>No range consensus data available</p>
            </div>
        );
    }

    return (
        <ChartContainer config={{
            range: { color: teamColor, label: "Draft Range" }
        }}>
            <BarChart data={rangeData} barCategoryGap="10%">
                <defs>
                    <linearGradient id={`barGradient-${prospect.Name.replace(/[^a-zA-Z0-9]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={teamColor} stopOpacity={0.8} />
                        <stop offset="100%" stopColor={teamColor} stopOpacity={0.1} />
                    </linearGradient>
                </defs>
                <CartesianGrid
                    strokeDasharray="0"
                    stroke="#333"
                    strokeOpacity={0.2}
                    horizontal={true}
                    vertical={false}
                />
                <XAxis
                    dataKey="label"
                    tick={{ fill: "#ccc", fontSize: 12 }}
                />
                <YAxis
                    tick={{ fill: "#ccc", fontSize: 12 }}
                    domain={[0, 100]}
                    ticks={[0, 20, 40, 60, 80, 100]}
                    label={{ value: '', angle: 0, position: 'insideLeft' }}
                />
                <Bar
                    dataKey="percentage"
                    fill={`url(#barGradient-${prospect.Name.replace(/[^a-zA-Z0-9]/g, '')})`}
                    shape={<CustomBarShape stroke={teamColor} />}
                    radius={[4, 4, 0, 0]}
                />
            </BarChart>
        </ChartContainer>
    );
};

const ConsensusPageProspectCard: React.FC<{
    prospect: DraftProspect;
    rank: RankType;
    filteredProspects: DraftProspect[];
    allProspects: DraftProspect[];
    selectedSortKey: string;
    selectedYear: number; // Add this prop - should match the type from ConsensusPage
    consensusData?: ConsensusColumns;
    rankingSystem: Map<string, number>;
}> = ({ prospect, consensusData, rankingSystem, selectedYear }) => { // Add selectedYear to destructuring
    const [, setIsExpanded] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showRangeConsensus, setShowRangeConsensus] = useState(true);
    const [showTooltip, setShowTooltip] = useState(false);

    // Check if device is mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Get the original rank from the ranking system
    const actualRank = rankingSystem.get(prospect.Name) || 1;
    const currentRank = actualRank.toString();

    const handleExpand = (expanded: boolean) => {
        setIsExpanded(expanded);
    };

    // Rest of your component logic...
    const consensusTableData = useMemo(() => [
        { label: 'Mean', value: prospect['MEAN'] || 'N/A' },
        { label: 'Median', value: prospect['MEDIAN'] || 'N/A' },
        { label: 'Mode', value: prospect['MODE'] || 'N/A' },
        { label: 'High', value: prospect['HIGH'] || 'N/A' },
        { label: 'Low', value: prospect['LOW'] || 'N/A' },
        { label: 'Range', value: prospect['RANGE'] || 'N/A' },
        { label: 'Inclusion Rate', value: prospect['Inclusion Rate'] ? `${Math.round(Number(prospect['Inclusion Rate']) * 100)}%` : 'N/A' },
    ], [prospect]);

    const rangeConsensusTableData = useMemo(() => {
        const safeParseFloat = (value: string | undefined): number => {
            if (!value || value.trim() === '') return 0;
            const parsed = parseFloat(value.trim());
            return isNaN(parsed) ? 0 : parsed;
        };

        const ranges = [
            { label: 'Picks 1-3', value: safeParseFloat(prospect['1 - 3']) },
            { label: 'Picks 4-14', value: safeParseFloat(prospect['4 - 14']) },
            { label: 'Picks 15-30', value: safeParseFloat(prospect['15 - 30']) },
            { label: '2nd Round', value: safeParseFloat(prospect['2nd Round']) },
            { label: isMobile ? 'UDFA' : 'Undrafted', value: safeParseFloat(prospect['Undrafted']) }
        ];

        return ranges.map(item => ({
            ...item,
            percentage: Math.round(item.value * 100)
        }));
    }, [prospect, isMobile]);

    return (
        <BaseProspectCard
            prospect={prospect}
            rank={currentRank}
            selectedYear={selectedYear}
            isMobile={isMobile}
            onExpand={handleExpand}
        >
            {/* Header with centered toggle */}
            <div className={`flex items-center mb-4 ${isMobile ? 'px-2 flex-col gap-3' : 'px-2'}`}>
                {isMobile ? (
                    <>
                        {/* Mobile: Stacked layout */}
                        <h3 className="font-semibold text-lg text-white text-center">
                            {showRangeConsensus ? '' : ''}
                        </h3>

                        {/* Centered Segmented Control with Tooltip */}
                        <div className="flex items-center gap-2">
                            <div className="flex bg-gray-800/20 border border-gray-700 rounded-lg p-1">
                                <button
                                    onClick={() => setShowRangeConsensus(false)}
                                    className={`px-3 py-1 text-sm font-bold rounded-md transition-all duration-300 ${!showRangeConsensus
                                        ? 'text-white shadow-sm'
                                        : 'text-gray-400 hover:text-gray-200'
                                        }`}
                                    style={!showRangeConsensus ? {
                                        backgroundColor: `${prospect['Team Color']}`
                                    } : {}}
                                >
                                    Rank View
                                </button>
                                <button
                                    onClick={() => setShowRangeConsensus(true)}
                                    className={`px-3 py-1 text-sm font-bold rounded-md transition-all duration-300 ${showRangeConsensus
                                        ? 'text-white shadow-sm'
                                        : 'text-gray-400 hover:text-gray-200'
                                        }`}
                                    style={showRangeConsensus ? {
                                        backgroundColor: `${prospect['Team Color']}`
                                    } : {}}
                                >
                                    Range View
                                </button>
                            </div>

                            {/* Tooltip */}
                            <div className="relative">
                                <div
                                    onMouseEnter={() => !isMobile && setShowTooltip(true)}
                                    onMouseLeave={() => !isMobile && setShowTooltip(false)}
                                    onClick={() => isMobile && setShowTooltip(true)}
                                    className="w-4 h-4 rounded-full bg-gray-600/50 text-gray-400 flex items-center justify-center text-xs cursor-pointer hover:text-gray-200 transition-colors"
                                >
                                    ?
                                </div>

                                {/* Desktop tooltip */}
                                {showTooltip && !isMobile && (
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-4 py-3 bg-[#19191A] border border-white/20 text-white text-sm rounded-lg shadow-lg w-96 max-w-screen-sm z-[9999]">
                                        <div className="text-left leading-relaxed space-y-2">
                                            <p>Both views show how each prospect is perceived across the boards that contribute to the consensus.</p>
                                            <p><strong className="text-blue-400">Rank View</strong> displays individual rankings from each board, along with summary stats (average rank, median rank, high, low, etc.).</p>
                                            <p><strong className="text-blue-400">Range View</strong> groups those rankings into broader draft tiers (Top 3, 2nd Round, Undrafted, etc.), showing how often the prospect falls into each tier (ex. ranked in the Top 3 on 50% of boards).</p>
                                        </div>
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-[#19191A]"></div>
                                    </div>
                                )}

                                {/* Mobile modal */}
                                {showTooltip && isMobile && (
                                    <>
                                        {/* Backdrop */}
                                        <div
                                            className="fixed inset-0 bg-black/50 z-[9998] flex items-center justify-center p-4"
                                            onClick={() => setShowTooltip(false)}
                                        >
                                            {/* Modal */}
                                            <div
                                                className="bg-[#19191A] border border-white/20 text-white rounded-lg shadow-xl max-w-sm w-full mx-4 relative"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {/* Close button */}
                                                <button
                                                    onClick={() => setShowTooltip(false)}
                                                    className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gray-600/50 text-gray-400 flex items-center justify-center text-sm hover:text-gray-200 hover:bg-gray-600/70 transition-colors"
                                                >
                                                    ×
                                                </button>

                                                {/* Content */}
                                                <div className="p-6 pr-10">
                                                    <div className="text-left leading-relaxed space-y-3">
                                                        <p>Both views show how each prospect is perceived across the boards that contribute to the consensus.</p>
                                                        <p><strong className="text-blue-400">Rank View</strong> displays individual rankings from each board, along with summary stats (average rank, median rank, high, low, etc.).</p>
                                                        <p><strong className="text-blue-400">Range View</strong> groups those rankings into broader draft tiers (Top 3, 2nd Round, Undrafted, etc.), showing how often the prospect falls into each tier (ex. ranked in the Top 3 on 50% of boards).</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <h3 className="font-semibold text-lg text-white text-center">
                            {showRangeConsensus ? '' : ''}
                        </h3>
                    </>
                ) : (
                    <>
                        {/* Desktop: Original layout */}
                        <div className="flex-[0.8] flex justify-center pr-1/2">
                            <h3 className="italic text-lg text-white ml-20">
                                {showRangeConsensus ? 'draft range distribution' : 'draft rank distribution'}
                            </h3>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex bg-gray-800/20 border border-gray-700 rounded-lg p-1">
                                <button
                                    onClick={() => setShowRangeConsensus(false)}
                                    className={`px-3 py-1 text-sm font-bold rounded-md transition-all duration-300 ${!showRangeConsensus
                                        ? 'text-white shadow-sm'
                                        : 'text-gray-400 hover:text-gray-200'
                                        }`}
                                    style={!showRangeConsensus ? {
                                        backgroundColor: `${prospect['Team Color']}`
                                    } : {}}
                                >
                                    Rank View
                                </button>
                                <button
                                    onClick={() => setShowRangeConsensus(true)}
                                    className={`px-3 py-1 text-sm font-bold rounded-md transition-all duration-300 ${showRangeConsensus
                                        ? 'text-white shadow-sm'
                                        : 'text-gray-400 hover:text-gray-200'
                                        }`}
                                    style={showRangeConsensus ? {
                                        backgroundColor: `${prospect['Team Color']}`
                                    } : {}}
                                >
                                    Range View
                                </button>
                            </div>

                            <div className="relative">
                                <div
                                    onMouseEnter={() => setShowTooltip(true)}
                                    onMouseLeave={() => setShowTooltip(false)}
                                    className="w-4 h-4 rounded-full bg-gray-600/50 text-gray-400 flex items-center justify-center text-xs cursor-pointer hover:text-gray-200 transition-colors"
                                >
                                    ?
                                </div>
                                {showTooltip && (
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-4 py-3 bg-[#19191A] border border-white/20 text-white text-sm rounded-lg shadow-lg w-96 max-w-screen-sm z-[9999]">
                                        <div className="text-left leading-relaxed space-y-2">
                                            <p>Both views show how each prospect is perceived across the boards that contribute to the consensus.</p>
                                            <p><strong className="text-blue-400">Rank View</strong> displays individual rankings from each board, along with summary stats (average rank, median rank, high, low, etc.).</p>
                                            <p><strong className="text-blue-400">Range View</strong> groups those rankings into broader draft tiers (Top 3, 2nd Round, Undrafted, etc.), showing how often the prospect falls into each tier (ex. ranked in the Top 3 on 50% of boards).</p>
                                        </div>
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-[#19191A]"></div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex-[0.8] flex justify-center pl-1/2">
                            <h3 className="italic text-lg text-white mr-20">
                                {showRangeConsensus ? 'draft range data' : 'draft rank data'}
                            </h3>
                        </div>
                    </>
                )}
            </div>

            {/* Consensus-specific dropdown content */}
            <div className={`pb-0 ${isMobile ? 'space-y-4' : 'grid grid-cols-2 gap-4'}`}>
                {/* Charts Column */}
                <div className={`text-gray-300 flex flex-col justify-start ${isMobile ? 'px-2' : 'px-1'}`}>
                    {/* Chart Container - Shows either histogram or range consensus */}
                    <div className={isMobile ? 'w-full -ml-5' : '-ml-8 w-[calc(100%+48px)]'}> {/*-ml-5 is to center the mobile view*/}
                        {showRangeConsensus ? (
                            // Range Consensus Graph
                            <RangeConsensusGraph
                                prospect={prospect}
                                isMobile={isMobile}
                            />
                        ) : (
                            // Consensus Histogram
                            consensusData ? (
                                <ConsensusHistogram
                                    prospect={prospect}
                                    consensusData={consensusData}
                                    isMobile={isMobile}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-48 text-gray-400">
                                    <p>No consensus data available</p>
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* Consensus Data Tables */}
                <div className={`text-gray-300 flex items-center ${isMobile ? 'px-0' : 'px-2'}`}> {/* Remove px-2 on mobile */}
                    {showRangeConsensus ? (
                        /* Range Consensus Table - This one gets centered */
                        <div className="w-full max-w-l">
                            <div className="space-y-2.5">
                                {rangeConsensusTableData.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`flex justify-between items-center py-2 ${index !== rangeConsensusTableData.length - 1 ? 'border-b border-gray-700/50' : ''}`}
                                    >
                                        <span className="font-bold text-white text-sm">{item.label}</span>
                                        <span className="text-gray-300 text-sm">{item.percentage}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Original Consensus Statistics Table */
                        <div className="w-full max-w-l">
                            <div className="space-y-0">
                                {consensusTableData.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`flex justify-between items-center py-2 ${index !== consensusTableData.length - 1 ? 'border-b border-gray-700/50' : ''}`}
                                    >
                                        <span className="font-bold text-white text-sm">{item.label}</span>
                                        <span className="text-gray-300 text-sm">{item.value}</span>
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
    onRankingSystemChange?: (rankingSystem: Map<string, number>) => void;
    rank: Record<string, RankType>;
    onViewModeChange?: (mode: 'card' | 'table' | 'contributors') => void;
    selectedYear?: '2025' | '2024' | '2023' | '2022' | '2021' | '2020';
    onYearChange?: (year: '2025' | '2024' | '2023' | '2022' | '2021' | '2020') => void;
    id?: string;
}

const ConsensusFilter: React.FC<ProspectFilterProps> = ({
    prospects,
    onFilteredProspectsChange,
    onRankingSystemChange,
    onViewModeChange,
    selectedYear,
    onYearChange,
    id
}) => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'Guard' | 'Wing' | 'Big'>('all');
    const [, setLocalFilteredProspects] = useState(prospects);
    const [viewMode, setViewMode] = useState<'card' | 'table' | 'contributors'>('card');
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Handle view mode changes with debugging
    const handleViewModeChange = useCallback((mode: 'card' | 'table' | 'contributors') => {
        console.log('handleViewModeChange called with:', mode);
        console.log('Current viewMode before change:', viewMode);

        setViewMode(mode);

        // Call parent callback immediately
        if (onViewModeChange) {
            console.log('Calling onViewModeChange with:', mode);
            onViewModeChange(mode);
        }
    }, [onViewModeChange]);

    // Add effect to log when viewMode actually changes
    useEffect(() => {
        console.log('viewMode state updated to:', viewMode);
    }, [viewMode]);

    const hasActiveFilters = () => {
        return (
            roleFilter !== 'all' ||
            searchQuery !== ''
        );
    };

    const resetFilters = () => {
        setSearchQuery('');
        setRoleFilter('all');
        setLocalFilteredProspects(prospects);
        setIsMobileFilterOpen(false);

        if (onFilteredProspectsChange) {
            onFilteredProspectsChange(prospects);
        }
    };

    useEffect(() => {
        let results = prospects;

        if (roleFilter !== 'all') {
            results = results.filter((prospect) => prospect.Role === roleFilter);
        }

        // Create ranking system based on filters (excluding search)
        const rankingSystem = new Map<string, number>();
        const filteredForRanking = prospects.filter((prospect) => {
            if (roleFilter !== 'all') {
                return prospect.Role === roleFilter;
            }
            return true;
        });

        // Sort by Rank (ascending order - 1, 2, 3, etc.)
        const sortedForRanking = filteredForRanking.sort((a, b) => {
            const rankA = parseInt(a.Rank) || 999; // Default to 999 if no rank
            const rankB = parseInt(b.Rank) || 999;
            return rankA - rankB;
        });

        // Assign ranks based on filtered and sorted data
        sortedForRanking.forEach((prospect, index) => {
            rankingSystem.set(prospect.Name, index + 1);
        });

        // Apply search filter after creating ranking system
        if (searchQuery) {
            const searchTermLower = searchQuery.toLowerCase();
            results = results.filter(
                (prospect) =>
                    prospect.Name.toLowerCase().includes(searchTermLower) ||
                    (prospect['Pre-NBA'] && prospect['Pre-NBA'].toLowerCase().includes(searchTermLower)) ||
                    (prospect['NBA Team'] && prospect['NBA Team'].toLowerCase().includes(searchTermLower))
            );
        }

        // Sort by Rank (ascending order - 1, 2, 3, etc.)
        results = results.sort((a, b) => {
            const rankA = parseInt(a.Rank) || 999; // Default to 999 if no rank
            const rankB = parseInt(b.Rank) || 999;
            return rankA - rankB;
        });

        setLocalFilteredProspects(results);

        if (onFilteredProspectsChange) {
            onFilteredProspectsChange(results);
        }

        if (onRankingSystemChange) {
            onRankingSystemChange(rankingSystem);
        }
    }, [prospects, searchQuery, roleFilter, onFilteredProspectsChange, onRankingSystemChange]);

    // Debug the current view mode
    console.log('Current viewMode in render:', viewMode);

    return (
        <div id={id} className="sticky top-14 z-30 bg-[#19191A] border-b border-gray-800 max-w-6xl mx-auto">
            {/* Mobile Initial Filter Section */}
            <div className="sm:hidden px-4 py-2">
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

                    {/* Year Dropdown and View Mode Dropdown - Right Side */}
                    <div className="flex items-center gap-2">
                        {/* Year Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <motion.button
                                    className={`
                                        px-3 py-2 rounded-lg text-sm font-medium
                                        transition-all duration-300
                                        bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700
                                        flex items-center gap-1 flex-shrink-0
                                    `}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {selectedYear || '2025'}
                                    <ChevronDown className="h-4 w-4" />
                                </motion.button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-[#19191A] border-gray-700">
                                {(['2025', '2024', '2023', '2022', '2021', '2020'] as const).map((year) => (
                                    <DropdownMenuItem
                                        key={year}
                                        className={`text-gray-400 hover:bg-gray-800/50 cursor-pointer rounded-md ${(selectedYear || '2025') === year ? 'bg-blue-500/20 text-blue-400' : ''
                                            }`}
                                        onClick={() => onYearChange?.(year)}
                                    >
                                        {year}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* View Mode Dropdown (now includes Contributors) */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <motion.button
                                    className="px-3 py-2 rounded-lg text-sm font-medium flex items-center transition-all duration-300 bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700"
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {/* Mobile view - show current mode text */}
                                    <span className="sm:hidden">
                                        {viewMode === 'card' ? 'Card View' : viewMode === 'table' ? 'Table View' : 'Evaluation'}
                                    </span>
                                    {/* Desktop view - show icons */}
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
                                        ) : viewMode === 'contributors' ? (
                                            <>
                                                <TrendingUp className="mr-1 h-4 w-4" />
                                                Evaluation
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
                                {/* Mobile: No icons, single-line text - now includes Contributors */}
                                <DropdownMenuItem
                                    className={`text-gray-400 hover:bg-gray-800/50 cursor-pointer rounded-md sm:hidden ${viewMode === 'card' ? 'bg-blue-500/20 text-blue-400' : ''}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleViewModeChange('card');
                                    }}
                                >
                                    Card View
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className={`text-gray-400 hover:bg-gray-800/50 cursor-pointer rounded-md sm:hidden ${viewMode === 'table' ? 'bg-blue-500/20 text-blue-400' : ''}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleViewModeChange('table');
                                    }}
                                >
                                    Table View
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className={`text-gray-400 hover:bg-gray-800/50 cursor-pointer rounded-md sm:hidden ${viewMode === 'contributors' ? 'bg-blue-500/20 text-blue-400' : ''}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleViewModeChange('contributors');
                                    }}
                                >
                                    Evaluation
                                </DropdownMenuItem>
                                {/* Desktop: With icons */}
                                <DropdownMenuItem
                                    className={`hidden sm:flex text-gray-400 hover:bg-gray-800/50 cursor-pointer rounded-md ${viewMode === 'card' ? 'bg-blue-500/20 text-blue-400' : ''}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleViewModeChange('card');
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
                                        handleViewModeChange('table');
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <TableIcon className="h-4 w-4" />
                                        Table View
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className={`hidden sm:flex text-gray-400 hover:bg-gray-800/50 cursor-pointer rounded-md ${viewMode === 'contributors' ? 'bg-blue-500/20 text-blue-400' : ''}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleViewModeChange('contributors');
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4" />
                                        Evaluation
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Filter Content (Desktop and Mobile Dropdown) */}
            <div className={`
          px-4 py-2
          sm:grid sm:grid-cols-[2fr_auto] sm:gap-4
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
                    {/* Mobile Only: Position Section (Year dropdown removed from here) */}
                    <div className="w-full sm:hidden mb-4">
                        <div className="text-sm text-gray-400 mb-3"></div>
                        <div className="flex items-center justify-between gap-1">
                            {/* Position Filters - Now takes full width */}
                            <div className="flex items-center gap-1">
                                <motion.button
                                    onClick={() => setRoleFilter(roleFilter === 'Guard' ? 'all' : 'Guard')}
                                    className={`w-20 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${roleFilter === 'Guard' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'}`}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Guards
                                </motion.button>
                                <motion.button
                                    onClick={() => setRoleFilter(roleFilter === 'Wing' ? 'all' : 'Wing')}
                                    className={`w-20 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${roleFilter === 'Wing' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'}`}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Wings
                                </motion.button>
                                <motion.button
                                    onClick={() => setRoleFilter(roleFilter === 'Big' ? 'all' : 'Big')}
                                    className={`w-20 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${roleFilter === 'Big' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'}`}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Bigs
                                </motion.button>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Filters */}
                    <div className="hidden sm:flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end space-x-2">
                        {/* Position Filters */}
                        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                            <motion.button
                                onClick={() => setRoleFilter(roleFilter === 'Guard' ? 'all' : 'Guard')}
                                className={`w-20 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${roleFilter === 'Guard' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'}`}
                                whileTap={{ scale: 0.95 }}
                            >
                                Guards
                            </motion.button>
                            <motion.button
                                onClick={() => setRoleFilter(roleFilter === 'Wing' ? 'all' : 'Wing')}
                                className={`w-20 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${roleFilter === 'Wing' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'}`}
                                whileTap={{ scale: 0.95 }}
                            >
                                Wings
                            </motion.button>
                            <motion.button
                                onClick={() => setRoleFilter(roleFilter === 'Big' ? 'all' : 'Big')}
                                className={`w-20 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${roleFilter === 'Big' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'}`}
                                whileTap={{ scale: 0.95 }}
                            >
                                Bigs
                            </motion.button>
                        </div>

                        {/* Divider */}
                        <div className="h-6 md:h-8 w-px bg-gray-700/30 mx-1 md:mx-2" />

                        {/* Year Dropdown */}
                        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <motion.button
                                        className={`
                                            px-3 py-2 rounded-lg text-sm font-medium
                                            transition-all duration-300
                                            bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700
                                            flex items-center gap-1
                                        `}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {selectedYear || '2025'}
                                        <ChevronDown className="h-4 w-4" />
                                    </motion.button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-[#19191A] border-gray-700">
                                    {(['2025', '2024', '2023', '2022', '2021', '2020'] as const).map((year) => (
                                        <DropdownMenuItem
                                            key={year}
                                            className={`text-gray-400 hover:bg-gray-800/50 cursor-pointer rounded-md ${(selectedYear || '2025') === year ? 'bg-blue-500/20 text-blue-400' : ''
                                                }`}
                                            onClick={() => onYearChange?.(year)}
                                        >
                                            {year}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Divider */}
                        <div className="h-6 md:h-8 w-px bg-gray-700/30 mx-1 md:mx-2" />

                        {/* Desktop View Mode Dropdown (Contributors still separate here) */}
                        <div className="flex items-center gap-2">
                            {/* Contributors Button */}
                            <motion.button
                                onClick={() => handleViewModeChange('contributors')}
                                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center transition-all duration-300 ${viewMode === 'contributors'
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'
                                    }`}
                                whileTap={{ scale: 0.95 }}
                            >
                                <TrendingUp className="mr-1 h-4 w-4" />
                                Evaluation
                            </motion.button>

                            {/* View Mode Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <motion.button
                                        className="px-3 py-2 rounded-lg text-sm font-medium flex items-center transition-all duration-300 bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700"
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {/* Desktop view - show icons */}
                                        <span className="flex items-center">
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
                                    {/* Desktop: With icons */}
                                    <DropdownMenuItem
                                        className={`flex text-gray-400 hover:bg-gray-800/50 cursor-pointer rounded-md ${viewMode === 'card' ? 'bg-blue-500/20 text-blue-400' : ''}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleViewModeChange('card');
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <LucideUser className="h-4 w-4" />
                                            Card View
                                        </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className={`flex text-gray-400 hover:bg-gray-800/50 cursor-pointer rounded-md ${viewMode === 'table' ? 'bg-blue-500/20 text-blue-400' : ''}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleViewModeChange('table');
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
            </div>
        </div>
    );
};

export default function ConsensusPage() {
    const [prospects, setProspects] = useState<DraftProspect[]>([]);
    const [filteredProspects, setFilteredProspects] = useState<DraftProspect[]>([]);
    const [consensusMap, setConsensusMap] = useState<Record<string, ConsensusColumns>>({});
    const [viewMode, setViewMode] = useState<'card' | 'table' | 'contributors'>('card');
    const [loadedProspects, setLoadedProspects] = useState<number>(5);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [selectedSortKey,] = useState<string>('Actual Pick');
    const [contributorSearch, setContributorSearch] = useState('');
    const [rankingSystem, setRankingSystem] = useState<Map<string, number>>(new Map());
    const [selectedYear, setSelectedYear] = useState<'2025' | '2024' | '2023' | '2022' | '2021' | '2020'>('2025');
    const [contributorEvaluations, setContributorEvaluations] = useState<BaseContributorEvaluation[]>([]);
    const [consensusFilter, setConsensusFilter] = useState<'lottery' | 'top30' | 'top60'>('lottery');
    const [filterHeight, setFilterHeight] = useState(0);
    const [showPercentile, setShowPercentile] = useState(false);


    useEffect(() => {
        // Clear any existing table column state to respect initial visibility settings
        const storageKeys = Object.keys(localStorage).filter(key => key.startsWith('prospect-table-columns-'));
        storageKeys.forEach(key => localStorage.removeItem(key));
    }, [selectedYear]);

    useEffect(() => {
        const measureFilter = () => {
            const filter = document.getElementById('consensus-filter');
            if (filter) {
                setFilterHeight(filter.offsetHeight);
            }
        };

        measureFilter();
        window.addEventListener('resize', measureFilter);

        // Small delay to ensure DOM is ready
        setTimeout(measureFilter, 100);

        return () => window.removeEventListener('resize', measureFilter);
    }, [viewMode]);

    // Define column configuration with proper Player Information order
    const initialColumns: ColumnConfig[] = [
        // Player Information - Rank and Name are always visible
        { key: 'Rank', label: 'Rank', category: 'Player Information', visible: true, sortable: true },
        { key: 'Name', label: 'Name', category: 'Player Information', visible: true, sortable: true },
        { key: 'Role', label: 'Position', category: 'Player Information', visible: true, sortable: true },
        { key: 'League', label: 'League', category: 'Player Information', visible: false, sortable: true },
        { key: 'Pre-NBA', label: 'Pre-NBA', category: 'Player Information', visible: true, sortable: true },
        { key: 'Actual Pick', label: 'Draft Pick', category: 'Player Information', visible: true, sortable: true },
        { key: 'NBA Team', label: 'NBA Team', category: 'Player Information', visible: true, sortable: true },
        { key: 'Age', label: 'Age', category: 'Player Information', visible: false, sortable: true },
        { key: 'Height', label: 'Height', category: 'Player Information', visible: false, sortable: true },
        { key: 'Wingspan', label: 'Wingspan', category: 'Player Information', visible: false, sortable: true },
        { key: 'Wing - Height', label: 'Wing-Height', category: 'Player Information', visible: false, sortable: true },
        { key: 'Weight (lbs)', label: 'Weight', category: 'Player Information', visible: false, sortable: true },

        // Consensus Rank
        { key: 'MEAN', label: 'Mean', category: 'Consensus Rank', visible: true, sortable: true },
        { key: 'MEDIAN', label: 'Median', category: 'Consensus Rank', visible: false, sortable: true },
        { key: 'MODE', label: 'Mode', category: 'Consensus Rank', visible: false, sortable: true },
        { key: 'HIGH', label: 'High', category: 'Consensus Rank', visible: true, sortable: true },
        { key: 'LOW', label: 'Low', category: 'Consensus Rank', visible: true, sortable: true },
        { key: 'RANGE', label: 'Range', category: 'Consensus Rank', visible: false, sortable: true },
        { key: 'STDEV', label: 'StDev', category: 'Consensus Rank', visible: false, sortable: true },
        { key: 'COUNT', label: 'Count', category: 'Consensus Rank', visible: false, sortable: true },
        { key: 'Inclusion Rate', label: 'Inclusion Rate', category: 'Consensus Rank', visible: true, sortable: true },

        // Range Consensus Info
        { key: '1 - 3', label: 'Picks 1-3', category: 'Consensus Range', visible: true, sortable: true },
        { key: '4 - 14', label: 'Picks 4-14', category: 'Consensus Range', visible: true, sortable: true },
        { key: '15 - 30', label: 'Picks 15-30', category: 'Consensus Range', visible: true, sortable: true },
        { key: '2nd Round', label: '2nd Round', category: 'Consensus Range', visible: true, sortable: true },
        { key: 'Undrafted', label: 'Undrafted', category: 'Consensus Range', visible: true, sortable: true },
    ];

    useEffect(() => {
        document.title = 'Consensus NBA Draft Board';
    }, []);

    const contributorColumns: ContributorColumnConfig[] = [
        // Board Information
        { key: 'Board', label: 'Board', category: 'Board Information', visible: true, sortable: true },
        { key: 'Board Size', label: 'Size', category: 'Board Information', visible: true, sortable: true },

        // Consensus Performance
        { key: 'Consensus Lottery', label: 'Consensus Lottery', category: 'Consensus', visible: true, sortable: true },
        { key: 'Consensus Top 30', label: 'Consensus Top 30', category: 'Consensus', visible: true, sortable: true },
        { key: 'Consensus Top 60', label: 'Consensus Top 60', category: 'Consensus', visible: false, sortable: true },

        // NBA Draft Performance
        { key: 'NBA Draft Lottery', label: 'NBA Draft Lottery', category: 'NBA Draft', visible: true, sortable: true },
        { key: 'NBA Draft Top 30', label: 'NBA Draft  Top 30', category: 'NBA Draft', visible: true, sortable: true },
        { key: 'NBA Draft Top 60', label: ' NBA Draft Top 60', category: 'NBA Draft', visible: false, sortable: true },

        // Redraft Performance
        { key: 'Redraft Lottery', label: 'Redraft Lottery', category: 'Redraft', visible: true, sortable: true },
        { key: 'Redraft Top 30', label: 'Redraft Top 30', category: 'Redraft', visible: true, sortable: true },
        { key: 'Redraft Top 60', label: 'Redraft Top 60', category: 'Redraft', visible: false, sortable: true },

        // EPM Performance
        { key: 'EPM Lottery', label: 'EPM Lottery', category: 'EPM', visible: false, sortable: true },
        { key: 'EPM Top 30', label: 'EPM Top 30', category: 'EPM', visible: false, sortable: true },
        { key: 'EPM Top 60', label: 'EPM Top 60', category: 'EPM', visible: false, sortable: true },

        // EW Performance
        { key: 'EW Lottery', label: 'EW Lottery', category: 'EW', visible: false, sortable: true },
        { key: 'EW Top 30', label: 'EW Top 30', category: 'EW', visible: false, sortable: true },
        { key: 'EW Top 60', label: 'EW Top 60', category: 'EW', visible: false, sortable: true },

        // Overall Rankings
        { key: 'Lottery Rank', label: 'Lottery Rank', category: 'Rankings', visible: true, sortable: true },
        { key: 'Top 30 Rank', label: 'Top 30 Rank', category: 'Rankings', visible: true, sortable: true },
        { key: 'Top 60 Rank', label: 'Top 60 Rank', category: 'Rankings', visible: false, sortable: true },
    ];

    const handleConsensusFilterChange = useCallback((filter: 'lottery' | 'top30' | 'top60') => {
        setConsensusFilter(filter);
    }, []);

    useEffect(() => {
        async function fetchContributorEvaluations() {
            // Only fetch for 2020 and 2021
            if (selectedYear !== '2020' && selectedYear !== '2021' && selectedYear !== '2022' && selectedYear !== '2023' && selectedYear !== '2024' && selectedYear !== '2025') {
                setContributorEvaluations([]);
                return;
            }

            try {
                const csvFileName = `${selectedYear} Consensus Evaluation.csv`;
                const response = await fetch(`/${csvFileName}`);
                const csvText = await response.text();

                Papa.parse(csvText, {
                    header: true,
                    complete: (results) => {
                        const evaluationData = results.data as BaseContributorEvaluation[];
                        setContributorEvaluations(evaluationData);
                    }
                });
            } catch (error) {
                console.error('Error fetching contributor evaluations:', error);
                setContributorEvaluations([]);
            }
        }

        fetchContributorEvaluations();
    }, [selectedYear]);

    // Global data analysis function
    const analyzeGlobalDataValidity = useCallback(() => {
        if (!consensusMap || Object.keys(consensusMap).length === 0) return;

        const globalAnalysis = {
            totalProspects: Object.keys(consensusMap).length,
            totalContributors: 0,
            contributorIssues: {} as Record<string, { invalidCount: number; emptyCount: number; totalCount: number }>,
            prospectIssues: {} as Record<string, { invalidCount: number; emptyCount: number; totalCount: number }>,
            problematicContributors: [] as string[],
            problematicProspects: [] as string[]
        };

        // Get contributor list from first prospect
        const firstProspect = Object.values(consensusMap)[0];
        const contributors = Object.keys(firstProspect).filter(key => key !== 'Name');
        globalAnalysis.totalContributors = contributors.length;

        // Initialize contributor tracking
        contributors.forEach(contributor => {
            globalAnalysis.contributorIssues[contributor] = { invalidCount: 0, emptyCount: 0, totalCount: 0 };
        });

        // Analyze each prospect
        Object.entries(consensusMap).forEach(([prospectName, consensusData]) => {
            globalAnalysis.prospectIssues[prospectName] = { invalidCount: 0, emptyCount: 0, totalCount: 0 };

            Object.entries(consensusData)
                .filter(([key]) => key !== 'Name')
                .forEach(([contributor, value]) => {
                    globalAnalysis.contributorIssues[contributor].totalCount++;
                    globalAnalysis.prospectIssues[prospectName].totalCount++;

                    // Check for empty values
                    if (value === null || value === undefined || value === '') {
                        globalAnalysis.contributorIssues[contributor].emptyCount++;
                        globalAnalysis.prospectIssues[prospectName].emptyCount++;
                        return;
                    }

                    // Check for invalid values
                    let pick: number;
                    if (typeof value === "number") {
                        pick = value;
                    } else if (typeof value === "string" && value.trim() !== "") {
                        pick = parseInt(value);
                    } else {
                        globalAnalysis.contributorIssues[contributor].invalidCount++;
                        globalAnalysis.prospectIssues[prospectName].invalidCount++;
                        return;
                    }

                    if (isNaN(pick) || pick < 1 || pick > 60) {
                        globalAnalysis.contributorIssues[contributor].invalidCount++;
                        globalAnalysis.prospectIssues[prospectName].invalidCount++;
                    }
                });
        });

        // Identify problematic contributors (more than 10% issues)
        Object.entries(globalAnalysis.contributorIssues).forEach(([contributor, issues]) => {
            const totalIssues = issues.invalidCount + issues.emptyCount;
            const issueRate = totalIssues / issues.totalCount;
            if (issueRate > 0.1) { // 10% threshold
                globalAnalysis.problematicContributors.push(contributor);
            }
        });

        // Identify problematic prospects (more than 10% issues)
        Object.entries(globalAnalysis.prospectIssues).forEach(([prospect, issues]) => {
            const totalIssues = issues.invalidCount + issues.emptyCount;
            const issueRate = totalIssues / issues.totalCount;
            if (issueRate > 0.1) { // 10% threshold
                globalAnalysis.problematicProspects.push(prospect);
            }
        });

        console.log('=== GLOBAL DATA VALIDITY ANALYSIS ===');
        console.log('Global Analysis:', globalAnalysis);

        if (globalAnalysis.problematicContributors.length > 0) {
            console.log('Problematic Contributors (>10% issues):', globalAnalysis.problematicContributors);
        }

        if (globalAnalysis.problematicProspects.length > 0) {
            console.log('Problematic Prospects (>10% issues):', globalAnalysis.problematicProspects);
        }

        return globalAnalysis;
    }, [consensusMap]);


    // Run global analysis when data is loaded
    useEffect(() => {
        if (Object.keys(consensusMap).length > 0) {
            analyzeGlobalDataValidity();
        }
    }, [consensusMap, analyzeGlobalDataValidity]);

    // Check if device is mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        async function fetchDraftProspects() {
            try {
                const csvFileName = `${selectedYear} Draft Twitter Consensus Big Board.csv`;
                const response = await fetch(`/${csvFileName}`);
                const csvText = await response.text();

                Papa.parse(csvText, {
                    header: true,
                    complete: (results) => {
                        const prospectData = results.data as DraftProspect[];
                        setProspects(prospectData);
                        setFilteredProspects(prospectData);

                        const consensusMap: Record<string, ConsensusColumns> = {};

                        // Helper function to safely convert CSV values
                        const safeParseInt = (value: string | number): number => {
                            if (typeof value === 'number') return value;
                            if (typeof value === 'string') {
                                const parsed = parseInt(value.trim());
                                return isNaN(parsed) ? 0 : parsed;
                            }
                            return 0;
                        };

                        for (const row of results.data as any[]) {
                            if (!row.Name) continue;

                            // Create consensus object with all available columns
                            const consensus: ConsensusColumns = { Name: row.Name };

                            // Add all other columns from the CSV
                            Object.keys(row).forEach(key => {
                                if (key !== 'Name') {
                                    consensus[key] = safeParseInt(row[key]);
                                }
                            });

                            consensusMap[row.Name] = consensus;
                        }

                        setConsensusMap(consensusMap);
                    }
                });
            } catch (error) {
                console.error('Error fetching draft prospects:', error);
            }
        }
        fetchDraftProspects();
    }, [selectedYear]);

    // Handle scroll event for infinite loading - only on desktop
    useEffect(() => {
        if (viewMode !== 'card' || isLoading) return; // Don't check isMobile here!

        const handleScroll = () => {
            const scrollPosition = window.scrollY + window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;

            if (documentHeight - scrollPosition < 100) {
                setIsLoading(true);

                const loadAmount = isMobile ? 10 : 20;

                requestAnimationFrame(() => {
                    setLoadedProspects(prev => {
                        const newCount = prev + loadAmount;
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
        setLoadedProspects(10);
        setHasMore(filteredProspects.length > 20);
    }, [filteredProspects]);

    return (
        <div className="min-h-screen bg-[#19191A]">
            <NavigationHeader activeTab="Consensus" />
            <DraftPageHeader author="Consensus" selectedYear={selectedYear} />
            <GoogleAnalytics gaId="G-X22HKJ13B7" />
            {viewMode !== 'contributors' ? (
                <ConsensusFilter
                    id="consensus-filter"  // Add this
                    prospects={prospects}
                    onFilteredProspectsChange={setFilteredProspects}
                    onRankingSystemChange={setRankingSystem}
                    rank={{}}
                    onViewModeChange={setViewMode}
                    selectedYear={selectedYear}
                    onYearChange={setSelectedYear}
                />
            ) : (
                <div className="sticky top-14 z-30 bg-[#19191A] border-b border-gray-800 max-w-6xl mx-auto">
                    {/* Mobile Layout */}
                    <div className="sm:hidden px-4 py-2">
                        <div className="flex items-center justify-between gap-2 mb-3">
                            {/* Search Bar - Full width on mobile */}
                            <div className="relative flex-grow">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                                <Input
                                    type="text"
                                    placeholder="Search Contributors"
                                    value={contributorSearch}
                                    onChange={(e) => setContributorSearch(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full bg-gray-800/20 border-gray-800 text-gray-300 placeholder-gray-500 rounded-lg focus:border-blue-500/30 focus:ring-1 focus:ring-blue-500/30"
                                />
                            </div>
                        </div>

                        {/* Controls Row */}
                        <div className="flex items-center justify-between gap-2">
                            {(selectedYear === '2020' || selectedYear === '2021' || selectedYear === '2022' || selectedYear === '2023' || selectedYear === '2024' || selectedYear === '2025') && (
                                <><div className="px-2 py-2 flex items-center gap-1 p-1 bg-gray-800/20 border border-gray-800 rounded-lg">
                                    <motion.button
                                        onClick={() => handleConsensusFilterChange('lottery')}
                                        className={`px-2 py-0.5 rounded-md text-xs font-medium transition-all duration-200 ${consensusFilter === 'lottery'
                                            ? 'text-blue-400'
                                            : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'}`}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Lottery
                                    </motion.button>
                                    <motion.button
                                        onClick={() => handleConsensusFilterChange('top30')}
                                        className={`px-2 py-0.5 rounded-md text-xs font-medium transition-all duration-200 ${consensusFilter === 'top30'
                                            ? 'text-blue-400'
                                            : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'}`}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Top 30
                                    </motion.button>
                                    <motion.button
                                        onClick={() => handleConsensusFilterChange('top60')}
                                        className={`px-2 py-0.5 rounded-md text-xs font-medium transition-all duration-200 ${consensusFilter === 'top60'
                                            ? 'text-blue-400'
                                            : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'}`}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Top 60
                                    </motion.button>
                                </div>
                                    <motion.button
                                        onClick={() => {
                                            console.log('Button clicked! Current state:', showPercentile);
                                            setShowPercentile(!showPercentile);
                                            console.log('New state will be:', !showPercentile);
                                        }}
                                        className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${showPercentile
                                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                                : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'
                                            }`}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all duration-200 ${showPercentile
                                                ? 'border-blue-400 bg-blue-400/20'
                                                : 'border-gray-500 bg-transparent'
                                            }`}>
                                            {showPercentile && (
                                                <svg
                                                    className="w-2.5 h-2.5 text-blue-400"
                                                    fill="none"
                                                    strokeWidth="2.5"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        Percentile
                                    </motion.button>
                                </>
                            )}

                            {/* Right Side Controls */}
                            <div className="flex items-center gap-2">
                                {/* Year Dropdown */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <motion.button
                                            className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700 flex items-center gap-1 flex-shrink-0"
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {selectedYear}
                                            <ChevronDown className="h-4 w-4" />
                                        </motion.button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="bg-[#19191A] border-gray-700">
                                        {(['2025', '2024', '2023', '2022', '2021', '2020'] as const).map((year) => (
                                            <DropdownMenuItem
                                                key={year}
                                                className={`text-gray-400 hover:bg-gray-800/50 cursor-pointer rounded-md ${selectedYear === year ? 'bg-blue-500/20 text-blue-400' : ''}`}
                                                onClick={() => setSelectedYear(year)}
                                            >
                                                {year}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {/* View Mode Dropdown */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <motion.button
                                            className="px-3 py-2 rounded-lg text-sm font-medium flex items-center bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <TrendingUp className="mr-1 h-4 w-4" />
                                            <span className="hidden xs:inline">Eval</span>
                                            <ChevronDown className="ml-1 h-4 w-4" />
                                        </motion.button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="bg-[#19191A] border-gray-700">
                                        <DropdownMenuItem
                                            className="text-gray-400 hover:bg-gray-800/50 cursor-pointer rounded-md"
                                            onClick={() => setViewMode('card')}
                                        >
                                            Card View
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-gray-400 hover:bg-gray-800/50 cursor-pointer rounded-md"
                                            onClick={() => setViewMode('table')}
                                        >
                                            Table View
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="bg-blue-500/20 text-blue-400 cursor-pointer rounded-md"
                                            onClick={() => setViewMode('contributors')}
                                        >
                                            Evaluation
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Layout - Unchanged */}
                    <div className="hidden sm:block px-4 py-3">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 flex-grow max-w-2xl">
                                <div className="relative flex-grow">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                                    <Input
                                        type="text"
                                        placeholder="Search Contributors"
                                        value={contributorSearch}
                                        onChange={(e) => setContributorSearch(e.target.value)}
                                        className="pl-10 pr-4 py-2 w-full bg-gray-800/20 border-gray-800 text-gray-300 placeholder-gray-500 rounded-lg focus:border-blue-500/30 focus:ring-1 focus:ring-blue-500/30"
                                    />
                                </div>
                                {contributorSearch && (
                                    <motion.button
                                        onClick={() => setContributorSearch('')}
                                        className="flex items-center px-3 py-2 rounded-lg text-xs transition-all duration-300 text-red-400 hover:text-red-300 bg-gray-800/20 border border-gray-800 hover:border-red-700/30 whitespace-nowrap flex-shrink-0"
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        Clear
                                    </motion.button>
                                )}
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                                {(selectedYear === '2020' || selectedYear === '2021' || selectedYear === '2022' || selectedYear === '2023' || selectedYear === '2024' || selectedYear === '2025') && (
                                    <>
                                        <div className="flex items-center gap-1 p-1 bg-[#19191A] border border-gray-800 rounded-lg">
                                            <motion.button
                                                onClick={() => handleConsensusFilterChange('lottery')}
                                                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${consensusFilter === 'lottery'
                                                    ? 'bg-blue-500/20 text-blue-400 border-blue-400 shadow-sm'
                                                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                                                    }`}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Lottery
                                            </motion.button>
                                            <motion.button
                                                onClick={() => handleConsensusFilterChange('top30')}
                                                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${consensusFilter === 'top30'
                                                    ? 'bg-blue-500/20 text-blue-400 border-blue-400 shadow-sm'
                                                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                                                    }`}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Top 30
                                            </motion.button>
                                            <motion.button
                                                onClick={() => handleConsensusFilterChange('top60')}
                                                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${consensusFilter === 'top60'
                                                    ? 'bg-blue-500/20 text-blue-400 border-blue-400 shadow-sm'
                                                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                                                    }`}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Top 60
                                            </motion.button>
                                        </div>
                                        <div className="h-6 w-px bg-gray-700/30 mx-1" />
                                        <motion.button
                                            onClick={() => {
                                                console.log('Button clicked! Current state:', showPercentile);
                                                setShowPercentile(!showPercentile);
                                                console.log('New state will be:', !showPercentile);
                                            }}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${showPercentile
                                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                                : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'
                                                }`}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all duration-200 ${showPercentile
                                                ? 'border-blue-400 bg-blue-400/20'
                                                : 'border-gray-500 bg-transparent'
                                                }`}>
                                                {showPercentile && (
                                                    <svg
                                                        className="w-3 h-3 text-blue-400"
                                                        fill="none"
                                                        strokeWidth="2.5"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                            Percentile
                                        </motion.button>
                                        <div className="h-6 w-px bg-gray-700/30 mx-1" />
                                    </>
                                )}

                                {/* Year Dropdown */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <motion.button
                                            className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700 flex items-center gap-1 flex-shrink-0"
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {selectedYear}
                                            <ChevronDown className="h-4 w-4" />
                                        </motion.button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="bg-[#19191A] border-gray-700">
                                        {(['2025', '2024', '2023', '2022', '2021', '2020'] as const).map((year) => (
                                            <DropdownMenuItem
                                                key={year}
                                                className={`text-gray-400 hover:bg-gray-800/50 cursor-pointer rounded-md ${selectedYear === year ? 'bg-blue-500/20 text-blue-400' : ''}`}
                                                onClick={() => setSelectedYear(year)}
                                            >
                                                {year}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {/* View Mode Dropdown */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <motion.button
                                            className="px-3 py-2 rounded-lg text-sm font-medium flex items-center bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <TrendingUp className="mr-1 h-4 w-4" />
                                            Evaluation
                                            <ChevronDown className="ml-1 h-4 w-4" />
                                        </motion.button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="bg-[#19191A] border-gray-700">
                                        <DropdownMenuItem
                                            className="text-gray-400 hover:bg-gray-800/50 cursor-pointer rounded-md"
                                            onClick={() => setViewMode('card')}
                                        >
                                            <div className="flex items-center gap-2">
                                                <LucideUser className="h-4 w-4" />
                                                Card View
                                            </div>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-gray-400 hover:bg-gray-800/50 cursor-pointer rounded-md"
                                            onClick={() => setViewMode('table')}
                                        >
                                            <div className="flex items-center gap-2">
                                                <TableIcon className="h-4 w-4" />
                                                Table View
                                            </div>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="bg-blue-500/20 text-blue-400 cursor-pointer rounded-md"
                                            onClick={() => setViewMode('contributors')}
                                        >
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="h-4 w-4" />
                                                Evaluation
                                            </div>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {viewMode === 'contributors' ? (
                (selectedYear === '2020' || selectedYear === '2021' || selectedYear === '2022' || selectedYear === '2023' || selectedYear === '2024' || selectedYear === '2025') ? (
                    <><EvaluationExplanation
                        selectedYear={selectedYear}
                        consensusFilter={consensusFilter} />
                        <ContributorEvaluationTable
                            evaluations={contributorEvaluations}
                            initialColumns={contributorColumns}
                            categories={['Board Information', 'Consensus', 'NBA Draft', 'Redraft', 'EPM', 'EW', 'Rankings']}
                            consensusFilter={consensusFilter}
                            onConsensusFilterChange={handleConsensusFilterChange}
                            searchQuery={contributorSearch}
                            year={parseInt(selectedYear)}
                            showPercentile={showPercentile}
                        />
                    </>
                ) : (
                    <div className="text-center py-8 text-gray-400">
                        Contributor evaluation data not available for {selectedYear}
                    </div>
                )
            ) : filteredProspects.length > 0 ? (
                viewMode === 'card' ? (
                    <div className="space-y mt-6">
                        {filteredProspects.slice(0, loadedProspects).map((prospect) => (
                            <ConsensusPageProspectCard
                                key={prospect.Name}
                                prospect={prospect}
                                filteredProspects={filteredProspects}
                                allProspects={prospects}
                                selectedSortKey={selectedSortKey}
                                selectedYear={Number(selectedYear)}
                                consensusData={consensusMap[prospect.Name]}
                                rankingSystem={rankingSystem}
                                rank={0}
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
                        prospects={filteredProspects.map(p => ({ ...p, Tier: (p as { Tier?: string; }).Tier ?? '' }))}
                        rankingSystem={rankingSystem}
                        initialColumns={initialColumns}
                    />
                )
            ) : (
                <div className="text-center py-8 text-gray-400">
                    No prospects found matching your search criteria
                </div>
            )
            }
        </div >
    );
}