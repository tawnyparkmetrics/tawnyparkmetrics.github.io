"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, ChevronDown, SlidersHorizontal, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import Papa from 'papaparse';
import NavigationHeader from '@/components/NavigationHeader';
import DraftPageHeader from '@/components/DraftPageHeader';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';


interface CombinePlayer {
    //Player Information
    'Player': string;
    'Pre-NBA': string;
    'Draft Year': string;
    'Primary Position': string;
    'Is Primary': number;
    'Combine Position': string;
    'Default Position': string;

    //Measurements
    'Height w/o Shoes': string;
    'Height (in.)': number;
    'Weight (lbs)': number;
    'Wingspan': string;
    'Wingspan (in.)': number;
    'Standing Reach': string;
    'Standing Reach (in.)': number;
    'Hand Length (in.)': number;
    'Hand Width (in.)': number;

    'Standing Vertical': number;
    'Max Vertical': number;

    'Lane Agility Time': number;
    'Shuttle Run': number;
    'Three Quarter Sprint': number;

    //Percentiles
    'Height (in.)_Percentile': number;
    'Weight (lbs)_Percentile': number;
    'Wingspan (in.)_Percentile': number;
    'Standing Reach (in.)_Percentile': number;
    'Hand Length (in.)_Percentile': number;
    'Hand Width (in.)_Percentile': number;

    'Standing Vertical_Percentile': number;
    'Max Vertical_Percentile': number;

    'Lane Agility Time_Percentile': number;
    'Shuttle Run_Percentile': number;
    'Three Quarter Sprint_Percentile': number;

    //Scores
    'Physical Score': number;
    'Agility Score': number;
    'Vertical Score': number;
    'Raw Score': number;
    'Combine Score': number;
    [key: string]: any;
}

