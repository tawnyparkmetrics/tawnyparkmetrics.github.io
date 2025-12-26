"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, ChevronDown, SlidersHorizontal, ChevronUp, Ruler } from 'lucide-react';
import { motion } from 'framer-motion';
import Papa from 'papaparse';
import NavigationHeader from '@/components/NavigationHeader';
import DraftPageHeader from '@/components/DraftPageHeader';
import { Barlow } from 'next/font/google';

const barlow = Barlow({
    weight: ['400', '500', '600', '700'],
    subsets: ['latin'],
});

const pulseStyles = `
  @keyframes subtle-pulse {
    0%, 100% { 
      filter: brightness(1) saturate(1) drop-shadow(0 0 0px currentColor);
      transform: scale(1);
    }
    50% { 
      filter: brightness(1.05) saturate(1.05) drop-shadow(0 0 4px currentColor);
      transform: scale(1.02);
    }
  }
  
  .pulse-active {
    animation: subtle-pulse 2s ease-in-out;
    display: inline-block;
  }
`;

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
    const [comparisonPlayer, setComparisonPlayer] = React.useState<CombinePlayer | null>(null);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [showSuggestions, setShowSuggestions] = React.useState(false);
    const [positionDropdownOpen, setPositionDropdownOpen] = React.useState<{ [key: string]: boolean }>({});
    const positionDropdownRefs = React.useRef<{ [key: string]: HTMLDivElement | null }>({});

    const searchDropdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }

            // Close position dropdowns when clicking outside
            Object.entries(positionDropdownRefs.current).forEach(([key, ref]) => {
                if (ref && !ref.contains(event.target as Node)) {
                    setPositionDropdownOpen(prev => ({ ...prev, [key]: false }));
                }
            });
        };


        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const getTieredColor = (percentile: number | null | undefined): string => {
        if (percentile === null || percentile === undefined) return 'transparent';
        const score = Math.max(0, Math.min(100, percentile));
        if (score >= 60) return '#79e0ff';
        else if (score >= 40) return '#ffbc49';
        else return '#ff5757';
    };

    // Get players in the same position for comparison
    const availableComparisons = React.useMemo(() => {
        const position = player['Default Position'];
        return allData.filter(p =>
            p['Default Position'] === position &&
            p['Is Primary'] === 1 &&
            p['Player'] !== player['Player'] // Exclude the current player
        ).sort((a, b) => a['Player'].localeCompare(b['Player']));
    }, [player, allData]);

    // Filter suggestions based on search
    const filteredSuggestions = React.useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return availableComparisons;

        return availableComparisons.filter(p => {
            const playerName = p['Player'].toLowerCase();
            const playerYear = p['Draft Year']?.toString() || '';

            return playerName.includes(query) || playerYear.includes(query);
        });
    }, [searchQuery, availableComparisons]);

    const handleSelectPlayer = (selectedPlayer: CombinePlayer) => {
        setComparisonPlayer(selectedPlayer);
        setSearchQuery(selectedPlayer['Player']);
        setShowSuggestions(false);
    };

    const handleClearComparison = () => {
        setComparisonPlayer(null);
        setSearchQuery('');
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
    const getSpiderPoints = (attributes: { name: string; key: string }[], targetPlayer: CombinePlayer = player) => {
        const centerX = 150;
        const centerY = 150;
        const maxRadius = 120;
        const angleStep = (2 * Math.PI) / attributes.length;

        return attributes.map((attr, i) => {
            const angle = -Math.PI / 2 + i * angleStep;
            const value = targetPlayer[attr.key] ?? 0;
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

    const getSpiderPolygonPath = (attributes: { name: string; key: string }[], targetPlayer: CombinePlayer = player) => {
        const points = getSpiderPoints(attributes, targetPlayer);
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
        <div className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
                {/* Bar Chart with Search - Left */}
                <div className="flex flex-col">
                    {/* Comparison Search Bar - Only above bar chart */}
                    <div className="rounded-lg pb-4">
                        <div className="flex items-center gap-2">
                            <div className="relative w-full" ref={searchDropdownRef}>
                                {/* Search icon */}
                                <svg
                                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3 z-10 pointer-events-none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.5 10.5a7.5 7.5 0 0013.15 6.15z" />
                                </svg>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setShowSuggestions(true);
                                        if (!e.target.value.trim()) {
                                            setComparisonPlayer(null);
                                        }
                                    }}
                                    onFocus={() => setShowSuggestions(true)}
                                    placeholder={`Compare with other ${player['Default Position'] === 'PG' ? 'Point Guards' :
                                        player['Default Position'] === 'SG' ? 'Shooting Guards' :
                                            player['Default Position'] === 'SF' ? 'Small Forwards' :
                                                player['Default Position'] === 'PF' ? 'Power Forwards' :
                                                    player['Default Position'] === 'C' ? 'Centers' :
                                                        player['Default Position'] + 's'
                                        }`}
                                    className="w-full pl-8 pr-3 py-2 text-xs bg-[#19191A] border border-gray-800 text-gray-300 placeholder-gray-500 rounded focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 focus:outline-none"
                                />
                                {comparisonPlayer && (
                                    <button
                                        onClick={handleClearComparison}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                                {showSuggestions && filteredSuggestions.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-[#19191A] border border-gray-700 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                        {filteredSuggestions.map((p, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleSelectPlayer(p)}
                                                className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 transition-colors"
                                            >
                                                {p['Player']} ({p['Draft Year']})
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bar Chart */}
                    <div className="bg-[#19191A] p-7 rounded-lg border border-gray-800"> {/* Changed from p-4 to p-3 */}
                        <h4 className="text-sm font-semibold text-gray-300 mb-2 text-center"> {/* Changed from mb-3 to mb-2 */}
                            {player.Player} vs {comparisonPlayer ? comparisonPlayer.Player : `Average ${player['Default Position']}`}
                        </h4>
                        <div className="flex items-end justify-center gap-4 h-32">
                            <div className="flex items-end gap-4">
                                {compositeScores.map((score) => {
                                    const playerRawValue = player[score.playerKey as keyof typeof player];
                                    const comparisonRawValue = comparisonPlayer
                                        ? comparisonPlayer[score.playerKey as keyof typeof comparisonPlayer]
                                        : positionAverages[score.avgKey as keyof typeof positionAverages];

                                    const playerValue = playerRawValue ?? null;
                                    const comparisonValue = comparisonRawValue ?? null;

                                    const playerColor = comparisonPlayer ? '#3b82f6' : getTieredColor(playerValue);
                                    const comparisonColor = comparisonPlayer ? '#ef4444' : '#4b5563';

                                    return (
                                        <div key={score.name} className="flex flex-col items-center gap-2 w-14">
                                            <div className="flex items-end gap-2 w-full justify-center" style={{ height: '104px' }}>
                                                {/* Player Bar */}
                                                <div className="flex flex-col items-center gap-1 w-5">
                                                    <span className="text-xs font-semibold text-white" style={{ minHeight: '16px' }}>
                                                        {playerValue !== null ? playerValue.toFixed(0) : 'N/A'}
                                                    </span>
                                                    <motion.div
                                                        className="w-full rounded-t"
                                                        animate={{ height: `${playerValue !== null ? (playerValue / 100) * 88 : 0}px` }}
                                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                                        style={{
                                                            backgroundColor: playerValue !== null ? playerColor : 'transparent',
                                                            minHeight: playerValue !== null ? '3px' : '0px'
                                                        }}
                                                    />
                                                </div>
                                                {/* Comparison/Average Bar */}
                                                <div className="flex flex-col items-center gap-1 w-5">
                                                    <span className="text-xs font-semibold text-gray-400" style={{ minHeight: '16px' }}>
                                                        {comparisonValue !== null ? comparisonValue.toFixed(0) : 'N/A'}
                                                    </span>
                                                    <motion.div
                                                        className="w-full rounded-t"
                                                        animate={{ height: `${comparisonValue !== null ? (comparisonValue / 100) * 88 : 0}px` }}
                                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                                        style={{
                                                            backgroundColor: comparisonValue !== null ? comparisonColor : 'transparent',
                                                            minHeight: comparisonValue !== null ? '3px' : '0px'
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
                                <div className="w-3 h-3 rounded" style={{ backgroundColor: comparisonPlayer ? '#3b82f6' : getTieredColor(60) }} />
                                <span className="text-xs text-gray-400">{player.Player}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded" style={{ backgroundColor: comparisonPlayer ? '#ef4444' : '#4b5563' }} />
                                <span className="text-xs text-gray-400">{comparisonPlayer ? comparisonPlayer.Player : 'Pos Avg'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Anthropometric Spider Chart - Middle */}
                <div className="bg-[#19191A] p-3 rounded-lg border border-gray-800">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2 text-center">Anthropometric Data</h4>
                    <svg viewBox="0 0 300 300" className="w-full h-56">
                        {/* Grid lines and axes */}
                        {getSpiderGridLines(anthropometricAttrs.length).map((grid, i) => (
                            <motion.polygon
                                key={i}
                                points={grid.points}
                                fill="none"
                                stroke="#374151"
                                strokeWidth="1"
                                opacity="0.3"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.3 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                            />
                        ))}

                        {getAxisLines(anthropometricAttrs.length).map((line, i) => (
                            <motion.line
                                key={i}
                                x1={line.x1}
                                y1={line.y1}
                                x2={line.x2}
                                y2={line.y2}
                                stroke="#374151"
                                strokeWidth="1"
                                opacity="0.5"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.6, delay: i * 0.05 }}
                            />
                        ))}

                        {/* Comparison player polygon (if exists) - behind */}
                        {comparisonPlayer && (
                            <>
                                <motion.polygon
                                    points={getSpiderPolygonPath(anthropometricAttrs, comparisonPlayer)}
                                    fill="#ef4444"
                                    fillOpacity="0.2"
                                    stroke="#ef4444"
                                    strokeWidth="2"
                                    strokeDasharray="5,5"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.6, delay: 0.4 }}
                                />
                                {getSpiderPoints(anthropometricAttrs, comparisonPlayer).map((point, i) => (
                                    <motion.circle
                                        key={i}
                                        cx={point.x}
                                        cy={point.y}
                                        r="3"
                                        fill="#ef4444"
                                        stroke="#19191A"
                                        strokeWidth="2"
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.3, delay: 0.5 + i * 0.05 }}
                                    />
                                ))}
                            </>
                        )}

                        {/* Main player polygon - in front */}
                        <motion.polygon
                            points={getSpiderPolygonPath(anthropometricAttrs, player)}
                            fill={comparisonPlayer ? '#3b82f6' : getTieredColor(player['Physical Score'])}
                            fillOpacity="0.3"
                            stroke={comparisonPlayer ? '#3b82f6' : getTieredColor(player['Physical Score'])}
                            strokeWidth="2"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        />

                        {getSpiderPoints(anthropometricAttrs, player).map((point, i) => (
                            <motion.circle
                                key={i}
                                cx={point.x}
                                cy={point.y}
                                r="3"
                                fill={comparisonPlayer ? '#3b82f6' : getTieredColor(point.value)}
                                stroke="#19191A"
                                strokeWidth="2"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3, delay: 0.4 + i * 0.05 }}
                            />
                        ))}

                        {/* Labels */}
                        {anthropometricAttrs.map((attr, i) => {
                            const pos = getLabelPosition(i, anthropometricAttrs.length);
                            return (
                                <motion.text
                                    key={i}
                                    x={pos.x}
                                    y={pos.y}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    className="text-xs fill-gray-300 font-medium"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.4, delay: 0.6 + i * 0.05 }}
                                >
                                    {attr.name}
                                </motion.text>
                            );
                        })}
                    </svg>
                </div>

                {/* Athletic Testing Spider Chart - Right */}
                <div className="bg-[#19191A] p-3 rounded-lg border border-gray-800">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2 text-center">Athletic Testing Data</h4>
                    <svg viewBox="0 0 300 300" className="w-full h-56">
                        {/* Grid lines and axes */}
                        {getSpiderGridLines(athleticAttrs.length).map((grid, i) => (
                            <motion.polygon
                                key={i}
                                points={grid.points}
                                fill="none"
                                stroke="#374151"
                                strokeWidth="1"
                                opacity="0.3"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.3 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                            />
                        ))}

                        {getAxisLines(athleticAttrs.length).map((line, i) => (
                            <motion.line
                                key={i}
                                x1={line.x1}
                                y1={line.y1}
                                x2={line.x2}
                                y2={line.y2}
                                stroke="#374151"
                                strokeWidth="1"
                                opacity="0.5"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.6, delay: i * 0.05 }}
                            />
                        ))}

                        {/* Comparison player polygon (if exists) - behind */}
                        {comparisonPlayer && (
                            <>
                                <motion.polygon
                                    points={getSpiderPolygonPath(athleticAttrs, comparisonPlayer)}
                                    fill="#ef4444"
                                    fillOpacity="0.2"
                                    stroke="#ef4444"
                                    strokeWidth="2"
                                    strokeDasharray="5,5"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.6, delay: 0.4 }}
                                />
                                {getSpiderPoints(athleticAttrs, comparisonPlayer).map((point, i) => (
                                    <motion.circle
                                        key={i}
                                        cx={point.x}
                                        cy={point.y}
                                        r="3"
                                        fill="#ef4444"
                                        stroke="#19191A"
                                        strokeWidth="2"
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.3, delay: 0.5 + i * 0.05 }}
                                    />
                                ))}
                            </>
                        )}

                        {/* Main player polygon - in front */}
                        <motion.polygon
                            points={getSpiderPolygonPath(athleticAttrs, player)}
                            fill={comparisonPlayer ? '#3b82f6' : getTieredColor(player['Agility Score'])}
                            fillOpacity="0.3"
                            stroke={comparisonPlayer ? '#3b82f6' : getTieredColor(player['Agility Score'])}
                            strokeWidth="2"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        />

                        {getSpiderPoints(athleticAttrs, player).map((point, i) => (
                            <motion.circle
                                key={i}
                                cx={point.x}
                                cy={point.y}
                                r="3"
                                fill={comparisonPlayer ? '#3b82f6' : getTieredColor(point.value)}
                                stroke="#19191A"
                                strokeWidth="2"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3, delay: 0.4 + i * 0.05 }}
                            />
                        ))}

                        {/* Labels */}
                        {athleticAttrs.map((attr, i) => {
                            const pos = getLabelPosition(i, athleticAttrs.length);
                            return (
                                <motion.text
                                    key={i}
                                    x={pos.x}
                                    y={pos.y}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    className="text-xs fill-gray-300 font-medium"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.4, delay: 0.6 + i * 0.05 }}
                                >
                                    {attr.name}
                                </motion.text>
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

    const playerNameOverrides: { [key: string]: string } = {
        'Yanic Konan Niederhauser': 'Yanic Konan N.',
        'Ryan Kalkbrenner': 'R. Kalkbrenner',
        'Walter Clayton Jr.': 'W. Clayton Jr.',
        // Add more overrides here as needed
    };

    const getDisplayName = (playerName: string): string => {
        return playerNameOverrides[playerName] || playerName;
    };

    const formatNumber = (num: number | null | undefined): string => {
        if (num === null || num === undefined) return 'N/A';
        return num % 1 === 0 ? num.toFixed(0) : num.toFixed(1);
    };

    const formatMeasurement = (value: any): string => {
        if (value === null || value === undefined || value === '' || (typeof value === 'string' && value.toUpperCase() === 'N/A')) {
            return 'N/A';
        }
        return String(value);
    };

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
            {/* Modal action buttons - vertically stacked, aligned, close to modal */}
            <div
                className="absolute flex flex-col gap-2 z-50 top-10 right-10"
                style={{ alignItems: "flex-end" }}
            >
                <button
                    onClick={onClose}
                    className="text-white p-2 rounded-full hover:bg-[#19191A] transition-colors"
                    aria-label="Close"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div
                className="bg-[#19191A] rounded-lg max-w-xl w-full max-h-[95vh] overflow-y-auto"
                style={{ border: '0.5px solid white', transform: 'scale(1.1)' }}
                onClick={(e) => e.stopPropagation()}
            >

                {/* Header (No change) */}
                <div className="bg-[#19191A] p-2 relative">
                    <div className="flex items-center justify-between px-3">
                        {/* Left: College Logo */}
                        <div className="h-24 w-24 rounded flex items-center justify-center flex-shrink-0">
                            <img
                                src={(player['Pre-NBA'] === null ||
                                    player['Pre-NBA'] === undefined ||
                                    player['Pre-NBA'] === '' ||
                                    player['Pre-NBA'].toUpperCase() === 'N/A')
                                    ? `/nbateam_logos/NBA-Combine.png`
                                    : `/prenba_logos/${player['Pre-NBA']}.png`
                                }
                                alt={`${(player['Pre-NBA'] === null || player['Pre-NBA'] === undefined || player['Pre-NBA'] === '') ? 'NBA Combine' : player['Pre-NBA']} logo`}
                                className="h-20 w-20 object-contain"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).onerror = null;
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    const parent = (e.target as HTMLImageElement).parentElement;
                                    if (parent) {
                                        const fallbackText = (player['Pre-NBA'] === null || player['Pre-NBA'] === undefined || player['Pre-NBA'] === '' || player['Pre-NBA'].toUpperCase() === 'N/A') ? 'N/A' : player['Pre-NBA'];
                                        parent.innerHTML = `<span class="text-xs font-bold text-gray-300 p-1 text-center">${fallbackText}</span>`;
                                    }
                                }}
                            />
                        </div>

                        {/* Center: Player Name and Details */}
                        <div className="flex-1 mx-3 text-center pt-3" style={{ minWidth: 0 }}>
                            <h2 className="text-4xl font-bold text-white mb-2 tracking-wide" style={{
                                fontFamily: 'Barlow, system-ui, -apple-system, sans-serif',
                                lineHeight: '1.1',
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word',
                                hyphens: 'auto'
                            }}>
                                {getDisplayName(player.Player).toUpperCase()}
                            </h2>
                            <div className="text-base text-sm text-gray-300 font-medium flex items-center justify-center flex-wrap gap-2">
                                <div className="flex items-center gap-3">
                                    <span>{player['Pre-NBA'] || 'N/A'}</span>
                                    <div className="h-4 w-px bg-[#33383F]"></div>
                                    <span className="font-semibold">{player['Default Position']}</span>
                                    <div className="h-4 w-px bg-[#33383F]"></div>
                                    <span>{player['Draft Year']}</span>
                                </div>
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
                <div className="p-1 px-6" ref={contentRef}>
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
                                    {formatNumber(player['Combine Score'])}
                                </span>
                            </div>

                            {/* Progress Bar (now centered within max-w-md) */}
                            <div className="relative h-1 bg-[#33383F] rounded-full overflow-hidden">
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
                                                {formatNumber(player['Physical Score'])}
                                            </span>
                                        </div>
                                        <div className="relative h-1 bg-[#33383F] rounded-full overflow-hidden">
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
                                                    {formatMeasurement(player['Height w/o Shoes'])}
                                                </span>
                                            </div>
                                            <span className="text-gray-400 text-xs">
                                                {formatNumber(player['Height (in.)_Percentile'])}
                                            </span>
                                        </div>
                                        <div className="relative h-1 bg-[#33383F] rounded-full overflow-hidden">
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
                                                    {formatMeasurement(player['Wingspan'])}
                                                </span>
                                            </div>
                                            <span className="text-gray-400 text-xs">
                                                {formatNumber(player['Wingspan (in.)_Percentile'])}
                                            </span>
                                        </div>
                                        <div className="relative h-1 bg-[#33383F] rounded-full overflow-hidden">
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
                                                    {formatMeasurement(player['Standing Reach'])}
                                                </span>
                                            </div>
                                            <span className="text-gray-400 text-xs">
                                                {formatNumber(player['Standing Reach (in.)_Percentile'])}
                                            </span>
                                        </div>
                                        <div className="relative h-1 bg-[#33383F] rounded-full overflow-hidden">
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
                                                    Weight (lbs) -
                                                </span>
                                                <span className="text-gray-400 text-xs">
                                                    {formatMeasurement(player['Weight (lbs)'])}
                                                </span>
                                            </div>
                                            <span className="text-gray-400 text-xs">
                                                {formatNumber(player['Weight (lbs)_Percentile'])}
                                            </span>
                                        </div>
                                        <div className="relative h-1 bg-[#33383F] rounded-full overflow-hidden">
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
                                                    Hand Length (in) -
                                                </span>
                                                <span className="text-gray-400 text-xs">
                                                    {formatMeasurement(player['Hand Length (in.)'])}
                                                </span>
                                            </div>
                                            <span className="text-gray-400 text-xs">
                                                {formatNumber(player['Hand Length (in.)_Percentile'])}
                                            </span>
                                        </div>
                                        <div className="relative h-1 bg-[#33383F] rounded-full overflow-hidden">
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
                                                    Hand Width (in) -
                                                </span>
                                                <span className="text-gray-400 text-xs">
                                                    {formatMeasurement(player['Hand Width (in.)'])}
                                                </span>
                                            </div>
                                            <span className="text-gray-400 text-xs">
                                                {formatNumber(player['Hand Width (in.)_Percentile'])}
                                            </span>
                                        </div>
                                        <div className="relative h-1 bg-[#33383F] rounded-full overflow-hidden">
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
                                                {formatNumber(player['Vertical Score'])}
                                            </span>
                                        </div>
                                        <div className="relative h-1 bg-[#33383F] rounded-full overflow-hidden">
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
                                                    {formatMeasurement(player['Max Vertical'])}
                                                </span>
                                            </div>
                                            <span className="text-gray-400 text-xs">
                                                {formatNumber(player['Max Vertical_Percentile'])}
                                            </span>
                                        </div>
                                        <div className="relative h-1 bg-[#33383F] rounded-full overflow-hidden">
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
                                                    {formatMeasurement(player['Standing Vertical'])}
                                                </span>
                                            </div>
                                            <span className="text-gray-400 text-xs">
                                                {formatNumber(player['Standing Vertical_Percentile'])}
                                            </span>
                                        </div>
                                        <div className="relative h-1 bg-[#33383F] rounded-full overflow-hidden">
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
                                                {formatNumber(player['Agility Score'])}
                                            </span>
                                        </div>
                                        <div className="relative h-1 bg-[#33383F] rounded-full overflow-hidden">
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
                                                    {formatMeasurement(player['Lane Agility Time'])}
                                                </span>
                                            </div>
                                            <span className="text-gray-400 text-xs">
                                                {formatNumber(player['Lane Agility Time_Percentile'])}
                                            </span>
                                        </div>
                                        <div className="relative h-1 bg-[#33383F] rounded-full overflow-hidden">
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
                                                    {formatMeasurement(player['Three Quarter Sprint'])}
                                                </span>
                                            </div>
                                            <span className="text-gray-400 text-xs">
                                                {formatNumber(player['Three Quarter Sprint_Percentile'])}
                                            </span>
                                        </div>
                                        <div className="relative h-1 bg-[#33383F] rounded-full overflow-hidden">
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
                                                    {formatMeasurement(player['Shuttle Run'])}
                                                </span>
                                            </div>
                                            <span className="text-gray-400 text-xs">
                                                {formatNumber(player['Shuttle Run_Percentile'])}
                                            </span>
                                        </div>
                                        <div className="relative h-1 bg-[#33383F] rounded-full overflow-hidden">
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
                    {/* Footer */}
                    <div className="flex justify-center pb-3">
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span>NBA Combine Score</span>
                            <div className="h-3 w-px bg-[#33383F]"></div>
                            <span className="font-semibold">TPM</span>
                            <div className="h-3 w-px bg-[#33383F]"></div>
                            <span>tawnyparkmetrics.com</span>
                            <div className="h-3 w-px bg-[#33383F]"></div>
                            <span>@supersayansavin</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function CombineScorePage() {
    const [pulsingCells, setPulsingCells] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [selectedYear, setSelectedYear] = useState('2025');
    const [selectedPosition, setSelectedPosition] = useState('PG-C');
    const [selectedGrouping, setSelectedGrouping] = useState<'none' | 'guards' | 'wings' | 'bigs'>('none');
    const [showUniversalSearch, setShowUniversalSearch] = useState(false);
    const universalSearchRef = useRef<HTMLDivElement>(null);
    const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
    const [isMobileYearDropdownOpen, setIsMobileYearDropdownOpen] = useState(false);
    const [isPositionDropdownOpen, setIsPositionDropdownOpen] = useState(false);
    const [tablePositionDropdowns, setTablePositionDropdowns] = useState<{ [key: string]: boolean }>({}); // Add this new one for table rows
    const [combineData, setCombineData] = useState<CombinePlayer[]>([]);
    const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({
        key: 'Player',
        direction: 'asc'
    });
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPlayer, setSelectedPlayer] = useState<CombinePlayer | null>(null);
    const [selectedPositions, setSelectedPositions] = useState<{ [playerName: string]: string }>({});
    const [expandedRows, setExpandedRows] = useState<{ [playerName: string]: boolean }>({});
    const [isPercentileMode, setIsPercentileMode] = useState(false);
    const yearDropdownRef = useRef<HTMLDivElement>(null);
    const positionDropdownRef = useRef<HTMLDivElement>(null);
    const mobileYearDropdownRef = useRef<HTMLDivElement>(null);


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



    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target as Node)) {
                setIsYearDropdownOpen(false);
            }
            if (positionDropdownRef.current && !positionDropdownRef.current.contains(event.target as Node)) {
                setIsPositionDropdownOpen(false);
            }
            if (mobileYearDropdownRef.current && !mobileYearDropdownRef.current.contains(event.target as Node)) {
                setIsMobileYearDropdownOpen(false);
            }
            if (universalSearchRef.current && !universalSearchRef.current.contains(event.target as Node)) {
                setShowUniversalSearch(false);
            }

            // Close position dropdowns in table when clicking outside
            const target = event.target as HTMLElement;
            if (!target.closest('td')) {
                setTablePositionDropdowns({}); // Updated to use new state name
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const filteredAndSortedData = useMemo(() => {
        let filtered = combineData.filter(player => {
            const playerYear = player['Draft Year'];
            return playerYear?.toString() === selectedYear;
        });

        if (selectedGrouping !== 'none') {
            // Group players by name
            const playerGroups = filtered.reduce((acc, player) => {
                const name = player['Player'];
                if (!acc[name]) {
                    acc[name] = [];
                }
                acc[name].push(player);
                return acc;
            }, {} as { [key: string]: CombinePlayer[] });

            // Select appropriate position based on grouping
            filtered = Object.entries(playerGroups).map(([name, variations]) => {
                let selectedVariation: CombinePlayer | undefined;

                if (selectedGrouping === 'guards') {
                    // Find PG variation, fallback to primary
                    selectedVariation = variations.find(v => v['Default Position'] === 'PG');
                } else if (selectedGrouping === 'wings') {
                    // Find SF variation, fallback to primary
                    selectedVariation = variations.find(v => v['Default Position'] === 'SF');
                } else if (selectedGrouping === 'bigs') {
                    // Find C variation, fallback to primary
                    selectedVariation = variations.find(v => v['Default Position'] === 'C');
                }

                // If no matching variation found, use primary
                return selectedVariation || variations.find(v => v['Is Primary'] === 1) || variations[0];
            }).filter(player => {
                // Only include players who have the target position
                const name = player['Player'];
                const variations = playerGroups[name];

                if (selectedGrouping === 'guards') {
                    return variations.some(v => v['Default Position'] === 'PG');
                } else if (selectedGrouping === 'wings') {
                    return variations.some(v => v['Default Position'] === 'SF');
                } else if (selectedGrouping === 'bigs') {
                    return variations.some(v => v['Default Position'] === 'C');
                }
                return true;
            });
        } else {
            // Original position filter logic when no grouping is selected
            if (selectedPosition !== 'PG-C') {
                filtered = filtered.filter(player => {
                    const defaultPos = player['Default Position'];
                    return defaultPos === selectedPosition;
                });
            }
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
        const displayDataBeforeSort = Object.entries(playerGroups).map(([name, variations]) => {
            // If grouping is active and we already selected the right position, use that
            if (selectedGrouping !== 'none') {
                return variations[0]; // Already filtered to correct position above
            }
            // Always use Is Primary = 1 for initial sorting
            return variations.find(v => v['Is Primary'] === 1) || variations[0];
        });

        // Sort based on the PRIMARY position data
        let sortedData = displayDataBeforeSort;
        if (sortConfig.key) {
            sortedData = [...displayDataBeforeSort].sort((a, b) => {
                let key = sortConfig.key as keyof CombinePlayer;

                // If percentile mode is active and we're sorting a measurement column, use percentile
                const measurementColumns = [
                    'Height (in.)',
                    'Wingspan (in.)',
                    'Standing Reach (in.)',
                    'Weight (lbs)',
                    'Max Vertical',
                    'Standing Vertical',
                    'Lane Agility Time',
                    'Three Quarter Sprint',
                    'Shuttle Run'
                ];

                if (isPercentileMode && sortConfig.key && measurementColumns.includes(sortConfig.key)) {
                    key = `${sortConfig.key}_Percentile` as keyof CombinePlayer;
                }

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

            if (selectedPos && selectedGrouping === 'none') {
                // Find the variation matching the selected Default Position
                const selected = variations.find(v => v['Default Position'] === selectedPos);
                return selected || player;
            }
            return player;
        });
    }, [combineData, selectedYear, selectedPosition, searchQuery, sortConfig, selectedPositions, selectedGrouping]);



    // Universal search across all years
    const universalSearchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];

        const query = searchQuery.toLowerCase();

        // Search across ALL years and ALL positions in combineData
        const allMatches = combineData
            .filter(p => {
                const playerName = (p['Player'] || '').toLowerCase();
                return playerName.includes(query); // Removed the Is Primary filter
            })
            .map(p => ({
                name: p['Player'],
                year: p['Draft Year'] ?? 0,
                position: p['Default Position'],
                score: p['Combine Score'],
                college: p['Pre-NBA'],
                player: p
            }))
            .sort((a, b) => {
                // Sort by year (most recent first), then by name, then by position
                const yearA = typeof a.year === 'number' ? a.year : 0;
                const yearB = typeof b.year === 'number' ? b.year : 0;

                if (yearB !== yearA) return yearB - yearA;
                if (a.name !== b.name) return a.name.localeCompare(b.name);
                return a.position.localeCompare(b.position);
            });

        // Remove duplicates (same player, same year, same position)
        const uniqueMatches = allMatches.filter((match, index, self) =>
            index === self.findIndex(m =>
                m.name === match.name &&
                m.year === match.year &&
                m.position === match.position
            )
        );

        return uniqueMatches;
    }, [searchQuery, combineData]);
    // Add the pulsing effect AFTER filteredAndSortedData is defined
    useEffect(() => {
        const triggerRandomPulse = () => {
            const visiblePlayers = filteredAndSortedData;
            if (visiblePlayers.length === 0) return;

            const randomPlayer = visiblePlayers[Math.floor(Math.random() * visiblePlayers.length)];

            const pulsableKeys = [
                'Combine Score',
                'Height (in.)_Percentile',
                'Wingspan (in.)_Percentile',
                'Standing Reach (in.)_Percentile',
                'Weight (lbs)_Percentile',
                'Max Vertical_Percentile',
                'Standing Vertical_Percentile',
                'Lane Agility Time_Percentile',
                'Three Quarter Sprint_Percentile',
                'Shuttle Run_Percentile'
            ].filter(key => randomPlayer[key] != null);

            if (pulsableKeys.length === 0) return;

            const randomKey = pulsableKeys[Math.floor(Math.random() * pulsableKeys.length)];
            const cellId = `${randomPlayer.Player}-${randomKey}`;

            setPulsingCells(prev => new Set(prev).add(cellId));

            setTimeout(() => {
                setPulsingCells(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(cellId);
                    return newSet;
                });
            }, 50000);
        };


        // Calculate total number of cells that can pulse
        const totalCells = filteredAndSortedData.reduce((count, player) => {
            const pulsableKeys = [
                'Combine Score',
                'Height (in.)_Percentile',
                'Wingspan (in.)_Percentile',
                'Standing Reach (in.)_Percentile',
                'Weight (lbs)_Percentile',
                'Max Vertical_Percentile',
                'Standing Vertical_Percentile',
                'Lane Agility Time_Percentile',
                'Three Quarter Sprint_Percentile',
                'Shuttle Run_Percentile'
            ].filter(key => player[key] != null);
            return count + pulsableKeys.length;
        }, 0);

        if (totalCells === 0) return;

        // Each cell should pulse once per minute
        // So trigger a pulse every (60 seconds / total cells) * 1000 ms
        const intervalTime = (60 * 50000) / totalCells;

        const interval = setInterval(() => {
            triggerRandomPulse();
        }, intervalTime);

        return () => {
            clearInterval(interval);
            setPulsingCells(new Set());
        };
    }, [filteredAndSortedData]);


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
        // Check if this is a measurement column
        const measurementColumns = [
            'Height (in.)',
            'Wingspan (in.)',
            'Standing Reach (in.)',
            'Weight (lbs)',
            'Max Vertical',
            'Standing Vertical',
            'Lane Agility Time',
            'Three Quarter Sprint',
            'Shuttle Run'
        ];

        const isMeasurementColumn = measurementColumns.includes(key);

        let direction: 'asc' | 'desc' = 'desc';
        if (sortConfig.key === key) {
            direction = sortConfig.direction === 'desc' ? 'asc' : 'desc';
        }

        setSortConfig({ key, direction });

        // Reset percentile mode if sorting by non-measurement column
        if (!isMeasurementColumn && key !== 'Combine Score') {
            setIsPercentileMode(false);
        }
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
        <div className="min-h-screen bg-[#19191A]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
            <style>{`
                ${pulseStyles}
                
                /* Hide scrollbars but keep functionality */
                .hide-scrollbar {
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;  /* Firefox */
                }
                
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;  /* Chrome, Safari and Opera */
                }
            `}</style>
            <NavigationHeader activeTab="Combine Score" />
            <DraftPageHeader author="Combine Score"
                selectedYear={selectedYear}
            />

            {/* Filter Section */}
            <div className="sticky top-14 z-30 bg-[#19191A] border-b border-gray-800">
                {/* Mobile Filter */}
                <div className="sm:hidden max-w-screen-2xl mx-auto px-4 py-3">
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

                        <div className="relative" ref={mobileYearDropdownRef}>
                            <motion.button
                                onClick={() => setIsMobileYearDropdownOpen(!isMobileYearDropdownOpen)}
                                className="px-2 py-2 rounded-lg text-sm font-medium bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700 flex items-center gap-1"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {selectedYear}
                                <ChevronDown className="h-4 w-4" />
                            </motion.button>

                            {isMobileYearDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-32 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                                    {years.map(year => (
                                        <button
                                            key={year}
                                            onClick={() => {
                                                setSelectedYear(year.toString());
                                                setIsMobileYearDropdownOpen(false);
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

                {/* Filter Content - Desktop */}
                <div className={`max-w-screen-xl mx-auto px-4 py-3 ${isMobileFilterOpen ? 'block' : 'hidden sm:block'}`}>
                    <div className="flex items-center gap-3 justify-between">
                        {/* Left Side - Search Bar and Reset */}
                        <div className="flex items-center gap-2 flex-1 max-w-lg">
                            {/* Search Bar with Universal Results */}
                            <div className="relative flex-1" ref={universalSearchRef}>
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                                <input
                                    type="text"
                                    placeholder="Search players across all years..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setShowUniversalSearch(true);
                                    }}
                                    onFocus={() => searchQuery.trim() && setShowUniversalSearch(true)}
                                    className="pl-10 pr-4 py-2 w-full bg-[#19191A] border border-gray-800 text-gray-300 placeholder-gray-500 rounded-lg focus:border-blue-500/30 focus:ring-1 focus:ring-blue-500/30"
                                />

                                {/* Universal Search Dropdown */}
                                {showUniversalSearch && searchQuery.trim() && universalSearchResults.length > 0 && (
                                    <div className="absolute z-50 w-full mt-2 bg-[#19191A] border border-gray-700 rounded-lg shadow-xl max-h-96 overflow-y-auto">
                                        <div className="p-2 border-b border-gray-800">
                                            <p className="text-xs text-gray-400">
                                                Found {universalSearchResults.length} player{universalSearchResults.length !== 1 ? 's' : ''} across {new Set(universalSearchResults.map(r => r.year)).size} year{new Set(universalSearchResults.map(r => r.year)).size !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                        {universalSearchResults.map((result, idx) => {
                                            const getTieredColor = (score: number | null | undefined): string => {
                                                if (score === null || score === undefined) return '#6b7280';
                                                const value = Math.max(0, Math.min(100, score));
                                                if (value >= 60) return '#79e0ff';
                                                else if (value >= 40) return '#ffbc49';
                                                else return '#ff5757';
                                            };

                                            return (
                                                <button
                                                    key={`${result.name}-${result.year}-${idx}`}
                                                    onClick={() => {
                                                        // Set the year to match the selected result
                                                        setSelectedYear(result.year.toString());
                                                        // Set the selected position for this player
                                                        setSelectedPositions(prev => ({
                                                            ...prev,
                                                            [result.name]: result.position
                                                        }));
                                                        // Clear the search query so full year shows
                                                        setSearchQuery('');
                                                        // Close the dropdown
                                                        setShowUniversalSearch(false);

                                                        // Expand the player's row and scroll to it after a brief delay
                                                        // Expand the player's row and scroll to it after a brief delay
                                                        setTimeout(() => {
                                                            // Expand the row
                                                            setExpandedRows(prev => ({
                                                                ...prev,
                                                                [result.name]: true
                                                            }));

                                                            // Scroll to the player row
                                                            const playerRow = document.querySelector(`[data-player-row="${result.name}"]`);
                                                            if (playerRow) {
                                                                playerRow.scrollIntoView({
                                                                    behavior: 'smooth',
                                                                    block: 'start' // Changed from 'center' to 'start'
                                                                });

                                                                // Additional scroll offset to push it down a bit more
                                                                setTimeout(() => {
                                                                    window.scrollBy({
                                                                        top: -150, // Negative value scrolls up, adjust this number as needed
                                                                        behavior: 'smooth'
                                                                    });
                                                                }, 100);
                                                            }
                                                        }, 150);
                                                    }}
                                                    className="w-full text-left p-3 hover:bg-gray-800 transition-colors border-b border-gray-800/50 last:border-b-0"
                                                >
                                                    <div className="flex items-center justify-between gap-3">
                                                        {/* Left side - Player info */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-white font-semibold truncate">
                                                                    {result.name}
                                                                </span>
                                                                <span className="text-xs text-gray-400 whitespace-nowrap">
                                                                    ({result.year})
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                                <span className="font-medium">{result.position}</span>
                                                                {result.college && result.college !== 'N/A' && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span className="truncate">{result.college}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Right side - Combine Score */}
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-xs text-gray-500 mb-0.5">Combine</span>
                                                            <span
                                                                className="text-lg font-bold"
                                                                style={{ color: getTieredColor(result.score) }}
                                                            >
                                                                {result.score != null ? result.score.toFixed(1) : 'N/A'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* No results message */}
                                {showUniversalSearch && searchQuery.trim() && universalSearchResults.length === 0 && (
                                    <div className="absolute z-50 w-full mt-2 bg-[#19191A] border border-gray-700 rounded-lg shadow-xl p-4">
                                        <p className="text-sm text-gray-400 text-center">
                                            No players found matching "{searchQuery}"
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Reset Button */}
                            <motion.button
                                onClick={() => {
                                    setSelectedGrouping('none');
                                    setSelectedPosition('PG-C');
                                    setSearchQuery('');
                                    setSortConfig({ key: 'Player', direction: 'asc' }); // Add this line
                                    setIsPercentileMode(false); // Add this line
                                }}
                                className="px-3 py-2 rounded-lg text-sm font-medium bg-[#19191A] text-gray-500 border border-gray-800 hover:text-red-400 hover:border-red-700 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Reset
                            </motion.button>
                        </div>

                        {/* Right Side - All Filter Buttons */}
                        <div className="flex items-center gap-2">
                            {/* Grouping Buttons */}
                            <motion.button
                                onClick={() => {
                                    setSelectedGrouping(selectedGrouping === 'guards' ? 'none' : 'guards');
                                    setSelectedPosition('PG-C');
                                }}
                                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors w-20 ${selectedGrouping === 'guards'
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    : 'bg-[#19191A] text-gray-400 border-gray-800 hover:border-gray-700'
                                    }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Guards
                            </motion.button>
                            <motion.button
                                onClick={() => {
                                    setSelectedGrouping(selectedGrouping === 'wings' ? 'none' : 'wings');
                                    setSelectedPosition('PG-C');
                                }}
                                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors w-20 ${selectedGrouping === 'wings'
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    : 'bg-[#19191A] text-gray-400 border-gray-800 hover:border-gray-700'
                                    }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Wings
                            </motion.button>
                            <motion.button
                                onClick={() => {
                                    setSelectedGrouping(selectedGrouping === 'bigs' ? 'none' : 'bigs');
                                    setSelectedPosition('PG-C');
                                }}
                                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors w-20 ${selectedGrouping === 'bigs'
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    : 'bg-[#19191A] text-gray-400 border-gray-800 hover:border-gray-700'
                                    }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Bigs
                            </motion.button>

                            {/* Divider */}
                            <div className="h-8 w-px bg-gray-700 mx-1"></div>

                            {/* Position Filter */}
                            <div className="relative" ref={positionDropdownRef}>
                                <motion.button
                                    onClick={() => selectedGrouping === 'none' && setIsPositionDropdownOpen(!isPositionDropdownOpen)}
                                    disabled={selectedGrouping !== 'none'}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium border whitespace-nowrap z-50 flex items-center justify-between gap-2 ${selectedGrouping !== 'none'
                                        ? 'bg-gray-800/50 text-gray-600 border-gray-800 cursor-not-allowed'
                                        : 'bg-[#19191A] text-gray-400 border-gray-800 hover:border-gray-700'
                                        }`}
                                >
                                    <span>{selectedPosition}</span>
                                    <ChevronDown className="h-4 w-4" />
                                </motion.button>

                                {isPositionDropdownOpen && selectedGrouping === 'none' && (
                                    <div className="absolute right-0 mt-2 w-40 bg-[#19191A] border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto z-30">
                                        {positions.map(position => (
                                            <button
                                                key={position}
                                                onClick={() => {
                                                    setSelectedPosition(position);
                                                    setIsPositionDropdownOpen(false);
                                                }}
                                                className={`w-full z-30 text-left px-4 py-2 text-sm hover:bg-gray-700 ${selectedPosition === position ? 'bg-gray-700 text-white' : 'text-gray-300'
                                                    }`}
                                            >
                                                {position}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Divider */}
                            <div className="h-8 w-px bg-gray-700 mx-1"></div>

                            {/* Year Filter */}
                            <div className="relative" ref={yearDropdownRef}>
                                <motion.button
                                    onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                                    className="px-3 py-2 rounded-lg text-sm font-medium bg-[#19191A] text-gray-400 border border-gray-800 hover:border-gray-700 flex items-center justify-between gap-2"
                                >
                                    <span>{selectedYear}</span>
                                    <ChevronDown className="h-4 w-4" />
                                </motion.button>

                                {isYearDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-32 bg-[#19191A] border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
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
            </div>

            {/* Main Content */}
            <div className="max-w-screen-xl mx-auto px-4 py-6">
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
                        <div className="mb-4 text-gray-400 text-sm flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Click player's Combine Score for detailed card
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    Click player name for comparison graphs
                                </span>
                            </div>


                            {/* Percentile/Measurement Toggle Switcher */}
                            <div className="flex items-center overflow-hidden">
                                {/* Ruler (Measurement) Button */}
                                <motion.button
                                    onClick={() => {
                                        if (sortConfig.key && [
                                            'Height (in.)',
                                            'Wingspan (in.)',
                                            'Standing Reach (in.)',
                                            'Weight (lbs)',
                                            'Max Vertical',
                                            'Standing Vertical',
                                            'Lane Agility Time',
                                            'Three Quarter Sprint',
                                            'Shuttle Run',
                                            'Combine Score'
                                        ].includes(sortConfig.key)) {
                                            if (isPercentileMode) {
                                                setIsPercentileMode(false);
                                                // Force re-sort by updating the config
                                                setSortConfig(prev => ({ ...prev }));
                                            }
                                        }
                                    }}
                                    className={`px-3 py-1.5 transition-colors ${!isPercentileMode && sortConfig.key && [
                                        'Height (in.)',
                                        'Wingspan (in.)',
                                        'Standing Reach (in.)',
                                        'Weight (lbs)',
                                        'Max Vertical',
                                        'Standing Vertical',
                                        'Lane Agility Time',
                                        'Three Quarter Sprint',
                                        'Shuttle Run',
                                        'Combine Score'
                                    ].includes(sortConfig.key)
                                        ? 'text-blue-400'
                                        : sortConfig.key && [
                                            'Height (in.)',
                                            'Wingspan (in.)',
                                            'Standing Reach (in.)',
                                            'Weight (lbs)',
                                            'Max Vertical',
                                            'Standing Vertical',
                                            'Lane Agility Time',
                                            'Three Quarter Sprint',
                                            'Shuttle Run',
                                            'Combine Score'
                                        ].includes(sortConfig.key)
                                            ? 'text-gray-400 hover:text-gray-300'
                                            : 'text-gray-600 opacity-50 cursor-default'
                                        }`}
                                    disabled={!sortConfig.key || ![
                                        'Height (in.)',
                                        'Wingspan (in.)',
                                        'Standing Reach (in.)',
                                        'Weight (lbs)',
                                        'Max Vertical',
                                        'Standing Vertical',
                                        'Lane Agility Time',
                                        'Three Quarter Sprint',
                                        'Shuttle Run',
                                        'Combine Score'
                                    ].includes(sortConfig.key)}
                                >
                                    <Ruler className="h-4 w-4" />
                                </motion.button>

                                {/* Divider */}
                                <div className="h-6 w-px bg-gray-700"></div>

                                {/* Percent (Percentile) Button */}
                                <motion.button
                                    onClick={() => {
                                        if (sortConfig.key && [
                                            'Height (in.)',
                                            'Wingspan (in.)',
                                            'Standing Reach (in.)',
                                            'Weight (lbs)',
                                            'Max Vertical',
                                            'Standing Vertical',
                                            'Lane Agility Time',
                                            'Three Quarter Sprint',
                                            'Shuttle Run',
                                            'Combine Score'
                                        ].includes(sortConfig.key)) {
                                            if (!isPercentileMode) {
                                                setIsPercentileMode(true);
                                                // Force re-sort by updating the config
                                                setSortConfig(prev => ({ ...prev }));
                                            }
                                        }
                                    }}
                                    className={`px-3 py-1.5 text-sm transition-colors ${isPercentileMode
                                        ? 'text-blue-400'
                                        : sortConfig.key && [
                                            'Height (in.)',
                                            'Wingspan (in.)',
                                            'Standing Reach (in.)',
                                            'Weight (lbs)',
                                            'Max Vertical',
                                            'Standing Vertical',
                                            'Lane Agility Time',
                                            'Three Quarter Sprint',
                                            'Shuttle Run',
                                            'Combine Score'
                                        ].includes(sortConfig.key)
                                            ? 'text-gray-400 hover:text-gray-300'
                                            : 'text-gray-600 opacity-50 cursor-default'
                                        }`}
                                    disabled={!sortConfig.key || ![
                                        'Height (in.)',
                                        'Wingspan (in.)',
                                        'Standing Reach (in.)',
                                        'Weight (lbs)',
                                        'Max Vertical',
                                        'Standing Vertical',
                                        'Lane Agility Time',
                                        'Three Quarter Sprint',
                                        'Shuttle Run',
                                        'Combine Score'
                                    ].includes(sortConfig.key)}
                                >
                                    %
                                </motion.button>
                            </div>
                        </div>


                        {/* Enhanced Table with Component Scores */}
                        <div className="bg-[#19191A] rounded-lg overflow-hidden relative">
                            <div className="overflow-x-auto max-h-[calc(100vh-280px)] overflow-y-auto hide-scrollbar">
                                <table className="w-full text-sm">
                                    <thead className="bg-[#19191A]">
                                        <tr>
                                            <th className="sticky left-0 z-20 bg-[#19191A] text-left px-4 py-3 text-xs font-semibold text-gray-300 cursor-pointer hover:bg-[#2a2a2b] whitespace-nowrap" style={{ minWidth: '192px', width: '192px', maxWidth: '192px' }} onClick={() => handleSort('Player')}>
                                                <div className="flex items-center gap-1">Player <SortIcon columnKey="Player" /></div>
                                            </th>
                                            <th className="sticky left-[192px] z-20 bg-[#19191A] text-left px-2 py-3 text-xs font-semibold text-gray-300 cursor-pointer hover:bg-[#2a2a2b] whitespace-nowrap" style={{ minWidth: '80px', width: '80px', maxWidth: '80px' }} onClick={() => handleSort('Default Position')}>
                                                <div className="flex items-center gap-1">Pos <SortIcon columnKey="Default Position" /></div>
                                            </th>
                                            <th className="text-center px-3 py-3 text-xs font-semibold bg-[#1c1c1d] text-gray-300 cursor-pointer hover:bg-[#2a2a2b] whitespace-nowrap w-24" onClick={() => handleSort('Combine Score')}>
                                                <div className="flex items-center justify-center gap-1">Combine <SortIcon columnKey="Combine Score" /></div>
                                            </th>
                                            <th className="text-center px-2 py-3 text-xs font-semibold text-gray-300 cursor-pointer hover:bg-[#2a2a2b] whitespace-nowrap w-24" onClick={() => handleSort('Height (in.)')}>
                                                <div className="flex items-center justify-center gap-1">Height <SortIcon columnKey="Height (in.)" /></div>
                                            </th>
                                            <th className="text-center px-2 py-3 text-xs font-semibold text-gray-300 cursor-pointer hover:bg-[#2a2a2b] whitespace-nowrap w-24" onClick={() => handleSort('Wingspan (in.)')}>
                                                <div className="flex items-center justify-center gap-1">Wingspan <SortIcon columnKey="Wingspan (in.)" /></div>
                                            </th>
                                            <th className="text-center px-2 py-3 text-xs font-semibold text-gray-300 cursor-pointer hover:bg-[#2a2a2b] whitespace-nowrap w-24" onClick={() => handleSort('Standing Reach (in.)')}>
                                                <div className="flex items-center justify-center gap-1">Reach <SortIcon columnKey="Standing Reach (in.)" /></div>
                                            </th>
                                            <th className="text-center px-2 py-3 text-xs font-semibold text-gray-300 cursor-pointer hover:bg-[#2a2a2b] whitespace-nowrap w-24" onClick={() => handleSort('Weight (lbs)')}>
                                                <div className="flex items-center justify-center gap-1">Weight <SortIcon columnKey="Weight (lbs)" /></div>
                                            </th>
                                            <th className="text-center px-3 py-3 text-xs font-semibold bg-[#1c1c1d] text-gray-300 cursor-pointer hover:bg-[#2a2a2b] whitespace-nowrap w-24" onClick={() => handleSort('Physical Score')}>
                                                <div className="flex items-center justify-center gap-1">Physical <SortIcon columnKey="Physical Score" /></div>
                                            </th>
                                            <th className="text-center px-2 py-3 text-xs font-semibold text-gray-300 cursor-pointer hover:bg-[#2a2a2b] whitespace-nowrap w-24" onClick={() => handleSort('Max Vertical')}>
                                                <div className="flex items-center justify-center gap-1">Max Vert <SortIcon columnKey="Max Vertical" /></div>
                                            </th>
                                            <th className="text-center px-2 py-3 text-xs font-semibold text-gray-300 cursor-pointer hover:bg-[#2a2a2b] whitespace-nowrap w-24" onClick={() => handleSort('Standing Vertical')}>
                                                <div className="flex items-center justify-center gap-1">Standing Vert <SortIcon columnKey="Standing Vertical" /></div>
                                            </th>
                                            <th className="text-center px-3 py-3 text-xs font-semibold bg-[#1c1c1d] text-gray-300 cursor-pointer hover:bg-[#2a2a2b] whitespace-nowrap w-24" onClick={() => handleSort('Vertical Score')}>
                                                <div className="flex items-center justify-center gap-1">Vertical <SortIcon columnKey="Vertical Score" /></div>
                                            </th>
                                            <th className="text-center px-2 py-3 text-xs font-semibold text-gray-300 cursor-pointer hover:bg-[#2a2a2b] whitespace-nowrap w-24" onClick={() => handleSort('Lane Agility Time')}>
                                                <div className="flex items-center justify-center gap-1">Lane Agility <SortIcon columnKey="Lane Agility Time" /></div>
                                            </th>
                                            <th className="text-center px-2 py-3 text-xs font-semibold text-gray-300 cursor-pointer hover:bg-[#2a2a2b] whitespace-nowrap w-24" onClick={() => handleSort('Three Quarter Sprint')}>
                                                <div className="flex items-center justify-center gap-1">3/4 Agility <SortIcon columnKey="Three Quarter Sprint" /></div>
                                            </th>
                                            <th className="text-center px-2 py-3 text-xs font-semibold text-gray-300 cursor-pointer hover:bg-[#2a2a2b] whitespace-nowrap w-24" onClick={() => handleSort('Shuttle Run')}>
                                                <div className="flex items-center justify-center gap-1">Shuttle Run <SortIcon columnKey="Shuttle Run" /></div>
                                            </th>
                                            <th className="text-center px-3 py-3 text-xs font-semibold bg-[#1c1c1d] text-gray-300 cursor-pointer hover:bg-[#2a2a2b] whitespace-nowrap w-24" onClick={() => handleSort('Agility Score')}>
                                                <div className="flex items-center justify-center gap-1">Agility <SortIcon columnKey="Agility Score" /></div>
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
                                                    <tr
                                                        className="group border-b border-white/5 transition-colors"
                                                        data-player-row={player.Player}
                                                    >
                                                        <td className="sticky left-0 bg-[#19191A] hover:brightness-125 px-4 py-3 text-white font-medium" style={{ minWidth: '192px', width: '192px', maxWidth: '192px', zIndex: 11 }}>
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
                                                                <span
                                                                    className="cursor-pointer truncate"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        toggleRowExpansion(player.Player);
                                                                    }}
                                                                >
                                                                    {player.Player}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="sticky left-[192px] bg-[#19191A] px-4 py-3" style={{ minWidth: '80px', width: '80px', maxWidth: '80px', zIndex: tablePositionDropdowns[player.Player] ? 100 : 11 }}>
                                                            {selectedGrouping === 'none' ? (
                                                                <div className="relative">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setTablePositionDropdowns(prev => {
                                                                                const isCurrentlyOpen = prev[player.Player];
                                                                                // Close all dropdowns first
                                                                                const allClosed: { [key: string]: boolean } = {};
                                                                                // Then open only this one if it wasn't already open
                                                                                if (!isCurrentlyOpen) {
                                                                                    allClosed[player.Player] = true;
                                                                                }
                                                                                return allClosed;
                                                                            });
                                                                        }}
                                                                        className="bg-transparent text-gray-300 text-sm cursor-pointer hover:text-white transition-colors flex items-center gap-1"
                                                                    >
                                                                        {currentPosition}
                                                                        <ChevronDown className="h-3 w-3" />
                                                                    </button>
                                                                    {tablePositionDropdowns[player.Player] && (
                                                                        <div
                                                                            className="absolute left-0 mt-1 w-20 bg-[#19191A] border border-gray-700 rounded-lg shadow-lg overflow-hidden"
                                                                            style={{
                                                                                minWidth: '5.5rem',
                                                                                zIndex: 1000
                                                                            }}
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        >
                                                                            {variations.map((variation, idx) => (
                                                                                <button
                                                                                    key={idx}
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setSelectedPositions(prev => ({
                                                                                            ...prev,
                                                                                            [player.Player]: variation['Default Position']
                                                                                        }));
                                                                                        setTablePositionDropdowns(prev => ({
                                                                                            ...prev,
                                                                                            [player.Player]: false
                                                                                        }));
                                                                                    }}
                                                                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-700 transition-colors ${currentPosition === variation['Default Position']
                                                                                        ? 'bg-gray-700 text-white'
                                                                                        : 'text-gray-300'
                                                                                        }`}
                                                                                >
                                                                                    {variation['Default Position']}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-500 text-sm cursor-not-allowed">
                                                                    {currentPosition}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td
                                                            className="px-3 py-3 text-center cursor-pointer bg-[#1c1c1d] hover:brightness-125 hover:text-white transition-colors"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedPlayer(player);
                                                            }}
                                                        >
                                                            <span
                                                                className={`text-m font-bold ${pulsingCells.has(`${player.Player}-Combine Score`) ? 'pulse-active' : ''}`}
                                                                style={{
                                                                    color: player['Combine Score'] != null ? getTieredColor(player['Combine Score']) : '#6b7280',
                                                                }}
                                                            >
                                                                {player['Combine Score'] != null ? player['Combine Score'].toFixed(1) : '-'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            {!player['Height w/o Shoes'] && !player['Height (in.)_Percentile'] ? (
                                                                <span className="text-gray-500">-</span>
                                                            ) : (
                                                                <div className="flex flex-col items-center gap-0.5">
                                                                    <span className="text-white font-medium">{player['Height w/o Shoes'] || '-'}</span>
                                                                    <span
                                                                        className={`text-xs font-medium ${pulsingCells.has(`${player.Player}-Height (in.)_Percentile`) ? 'pulse-active' : ''}`}
                                                                        style={{
                                                                            color: getTieredColor(player['Height (in.)_Percentile'])
                                                                        }}
                                                                    >
                                                                        {player['Height (in.)_Percentile']?.toFixed(0) || '-'}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            {!player['Standing Reach'] && !player['Standing Reach (in.)_Percentile'] ? (
                                                                <span className="text-gray-500">-</span>
                                                            ) : (
                                                                <div className="flex flex-col items-center gap-0.5">
                                                                    <span className="text-white font-medium">{player['Standing Reach'] || '-'}</span>
                                                                    <span
                                                                        className={`text-xs font-medium ${pulsingCells.has(`${player.Player}-Standing Reach (in.)_Percentile`) ? 'pulse-active' : ''}`}
                                                                        style={{
                                                                            color: getTieredColor(player['Standing Reach (in.)_Percentile'])
                                                                        }}
                                                                    >
                                                                        {player['Standing Reach (in.)_Percentile']?.toFixed(0) || '-'}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            {!player['Weight (lbs)'] && !player['Weight (lbs)_Percentile'] ? (
                                                                <span className="text-gray-500">-</span>
                                                            ) : (
                                                                <div className="flex flex-col items-center gap-0.5">
                                                                    <span className="text-white font-medium">{player['Weight (lbs)'] || '-'}</span>
                                                                    <span
                                                                        className={`text-xs font-medium ${pulsingCells.has(`${player.Player}-Weight (lbs)_Percentile`) ? 'pulse-active' : ''}`}
                                                                        style={{
                                                                            color: getTieredColor(player['Weight (lbs)_Percentile'])
                                                                        }}
                                                                    >
                                                                        {player['Weight (lbs)_Percentile']?.toFixed(0) || '-'}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            {!player['Weight (lbs)'] && !player['Weight (lbs)_Percentile'] ? (
                                                                <span className="text-gray-500">-</span>
                                                            ) : (
                                                                <div className="flex flex-col items-center gap-0.5">
                                                                    <span className="text-white font-medium">{player['Weight (lbs)'] || '-'}</span>
                                                                    <span
                                                                        className={`text-xs font-medium ${pulsingCells.has(`${player.Player}-Weight (lbs)_Percentile`) ? 'pulse-active' : ''}`}
                                                                        style={{
                                                                            color: getTieredColor(player['Weight (lbs)_Percentile'])
                                                                        }}
                                                                    >
                                                                        {player['Weight (lbs)_Percentile']?.toFixed(0) || '-'}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-3 text-center bg-[#1c1c1d] transition-color">
                                                            <span
                                                                className={`text-m font-bold ${pulsingCells.has(`${player.Player}-Physical Score`) ? 'pulse-active' : ''}`}
                                                                style={{
                                                                    color: player['Physical Score'] != null ? getTieredColor(player['Physical Score']) : '#6b7280',
                                                                }}
                                                            >
                                                                {player['Physical Score'] != null ? player['Physical Score'].toFixed(1) : '-'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            {!player['Max Vertical'] && !player['Max Vertical_Percentile'] ? (
                                                                <span className="text-gray-500">-</span>
                                                            ) : (
                                                                <div className="flex flex-col items-center gap-0.5">
                                                                    <span className="text-white font-medium">{player['Max Vertical'] || '-'}</span>
                                                                    <span
                                                                        className={`text-xs font-medium ${pulsingCells.has(`${player.Player}-Max Vertical_Percentile`) ? 'pulse-active' : ''}`}
                                                                        style={{
                                                                            color: getTieredColor(player['Max Vertical_Percentile'])
                                                                        }}
                                                                    >
                                                                        {player['Max Vertical_Percentile']?.toFixed(0) || '-'}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            {!player['Standing Vertical'] && !player['Standing Vertical_Percentile'] ? (
                                                                <span className="text-gray-500">-</span>
                                                            ) : (
                                                                <div className="flex flex-col items-center gap-0.5">
                                                                    <span className="text-white font-medium">{player['Standing Vertical'] || '-'}</span>
                                                                    <span
                                                                        className={`text-xs font-medium ${pulsingCells.has(`${player.Player}-Standing Vertical_Percentile`) ? 'pulse-active' : ''}`}
                                                                        style={{
                                                                            color: getTieredColor(player['Standing Vertical_Percentile'])
                                                                        }}
                                                                    >
                                                                        {player['Standing Vertical_Percentile']?.toFixed(0) || '-'}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-3 text-center bg-[#1c1c1d] transition-color">
                                                            <span
                                                                className={`text-m font-bold ${pulsingCells.has(`${player.Player}-Vertical Score`) ? 'pulse-active' : ''}`}
                                                                style={{
                                                                    color: player['Vertical Score'] != null ? getTieredColor(player['Vertical Score']) : '#6b7280',
                                                                }}
                                                            >
                                                                {player['Vertical Score'] != null ? player['Vertical Score'].toFixed(1) : '-'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            {!player['Lane Agility Time'] && !player['Lane Agility Time_Percentile'] ? (
                                                                <span className="text-gray-500">-</span>
                                                            ) : (
                                                                <div className="flex flex-col items-center gap-0.5">
                                                                    <span className="text-white font-medium">{player['Lane Agility Time']?.toFixed(2) || '-'}</span>
                                                                    <span
                                                                        className={`text-xs font-medium ${pulsingCells.has(`${player.Player}-Lane Agility Time_Percentile`) ? 'pulse-active' : ''}`}
                                                                        style={{
                                                                            color: getTieredColor(player['Lane Agility Time_Percentile'])
                                                                        }}
                                                                    >
                                                                        {player['Lane Agility Time_Percentile']?.toFixed(0) || '-'}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            {!player['Three Quarter Sprint'] && !player['Three Quarter Sprint_Percentile'] ? (
                                                                <span className="text-gray-500">-</span>
                                                            ) : (
                                                                <div className="flex flex-col items-center gap-0.5">
                                                                    <span className="text-white font-medium">{player['Three Quarter Sprint']?.toFixed(2) || '-'}</span>
                                                                    <span
                                                                        className={`text-xs font-medium ${pulsingCells.has(`${player.Player}-Three Quarter Sprint_Percentile`) ? 'pulse-active' : ''}`}
                                                                        style={{
                                                                            color: getTieredColor(player['Three Quarter Sprint_Percentile'])
                                                                        }}
                                                                    >
                                                                        {player['Three Quarter Sprint_Percentile']?.toFixed(0) || '-'}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            {!player['Shuttle Run'] && !player['Shuttle Run_Percentile'] ? (
                                                                <span className="text-gray-500">-</span>
                                                            ) : (
                                                                <div className="flex flex-col items-center gap-0.5">
                                                                    <span className="text-white font-medium">{player['Shuttle Run']?.toFixed(2) || '-'}</span>
                                                                    <span
                                                                        className={`text-xs font-medium ${pulsingCells.has(`${player.Player}-Shuttle Run_Percentile`) ? 'pulse-active' : ''}`}
                                                                        style={{
                                                                            color: getTieredColor(player['Shuttle Run_Percentile'])
                                                                        }}
                                                                    >
                                                                        {player['Shuttle Run_Percentile']?.toFixed(0) || '-'}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-3 text-center bg-[#1c1c1d] transition-color">
                                                            <span
                                                                className={`text-m font-bold ${pulsingCells.has(`${player.Player}-Agility Score`) ? 'pulse-active' : ''}`}
                                                                style={{
                                                                    color: player['Agility Score'] != null ? getTieredColor(player['Agility Score']) : '#6b7280',
                                                                }}
                                                            >
                                                                {player['Agility Score'] != null ? player['Agility Score'].toFixed(1) : '-'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                    {isExpanded && (
                                                        <tr className="bg-gray-800/20 border-b border-white/5">
                                                            <td colSpan={15} className="px-6 py-8">
                                                                <PlayerComparison
                                                                    player={(() => {
                                                                        const selectedPos = selectedPositions[player.Player];
                                                                        if (selectedPos && selectedGrouping === 'none') {
                                                                            const variations = getPlayerVariations(player.Player);
                                                                            const selected = variations.find(v => v['Default Position'] === selectedPos);
                                                                            return selected || player;
                                                                        }
                                                                        return player;
                                                                    })()}
                                                                    allData={combineData}
                                                                />
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