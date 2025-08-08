"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
    '31 - 59': string;
    'Undrafted': string;

    Summary?: string;
    originalRank?: number;

}

export interface ConsensusColumns {
    'Name': string;
    'The Athletic (Sam Vecenie)': number;
    'CBS Sports': number;
    '@KevinOConnorNBA (Yahoo)': number;
    'The Ringer': number;
    'Tankathon': number;
    'NBADraft.net': number;
    'ESPN': number;
    'No Ceilings': number;
    'CraftedNBA': number;
    '@KlineNBA (Fansided)': number;
    'Swish Theory': number;
    'Kevin Pelton (ESPN)': number;
    'Opta': number;
    'the center hub': number;
    '@supersayansavin (TPM)': number;
    '@CRiehl30': number;
    '@JoelHinkieMaxey': number;
    '@draymottishaw': number;
    '@ZP12Hoops': number;
    '@kimonsjaer24': number;
    '@Jackmatthewss_': number;
    '@rowankent': number;
    '@CannibalSerb': number;
    'Jishnu': number;
    '@fra_sempru': number;
    '@FPL_Mou': number;
    'RyanHammer09': number;
    '@thezonemaster': number;
    '@hutsonboggs': number;
    '@PAKA_FLOCKA': number;
    '@drew_cant_hoop': number;
    '@PenguinHoops': number;
    'PK': number;
    '@nore4dh': number;
    '@LeftFieldSoup': number;
    '@OranjeGuerrero': number;
    '@503sbest': number;
    '@BrianJNBA': number;
    '@CediBetter': number;
    '@JEnnisNBADraft': number;
    '@report_court': number;
    '@esotericloserr': number;
    '@atthelevel': number;
    '@freewave3': number;
    'Andrea Cannici': number;
    '@LoganH_utk': number;
    'JoshW': number;
    '@double_pg': number;
    '@TaouTi959': number;
    '@Alley_Oop_Coop': number;
    '@perspectivehoop': number;
    '@chipwilliamsjr': number;
    '@DraftCasual': number;
    '@thebigwafe': number;
    '@NPComplete34': number;
    '@SPTSJUNKIE (NBA Draft Network)': number;
    '@bjpf_': number;
    '@ram_dub': number;
    'ReverseEnigma (databallr)': number;
    '@OpticalHoops': number;
    '@Rileybushh': number;
    '@jhirsh03': number;
    '@who_____knows': number;
    '@GrizzliesFilm': number;
    '@Juul__Embiid': number;
    '@redrock_bball': number;
    '@matwnba': number;
    '@SpencerVonNBA': number;
    'Jack Chambers': number;
    'NBA Draft Room': number;
    '@LoganPAdams': number;
    '@bballstrategy': number;
    '@movedmypivot': number;
    '@drakemayefc': number;
    '@Trellinterlude': number;
    '@TrashPanda': number;
    '@Duydidt': number;
    '@Hoops_Haven1': number;
    'Isaiah Silas': number;
    '@codyreeves14': number;
    '@nikoza2': number;
    '@zjy2000': number;
    '@Quinnfishburne': number;
    '@antoniodias_pt': number;
    '@cparkernba': number;
    '@ChuckingDarts': number;
    '@ShoryLogan': number;
    '@Ethan387': number;
    '@IFIMINC': number;
    '@TStapletonNBA': number;
    '@WillC': number;
    '@mobanks10': number;
    '@RichStayman': number;
    '@_thedealzone': number;
    '@_GatheringIntel': number;
    '@DraftPow': number;
    '@Dkphisports': number;
    '@NicThomasNBA': number;
    'Giddf': number;
    '@BeyondTheRK': number;
    '@greg23m': number;
    'DrewDataDesign': number;
    'Kam H': number;
    '@dancingwithnoah': number;
    'theballhaus': number;
    'Oneiric': number;
    '@undraliu': number;
    '@corbannba': number;
    '@_LarroHoops': number;
    'salvador cali': number;
    '@LoganRoA_': number;
    '@sammygprops': number;
    '@wilkomcv': number;
    '@wheatonbrando': number;
    '@Flawlesslikeeli': number;
    '@_R_M_M': number;
    '@mcfNBA': number;
    '@evidenceforZ': number;
    '@sixringsofsteeI': number;
    '@CozyLito': number;
    '@HoopsMetrOx': number;
    '@SBNRicky': number;
    '@redcooteay': number;
    '@jessefischer': number;
    '@henrynbadraft': number;
    '@spursbeliever': number;
    'SMILODON': number;
    '@ayush_batra15': number;
    '@AmericanNumbers': number;
    '@100guaranteed': number;
    '@jaynay1': number;
    '@NileHoops': number;
    '@HuntHoops': number;
    'Mike Gribanov': number;
    '@bendog28': number;
    '@JHM Basketball': number;
    '@halfwaketakes': number;
    '@criggsnba': number;
    '@NBADraftFuture': number;
    '@JoeHulbertNBA': number;
    '@CTFazio24': number;
    '@JozhNBA': number;
    '@hoop_tetris': number;
    '@tobibuehner': number;
    '@Josh_markowitz': number;
    '@onlyonepodcastt': number;
    '@akaCK_': number;
    '@TheNicolau15': number;
    '@British_Buzz': number;
    '@hellyymarco': number;
    '@SaucyTakez': number;
    '@j0nzzzz': number;
    '@JackDAnder': number;
    '@nbadrafting': number;
    'TheProcess': number;
    '@canpekerpekcan': number;
    '@ByAnthonyRizzo': number;
    '@TwoWayMurray': number;
}

interface ConsensusHistogramProps {
    prospect: DraftProspect;
    consensusData: ConsensusColumns;
    isMobile?: boolean;
}