const PlayerComparison = ({ player, allData }: { player: CombinePlayer; allData: CombinePlayer[] }) => {
    const getTieredColor = (percentile: number | null | undefined): string => {
        if (percentile === null || percentile === undefined) return 'transparent';
        const score = Math.max(0, Math.min(100, percentile));
        if (score >= 60) return '#79e0ff';
        else if (score >= 40) return '#ffbc49';
        else return '#ff5757';
    };

    // Calculate position averages across all years
    const positionAverages = React.useMemo(() => {
        const position = player['Default Position'];
        const positionPlayers = allData.filter(p =>
            p['Default Position'] === position &&
            p['Is Primary'] === 1
        );

        const calculateAverage = (key: string) => {
            const values = positionPlayers
                .map(p => p[key])
                .filter(v => v !== null && v !== undefined && !isNaN(v));
            if (values.length === 0) return null;
            return values.reduce((sum, v) => sum + v, 0) / values.length;
        };

        return {
            'Physical Score': calculateAverage('Physical Score'),
            'Agility Score': calculateAverage('Agility Score'),
            'Vertical Score': calculateAverage('Vertical Score'),
            'Combine Score': calculateAverage('Combine Score'),
            'Height (in.)_Percentile': calculateAverage('Height (in.)_Percentile'),
            'Wingspan (in.)_Percentile': calculateAverage('Wingspan (in.)_Percentile'),
            'Standing Reach (in.)_Percentile': calculateAverage('Standing Reach (in.)_Percentile'),
            'Weight (lbs)_Percentile': calculateAverage('Weight (lbs)_Percentile'),
            'Hand Length (in.)_Percentile': calculateAverage('Hand Length (in.)_Percentile'),
            'Hand Width (in.)_Percentile': calculateAverage('Hand Width (in.)_Percentile'),
            'Max Vertical_Percentile': calculateAverage('Max Vertical_Percentile'),
            'Standing Vertical_Percentile': calculateAverage('Standing Vertical_Percentile'),
            'Lane Agility Time_Percentile': calculateAverage('Lane Agility Time_Percentile'),
            'Three Quarter Sprint_Percentile': calculateAverage('Three Quarter Sprint_Percentile'),
            'Shuttle Run_Percentile': calculateAverage('Shuttle Run_Percentile'),
        };
    }, [player, allData]);

    const compositeScores = [
        { name: 'Physical', playerKey: 'Physical Score', avgKey: 'Physical Score' },
        { name: 'Agility', playerKey: 'Agility Score', avgKey: 'Agility Score' },
        { name: 'Vertical', playerKey: 'Vertical Score', avgKey: 'Vertical Score' },
        { name: 'Combine', playerKey: 'Combine Score', avgKey: 'Combine Score' },
    ];

    const anthropometricAttrs = [
        { name: 'Height', key: 'Height (in.)_Percentile' },
        { name: 'Wingspan', key: 'Wingspan (in.)_Percentile' },
        { name: 'Reach', key: 'Standing Reach (in.)_Percentile' },
        { name: 'Weight', key: 'Weight (lbs)_Percentile' },
        { name: 'Hand Length', key: 'Hand Length (in.)_Percentile' },
        { name: 'Hand Width', key: 'Hand Width (in.)_Percentile' },
    ];

    const athleticAttrs = [
        { name: 'Max Vert', key: 'Max Vertical_Percentile' },
        { name: 'Standing Vert', key: 'Standing Vertical_Percentile' },
        { name: 'Lane Agility', key: 'Lane Agility Time_Percentile' },
        { name: '3/4 Sprint', key: 'Three Quarter Sprint_Percentile' },
        { name: 'Shuttle', key: 'Shuttle Run_Percentile' },
    ];

    // Spider chart helper function
    const getSpiderPoints = (attributes: { name: string; key: string }[]) => {
        const centerX = 150;
        const centerY = 150;
        const maxRadius = 120;
        const angleStep = (2 * Math.PI) / attributes.length;

        return attributes.map((attr, i) => {
            const angle = -Math.PI / 2 + i * angleStep;
            const value = player[attr.key] ?? 0;
            const radius = (value / 100) * maxRadius;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            return { x, y, angle, value };
        });
    };

    const getSpiderGridLines = (numAttributes: number) => {
        const centerX = 150;
        const centerY = 150;
        const maxRadius = 120;
        const angleStep = (2 * Math.PI) / numAttributes;
        const levels = [20, 40, 60, 80, 100];

        return levels.map(level => {
            const radius = (level / 100) * maxRadius;
            const points = Array.from({ length: numAttributes }, (_, i) => {
                const angle = -Math.PI / 2 + i * angleStep;
                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);
                return `${x},${y}`;
            }).join(' ');
            return { points, level, radius };
        });
    };

    const getAxisLines = (numAttributes: number) => {
        const centerX = 150;
        const centerY = 150;
        const maxRadius = 120;
        const angleStep = (2 * Math.PI) / numAttributes;

        return Array.from({ length: numAttributes }, (_, i) => {
            const angle = -Math.PI / 2 + i * angleStep;
            const x = centerX + maxRadius * Math.cos(angle);
            const y = centerY + maxRadius * Math.sin(angle);
            return { x1: centerX, y1: centerY, x2: x, y2: y };
        });
    };

    const getSpiderPolygonPath = (attributes: { name: string; key: string }[]) => {
        const points = getSpiderPoints(attributes);
        return points.map(p => `${p.x},${p.y}`).join(' ');
    };

    const getLabelPosition = (index: number, total: number) => {
        const centerX = 150;
        const centerY = 150;
        const labelRadius = 140;
        const angleStep = (2 * Math.PI) / total;
        const angle = -Math.PI / 2 + index * angleStep;
        const x = centerX + labelRadius * Math.cos(angle);
        const y = centerY + labelRadius * Math.sin(angle);
        return { x, y };
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
                {/* Bar Chart - Left */}
                <div className="bg-[#19191A] p-4 rounded-lg border border-gray-800">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3 text-center">
                        {player.Player} ({player['Default Position']}) vs Average {player['Default Position']}
                    </h4>
                    <div className="flex items-end justify-center gap-4 h-40">
                        <div className="flex items-end gap-4">
                            {compositeScores.map((score) => {
                                const playerValue = player[score.playerKey as keyof typeof player] ?? 0;
                                const avgValue = positionAverages[score.avgKey as keyof typeof positionAverages] ?? 0;
                                return (
                                    <div key={score.name} className="flex flex-col items-center gap-2 w-14">
                                        <div className="flex items-end gap-2 w-full justify-center" style={{ height: '128px' }}>
                                            {/* Player Bar */}
                                            <div className="flex flex-col items-center gap-1 w-5">
                                                <span className="text-xs font-semibold text-white" style={{ minHeight: '16px' }}>
                                                    {playerValue.toFixed(0)}
                                                </span>
                                                <div
                                                    className="w-full rounded-t transition-all duration-500"
                                                    style={{
                                                        height: `${(playerValue / 100) * 112}px`,
                                                        backgroundColor: getTieredColor(playerValue),
                                                        minHeight: '3px'
                                                    }}
                                                />
                                            </div>
                                            {/* Average Bar */}
                                            <div className="flex flex-col items-center gap-1 w-5">
                                                <span className="text-xs font-semibold text-gray-400" style={{ minHeight: '16px' }}>
                                                    {avgValue.toFixed(0)}
                                                </span>
                                                <div
                                                    className="w-full rounded-t transition-all duration-500"
                                                    style={{
                                                        height: `${(avgValue / 100) * 112}px`,
                                                        backgroundColor: '#4b5563',
                                                        minHeight: '3px'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="text-xs font-medium text-gray-300 text-center">{score.name}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-3">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: getTieredColor(50) }} />
                            <span className="text-xs text-gray-400">Player</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-gray-600" />
                            <span className="text-xs text-gray-400">Pos Avg</span>
                        </div>
                    </div>
                </div>

                {/* Anthropometric Spider Chart - Middle */}
                <div className="bg-[#19191A] p-4 rounded-lg border border-gray-800">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3 text-center">Anthropometric Data</h4>
                    <svg viewBox="0 0 300 300" className="w-full h-56">
                        {getSpiderGridLines(anthropometricAttrs.length).map((grid, i) => (
                            <polygon
                                key={i}
                                points={grid.points}
                                fill="none"
                                stroke="#374151"
                                strokeWidth="1"
                                opacity="0.3"
                            />
                        ))}

                        {getAxisLines(anthropometricAttrs.length).map((line, i) => (
                            <line
                                key={i}
                                x1={line.x1}
                                y1={line.y1}
                                x2={line.x2}
                                y2={line.y2}
                                stroke="#374151"
                                strokeWidth="1"
                                opacity="0.5"
                            />
                        ))}

                        <polygon
                            points={getSpiderPolygonPath(anthropometricAttrs)}
                            fill={getTieredColor(player['Physical Score'])}
                            fillOpacity="0.3"
                            stroke={getTieredColor(player['Physical Score'])}
                            strokeWidth="2"
                        />

                        {getSpiderPoints(anthropometricAttrs).map((point, i) => (
                            <circle
                                key={i}
                                cx={point.x}
                                cy={point.y}
                                r="3"
                                fill={getTieredColor(point.value)}
                                stroke="#19191A"
                                strokeWidth="2"
                            />
                        ))}

                        {anthropometricAttrs.map((attr, i) => {
                            const pos = getLabelPosition(i, anthropometricAttrs.length);
                            return (
                                <text
                                    key={i}
                                    x={pos.x}
                                    y={pos.y}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    className="text-xs fill-gray-300 font-medium"
                                >
                                    {attr.name}
                                </text>
                            );
                        })}
                    </svg>
                </div>

                {/* Athletic Testing Spider Chart - Right */}
                <div className="bg-[#19191A] p-4 rounded-lg border border-gray-800">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3 text-center">Athletic Testing Data</h4>
                    <svg viewBox="0 0 300 300" className="w-full h-56">
                        {getSpiderGridLines(athleticAttrs.length).map((grid, i) => (
                            <polygon
                                key={i}
                                points={grid.points}
                                fill="none"
                                stroke="#374151"
                                strokeWidth="1"
                                opacity="0.3"
                            />
                        ))}

                        {getAxisLines(athleticAttrs.length).map((line, i) => (
                            <line
                                key={i}
                                x1={line.x1}
                                y1={line.y1}
                                x2={line.x2}
                                y2={line.y2}
                                stroke="#374151"
                                strokeWidth="1"
                                opacity="0.5"
                            />
                        ))}

                        <polygon
                            points={getSpiderPolygonPath(athleticAttrs)}
                            fill={getTieredColor(player['Agility Score'])}
                            fillOpacity="0.3"
                            stroke={getTieredColor(player['Agility Score'])}
                            strokeWidth="2"
                        />

                        {getSpiderPoints(athleticAttrs).map((point, i) => (
                            <circle
                                key={i}
                                cx={point.x}
                                cy={point.y}
                                r="3"
                                fill={getTieredColor(point.value)}
                                stroke="#19191A"
                                strokeWidth="2"
                            />
                        ))}

                        {athleticAttrs.map((attr, i) => {
                            const pos = getLabelPosition(i, athleticAttrs.length);
                            return (
                                <text
                                    key={i}
                                    x={pos.x}
                                    y={pos.y}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    className="text-xs fill-gray-300 font-medium"
                                >
                                    {attr.name}
                                </text>
                            );
                        })}
                    </svg>
                </div>
            </div>
        </div>
    );
};

const PlayerModal = ({ player, onClose }: { player: CombinePlayer | null; onClose: () => void }) => {
    if (!player) return null;

    const [activeStreaks, setActiveStreaks] = React.useState<{ [key: number]: string }>({});
    const contentRef = React.useRef<HTMLDivElement>(null);


    // Randomly trigger streaks on different boxes and edges
    React.useEffect(() => {
        const triggerRandomStreak = () => {
            const boxIndex = Math.floor(Math.random() * 4) + 1; // 1-4
            const edges = ['top', 'right', 'bottom', 'left'];
            const randomEdge = edges[Math.floor(Math.random() * edges.length)];

            setActiveStreaks(prev => ({ ...prev, [boxIndex]: randomEdge }));

            // Remove the streak after 2 seconds
            setTimeout(() => {
                setActiveStreaks(prev => {
                    const newStreaks = { ...prev };
                    delete newStreaks[boxIndex];
                    return newStreaks;
                });
            }, 2000);
        };

        // Trigger first streak immediately
        triggerRandomStreak();

        // Then trigger a new streak every 3-5 seconds randomly
        const interval = setInterval(() => {
            triggerRandomStreak();
        }, Math.random() * 2000 + 3000); // Random between 3-5 seconds

        return () => clearInterval(interval);
    }, []);

    const handleDownload = async () => {
        const content = contentRef.current;
        if (!content) return;

        try {
            // Capture the content as a canvas
            const canvas = await html2canvas(content, {
                scale: 2, // Higher quality
                useCORS: true,
                logging: false,
                backgroundColor: '#19191A'
            });

            // Calculate PDF dimensions
            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Create PDF
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

            // Generate filename: "Player (Position) Combine Score.pdf"
            const position = player['Default Position'];
            const filename = `${player.Player} (${position}) Combine Score.pdf`;

            pdf.save(filename);
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    // The new diverging color scheme function: Red <-> Gray <-> Blue
    const getTieredColor = (percentile: number | null | undefined): string => {
        // 1. Handle Null/Undefined/N/A Data
        if (percentile === null || percentile === undefined) {
            // Return transparent color for missing data, similar to your original logic.
            return 'hsla(0, 0%, 38%, 0)';
        }

        // 2. Clamp the Percentile
        const score = Math.max(0, Math.min(100, percentile));

        // 3. Define the Color Tiers (No Gradient)

        // Tier 1: High Score (score >= 60)
        if (score >= 60) {
            return '#79e0ff'; // Cyan
        }

        // Tier 2: Mid Score (40 <= score < 60)
        else if (score >= 40) {
            return '#ffbc49'; // Orange
        }

        // Tier 3: Low Score (score < 40)
        else {
            // Using your suggested red: #ff5757
            return '#ff5757'; // Red
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-[#19191A] rounded-lg max-w-xl w-full max-h-[95vh] overflow-y-auto"
                style={{ border: '0.5px solid white' }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-[#19191A] transition-colors z-20"
                    aria-label="Close"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <button
                    onClick={handleDownload}
                    className="absolute top-16 right-4 text-white p-2 rounded-full hover:bg-[#19191A] transition-colors z-20"
                    aria-label="Download content"
                    title="Download"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                </button>

                {/* Header (No change) */}
                <div className="bg-[#19191A] p-2 relative">
                    <div className="flex items-center gap-5 px-4">
                        {/* Left: College Logo */}
                        <div className="h-24 w-24 rounded flex items-center justify-center flex-shrink-0">
                            <img
                                // FIX: If Pre-NBA is falsy (null, undefined, "") OR is "N/A", use 'na' as a placeholder filename.
                                // Otherwise, use the lowercase Pre-NBA value.
                                src={`/prenba_logos/${(player['Pre-NBA'] === null ||
                                    player['Pre-NBA'] === undefined ||
                                    player['Pre-NBA'] === '' ||
                                    player['Pre-NBA'].toUpperCase() === 'N/A')
                                    ? 'na'
                                    : player['Pre-NBA'].toLowerCase()
                                    }.png`}

                                // Use 'N/A' for the alt text if the data is missing/invalid
                                alt={`${(player['Pre-NBA'] === null || player['Pre-NBA'] === undefined || player['Pre-NBA'] === '') ? 'N/A' : player['Pre-NBA']} logo`}

                                className="h-20 w-20 object-contain"

                                // Optional: Fallback if the 'na.png' or any other logo file is missing
                                onError={(e) => {
                                    (e.target as HTMLImageElement).onerror = null;
                                    (e.target as HTMLImageElement).style.display = 'none'; // Hide the broken image icon
                                    const parent = (e.target as HTMLImageElement).parentElement;
                                    if (parent) {
                                        // Show the 'N/A' text if the original data was invalid, or the original text otherwise
                                        const fallbackText = (player['Pre-NBA'] === null || player['Pre-NBA'] === undefined || player['Pre-NBA'] === '' || player['Pre-NBA'].toUpperCase() === 'N/A') ? 'N/A' : player['Pre-NBA'];
                                        parent.innerHTML = `<span class="text-xs font-bold text-gray-300 p-1 text-center">${fallbackText}</span>`;
                                    }
                                }}
                            />
                        </div>

                        {/* Center: Player Name and Details */}
                        <div className="flex-1 text-center min-w-0 px-4 pt-3">
                            <h2 className="text-3xl font-bold text-white mb-2 tracking-wide font-barlow">
                                {player.Player.toUpperCase()}
                            </h2>
                            <div className="text-base text-sm text-gray-300 font-medium flex items-center justify-center">
                                <span>{player['Pre-NBA'] || 'N/A'}</span>
                                <div className="mx-3 h-4 w-px bg-gray-500"></div>
                                <span className="font-semibold">{player['Default Position']}</span>
                                <div className="mx-3 h-4 w-px bg-gray-500"></div>
                                <span>{player['Draft Year']} NBA Draft</span>
                            </div>
                        </div>

                        {/* Right: TPM Logo */}
                        <div className="h-24 w-24 flex items-center justify-center flex-shrink-0">
                            <img
                                src="/TPM_logo_designs/TPM Square (Dark with Map).png"
                                alt="TPM Logo"
                                className="h-20 w-20 object-contain"
                            />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-1 px-6">
                    {/* Component Scores - Now using diverging color */}
                    <div className="pb-2 mb-1">

                        {/* New Wrapper to control width and centering */}
                        <div className="max-w-[225px] mx-auto">

                            {/* Score Text Row (now centered within max-w-md) */}
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold tracking-wider text-white">
                                    Combine Score
                                </span>
                                <span className="text-white text-xs font-semibold">
                                    {player['Combine Score'] ? player['Combine Score'].toFixed(1) : 'N/A'}
                                </span>
                            </div>

                            {/* Progress Bar (now centered within max-w-md) */}
                            <div className="relative h-1 bg-gray-800/30 rounded-full overflow-hidden">
                                <div
                                    style={{
                                        width: `${player['Combine Score'] ? Math.min(100, Math.max(0, player['Combine Score'])) : 0}%`,
                                        backgroundColor: getTieredColor(player['Combine Score'])
                                    }}
                                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                                />
                            </div>

                        </div>
                    </div>

                    {/* Measurements Grid */}
                    <div className="grid grid-cols-2 gap-1">
                        {/* Left Column - Anthropometric Data */}
                        <div className={`relative border-streak ${activeStreaks[3] ? `active edge-${activeStreaks[3]}` : ''}`}>
                            <div className="bg-[#19191A] p-3 rounded">
                                <h3 className="text-base text-gr mb-2 text-center lowercase tracking-wider text-gray-400">Anthropometric Data</h3>
                                <div className="space-y-1.5">
                                    {/* All rows updated to use diverging color */}
                                    {/* Physical Score */}
                                    <div className="pb-2 mb-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-bold tracking-wider text-white">
                                                Physical Score
                                            </span>
                                            <span className="text-white text-xs font-semibold">
                                                {player['Physical Score'] ? player['Physical Score'].toFixed(1) : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="relative h-1 bg-gray-800/30 rounded-full overflow-hidden">
                                            <div
                                                style={{
                                                    width: `${player['Physical Score'] ? Math.min(100, Math.max(0, player['Physical Score'])) : 0}%`,
                                                    backgroundColor: getTieredColor(player['Physical Score'])
                                                }}
                                                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="pb-2 mb-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center space-x-1">
                                                <span className="text-xs tracking-wider text-gray-400">
                                                    Height -
                                                </span>
                                                <span className="text-gray-400 text-xs">
                                                    {player['Height w/o Shoes']}
                                                </span>
                                            </div>
                                            <span className="text-gray-400 text-xs">
                                                {player['Height (in.)_Percentile'] ? player['Height (in.)_Percentile'].toFixed(1) : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="relative h-1 bg-gray-800/30 rounded-full overflow-hidden">
                                            <div
                                                style={{
                                                    width: `${player['Height (in.)_Percentile'] ? Math.min(100, Math.max(0, player['Height (in.)_Percentile'])) : 0}%`,
                                                    backgroundColor: getTieredColor(player['Height (in.)_Percentile'])
                                                }}
                                                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="pb-2 mb-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center space-x-1">
                                                <span className="  text-xs tracking-wider text-gray-400">
                                                    Wingspan -
                                                </span>
                                                <span className="text-gray-400 text-xs">
                                                    {player['Wingspan']}
                                                </span>
                                            </div>
                                            <span className="text-gray-400 text-xs">
                                                {player['Wingspan (in.)_Percentile'] ? player['Wingspan (in.)_Percentile'].toFixed(1) : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="relative h-1 bg-gray-800/30 rounded-full overflow-hidden">
                                            <div
                                                style={{
                                                    width: `${player['Wingspan (in.)_Percentile'] ? Math.min(100, Math.max(0, player['Wingspan (in.)_Percentile'])) : 0}%`,
                                                    backgroundColor: getTieredColor(player['Wingspan (in.)_Percentile'])
                                                }}
                                                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="pb-2 mb-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center space-x-1">
                                                <span className="  text-xs tracking-wider text-gray-400">
                                                    Standing Reach -
                                                </span>
                                                <span className="text-gray-400 text-xs">
                                                    {player['Standing Reach']}
                                                </span>
                                            </div>
                                            <span className="text-gray-400 text-xs">
                                                {player['Standing Reach (in.)_Percentile'] ? player['Standing Reach (in.)_Percentile'].toFixed(1) : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="relative h-1 bg-gray-800/30 rounded-full overflow-hidden">
                                            <div
                                                style={{
                                                    width: `${player['Standing Reach (in.)_Percentile'] ? Math.min(100, Math.max(0, player['Standing Reach (in.)_Percentile'])) : 0}%`,
                                                    backgroundColor: getTieredColor(player['Standing Reach (in.)_Percentile'])
                                                }}
                                                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="pb-2 mb-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center space-x-1">
                                                <span className="  text-xs tracking-wider text-gray-400">
                                                    Weight -
                                                </span>
                                                <span className="text-gray-400 text-xs">
                                                    {player['Weight (lbs)']}
                                                </span>
                                            </div>
                                            <span className="text-gray-400 text-xs">
                                                {player['Weight (lbs)_Percentile'] ? player['Weight (lbs)_Percentile'].toFixed(1) : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="relative h-1 bg-gray-800/30 rounded-full overflow-hidden">
                                            <div
                                                style={{
                                                    width: `${player['Weight (lbs)_Percentile'] ? Math.min(100, Math.max(0, player['Weight (lbs)_Percentile'])) : 0}%`,
                                                    backgroundColor: getTieredColor(player['Weight (lbs)_Percentile'])
                                                }}
                                                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="pb-2 mb-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center space-x-1">
                                                <span className="  text-xs tracking-wider text-gray-400">
                                                    Hand Length -
                                                </span>
                                                <span className="text-gray-400 text-xs">
                                                    {player['Hand Length (in.)']}
                                                </span>
                                            </div>
                                            <span className="text-gray-400 text-xs">
                                                {player['Hand Length (in.)_Percentile'] ? player['Hand Length (in.)_Percentile'].toFixed(1) : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="relative h-1 bg-gray-800/30 rounded-full overflow-hidden">
                                            <div
                                                style={{
                                                    width: `${player['Hand Length (in.)_Percentile'] ? Math.min(100, Math.max(0, player['Hand Length (in.)_Percentile'])) : 0}%`,
                                                    backgroundColor: getTieredColor(player['Hand Length (in.)_Percentile'])
                                                }}
                                                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="pb-2 mb-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center space-x-1">
                                                <span className="  text-xs tracking-wider text-gray-400">
                                                    Hand Width -
                                                </span>
                                                <span className="text-gray-400 text-xs">
                                                    {player['Hand Width (in.)']}
                                                </span>
                                            </div>
                                            <span className="text-gray-400 text-xs">
                                                {player['Hand Width (in.)_Percentile'] ? player['Hand Width (in.)_Percentile'].toFixed(1) : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="relative h-1 bg-gray-800/30 rounded-full overflow-hidden">
                                            <div
                                                style={{
                                                    width: `${player['Hand Width (in.)_Percentile'] ? Math.min(100, Math.max(0, player['Hand Width (in.)_Percentile'])) : 0}%`,
                                                    backgroundColor: getTieredColor(player['Hand Width (in.)_Percentile'])
                                                }}
                                                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Athletic Testing Data */}
                        <div className={`relative border-streak ${activeStreaks[4] ? `active edge-${activeStreaks[4]}` : ''}`}>
                            <div className="bg-[#19191A] p-3 rounded">
                                <h3 className="text-base text-gr mb-2 text-center lowercase tracking-wider text-gray-400">Athletic Testing Data</h3>
                                <div className="space-y-1.5">
                                    {/* All rows updated to use diverging color */}
                                    {/* Vertical Score */}
                                    <div className="pb-2 mb-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="  text-xs font-bold tracking-wider text-white">
                                                Vertical Score
                                            </span>
                                            <span className="text-white text-xs font-semibold">
                                                {player['Vertical Score'] ? player['Vertical Score'].toFixed(1) : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="relative h-1 bg-gray-800/30 rounded-full overflow-hidden">
                                            <div
                                                style={{
                                                    width: `${player['Vertical Score'] ? Math.min(100, Math.max(0, player['Vertical Score'])) : 0}%`,
                                                    backgroundColor: getTieredColor(player['Vertical Score'])
                                                }}
                                                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="pb-2 mb-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center space-x-1">
                                                <span className="  text-xs tracking-wider text-gray-400">
                                                    Max Vert -
                                                </span>
                                                <span className="text-gray-400 text-xs">
                                                    {player['Max Vertical']}
                                                </span>
                                            </div>
                                            <span className="text-gray-400 text-xs">
                                                {player['Max Vertical_Percentile'] ? player['Max Vertical_Percentile'].toFixed(1) : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="relative h-1 bg-gray-800/30 rounded-full overflow-hidden">
                                            <div
                                                style={{
                                                    width: `${player['Max Vertical_Percentile'] ? Math.min(100, Math.max(0, player['Max Vertical_Percentile'])) : 0}%`,
                                                    backgroundColor: getTieredColor(player['Max Vertical_Percentile'])
                                                }}
                                                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="pb-2 mb-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center space-x-1">
                                                <span className="  text-xs tracking-wider text-gray-400">
                                                    Standing Vert -
                                                </span>
                                                <span className="text-gray-400 text-xs">
                                                    {player['Standing Vertical']}
                                                </span>
                                            </div>
                                            <span className="text-gray-400 text-xs">
                                                {player['Standing Vertical_Percentile'] ? player['Standing Vertical_Percentile'].toFixed(1) : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="relative h-1 bg-gray-800/30 rounded-full overflow-hidden">
                                            <div
                                                style={{
                                                    width: `${player['Standing Vertical_Percentile'] ? Math.min(100, Math.max(0, player['Standing Vertical_Percentile'])) : 0}%`,
                                                    backgroundColor: getTieredColor(player['Standing Vertical_Percentile'])
                                                }}
                                                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Agility Score */}
                                    <div className="pb-2 mb-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="  text-xs font-bold tracking-wider text-white">
                                                Agility Score
                                            </span>
                                            <span className="text-white text-xs font-semibold">
                                                {player['Agility Score'] ? player['Agility Score'].toFixed(1) : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="relative h-1 bg-gray-800/30 rounded-full overflow-hidden">
                                            <div
                                                style={{
                                                    width: `${player['Agility Score'] ? Math.min(100, Math.max(0, player['Agility Score'])) : 0}%`,
                                                    backgroundColor: getTieredColor(player['Agility Score'])
                                                }}
                                                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="pb-2 mb-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center space-x-1">
                                                <span className="  text-xs tracking-wider text-gray-400">
                                                    Lane Agility -
                                                </span>
                                                <span className="text-gray-400 text-xs">
                                                    {player['Lane Agility Time'] ? player['Lane Agility Time'].toFixed(2) : 'N/A'}
                                                </span>
                                            </div>
                                            <span className="text-gray-400 text-xs">
                                                {player['Lane Agility Time_Percentile'] ? player['Lane Agility Time_Percentile'].toFixed(1) : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="relative h-1 bg-gray-800/30 rounded-full overflow-hidden">
                                            <div
                                                style={{
                                                    width: `${player['Lane Agility Time_Percentile'] ? Math.min(100, Math.max(0, player['Lane Agility Time_Percentile'])) : 0}%`,
                                                    backgroundColor: getTieredColor(player['Lane Agility Time_Percentile'])
                                                }}
                                                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="pb-2 mb-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center space-x-1">
                                                <span className="  text-xs tracking-wider text-gray-400">
                                                    3/4 Sprint -
                                                </span>
                                                <span className="text-gray-400 text-xs">
                                                    {player['Three Quarter Sprint']}
                                                </span>
                                            </div>
                                            <span className="text-gray-400 text-xs">
                                                {player['Three Quarter Sprint_Percentile'] ? player['Three Quarter Sprint_Percentile'].toFixed(1) : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="relative h-1 bg-gray-800/30 rounded-full overflow-hidden">
                                            <div
                                                style={{
                                                    width: `${player['Three Quarter Sprint_Percentile'] ? Math.min(100, Math.max(0, player['Three Quarter Sprint_Percentile'])) : 0}%`,
                                                    backgroundColor: getTieredColor(player['Three Quarter Sprint_Percentile'])
                                                }}
                                                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="pb-2 mb-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center space-x-1">
                                                <span className="  text-xs tracking-wider text-gray-400">
                                                    Shuttle Run -
                                                </span>
                                                <span className="text-gray-400 text-xs">
                                                    {player['Shuttle Run'] ? player['Shuttle Run'].toFixed(2) : 'N/A'}
                                                </span>
                                            </div>
                                            <span className="text-gray-400 text-xs">
                                                {player['Shuttle Run_Percentile'] ? player['Shuttle Run_Percentile'].toFixed(1) : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="relative h-1 bg-gray-800/30 rounded-full overflow-hidden">
                                            <div
                                                style={{
                                                    width: `${player['Shuttle Run_Percentile'] ? Math.min(100, Math.max(0, player['Shuttle Run_Percentile'])) : 0}%`,
                                                    backgroundColor: getTieredColor(player['Shuttle Run_Percentile'])
                                                }}
                                                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function CombineScorePage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [selectedYear, setSelectedYear] = useState('2025');
    const [selectedPosition, setSelectedPosition] = useState('PG-C');
    const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
    const [isPositionDropdownOpen, setIsPositionDropdownOpen] = useState(false);
    const [combineData, setCombineData] = useState<CombinePlayer[]>([]);
    const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({
        key: 'Player',
        direction: 'asc'
    });
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPlayer, setSelectedPlayer] = useState<CombinePlayer | null>(null);
    const [selectedPositions, setSelectedPositions] = useState<{ [playerName: string]: string }>({});
    const [expandedRows, setExpandedRows] = useState<{ [playerName: string]: boolean }>({});

    const years = Array.from({ length: 26 }, (_, i) => 2025 - i);
    const positions = ['PG-C', 'PG', 'SG', 'SF', 'PF', 'C'];

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const csvFile = '/CombineScores - Final_Combine_Data.csv';
                const response = await fetch(csvFile);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const csvText = await response.text();

                Papa.parse(csvText, {
                    header: true,
                    dynamicTyping: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        setCombineData(results.data as CombinePlayer[]);
                        setIsLoading(false);
                    },
                    error: (error: any) => {
                        console.error('Error parsing CSV:', error);
                        setIsLoading(false);
                    }
                });
            } catch (error) {
                console.error('Error loading CSV:', error);
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    const filteredAndSortedData = useMemo(() => {
        let filtered = combineData.filter(player => {
            const playerYear = player['Draft Year'];
            return playerYear?.toString() === selectedYear;
        });

        // Filter by position if not "PG-C"
        if (selectedPosition !== 'PG-C') {
            filtered = filtered.filter(player => {
                const defaultPos = player['Default Position'];
                return defaultPos === selectedPosition;
            });
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(player => {
                const playerName = (player['Player'] || '').toLowerCase();
                return playerName.includes(query);
            });
        }

        // Group by player name and get their position variations
        const playerGroups = filtered.reduce((acc, player) => {
            const name = player['Player'];
            if (!acc[name]) {
                acc[name] = [];
            }
            acc[name].push(player);
            return acc;
        }, {} as { [key: string]: CombinePlayer[] });

        // For each player, select the appropriate variation based on selectedPositions or Is Primary
        // This is done BEFORE sorting to establish the initial order
        const displayDataBeforeSort = Object.entries(playerGroups).map(([name, variations]) => {
            // Always use Is Primary = 1 for initial sorting
            return variations.find(v => v['Is Primary'] === 1) || variations[0];
        });

        // Sort based on the PRIMARY position data
        let sortedData = displayDataBeforeSort;
        if (sortConfig.key) {
            sortedData = [...displayDataBeforeSort].sort((a, b) => {
                const key = sortConfig.key as keyof CombinePlayer;
                const aVal = a[key];
                const bVal = b[key];

                if (aVal === null || aVal === undefined) return 1;
                if (bVal === null || bVal === undefined) return -1;

                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
                } else {
                    const aStr = String(aVal);
                    const bStr = String(bVal);
                    return sortConfig.direction === 'asc'
                        ? aStr.localeCompare(bStr)
                        : bStr.localeCompare(aStr);
                }
            });
        }

        // Now map to selected positions while maintaining sort order
        return sortedData.map(player => {
            const name = player['Player'];
            const selectedPos = selectedPositions[name];
            const variations = playerGroups[name];

            if (selectedPos) {
                // Find the variation matching the selected Default Position
                const selected = variations.find(v => v['Default Position'] === selectedPos);
                return selected || player;
            }
            return player;
        });
    }, [combineData, selectedYear, selectedPosition, searchQuery, sortConfig, selectedPositions]);

    // Get all position variations for a player
    const getPlayerVariations = (playerName: string) => {
        return combineData.filter(p =>
            p['Player'] === playerName &&
            p['Draft Year']?.toString() === selectedYear
        );
    };

    const toggleRowExpansion = (playerName: string) => {
        setExpandedRows(prev => ({
            ...prev,
            [playerName]: !prev[playerName]
        }));
    };

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'desc';
        if (sortConfig.key === key) {
            direction = sortConfig.direction === 'desc' ? 'asc' : 'desc';
        }
        setSortConfig({ key, direction });
    };

    const SortIcon = ({ columnKey }: { columnKey: string }) => {
        if (sortConfig.key !== columnKey) {
            return <ChevronDown className="h-4 w-4 text-gray-500" />;
        }
        return sortConfig.direction === 'desc' ? (
            <ChevronDown className="h-4 w-4 text-blue-400" />
        ) : (
            <ChevronUp className="h-4 w-4 text-blue-400" />
        );
    };

    return (
        <div className="min-h-screen bg-[#19191A]">
            <NavigationHeader activeTab="Combine Score" />
            <DraftPageHeader author="Combine Score" />

            {/* Filter Section */}
            <div className="sticky top-14 z-30 bg-[#19191A] border-b border-gray-800">
                {/* Mobile Filter */}
                <div className="sm:hidden px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
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

                        <div className="relative">
                            <motion.button
                                onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                                className="px-2 py-2 rounded-lg text-sm font-medium bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700 flex items-center gap-1"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {selectedYear}
                                <ChevronDown className="h-4 w-4" />
                            </motion.button>

                            {isYearDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-32 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                                    {years.map(year => (
                                        <button
                                            key={year}
                                            onClick={() => {
                                                setSelectedYear(year.toString());
                                                setIsYearDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 ${selectedYear === year.toString() ? 'bg-gray-700 text-white' : 'text-gray-300'
                                                }`}
                                        >
                                            {year}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Filter Content */}
                <div className={`px-4 py-3 ${isMobileFilterOpen ? 'block' : 'hidden sm:block'}`}>
                    <div className="flex items-center gap-3">
                        {/* Search Bar */}
                        <div className="relative flex-1 max-w-lg">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full bg-gray-800/20 border border-gray-800 text-gray-300 placeholder-gray-500 rounded-lg focus:border-blue-500/30 focus:ring-1 focus:ring-blue-500/30"
                            />
                        </div>

                        {/* Position Filter */}
                        <div className="relative">
                            <motion.button
                                onClick={() => setIsPositionDropdownOpen(!isPositionDropdownOpen)}
                                className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700 flex items-center gap-2 whitespace-nowrap"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {selectedPosition}
                                <ChevronDown className="h-4 w-4" />
                            </motion.button>

                            {isPositionDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                                    {positions.map(position => (
                                        <button
                                            key={position}
                                            onClick={() => {
                                                setSelectedPosition(position);
                                                setIsPositionDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 ${selectedPosition === position ? 'bg-gray-700 text-white' : 'text-gray-300'
                                                }`}
                                        >
                                            {position}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Year Filter */}
                        <div className="relative">
                            <motion.button
                                onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                                className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700 flex items-center gap-2"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {selectedYear}
                                <ChevronDown className="h-4 w-4" />
                            </motion.button>

                            {isYearDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-32 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                                    {years.map(year => (
                                        <button
                                            key={year}
                                            onClick={() => {
                                                setSelectedYear(year.toString());
                                                setIsYearDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 ${selectedYear === year.toString() ? 'bg-gray-700 text-white' : 'text-gray-300'
                                                }`}
                                        >
                                            {year}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-screen-2xl mx-auto px-4 py-6">
                {isLoading ? (
                    <div className="text-center text-gray-400 py-12">
                        <p>Loading combine data...</p>
                    </div>
                ) : filteredAndSortedData.length === 0 ? (
                    <div className="text-center text-gray-400 py-12">
                        <p>No players found for {selectedYear} with current filters.</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-4 text-gray-400 text-sm">
                            Click on player name to view their Combine Score Card
                        </div>

                        {/* Enhanced Table with All Measurements */}
                        <div className="bg-[#19191A] rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-[#19191A]">
                                        <tr>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-300 cursor-pointer hover:bg-gray-700/30 whitespace-nowrap" onClick={() => handleSort('Player')}>
                                                <div className="flex items-center gap-1">Player <SortIcon columnKey="Player" /></div>
                                            </th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-300 cursor-pointer hover:bg-gray-700/30 whitespace-nowrap" onClick={() => handleSort('Default Position')}>
                                                <div className="flex items-center gap-1">Pos <SortIcon columnKey="Default Position" /></div>
                                            </th>
                                            <th className="text-center px-3 py-3 text-xs font-semibold text-gray-300 cursor-pointer hover:bg-gray-700/30 whitespace-nowrap w-24" onClick={() => handleSort('Combine Score')}>
                                                <div className="flex items-center justify-center gap-1">Combine Score <SortIcon columnKey="Combine Score" /></div>
                                            </th>
                                            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-300 cursor-pointer hover:bg-gray-700/30 whitespace-nowrap w-24" onClick={() => handleSort('Height (in.)')}>
                                                <div className="flex items-center justify-center gap-1">Height <SortIcon columnKey="Height (in.)" /></div>
                                            </th>
                                            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-300 cursor-pointer hover:bg-gray-700/30 whitespace-nowrap w-24" onClick={() => handleSort('Wingspan (in.)')}>
                                                <div className="flex items-center justify-center gap-1">Wingspan <SortIcon columnKey="Wingspan (in.)" /></div>
                                            </th>
                                            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-300 cursor-pointer hover:bg-gray-700/30 whitespace-nowrap w-24" onClick={() => handleSort('Standing Reach (in.)')}>
                                                <div className="flex items-center justify-center gap-1">Reach <SortIcon columnKey="Standing Reach (in.)" /></div>
                                            </th>
                                            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-300 cursor-pointer hover:bg-gray-700/30 whitespace-nowrap w-24" onClick={() => handleSort('Weight (lbs)')}>
                                                <div className="flex items-center justify-center gap-1">Weight <SortIcon columnKey="Weight (lbs)" /></div>
                                            </th>
                                            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-300 cursor-pointer hover:bg-gray-700/30 whitespace-nowrap w-24" onClick={() => handleSort('Max Vertical')}>
                                                <div className="flex items-center justify-center gap-1">Max Vert <SortIcon columnKey="Max Vertical" /></div>
                                            </th>
                                            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-300 cursor-pointer hover:bg-gray-700/30 whitespace-nowrap w-24" onClick={() => handleSort('Standing Vertical')}>
                                                <div className="flex items-center justify-center gap-1">Standing Vert <SortIcon columnKey="Standing Vertical" /></div>
                                            </th>
                                            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-300 cursor-pointer hover:bg-gray-700/30 whitespace-nowrap w-24" onClick={() => handleSort('Lane Agility Time')}>
                                                <div className="flex items-center justify-center gap-1">Lane Agility <SortIcon columnKey="Lane Agility Time" /></div>
                                            </th>
                                            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-300 cursor-pointer hover:bg-gray-700/30 whitespace-nowrap w-24" onClick={() => handleSort('Three Quarter Sprint')}>
                                                <div className="flex items-center justify-center gap-1">3/4 Agility <SortIcon columnKey="Three Quarter Sprint" /></div>
                                            </th>
                                            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-300 cursor-pointer hover:bg-gray-700/30 whitespace-nowrap w-24" onClick={() => handleSort('Shuttle Run')}>
                                                <div className="flex items-center justify-center gap-1">Shuttle Run <SortIcon columnKey="Shuttle Run" /></div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAndSortedData.map((player, index) => {
                                            const variations = getPlayerVariations(player.Player);
                                            const currentPosition = selectedPositions[player.Player] || player['Default Position'];
                                            const isExpanded = expandedRows[player.Player] || false;

                                            const getTieredColor = (percentile: number | null | undefined): string => {
                                                if (percentile === null || percentile === undefined) return 'transparent';
                                                const score = Math.max(0, Math.min(100, percentile));
                                                if (score >= 60) return '#79e0ff';
                                                else if (score >= 40) return '#ffbc49';
                                                else return '#ff5757';
                                            };

                                            return (
                                                <React.Fragment key={`${player.Player}-${index}`}>
                                                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                        <td className="px-4 py-3 text-white font-medium">
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        toggleRowExpansion(player.Player);
                                                                    }}
                                                                    className="text-gray-400 hover:text-white transition-colors"
                                                                >
                                                                    <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                                </button>
                                                                <span className="cursor-pointer" onClick={() => setSelectedPlayer(player)}>
                                                                    {player.Player}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <select
                                                                value={currentPosition}
                                                                onChange={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedPositions(prev => ({
                                                                        ...prev,
                                                                        [player.Player]: e.target.value
                                                                    }));
                                                                }}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="bg-transparent text-gray-300 text-sm cursor-pointer"
                                                            >
                                                                {variations.map((variation, idx) => (
                                                                    <option key={idx} value={variation['Default Position']}>
                                                                        {variation['Default Position']}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="px-3 py-3 text-center cursor-pointer" onClick={() => setSelectedPlayer(player)}>
                                                            <span
                                                                className="text-m font-bold"
                                                                style={{
                                                                    color: player['Combine Score'] != null ? getTieredColor(player['Combine Score']) : '#6b7280',
                                                                }}
                                                            >
                                                                {player['Combine Score'] != null ? player['Combine Score'].toFixed(1) : '-'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <div className="flex flex-col items-center gap-0.5">
                                                                <span className="text-white font-medium">{player['Height w/o Shoes'] || '-'}</span>
                                                                <span
                                                                    className="text-xs font-medium"
                                                                    style={{
                                                                        color: getTieredColor(player['Height (in.)_Percentile'])
                                                                    }}
                                                                >
                                                                    {player['Height (in.)_Percentile']?.toFixed(0) || '-'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <div className="flex flex-col items-center gap-0.5">
                                                                <span className="text-white font-medium">{player['Wingspan'] || '-'}</span>
                                                                <span
                                                                    className="text-xs font-medium"
                                                                    style={{
                                                                        color: getTieredColor(player['Wingspan (in.)_Percentile'])
                                                                    }}
                                                                >
                                                                    {player['Wingspan (in.)_Percentile']?.toFixed(0) || '-'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <div className="flex flex-col items-center gap-0.5">
                                                                <span className="text-white font-medium">{player['Standing Reach'] || '-'}</span>
                                                                <span
                                                                    className="text-xs font-medium"
                                                                    style={{
                                                                        color: getTieredColor(player['Standing Reach (in.)_Percentile'])
                                                                    }}
                                                                >
                                                                    {player['Standing Reach (in.)_Percentile']?.toFixed(0) || '-'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <div className="flex flex-col items-center gap-0.5">
                                                                <span className="text-white font-medium">{player['Weight (lbs)'] || '-'}</span>
                                                                <span
                                                                    className="text-xs font-medium"
                                                                    style={{
                                                                        color: getTieredColor(player['Weight (lbs)_Percentile'])
                                                                    }}
                                                                >
                                                                    {player['Weight (lbs)_Percentile']?.toFixed(0) || '-'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <div className="flex flex-col items-center gap-0.5">
                                                                <span className="text-white font-medium">{player['Max Vertical'] || '-'}</span>
                                                                <span
                                                                    className="text-xs font-medium"
                                                                    style={{
                                                                        color: getTieredColor(player['Max Vertical_Percentile'])
                                                                    }}
                                                                >
                                                                    {player['Max Vertical_Percentile']?.toFixed(0) || '-'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <div className="flex flex-col items-center gap-0.5">
                                                                <span className="text-white font-medium">{player['Standing Vertical'] || '-'}</span>
                                                                <span
                                                                    className="text-xs font-medium"
                                                                    style={{
                                                                        color: getTieredColor(player['Standing Vertical_Percentile'])
                                                                    }}
                                                                >
                                                                    {player['Standing Vertical_Percentile']?.toFixed(0) || '-'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <div className="flex flex-col items-center gap-0.5">
                                                                <span className="text-white font-medium">{player['Lane Agility Time']?.toFixed(2) || '-'}</span>
                                                                <span
                                                                    className="text-xs font-medium"
                                                                    style={{
                                                                        color: getTieredColor(player['Lane Agility Time_Percentile'])
                                                                    }}
                                                                >
                                                                    {player['Lane Agility Time_Percentile']?.toFixed(0) || '-'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <div className="flex flex-col items-center gap-0.5">
                                                                <span className="text-white font-medium">{player['Three Quarter Sprint']?.toFixed(2) || '-'}</span>
                                                                <span
                                                                    className="text-xs font-medium"
                                                                    style={{
                                                                        color: getTieredColor(player['Three Quarter Sprint_Percentile'])
                                                                    }}
                                                                >
                                                                    {player['Three Quarter Sprint_Percentile']?.toFixed(0) || '-'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <div className="flex flex-col items-center gap-0.5">
                                                                <span className="text-white font-medium">{player['Shuttle Run']?.toFixed(2) || '-'}</span>
                                                                <span
                                                                    className="text-xs font-medium"
                                                                    style={{
                                                                        color: getTieredColor(player['Shuttle Run_Percentile'])
                                                                    }}
                                                                >
                                                                    {player['Shuttle Run_Percentile']?.toFixed(0) || '-'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    {isExpanded && (
                                                        <tr className="bg-gray-800/20 border-b border-white/5">
                                                            <td colSpan={12} className="px-6 py-8">
                                                                <PlayerComparison player={player} allData={combineData} />
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Modal */}
            {selectedPlayer && (
                <PlayerModal
                    player={selectedPlayer}
                    onClose={() => setSelectedPlayer(null)}
                />
            )}
        </div>
    );
}