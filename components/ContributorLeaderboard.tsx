import React, { useState, useMemo, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface LeaderboardEntry {
    [key: string]: any;
}

export interface LeaderboardTableProps {
    leaderboardData: LeaderboardEntry[];
    consensusFilter: 'lottery' | 'top30' | 'top60';
    searchQuery?: string;
    className?: string;
}

const MEDIA_LOGOS: Record<string, string> = {
    'x.com': 'x.com',
    'twitter.com': 'x.com',
    'youtube.com': 'youtube.com',
    'reddit.com': 'reddit.com',
    'yahoo.com': 'yahoo.com',
    'bsky.app': 'bsky.app',
    'cbssports.com': 'cbssports.com',
    'espn': 'espn',
    'fansided.com': 'fansided.com',
    'noceilingsnba.com': 'noceilingsnba.com',
    'nytimes.com': 'nytimes.com',
    'on3.com': 'on3.com',
    'si.com': 'si.com',
    'tawnyparkmetrics.com': 'tawnyparkmetrics.com',
    'the-center-hub.com': 'the-center-hub.com',
    'theanalyst.com': 'theanalyst.com',
    'theringer.com': 'theringer.com',
    'bleacherreport.com': 'bleacherreport.com',
};

export function LeaderboardTable({
    leaderboardData,
    consensusFilter,
    searchQuery = '',
    className = '',
}: LeaderboardTableProps) {
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);

    // Auto-sort by Rank column in ascending order on mount (or first numeric column as fallback)
    useEffect(() => {
        if (leaderboardData.length > 0 && !sortConfig) {
            const firstRow = leaderboardData[0];

            // First, look for a column that contains "Rank" in its name
            const rankColumn = Object.keys(firstRow).find(key =>
                key.toLowerCase().includes('rank')
            );

            if (rankColumn) {
                setSortConfig({ key: rankColumn, direction: 'ascending' });
                return;
            }

            // Fallback: find first numeric column
            const numericColumn = Object.keys(firstRow).find(key => {
                const value = firstRow[key];
                return !isNaN(parseFloat(String(value))) && key !== 'Board' && key !== 'Link 1' && key !== 'Link 2';
            });

            if (numericColumn) {
                setSortConfig({ key: numericColumn, direction: 'descending' });
            }
        }
    }, [leaderboardData]);

    const handleSort = (key: string) => {
        setSortConfig(current => {
            if (current?.key === key) {
                return {
                    key,
                    direction: current.direction === 'ascending' ? 'descending' : 'ascending'
                };
            }
            return { key, direction: 'ascending' };
        });
    };

    // Get columns from the data, excluding Link 1, Link 2, and Year(s)
    const columns = useMemo(() => {
        if (leaderboardData.length === 0) return [];
        return Object.keys(leaderboardData[0]).filter(key => key !== 'Link 1' && key !== 'Link 2' && key !== 'Year(s)');
    }, [leaderboardData]);

    // Filter data based on search query
    const filteredData = useMemo(() => {
        if (!searchQuery || searchQuery.trim() === '') {
            return leaderboardData;
        }

        const searchTerm = searchQuery.toLowerCase().trim();
        return leaderboardData.filter(entry => {
            const boardName = String(entry.Board || '').toLowerCase();
            return boardName.includes(searchTerm);
        });
    }, [leaderboardData, searchQuery]);

    const sortedData = useMemo(() => {
        if (!sortConfig) return filteredData;

        const sorted = [...filteredData].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            const isNAValue = (value: unknown): boolean => {
                if (value === null || value === undefined) return true;
                if (typeof value === 'string') {
                    return value.toLowerCase() === 'na' || value.toLowerCase() === 'n/a' || value.trim() === '';
                }
                return false;
            };

            const aIsNA = isNAValue(aValue);
            const bIsNA = isNAValue(bValue);

            if (aIsNA && !bIsNA) return 1;
            if (!aIsNA && bIsNA) return -1;
            if (aIsNA && bIsNA) return 0;

            // Handle Board column (string comparison)
            if (sortConfig.key === 'Board') {
                const aStr = String(aValue || '').replace(/^@/, '');
                const bStr = String(bValue || '').replace(/^@/, '');
                return sortConfig.direction === 'ascending'
                    ? aStr.localeCompare(bStr)
                    : bStr.localeCompare(aStr);
            }

            // Handle numeric columns
            const aNum = parseFloat(String(aValue));
            const bNum = parseFloat(String(bValue));

            if (!isNaN(aNum) && !isNaN(bNum)) {
                return sortConfig.direction === 'ascending' ? aNum - bNum : bNum - aNum;
            }

            // Fallback to string comparison
            const aStr = String(aValue || '');
            const bStr = String(bValue || '');
            return sortConfig.direction === 'ascending'
                ? aStr.localeCompare(bStr)
                : bStr.localeCompare(aStr);
        });

        // Only return first 15 rows
        return sorted.slice(0, 15);
    }, [filteredData, sortConfig]);

    // Calculate data ranges for gradient
    const dataRanges = useMemo(() => {
        const ranges: Record<string, { min: number; max: number }> = {};

        columns.forEach(columnKey => {
            if (columnKey === 'Board') return;

            const values = leaderboardData
                .map(entry => entry[columnKey])
                .filter(value => value !== null && value !== undefined && value !== '' && !isNaN(parseFloat(String(value))))
                .map(value => parseFloat(String(value)));

            if (values.length > 0) {
                ranges[columnKey] = {
                    min: Math.min(...values),
                    max: Math.max(...values)
                };
            }
        });

        return ranges;
    }, [leaderboardData, columns]);



    const getLogoFromUrl = (url: string): string | null => {
        if (!url || url.trim() === '' || url.toLowerCase() === 'na' || url.toLowerCase() === 'n/a') {
            return null;
        }

        try {
            const urlLower = url.toLowerCase();
            for (const [domain, logoFile] of Object.entries(MEDIA_LOGOS)) {
                if (urlLower.includes(domain)) {
                    return `/media_logos/${logoFile}.png`;
                }
            }
        } catch (e) {
            return null;
        }

        return null;
    };

    const getPerformanceGradient = (value: any, key: string): { backgroundColor: string; color: string } => {
        // Skip gradient for non-numeric columns
        if (key === 'Board' || key === 'Year(s)' || key.includes('%tile') || 
            key.includes('Align.') || key.toLowerCase().includes('align.')) {
            return { backgroundColor: 'transparent', color: '#d1d5db' };
        }

        if (value === null || value === undefined || value === '' || isNaN(parseFloat(String(value)))) {
            return { backgroundColor: 'transparent', color: '#d1d5db' };
        }

        const numValue = parseFloat(String(value));
        const range = dataRanges[key];

        if (!range || range.min === range.max) {
            return { backgroundColor: 'transparent', color: '#d1d5db' };
        }

        // Special handling for Rank columns - lower rank = better = brighter
        if (key.includes('Rank')) {
            // Invert the intensity calculation for Rank (1 is best, 15 is worst)
            const intensity = 1 - ((numValue - range.min) / (range.max - range.min));
            const clampedIntensity = Math.max(0.1, Math.min(1, intensity));

            const backgroundColor = `rgba(59, 130, 246, ${0.1 + clampedIntensity * 0.4})`;
            const textColor = clampedIntensity > 0.3 ? '#ffffff' : '#e5e7eb';

            return { backgroundColor, color: textColor };
        }

        // Higher values = better = brighter (normalized 0 to 1) for Count and Avg Z-Score
        const intensity = (numValue - range.min) / (range.max - range.min);
        const clampedIntensity = Math.max(0.1, Math.min(1, intensity));

        const backgroundColor = `rgba(59, 130, 246, ${0.1 + clampedIntensity * 0.4})`;
        const textColor = clampedIntensity > 0.3 ? '#ffffff' : '#e5e7eb';

        return { backgroundColor, color: textColor };
    };

    const formatCellValue = (value: any, columnKey: string): string => {
        if (value === null || value === undefined || value === '') {
            return 'N/A';
        }

        // Don't format these columns - keep as strings
        if (columnKey === 'Board' || columnKey === 'Year(s)') {
            return String(value);
        }

        // Count column should be a whole number
        if (columnKey === 'Count') {
            const numValue = parseFloat(String(value));
            if (!isNaN(numValue)) {
                return Math.round(numValue).toString();
            }
            return String(value);
        }

        // For all other columns (Avg Z-Score, %tile, Rank), keep as strings
        return String(value);
    };

    const getColumnLabel = (key: string): string => {
        // Map specific column names to their display labels
        const columnMap: Record<string, string> = {
            'Board': 'Board',
            'Count': 'Count',
            'Year(s)': 'Year(s)',
            'Align. w/ Cons.': 'Align. w/ Cons.',
            'Align. w/ NBA': 'Align. w/ NBA',
            'Avg Z-Score': 'Avg Z-Score',
            'Top 30 %tile': consensusFilter === 'lottery' ? 'Lottery %tile' :
                consensusFilter === 'top60' ? 'Top 60 %tile' : 'Top 30 %tile',
            'Top 30 Rank': consensusFilter === 'lottery' ? 'Lottery Rank' :
                consensusFilter === 'top60' ? 'Top 60 Rank' : 'Top 30 Rank',
            'Lottery %tile': 'Lottery %tile',
            'Lottery Rank': 'Lottery Rank',
            'Top 60 %tile': 'Top 60 %tile',
            'Top 60 Rank': 'Top 60 Rank'
        };

        // Return mapped label if exists, otherwise format the key
        if (columnMap[key]) {
            return columnMap[key];
        }

        // Fallback: Convert snake_case or camelCase to Title Case
        return key
            .replace(/_/g, ' ')
            .replace(/([A-Z])/g, ' $1')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ')
            .trim();
    };

    if (leaderboardData.length === 0) {
        return (
            <div className={`max-w-6xl mx-auto px-4 pt-2 ${className}`}>
                <div className="w-full bg-[#19191A] rounded-lg border border-gray-700/40 p-8">
                    <div className="text-center text-gray-400">
                        No leaderboard data available
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`max-w-6xl mx-auto px-4 pt-2 pb-8 ${className}`}>
            <div className="w-full overflow-x-auto bg-[#19191A] rounded-lg border border-gray-700/40">
                <Table>
                    <TableHeader>
                        <TableRow className="border-gray-700/30">
                            {columns.map((column) => (
                                <TableHead
                                    key={column}
                                    className={`text-gray-400 font-semibold cursor-pointer hover:text-gray-200 whitespace-nowrap ${column === 'Board' ? 'text-left' : 'text-center'
                                        }`}
                                    onClick={() => handleSort(column)}
                                >
                                    {getColumnLabel(column)}
                                    {sortConfig?.key === column && (
                                        <span className="ml-1">
                                            {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                                        </span>
                                    )}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedData.map((entry, index) => {
                            const boardName = String(entry.Board || '');
                            const isHighlighted = boardName.toLowerCase().trim() === 'consensus' ||
                                boardName.toLowerCase().trim() === 'nba';

                            const link1 = entry['Link 1'];
                            const link2 = entry['Link 2'];
                            const logo1 = getLogoFromUrl(link1);
                            const logo2 = getLogoFromUrl(link2);

                            return (
                                <TableRow
                                    key={`${entry.Board}-${index}`}
                                    className={`border-gray-700/30 ${index === 10 ? 'border-t-2 border-t-white/20' : ''} ${isHighlighted
                                        ? 'bg-gray-600/30 hover:bg-gray-600/40'
                                        : 'hover:bg-gray-800/20'
                                        }`}
                                >
                                    {columns.map((column) => {
                                        const cellValue = entry[column];
                                        const gradientStyle = column === 'Board'
                                            ? { backgroundColor: 'transparent', color: '#d1d5db' }
                                            : getPerformanceGradient(cellValue, column);

                                        if (column === 'Board') {
                                            return (
                                                <TableCell
                                                    key={column}
                                                    className={`font-semibold whitespace-nowrap ${index >= 10 ? 'text-gray-500' : 'text-gray-300'}`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span>{formatCellValue(cellValue, column)}</span>
                                                        <div className="flex items-center gap-2">
                                                            {logo1 && (
                                                                <a
                                                                    href={link1}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="transition-all duration-200"
                                                                >
                                                                    <img
                                                                        src={logo1}
                                                                        alt="Link 1"
                                                                        className="w-3 h-3 object-contain grayscale hover:grayscale-0 transition-all duration-200 hover:scale-110"
                                                                        style={{
                                                                            filter: 'grayscale(100%) brightness(0.85)',
                                                                        }}
                                                                        onMouseEnter={(e) => {
                                                                            e.currentTarget.style.filter = 'grayscale(0%) brightness(1)';
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            e.currentTarget.style.filter = 'grayscale(100%) brightness(0.85)';
                                                                        }}
                                                                        onError={(e) => {
                                                                            e.currentTarget.style.display = 'none';
                                                                        }}
                                                                    />
                                                                </a>
                                                            )}
                                                            {logo2 && (
                                                                <a
                                                                    href={link2}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="transition-all duration-200"
                                                                >
                                                                    <img
                                                                        src={logo2}
                                                                        alt="Link 2"
                                                                        className="w-3 h-3 object-contain grayscale hover:grayscale-0 transition-all duration-200 hover:scale-110"
                                                                        style={{
                                                                            filter: 'grayscale(100%) brightness(0.85)',
                                                                        }}
                                                                        onMouseEnter={(e) => {
                                                                            e.currentTarget.style.filter = 'grayscale(0%) brightness(1)';
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            e.currentTarget.style.filter = 'grayscale(100%) brightness(0.85)';
                                                                        }}
                                                                        onError={(e) => {
                                                                            e.currentTarget.style.display = 'none';
                                                                        }}
                                                                    />
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            );
                                        }

                                        // Special handling for Count column with Year(s) tooltip
                                        if (column === 'Count') {
                                            const years = entry['Year(s)'];
                                            return (
                                                <TableCell
                                                    key={column}
                                                    className="text-center font-medium relative group"
                                                    style={gradientStyle}
                                                >
                                                    {formatCellValue(cellValue, column)}
                                                    {years && years !== '' && years.toLowerCase() !== 'n/a' && (
                                                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-10 pointer-events-none">
                                                            <div className="bg-[#19191A] text-gray-200 text-xs px-3 py-1.5 rounded shadow-lg whitespace-nowrap border border-gray-700">
                                                                {years}
                                                            </div>
                                                        </div>
                                                    )}
                                                </TableCell>
                                            );
                                        }

                                        return (
                                            <TableCell
                                                key={column}
                                                className="text-center font-medium"
                                                style={gradientStyle}
                                            >
                                                {formatCellValue(cellValue, column)}
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
}