const ConsensusHistogram: React.FC<ConsensusHistogramProps> = ({
    prospect,
    consensusData,
}) => {
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

        Object.entries(consensusData)
            .filter(([key]) => key !== "Name")
            .forEach(([contributor, value]) => {
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
    }, [consensusData, prospect.Name]);

    // Log analysis for debugging (only for first few prospects to avoid spam)
    useEffect(() => {
        if (prospect.Name === 'Cooper Flagg') {
            console.log(`Data Analysis for ${prospect.Name}:`, analyzeDataValidity);

            if (analyzeDataValidity.invalidContributors.length > 0) {
                console.log(`Invalid contributors for ${prospect.Name}:`, analyzeDataValidity.invalidContributors);
                console.log(`Invalid values for ${prospect.Name}:`, analyzeDataValidity.invalidValues);
            }

            if (analyzeDataValidity.emptyContributors.length > 0) {
                console.log(`Empty contributors for ${prospect.Name}:`, analyzeDataValidity.emptyContributors);
            }
        }
    }, [analyzeDataValidity, prospect.Name]);

    // Build histogram data with proper counting and percentage conversion
    const histogramData = useMemo(() => {
        const counts: Record<number, number> = {};
        const picks: number[] = [];

        Object.entries(consensusData)
            .filter(([key]) => key !== "Name")
            .forEach(([, value]) => {
                let pick: number | undefined;

                if (typeof value === "number") {
                    pick = value;
                } else if (typeof value === "string") {
                    const cleaned = value.replace(/[^\d]/g, ''); // remove commas, quotes, etc.
                    const parsed = parseInt(cleaned);
                    if (!isNaN(parsed)) pick = parsed;
                }

                if (pick && pick >= 1 && pick <= 108) {
                    counts[pick] = (counts[pick] || 0) + 1;
                    picks.push(pick);
                }
            });

        // RJ Davis specific debug
        if (prospect.Name === 'RJ Davis') {
            console.log(`🔍 RJ Davis Area Chart Data:`, {
                rawPicks: picks,
                histogramCounts: counts,
            });
        }

        if (picks.length === 0) return [];

        const minPick = Math.min(...picks);
        const maxPick = Math.max(...picks);
        const uniquePicks = new Set(picks);

        // Calculate total valid contributors for percentage calculation
        const totalContributors = Object.entries(consensusData)
            .filter(([key]) => key !== "Name")
            .reduce((count, [, value]) => {
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

        if (prospect.Name === 'RJ Davis') {
            console.log("✅ Final RJ Davis histogramData:", histogram);
        }

        return histogram;
    }, [consensusData, prospect]);


    // Calculate data quality metrics - FIXED VOTE COUNTING
    const dataQuality = useMemo(() => {
        const totalContributors = Object.keys(consensusData).length - 1; // Exclude 'Name'

        // FIXED: Count valid picks directly from consensusData instead of histogramData
        let actualValidPicks = 0;
        Object.entries(consensusData)
            .filter(([key]) => key !== "Name")
            .forEach(([, value]) => {
                // Handle different value types
                let pick: number;
                if (typeof value === "number") {
                    pick = value;
                } else if (typeof value === "string" && value.trim() !== "") {
                    pick = parseInt(value);
                } else {
                    return; // Skip empty/invalid values
                }

                // Count all valid NBA draft picks (1-60)
                if (!isNaN(pick) && pick >= 1 && pick <= 60) {
                    actualValidPicks++;
                }
            });

        const participationRate = totalContributors > 0 ? (actualValidPicks / totalContributors) * 100 : 0;
        const maxPercentage = Math.max(...histogramData.map(item => item.percentage));

        // FIXED: Make sparse data criteria extremely restrictive - only for truly exceptional cases
        // Only use bars for prospects with 1-2 total votes or completely no distribution
        const uniquePickPositions = histogramData.filter(item => item.count > 0).length;
        const isSparseData = actualValidPicks <= 1 || (actualValidPicks === 2 && uniquePickPositions === 1); // Very restrictive

        return {
            totalContributors,
            validPicks: actualValidPicks, // Use the correctly counted picks
            participationRate,
            maxPercentage,
            isSparseData,
            uniquePickPositions
        };
    }, [histogramData, consensusData]);

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

    // If no data, show message
    if (histogramData.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-gray-400">
                <p>No consensus data available for {prospect.Name}</p>
            </div>
        );
    }

    // Calculate proper domains for better visualization
    const xDomain = histogramData.length > 0 ? [
        histogramData[0].pick,
        histogramData[histogramData.length - 1].pick
    ] : [1, 60];

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
                    // Use bar chart for truly sparse data (very few picks or single position)
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
            { label: '31-59', value: safeParseFloat(prospect['31 - 59']), range: '31-59' },
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
    selectedYear: number;
    consensusData?: ConsensusColumns;
    rankingSystem: Map<string, number>;
}> = ({ prospect, consensusData, rankingSystem }) => {
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

    // Consensus data for the table
    const consensusTableData = useMemo(() => [
        { label: 'Mean', value: prospect['MEAN'] || 'N/A' },
        { label: 'Median', value: prospect['MEDIAN'] || 'N/A' },
        { label: 'Mode', value: prospect['MODE'] || 'N/A' },
        { label: 'High', value: prospect['HIGH'] || 'N/A' },
        { label: 'Low', value: prospect['LOW'] || 'N/A' },
        { label: 'Range', value: prospect['RANGE'] || 'N/A' },
        { label: 'Inclusion Rate', value: prospect['Inclusion Rate'] ? `${Math.round(Number(prospect['Inclusion Rate']) * 100)}%` : 'N/A' },
    ], [prospect]);

    // Range consensus data for the table
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
            { label: 'Picks 31-59', value: safeParseFloat(prospect['31 - 59']) },
            { label: isMobile ? 'UDFA' : 'Undrafted', value: safeParseFloat(prospect['Undrafted']) }
        ];

        // Return all ranges, including those with 0% values
        return ranges.map(item => ({
            ...item,
            percentage: Math.round(item.value * 100)
        }));
    }, [prospect, isMobile]);

    return (
        <BaseProspectCard
            prospect={prospect}
            rank={currentRank}
            selectedYear={2025}
            isMobile={isMobile}
            onExpand={handleExpand}
        >
            {/* Header with centered toggle */}
            <div className="flex items-center px-2 mb-4">
                <div className="flex-[0.8] flex justify-center pr-1">
                    <h3 className="font-semibold text-lg text-white">
                        Draft Rank Distribution
                    </h3>
                </div>
                
                {/* Centered Segmented Control with Tooltip */}
                <div className="flex items-center gap-2">
                    <div className="flex bg-gray-800/20 border border-gray-700 rounded-lg p-1">
                        <button
                            onClick={() => setShowRangeConsensus(false)}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-300 ${
                                !showRangeConsensus 
                                    ? 'text-white shadow-sm' 
                                    : 'text-gray-400 hover:text-gray-200'
                            }`}
                            style={!showRangeConsensus ? {
                                backgroundColor: `${prospect['Team Color']}60` // 60 for 60% opacity like the original /60
                            } : {}}
                        >
                            Rank View
                        </button>
                        <button
                            onClick={() => setShowRangeConsensus(true)}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-300 ${
                                showRangeConsensus 
                                    ? 'text-white shadow-sm' 
                                    : 'text-gray-400 hover:text-gray-200'
                            }`}
                            style={showRangeConsensus ? {
                                backgroundColor: `${prospect['Team Color']}60` // 60 for 60% opacity like the original /60
                            } : {}}
                        >
                            Range View
                        </button>
                    </div>
                    
                    {/* Clickable Tooltip Question Mark */}
                    <div className="relative">
                        <button
                            onClick={() => setShowTooltip(!showTooltip)}
                            className="w-4 h-4 rounded-full bg-gray-600/50 text-gray-400 flex items-center justify-center text-xs cursor-pointer hover:text-gray-200 transition-colors"
                        >
                            ?
                        </button>
                        {showTooltip && (
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-4 py-3 bg-[#19191A] border border-white/20 text-white text-sm rounded-lg shadow-lg w-96 max-w-screen-sm z-[9999]">
                                <div className="text-left leading-relaxed space-y-2">
                                    <p>Both views show how each prospect is perceived across the boards that contribute to the consensus.</p>
                                    <p><strong className="text-blue-400">Rank View</strong> displays individual rankings from each board, along with summary stats (average rank, median rank, high, low, etc.).</p>
                                    <p><strong className="text-blue-400">Range View</strong> groups those rankings into broader draft tiers (Top 3, 2nd Round, Undrafted, etc.), showing how often the prospect falls into each tier (ex. ranked in the Top 3 on 50% of boards).</p>
                                </div>
                                {/* Arrow pointing up */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-[#19191A]"></div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-[0.8] flex justify-center pl-1">
                    <h3 className="font-semibold text-lg text-white">
                        Draft Rank Data
                    </h3>
                </div>
            </div>

            {/* Consensus-specific dropdown content */}
            <div className={`${isMobile ? '' : 'grid grid-cols-2 gap-4'} pb-0`}>
                {/* Charts Column */}
                <div className="text-gray-300 px-1 flex flex-col justify-start">
                    {/* Chart Container - Shows either histogram or range consensus */}
                    <div className="-ml-2 w-[calc(100%+16px)]">
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
                <div className="text-gray-300 px-2">

                    {showRangeConsensus ? (
                        /* Range Consensus Table */
                        <div>
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
                        <div>
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
}

const ProspectFilter: React.FC<ProspectFilterProps> = ({
    prospects,
    onFilteredProspectsChange,
    onRankingSystemChange,
    onViewModeChange
}) => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'Guard' | 'Wing' | 'Big'>('all');
    const [, setLocalFilteredProspects] = useState(prospects);
    const [viewMode, setViewMode] = useState<'card' | 'table' | 'contributors'>('card');
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(true);

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
                    <div className="flex items-center gap-2">
                        {/* Contributors Button */}
                        <motion.button
                            onClick={() => handleViewModeChange('contributors')}
                            className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center transition-all duration-300 ${viewMode === 'contributors'
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'
                                }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <TrendingUp className="mr-1 h-4 w-4" />
                            Contributors
                        </motion.button>

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
                        <div className="h-6 md:h-8 w-px bg-gray-700/30 mx-1 md:mx-2" />

                        {/* Desktop View Mode Dropdown */}
                        <div className="flex items-center gap-2">
                            {/* Contributors Button */}
                            <motion.button
                                onClick={() => handleViewModeChange('contributors')}
                                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center transition-all duration-300 ${viewMode === 'contributors'
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'
                                    }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <TrendingUp className="mr-1 h-4 w-4" />
                                Contributors
                            </motion.button>

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
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ContributorsView: React.FC<{ searchQuery?: string }> = ({ searchQuery }) => {
    // Mapping object for contributors with their URLs - easy to copy-paste from CSV
    const contributorsData = {
        'The Athletic (Sam Vecenie)': 'https://theathletic.com/author/sam-vecenie/',
        'CBS Sports': 'https://www.cbssports.com/nba/draft/prospect-rankings/',
        '@KevinOConnorNBA (Yahoo)': 'https://twitter.com/KevinOConnorNBA',
        'The Ringer': 'https://nbadraft.theringer.com/',
        'Tankathon': 'https://www.tankathon.com/big_board',
        'NBADraft.net': 'https://www.nbadraft.net/ranking/bigboard/',
        'CraftedNBA': 'https://craftednba.com/draft/2025',
        '@KlineNBA (Fansided)': 'https://twitter.com/KlineNBA',
        'Swish Theory': 'https://theswishtheory.com/scouting-report/nba-draft/2025-nba-draft/',
        'No Ceilings': 'https://noceilingsnba.com/',
        'ESPN': 'https://www.espn.com/nba/draft',
        'Kevin Pelton (ESPN)': 'https://www.espn.co.uk/nba/story/_/id/44888875/nba-draft-2025-projecting-30-best-prospects',
        'Opta': 'https://theanalyst.com/articles/nba-draft-rankings-2025-big-board',
        'the center hub': 'https://the-center-hub.com/2025/06/19/2025-nba-draft-guide/',
        '@supersayansavin (TPM)': 'https://twitter.com/supersayansavin',
        '@CRiehl30': 'https://twitter.com/CRiehl30',
        '@JoelHinkieMaxey': 'https://twitter.com/JoelHinkieMaxey',
        '@draymottishaw': 'https://twitter.com/draymottishaw',
        '@ZP12Hoops': 'https://twitter.com/ZP12Hoops',
        '@kimonsjaer24': 'https://twitter.com/kimonsjaer24',
        '@Jackmatthewss_': 'https://twitter.com/Jackmatthewss_',
        '@rowankent': 'https://twitter.com/rowankent',
        '@CannibalSerb': 'https://twitter.com/CannibalSerb',
        'Jishnu': '',
        '@fra_sempru': 'https://twitter.com/fra_sempru',
        '@FPL_Mou': 'https://twitter.com/FPL_Mou',
        '@ryanhammer09': 'https://twitter.com/ryanhammer09',
        '@thezonemaster': 'https://twitter.com/thezonemaster',
        '@hutsonboggs': 'https://twitter.com/hutsonboggs',
        '@PAKA_FLOCKA': 'https://twitter.com/PAKA_FLOCKA',
        '@drew_cant_hoop': 'https://twitter.com/drew_cant_hoop',
        '@PenguinHoops': 'https://twitter.com/PenguinHoops',
        'PK': '',
        '@nore4dh': 'https://twitter.com/nore4dh',
        '@LeftFieldSoup': 'https://twitter.com/LeftFieldSoup',
        '@OranjeGuerrero': 'https://twitter.com/OranjeGuerrero',
        '@503sbest': 'https://twitter.com/503sbest',
        '@BrianJNBA': 'https://twitter.com/BrianJNBA',
        '@CediBetter': 'https://twitter.com/CediBetter',
        '@JEnnisNBADraft': 'https://twitter.com/JEnnisNBADraft',
        '@report_court': 'https://twitter.com/report_court',
        '@esotericloserr': 'https://twitter.com/esotericloserr',
        '@atthelevel': 'https://twitter.com/atthelevel',
        '@freewave3': 'https://twitter.com/freewave3',
        'Andrea Cannici': 'https://twitter.com/andrecannici',
        '@LoganH_utk': 'https://twitter.com/LoganH_utk',
        'JoshW': '',
        '@double_pg': 'https://twitter.com/double_pg',
        '@TaouTi959': 'https://twitter.com/TaouTi959',
        '@Alley_Oop_Coop': 'https://twitter.com/Alley_Oop_Coop',
        '@perspectivehoop': 'https://twitter.com/perspectivehoop',
        '@chipwilliamsjr': 'https://twitter.com/chipwilliamsjr',
        '@DraftCasual': 'https://twitter.com/DraftCasual',
        '@thebigwafe': 'https://twitter.com/thebigwafe',
        '@NPComplete34': 'https://twitter.com/NPComplete34',
        '@SPTSJUNKIE (NBA Draft Network)': 'https://twitter.com/SPTSJUNKIE',
        '@bjpf_': 'https://twitter.com/bjpf_',
        '@ram_dub': 'https://twitter.com/ram_dub',
        'ReverseEnigma (databallr)': 'https://bsky.app/profile/reverseenigma.bsky.social',
        '@OpticalHoops': 'https://twitter.com/OpticalHoops',
        '@Rileybushh': 'https://twitter.com/Rileybushh',
        '@jhirsh03': 'https://twitter.com/jhirsh03',
        '@who_____knows': 'https://twitter.com/who_____knows',
        '@GrizzliesFilm': 'https://twitter.com/GrizzliesFilm',
        '@Juul__Embiid': 'https://twitter.com/Juul__Embiid',
        '@redrock_bball': 'https://twitter.com/redrock_bball',
        '@matwnba': 'https://twitter.com/matwnba',
        '@SpencerVonNBA': 'https://twitter.com/SpencerVonNBA',
        'Jack Chambers': '',
        'NBA Draft Room': 'https://nbadraftroom.com/2025-nba-draft-big-board-10-0-final-edition/',
        '@LoganPAdams': 'https://twitter.com/LoganPAdams',
        '@bballstrategy': 'https://twitter.com/bballstrategy',
        '@movedmypivot': 'https://twitter.com/movedmypivot',
        '@drakemayefc': 'https://twitter.com/drakemayefc',
        '@Trellinterlude': 'https://twitter.com/Trellinterlude',
        '@TrashPanda': 'https://twitter.com/TrashPanda',
        '@Duydidt': 'https://twitter.com/Duydidt',
        '@Hoops_Haven1': 'https://twitter.com/Hoops_Haven1',
        'Isaiah Silas': 'https://twitter.com/ProspectReportt',
        '@codyreeves14': 'https://twitter.com/codyreeves14',
        '@nikoza2': 'https://twitter.com/nikoza2',
        '@zjy2000': 'https://twitter.com/zjy2000',
        '@Quinnfishburne': 'https://twitter.com/Quinnfishburne',
        '@antoniodias_pt': 'https://twitter.com/antoniodias_pt',
        '@cparkernba': 'https://twitter.com/cparkernba',
        '@ChuckingDarts': 'https://twitter.com/ChuckingDarts',
        '@ShoryLogan': 'https://twitter.com/ShoryLogan',
        '@Ethan387': 'https://twitter.com/Ethan387',
        '@IFIMINC': 'https://twitter.com/IFIMINC',
        '@TStapletonNBA': 'https://twitter.com/TStapletonNBA',
        '@WillC': 'https://twitter.com/WillC_NBA',
        '@mobanks10': 'https://twitter.com/mobanks10',
        '@RichStayman': 'https://twitter.com/RichStayman',
        '@_thedealzone': 'https://twitter.com/_thedealzone',
        '@_GatheringIntel': 'https://twitter.com/_GatheringIntel',
        '@DraftPow': 'https://twitter.com/DraftPow',
        '@Dkphisports': 'https://twitter.com/Dkphisports',
        '@NicThomasNBA': 'https://twitter.com/NicThomasNBA',
        'Giddf': '',
        '@BeyondTheRK': 'https://twitter.com/BeyondTheRK',
        '@greg23m': 'https://twitter.com/greg23m',
        'DrewDataDesign': '',
        'Kam H': '',
        '@dancingwithnoah': 'https://twitter.com/dancingwithnoah',
        'atheballhaus': 'https://twitter.com/theballhaus',
        'Oneiric': '',
        '@undraliu': 'https://twitter.com/undraliu',
        '@corbannba': 'https://twitter.com/corbannba',
        '@_LarroHoops': 'https://twitter.com/_LarroHoops',
        'salvador cali': '',
        '@LoganRoA_': 'https://twitter.com/LoganRoA_',
        '@sammygprops': 'https://twitter.com/sammygprops',
        '@wilkomcv': 'https://twitter.com/wilkomcv',
        '@wheatonbrando': 'https://twitter.com/wheatonbrando',
        '@Flawlesslikeeli': 'https://twitter.com/Flawlesslikeeli',
        '@_R_M_M': 'https://twitter.com/_R_M_M',
        '@mcfNBA': 'https://twitter.com/mcfNBA',
        '@evidenceforZ': 'https://twitter.com/evidenceforZ',
        '@sixringsofsteeI': 'https://twitter.com/sixringsofsteeI',
        '@CozyLito': 'https://twitter.com/CozyLito',
        '@HoopsMetrOx': 'https://twitter.com/HoopsMetrOx',
        '@SBNRicky': 'https://twitter.com/SBNRicky',
        '@redcooteay': 'https://twitter.com/redcooteay',
        '@jessefischer': 'https://twitter.com/jessefischer',
        '@henrynbadraft': 'https://twitter.com/henrynbadraft',
        '@spursbeliever': 'https://twitter.com/spursbeliever',
        'SMILODON': '',
        '@ayush_batra15': 'https://twitter.com/ayush_batra15',
        '@AmericanNumbers': 'https://twitter.com/AmericanNumbers',
        '@100guaranteed': 'https://twitter.com/100guaranteed',
        '@jaynay1': 'https://twitter.com/jaynay1',
        '@NileHoops': 'https://twitter.com/NileHoops',
        '@HuntHoops': 'https://twitter.com/HuntHoops',
        'Mike Gribanov': 'https://twitter.com/mikegrib8',
        '@bendog28': 'https://twitter.com/bendog28',
        '@JHM Basketball': 'https://twitter.com/JHMBasketball',
        '@halfwaketakes': 'https://twitter.com/halfwaketakes',
        '@criggsnba': 'https://twitter.com/criggsnba',
        '@NBADraftFuture': 'https://twitter.com/NBADraftFuture',
        '@JoeHulbertNBA': 'https://twitter.com/JoeHulbertNBA',
        '@CTFazio24': 'https://twitter.com/CTFazio24',
        '@JozhNBA': 'https://twitter.com/JozhNBA',
        '@hoop_tetris': 'https://twitter.com/hoop_tetris',
        '@tobibuehner': 'https://twitter.com/tobibuehner',
        '@Josh_markowitz': 'https://twitter.com/Josh_markowitz',
        '@onlyonepodcastt': 'https://twitter.com/onlyonepodcastt',
        '@akaCK_': 'https://twitter.com/akaCK_',
        '@TheNicolau15': 'https://twitter.com/TheNicolau15',
        '@British_Buzz': 'https://twitter.com/British_Buzz',
        '@hellyymarco': 'https://twitter.com/hellyymarco',
        '@SaucyTakez': 'https://twitter.com/SaucyTakez',
        '@j0nzzzz': 'https://twitter.com/j0nzzzz',
        '@JackDAnder': 'https://twitter.com/JackDAnder',
        '@nbadrafting': 'https://twitter.com/nbadrafting',
        'TheProcess': '',
        '@canpekerpekcan': 'https://twitter.com/canpekerpekcan',
        '@ByAnthonyRizzo': 'https://twitter.com/ByAnthonyRizzo',
        '@TwoWayMurray': 'https://twitter.com/TwoWayMurray'
    };

    let contributors = Object.keys(contributorsData);
    if (searchQuery) {
        const lower = searchQuery.toLowerCase();
        contributors = contributors.filter(c => c.toLowerCase().includes(lower));
    }

    return (
        <div className="max-w-6xl mx-auto px-4">
            <div className="bg-[#19191A] rounded-lg border border-gray-800 p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Consensus Contributors</h2>
                <div className="mt-8 pt-6 border-t border-gray-700/50">
                    <p className="text-gray-400 mb-5">
                        Total Contributors: <span className="text-white font-semibold">158</span>, Total Ranks: <span className="text-white font-semibold">8963</span>, Prospects Per Board <span className="text-white font-semibold">59.3</span>
                    </p>
                </div>
                <p className="text-gray-400 mb-8">
                    Our consensus board is compiled from rankings provided by the following analysts, scouts, and platforms:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {contributors.map((contributor, index) => (
                        <a
                            key={contributor}
                            href={contributorsData[contributor as keyof typeof contributorsData]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gray-800/20 border border-gray-700/50 rounded-lg p-4 hover:bg-gray-800/30 transition-colors duration-200 hover:border-blue-500/50 group"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                                    <span className="text-blue-400 font-semibold text-sm group-hover:text-blue-300">
                                        {index + 1}
                                    </span>
                                </div>
                                <span className="text-gray-300 font-medium group-hover:text-white transition-colors">
                                    {contributor}
                                </span>
                            </div>
                        </a>
                    ))}
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

    // Define column configuration with proper Player Information order
    const initialColumns: ColumnConfig[] = [
        // Player Information - Rank and Name are always visible
        { key: 'Rank', label: 'Rank', category: 'Player Information', visible: true, sortable: true },
        { key: 'Name', label: 'Name', category: 'Player Information', visible: true, sortable: true },
        { key: 'Role', label: 'Position', category: 'Player Information', visible: true, sortable: true },
        { key: 'League', label: 'League', category: 'Player Information', visible: true, sortable: true },
        { key: 'Pre-NBA', label: 'Pre-NBA', category: 'Player Information', visible: true, sortable: true },
        { key: 'Actual Pick', label: 'Draft Pick', category: 'Player Information', visible: true, sortable: true },
        { key: 'NBA Team', label: 'NBA Team', category: 'Player Information', visible: true, sortable: true },
        { key: 'Age', label: 'Age', category: 'Player Information', visible: true, sortable: true },
        { key: 'Height', label: 'Height', category: 'Player Information', visible: true, sortable: true },
        { key: 'Wingspan', label: 'Wingspan', category: 'Player Information', visible: true, sortable: true },
        { key: 'Wing - Height', label: 'Wing-Height', category: 'Player Information', visible: true, sortable: true },
        { key: 'Weight (lbs)', label: 'Weight', category: 'Player Information', visible: true, sortable: true },

        // Consensus Information
        { key: 'MEAN', label: 'Mean', category: 'Consensus Information', visible: false, sortable: true },
        { key: 'MEDIAN', label: 'Median', category: 'Consensus Information', visible: false, sortable: true },
        { key: 'MODE', label: 'Mode', category: 'Consensus Information', visible: false, sortable: true },
        { key: 'HIGH', label: 'High', category: 'Consensus Information', visible: false, sortable: true },
        { key: 'LOW', label: 'Low', category: 'Consensus Information', visible: false, sortable: true },
        { key: 'RANGE', label: 'Range', category: 'Consensus Information', visible: false, sortable: true },
        { key: 'STDEV', label: 'StDev', category: 'Consensus Information', visible: false, sortable: true },
        { key: 'COUNT', label: 'Count', category: 'Consensus Information', visible: false, sortable: true },
        { key: 'Inclusion Rate', label: 'Inclusion Rate', category: 'Consensus Information', visible: false, sortable: true },

        // Range Consensus Info
        { key: '1 - 3', label: 'Picks 1-3', category: 'Range Consensus Information', visible: false, sortable: true },
        { key: '4 - 14', label: 'Picks 4-14', category: 'Range Consensus Information', visible: false, sortable: true },
        { key: '15 - 30', label: 'Picks 15-30', category: 'Range Consensus Information', visible: false, sortable: true },
        { key: '31 - 59', label: 'Picks 31-59', category: 'Range Consensus Information', visible: false, sortable: true },
        { key: 'Undrafted', label: 'Undrafted', category: 'Range Consensus Information', visible: false, sortable: true },
    ];

    useEffect(() => {
        document.title = 'Consensus NBA Draft Board';
    }, []);


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
                const response = await fetch('/2025 Draft Twitter Consensus Big Board.csv');
                const csvText = await response.text();

                Papa.parse(csvText, {
                    header: true,
                    complete: (results) => {
                        const prospectData = results.data as DraftProspect[];
                        setProspects(prospectData);
                        setFilteredProspects(prospectData);

                        const consensusMap: Record<string, ConsensusColumns> = {};

                        // Interface for raw CSV row data
                        interface CSVRow {
                            Name: string;
                            [key: string]: string | number;
                        }

                        // Helper function to safely convert CSV values to numbers
                        const safeParseInt = (value: string | number): number => {
                            if (typeof value === 'number') return value;
                            if (typeof value === 'string') return parseInt(value) || 0;
                            return 0;
                        };

                        for (const row of results.data as CSVRow[]) {
                            if (!row.Name) continue;
                            const consensus: ConsensusColumns = {
                                Name: row.Name,
                                'The Athletic (Sam Vecenie)': safeParseInt(row['The Athletic (Sam Vecenie)']),
                                'CBS Sports': safeParseInt(row['CBS Sports']),
                                '@KevinOConnorNBA (Yahoo)': safeParseInt(row['@KevinOConnorNBA (Yahoo)']),
                                'The Ringer': safeParseInt(row['The Ringer']),
                                'Tankathon': safeParseInt(row['Tankathon']),
                                'NBADraft.net': safeParseInt(row['NBADraft.net']),
                                'ESPN': safeParseInt(row['ESPN']),
                                'No Ceilings': safeParseInt(row['No Ceilings']),
                                'CraftedNBA': safeParseInt(row['CraftedNBA']),
                                '@KlineNBA (Fansided)': safeParseInt(row['@KlineNBA (Fansided)']),
                                'Swish Theory': safeParseInt(row['Swish Theory']),
                                'Kevin Pelton (ESPN)': safeParseInt(row['Kevin Pelton (ESPN)']),
                                'Opta': safeParseInt(row['Opta']),
                                'the center hub': safeParseInt(row['the center hub']),
                                '@supersayansavin (TPM)': safeParseInt(row['@supersayansavin (TPM)']),
                                '@CRiehl30': safeParseInt(row['@CRiehl30']),
                                '@JoelHinkieMaxey': safeParseInt(row['@JoelHinkieMaxey']),
                                '@draymottishaw': safeParseInt(row['@draymottishaw']),
                                '@ZP12Hoops': safeParseInt(row['@ZP12Hoops']),
                                '@kimonsjaer24': safeParseInt(row['@kimonsjaer24']),
                                '@Jackmatthewss_': safeParseInt(row['@Jackmatthewss_']),
                                '@rowankent': safeParseInt(row['@rowankent']),
                                '@CannibalSerb': safeParseInt(row['@CannibalSerb']),
                                'Jishnu': safeParseInt(row['Jishnu']),
                                '@fra_sempru': safeParseInt(row['@fra_sempru']),
                                '@FPL_Mou': safeParseInt(row['@FPL_Mou']),
                                'RyanHammer09': safeParseInt(row['RyanHammer09']),
                                '@thezonemaster': safeParseInt(row['@thezonemaster']),
                                '@hutsonboggs': safeParseInt(row['@hutsonboggs']),
                                '@PAKA_FLOCKA': safeParseInt(row['@PAKA_FLOCKA']),
                                '@drew_cant_hoop': safeParseInt(row['@drew_cant_hoop']),
                                '@PenguinHoops': safeParseInt(row['@PenguinHoops']),
                                'PK': safeParseInt(row['PK']),
                                '@nore4dh': safeParseInt(row['@nore4dh']),
                                '@LeftFieldSoup': safeParseInt(row['@LeftFieldSoup']),
                                '@OranjeGuerrero': safeParseInt(row['@OranjeGuerrero']),
                                '@503sbest': safeParseInt(row['@503sbest']),
                                '@BrianJNBA': safeParseInt(row['@BrianJNBA']),
                                '@CediBetter': safeParseInt(row['@CediBetter']),
                                '@JEnnisNBADraft': safeParseInt(row['@JEnnisNBADraft']),
                                '@report_court': safeParseInt(row['@report_court']),
                                '@esotericloserr': safeParseInt(row['@esotericloserr']),
                                '@atthelevel': safeParseInt(row['@atthelevel']),
                                '@freewave3': safeParseInt(row['@freewave3']),
                                'Andrea Cannici': safeParseInt(row['Andrea Cannici']),
                                '@LoganH_utk': safeParseInt(row['@LoganH_utk']),
                                'JoshW': safeParseInt(row['JoshW']),
                                '@double_pg': safeParseInt(row['@double_pg']),
                                '@TaouTi959': safeParseInt(row['@TaouTi959']),
                                '@Alley_Oop_Coop': safeParseInt(row['@Alley_Oop_Coop']),
                                '@perspectivehoop': safeParseInt(row['@perspectivehoop']),
                                '@chipwilliamsjr': safeParseInt(row['@chipwilliamsjr']),
                                '@DraftCasual': safeParseInt(row['@DraftCasual']),
                                '@thebigwafe': safeParseInt(row['@thebigwafe']),
                                '@NPComplete34': safeParseInt(row['@NPComplete34']),
                                '@SPTSJUNKIE (NBA Draft Network)': safeParseInt(row['@SPTSJUNKIE (NBA Draft Network)']),
                                '@bjpf_': safeParseInt(row['@bjpf_']),
                                '@ram_dub': safeParseInt(row['@ram_dub']),
                                'ReverseEnigma (databallr)': safeParseInt(row['ReverseEnigma (databallr)']),
                                '@OpticalHoops': safeParseInt(row['@OpticalHoops']),
                                '@Rileybushh': safeParseInt(row['@Rileybushh']),
                                '@jhirsh03': safeParseInt(row['@jhirsh03']),
                                '@who_____knows': safeParseInt(row['@who_____knows']),
                                '@GrizzliesFilm': safeParseInt(row['@GrizzliesFilm']),
                                '@Juul__Embiid': safeParseInt(row['@Juul__Embiid']),
                                '@redrock_bball': safeParseInt(row['@redrock_bball']),
                                '@matwnba': safeParseInt(row['@matwnba']),
                                '@SpencerVonNBA': safeParseInt(row['@SpencerVonNBA']),
                                'Jack Chambers': safeParseInt(row['Jack Chambers']),
                                'NBA Draft Room': safeParseInt(row['NBA Draft Room']),
                                '@LoganPAdams': safeParseInt(row['@LoganPAdams']),
                                '@bballstrategy': safeParseInt(row['@bballstrategy']),
                                '@movedmypivot': safeParseInt(row['@movedmypivot']),
                                '@drakemayefc': safeParseInt(row['@drakemayefc']),
                                '@Trellinterlude': safeParseInt(row['@Trellinterlude']),
                                '@TrashPanda': safeParseInt(row['@TrashPanda']),
                                '@Duydidt': safeParseInt(row['@Duydidt']),
                                '@Hoops_Haven1': safeParseInt(row['@Hoops_Haven1']),
                                'Isaiah Silas': safeParseInt(row['Isaiah Silas']),
                                '@codyreeves14': safeParseInt(row['@codyreeves14']),
                                '@nikoza2': safeParseInt(row['@nikoza2']),
                                '@zjy2000': safeParseInt(row['@zjy2000']),
                                '@Quinnfishburne': safeParseInt(row['@Quinnfishburne']),
                                '@antoniodias_pt': safeParseInt(row['@antoniodias_pt']),
                                '@cparkernba': safeParseInt(row['@cparkernba']),
                                '@ChuckingDarts': safeParseInt(row['@ChuckingDarts']),
                                '@ShoryLogan': safeParseInt(row['@ShoryLogan']),
                                '@Ethan387': safeParseInt(row['@Ethan387']),
                                '@IFIMINC': safeParseInt(row['@IFIMINC']),
                                '@TStapletonNBA': safeParseInt(row['@TStapletonNBA']),
                                '@WillC': safeParseInt(row['@WillC']),
                                '@mobanks10': safeParseInt(row['@mobanks10']),
                                '@RichStayman': safeParseInt(row['@RichStayman']),
                                '@_thedealzone': safeParseInt(row['@_thedealzone']),
                                '@_GatheringIntel': safeParseInt(row['@_GatheringIntel']),
                                '@DraftPow': safeParseInt(row['@DraftPow']),
                                '@Dkphisports': safeParseInt(row['@Dkphisports']),
                                '@NicThomasNBA': safeParseInt(row['@NicThomasNBA']),
                                'Giddf': safeParseInt(row['Giddf']),
                                '@BeyondTheRK': safeParseInt(row['@BeyondTheRK']),
                                '@greg23m': safeParseInt(row['@greg23m']),
                                'DrewDataDesign': safeParseInt(row['DrewDataDesign']),
                                'Kam H': safeParseInt(row['Kam H']),
                                '@dancingwithnoah': safeParseInt(row['@dancingwithnoah']),
                                'theballhaus': safeParseInt(row['theballhaus']),
                                'Oneiric': safeParseInt(row['Oneiric']),
                                '@undraliu': safeParseInt(row['@undraliu']),
                                '@corbannba': safeParseInt(row['@corbannba']),
                                '@_LarroHoops': safeParseInt(row['@_LarroHoops']),
                                'salvador cali': safeParseInt(row['salvador cali']),
                                '@LoganRoA_': safeParseInt(row['@LoganRoA_']),
                                '@sammygprops': safeParseInt(row['@sammygprops']),
                                '@wilkomcv': safeParseInt(row['@wilkomcv']),
                                '@wheatonbrando': safeParseInt(row['@wheatonbrando']),
                                '@Flawlesslikeeli': safeParseInt(row['@Flawlesslikeeli']),
                                '@_R_M_M': safeParseInt(row['@_R_M_M']),
                                '@mcfNBA': safeParseInt(row['@mcfNBA']),
                                '@evidenceforZ': safeParseInt(row['@evidenceforZ']),
                                '@sixringsofsteeI': safeParseInt(row['@sixringsofsteeI']),
                                '@CozyLito': safeParseInt(row['@CozyLito']),
                                '@HoopsMetrOx': safeParseInt(row['@HoopsMetrOx']),
                                '@SBNRicky': safeParseInt(row['@SBNRicky']),
                                '@redcooteay': safeParseInt(row['@redcooteay']),
                                '@jessefischer': safeParseInt(row['@jessefischer']),
                                '@henrynbadraft': safeParseInt(row['@henrynbadraft']),
                                '@spursbeliever': safeParseInt(row['@spursbeliever']),
                                'SMILODON': safeParseInt(row['SMILODON']),
                                '@ayush_batra15': safeParseInt(row['@ayush_batra15']),
                                '@AmericanNumbers': safeParseInt(row['@AmericanNumbers']),
                                '@100guaranteed': safeParseInt(row['@100guaranteed']),
                                '@jaynay1': safeParseInt(row['@jaynay1']),
                                '@NileHoops': safeParseInt(row['@NileHoops']),
                                '@HuntHoops': safeParseInt(row['@HuntHoops']),
                                'Mike Gribanov': safeParseInt(row['Mike Gribanov']),
                                '@bendog28': safeParseInt(row['@bendog28']),
                                '@JHM Basketball': safeParseInt(row['@JHM Basketball']),
                                '@halfwaketakes': safeParseInt(row['@halfwaketakes']),
                                '@criggsnba': safeParseInt(row['@criggsnba']),
                                '@NBADraftFuture': safeParseInt(row['@NBADraftFuture']),
                                '@JoeHulbertNBA': safeParseInt(row['@JoeHulbertNBA']),
                                '@CTFazio24': safeParseInt(row['@CTFazio24']),
                                '@JozhNBA': safeParseInt(row['@JozhNBA']),
                                '@hoop_tetris': safeParseInt(row['@hoop_tetris']),
                                '@tobibuehner': safeParseInt(row['@tobibuehner']),
                                '@Josh_markowitz': safeParseInt(row['@Josh_markowitz']),
                                '@onlyonepodcastt': safeParseInt(row['@onlyonepodcastt']),
                                '@akaCK_': safeParseInt(row['@akaCK_']),
                                '@TheNicolau15': safeParseInt(row['@TheNicolau15']),
                                '@British_Buzz': safeParseInt(row['@British_Buzz']),
                                '@hellyymarco': safeParseInt(row['@hellyymarco']),
                                '@SaucyTakez': safeParseInt(row['@SaucyTakez']),
                                '@j0nzzzz': safeParseInt(row['@j0nzzzz']),
                                '@JackDAnder': safeParseInt(row['@JackDAnder']),
                                '@nbadrafting': safeParseInt(row['@nbadrafting']),
                                'TheProcess': safeParseInt(row['TheProcess']),
                                '@canpekerpekcan': safeParseInt(row['@canpekerpekcan']),
                                '@ByAnthonyRizzo': safeParseInt(row['@ByAnthonyRizzo']),
                                '@TwoWayMurray': safeParseInt(row['@TwoWayMurray'])
                            };
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
    }, []);

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

    // Custom cell renderer for consensus-specific columns
    const customCellRenderer = (prospect: DraftProspect, column: ColumnConfig) => {
        // Handle range consensus columns (display as percentages)
        const rangeConsensusKeys = ['1 - 3', '4 - 14', '15 - 30', '31 - 59', 'Undrafted'] as const;
        type RangeConsensusKey = typeof rangeConsensusKeys[number];

        if (rangeConsensusKeys.includes(column.key as RangeConsensusKey)) {
            const value = prospect[column.key as RangeConsensusKey];
            return value ? `${Math.round(Number(value) * 100)}%` : '0%';
        }
        if (column.key === 'Inclusion Rate') {
            const inclusionRate = prospect['Inclusion Rate'];
            return inclusionRate ? `${Math.round(Number(inclusionRate) * 100)}%` : '0%';
        }

        // Default handling - let ProspectTable handle it
        return null;
    };

    return (
        <div className="min-h-screen bg-[#19191A]">
            <NavigationHeader activeTab="Consensus" />
            <DraftPageHeader author="Consensus" />
            <GoogleAnalytics gaId="G-X22HKJ13B7" />
            {viewMode !== 'contributors' ? (
                <ProspectFilter
                    prospects={prospects}
                    onFilteredProspectsChange={setFilteredProspects}
                    onRankingSystemChange={setRankingSystem}
                    rank={{}}
                    onViewModeChange={setViewMode}
                />
            ) : (
                <div className="sticky top-14 z-30 bg-[#19191A] border-b border-gray-800 max-w-6xl mx-auto">
                    <div className="px-4 py-3 flex items-center justify-between">
                        <div className="relative flex-grow max-w-full mr-2">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                type="text"
                                placeholder="Search Contributors"
                                value={contributorSearch}
                                onChange={(e) => setContributorSearch(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full bg-gray-800/20 border-gray-800 text-gray-300 placeholder-gray-500 rounded-lg focus:border-blue-500/30 focus:ring-1 focus:ring-blue-500/30"
                            />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <motion.button
                                    className={`
                                        px-3 py-2 rounded-lg text-sm font-medium flex items-center
                                        transition-all duration-300
                                        bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700
                                    `}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <TrendingUp className="mr-1 h-4 w-4" />
                                    Contributors
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
                                        Contributors
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto px-4 pt-8">
                {viewMode === 'contributors' ? (
                    <ContributorsView searchQuery={contributorSearch} />
                ) : filteredProspects.length > 0 ? (
                    viewMode === 'card' ? (
                        <div className="space-y-4">
                            {filteredProspects.slice(0, isMobile ? filteredProspects.length : loadedProspects).map((prospect) => (
                                <ConsensusPageProspectCard
                                    key={prospect.Name}
                                    prospect={prospect}
                                    filteredProspects={filteredProspects}
                                    allProspects={prospects}
                                    selectedSortKey={selectedSortKey}
                                    selectedYear={0}
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
                            prospects={prospects.map(p => ({ ...p, Tier: (p as { Tier?: string; }).Tier ?? '' }))}
                            rankingSystem={rankingSystem}
                            initialColumns={initialColumns}
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