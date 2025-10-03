import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Column configuration interface for contributor evaluations
export interface ContributorColumnConfig {
    key: string;
    label: string;
    category: string;
    visible: boolean;
    sortable: boolean;
}

// Base contributor evaluation interface
export interface BaseContributorEvaluation {
    'Board': string;
    'Board Size': string;

    //Values Items
    'Consensus Lottery': string;
    'Consensus Top 30': string;
    'Consensus Top 60': string;
    'NBA Draft Lottery': string;
    'NBA Draft Top 30': string;
    'NBA Draft Top 60': string;
    'Redraft Lottery': string;
    'Redraft Top 30': string;
    'Redraft Top 60': string;
    'EPM Lottery': string;
    'EPM Top 30': string;
    'EPM Top 60': string;
    'EW Lottery': string;
    'EW Top 30': string;
    'EW Top 60': string;
    'Lottery Rank': string;
    'Top 30 Rank': string;
    'Top 60 Rank': string;

    //Percentile Items
    'Lottery %ile': string;
    'Top 30 %ile': string;
    'Top 60 %ile': string;
    'R-L %ile': string;
    'R-T30 %ile': string;
    'R-T60 %ile': string;
    'EPM-L %ile': string;
    'EPM-T30 %ile': string;
    'EPM-T60 %ile': string; 
    'EW-L &ile': string;
    'EW-T30 %ile': string;
    'EW-T60 %ile': string;
    'NBA-L %ile': string;
    'NBA-T30 %ile': string;
    'NBA-T60 %ile': string;
    'Consensus-L %ile': string;
    'Consensus-T30 %ile': string;
    'Consensus-T60 %ile': string;
    [key: string]: any;
}

export interface ContributorEvaluationTableProps<T extends BaseContributorEvaluation> {
    evaluations: T[];
    initialColumns: ContributorColumnConfig[];
    className?: string;
    categories?: string[];
    lockedColumns?: string[];
    consensusFilter?: 'lottery' | 'top30' | 'top60';
    onConsensusFilterChange?: (filter: 'lottery' | 'top30' | 'top60') => void;
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
    year?: number;
    showPercentile?: boolean;
}

// Board anonymization configuration
const ANONYMOUS_BOARD_NAMES: Record<string, string> = {
    '@marx_posts': '[redacted]',
};

// Helper function to anonymize board names
const anonymizeBoardName = (boardName: string): string => {
    const anonymizedName = ANONYMOUS_BOARD_NAMES[boardName];
    if (anonymizedName) {
        return anonymizedName;
    }
    return boardName;
};

const isHighlightedRow = (boardName: string): boolean => {
    const cleanName = boardName.toLowerCase().trim();
    return cleanName === 'consensus' || cleanName === 'nba';
};

export function ContributorEvaluationTable<T extends BaseContributorEvaluation>({
    evaluations,
    initialColumns,
    className = '',
    lockedColumns = ['Board'],
    consensusFilter = 'lottery',
    searchQuery = '',
    year,
    showPercentile = false,
}: ContributorEvaluationTableProps<T>) {
    const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: 'ascending' | 'descending' } | null>(null);
    const [columns, setColumns] = useState<ContributorColumnConfig[]>([]);
    console.log('=== TABLE RENDER ===');
    console.log('showPercentile prop:', showPercentile);
    console.log('evaluations count:', evaluations.length);

    // Auto-generate a unique identifier for storage
    const tableId = useMemo(() => {
        const columnSignature = initialColumns
            .map(col => `${col.key}:${col.category}`)
            .sort()
            .join('|');

        let hash = 0;
        for (let i = 0; i < columnSignature.length; i++) {
            const char = columnSignature.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }

        return `contributor-table-${Math.abs(hash)}`;
    }, [initialColumns]);

    const storageKey = `contributor-evaluation-columns-${tableId}`;

    // Load saved column visibility state and set initial sort
    useEffect(() => {
        try {
            const savedState = JSON.parse(localStorage.getItem(storageKey) || '{}');

            const updatedColumns = initialColumns.map(col => ({
                ...col,
                visible: savedState[col.key] !== undefined ? savedState[col.key] : col.visible
            }));

            setColumns(updatedColumns);
            
            // Set initial sort based on year
            if (year === 2025) {
                // For 2025, sort by Board Size
                setSortConfig({ key: 'Board Size' as keyof T, direction: 'descending' });
            } else {
                // For other years, sort by the appropriate rank column based on consensus filter
                const rankColumnMap = {
                    'lottery': 'Lottery Rank',
                    'top30': 'Top 30 Rank',
                    'top60': 'Top 60 Rank'
                };
                const rankColumn = rankColumnMap[consensusFilter] as keyof T;
                setSortConfig({ key: rankColumn, direction: 'ascending' });
            }
        } catch (error) {
            console.warn('Failed to load saved column state:', error);
            setColumns(initialColumns);
            // Still set initial sort even if loading fails
            if (year === 2025) {
                setSortConfig({ key: 'Board Size' as keyof T, direction: 'descending' });
            } else {
                const rankColumnMap = {
                    'lottery': 'Lottery Rank',
                    'top30': 'Top 30 Rank',
                    'top60': 'Top 60 Rank'
                };
                const rankColumn = rankColumnMap[consensusFilter] as keyof T;
                setSortConfig({ key: rankColumn, direction: 'ascending' });
            }
        }
    }, [initialColumns, storageKey, year, consensusFilter]);

    const handleSort = (key: keyof T) => {
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

    const prevConsensusFilterRef = useRef(consensusFilter);

    const getColumnDisplayLabel = (column: ContributorColumnConfig): string => {
        if (column.key.includes('Rank')) {
            return column.label;
        }

        if (column.key.includes('Lottery') || column.key.includes('Top 30') || column.key.includes('Top 60')) {
            if (column.key.includes('Consensus')) return 'Consensus';
            if (column.key.includes('NBA Draft')) return 'NBA Draft';
            if (column.key.includes('Redraft')) return 'Redraft';
            if (column.key.includes('EPM')) return 'EPM';
            if (column.key.includes('EW')) return 'EW';
        }

        return column.label;
    };

    useEffect(() => {
        if (columns.length === initialColumns.length && 
            consensusFilter && 
            consensusFilter !== prevConsensusFilterRef.current) {
            
            prevConsensusFilterRef.current = consensusFilter;
            
            const filterSuffixes = {
                'lottery': 'Lottery',
                'top30': 'Top 30', 
                'top60': 'Top 60'
            };
            
            const targetSuffix = filterSuffixes[consensusFilter];
            
            const updatedColumns = columns.map(col => {
                if (lockedColumns.includes(col.key) || col.key === 'Board Size') {
                    return col;
                }
                
                if (col.key.includes('Lottery') || col.key.includes('Top 30') || col.key.includes('Top 60')) {
                    return { ...col, visible: col.key.includes(targetSuffix) };
                }
                
                if (col.key.includes('Rank')) {
                    if (consensusFilter === 'lottery' && col.key === 'Lottery Rank') return { ...col, visible: true };
                    if (consensusFilter === 'top30' && col.key === 'Top 30 Rank') return { ...col, visible: true };
                    if (consensusFilter === 'top60' && col.key === 'Top 60 Rank') return { ...col, visible: true };
                    return { ...col, visible: false };
                }
                
                return col;
            });
            
            setColumns(updatedColumns);
            try {
                const visibilityState = updatedColumns.reduce((acc, col) => {
                    acc[col.key] = col.visible;
                    return acc;
                }, {} as Record<string, boolean>);
                localStorage.setItem(storageKey, JSON.stringify(visibilityState));
            } catch (error) {
                console.warn('Failed to save column state:', error);
            }
        }
    }, [consensusFilter, initialColumns.length, storageKey]);

    const filteredEvaluations = useMemo(() => {
        const effectiveSearchQuery = searchQuery || '';
        
        if (!effectiveSearchQuery || effectiveSearchQuery.trim() === '') {
            return evaluations;
        }

        const searchTerm = effectiveSearchQuery.toLowerCase().trim();
        return evaluations.filter(evaluation => {
            const originalBoardName = String(evaluation.Board || '');
            
            // If this board is anonymized, exclude it from search results entirely
            if (ANONYMOUS_BOARD_NAMES[originalBoardName]) {
                return false;
            }

            // Search in the display name (which will be the same as original for non-anonymized boards)
            const displayName = anonymizeBoardName(originalBoardName).toLowerCase();
            if (displayName.includes(searchTerm)) {
                return true;
            }

            // Also search without @ symbol
            const cleanBoardName = originalBoardName.replace(/^@/, '').toLowerCase();
            if (cleanBoardName.includes(searchTerm)) {
                return true;
            }

            return false;
        });
    }, [evaluations, searchQuery]);

    const visibleColumns = columns.filter(col => col.visible);

    const createUniqueId = (evaluation: T): string => {
        return [
            evaluation.Board,
            evaluation['Board Size'] || ''
        ].join('|');
    };

    const dataRanges = useMemo(() => {
        const ranges: Record<string, { min: number; max: number }> = {};
        
        const gradientColumns = [
            'Redraft Lottery', 'Redraft Top 30', 'Redraft Top 60',
            'EPM Lottery', 'EPM Top 30', 'EPM Top 60',
            'EW Lottery', 'EW Top 30', 'EW Top 60',
            'Lottery Rank', 'Top 30 Rank', 'Top 60 Rank'
        ];
        
        gradientColumns.forEach(columnKey => {
            const values = evaluations
                .map(evaluation => evaluation[columnKey as keyof T])
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
    }, [evaluations]);

    const getPerformanceGradient = (value: any, key: string): { backgroundColor: string; color: string } => {
        if (key.includes('Consensus') || key.includes('NBA Draft')) {
            return { backgroundColor: 'transparent', color: '#d1d5db' };
        }
    
        if (value === null || value === undefined || value === '' || isNaN(parseFloat(String(value)))) {
            return { backgroundColor: 'transparent', color: '#d1d5db' };
        }
    
        const numValue = parseFloat(String(value));
        let intensity: number;
    
        // If we're in percentile mode and this is a percentile column, scale properly
        if (showPercentile && (key.includes('Rank') || key.includes('Redraft') || key.includes('EPM') || key.includes('EW'))) {
            // Percentile values are 0-1 decimals, so we need to use them directly for intensity
            // Higher percentile = better, so intensity should be higher
            intensity = numValue <= 1 ? numValue : numValue / 100;
        } else {
            const range = dataRanges[key];
            if (!range || range.min === range.max) {
                intensity = 0.5;
            } else {
                const normalizedValue = (numValue - range.min) / (range.max - range.min);
                
                if (key.includes('Redraft') || key.includes('EPM') || key.includes('EW')) {
                    intensity = 1 - normalizedValue;
                }
                else if (key.includes('Rank')) {
                    intensity = 1 - normalizedValue;
                }
                else {
                    intensity = normalizedValue;
                }
            }
        }
    
        intensity = Math.max(0.1, Math.min(1, intensity));
    
        const backgroundColor = `rgba(59, 130, 246, ${0.1 + intensity * 0.4})`;
        const textColor = intensity > 0.3 ? '#ffffff' : '#e5e7eb';
    
        return { backgroundColor, color: textColor };
    };

    const sortedEvaluations = useMemo(() => {
        if (!sortConfig) return filteredEvaluations;

        const evaluationsWithId = filteredEvaluations.map((evaluation, originalIndex) => ({
            ...evaluation,
            _uniqueId: createUniqueId(evaluation),
            _originalIndex: originalIndex
        }));

        const sortableEvaluations = [...evaluationsWithId].sort((a, b) => {
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
            if (aIsNA && bIsNA) {
                const uniqueIdCompare = a._uniqueId.localeCompare(b._uniqueId);
                return uniqueIdCompare !== 0 ? uniqueIdCompare : a._originalIndex - b._originalIndex;
            }

            if (sortConfig.key === 'Board') {
                const aCleanBoard = String(aValue || '').replace(/^@/, '');
                const bCleanBoard = String(bValue || '').replace(/^@/, '');
                const boardCompare = sortConfig.direction === 'ascending' 
                    ? aCleanBoard.localeCompare(bCleanBoard) 
                    : bCleanBoard.localeCompare(aCleanBoard);
                return boardCompare !== 0 ? boardCompare : (a._uniqueId.localeCompare(b._uniqueId) || a._originalIndex - b._originalIndex);
            }

            const aNum = parseFloat(aValue as string);
            const bNum = parseFloat(bValue as string);

            if (!isNaN(aNum) && !isNaN(bNum)) {
                const numericCompare = sortConfig.direction === 'ascending' ? aNum - bNum : bNum - aNum;
                return numericCompare !== 0 ? numericCompare : (a._uniqueId.localeCompare(b._uniqueId) || a._originalIndex - b._originalIndex);
            }

            const aStr = String(aValue || '');
            const bStr = String(bValue || '');
            const stringCompare = sortConfig.direction === 'ascending' 
                ? aStr.localeCompare(bStr) 
                : bStr.localeCompare(aStr);

            return stringCompare !== 0 ? stringCompare : (a._uniqueId.localeCompare(b._uniqueId) || a._originalIndex - b._originalIndex);
        });

        return sortableEvaluations.map((item) => {
            const { _uniqueId, _originalIndex, ...evaluation } = item;
            return evaluation;
        }) as unknown as T[];
    }, [filteredEvaluations, sortConfig]);

    const renderCell = (evaluation: T, column: ContributorColumnConfig) => {
        const key = column.key as keyof T;

        if (column.key.includes('Rank') || column.key.includes('Lottery')) {
            console.log('Rendering cell:', column.key, 'showPercentile:', showPercentile);
        }
    
        if (column.key === 'Board') {
            const displayName = anonymizeBoardName(String(evaluation.Board || ''));
            return (
                <TableCell key={column.key} className="font-semibold text-gray-300 whitespace-nowrap">
                    {displayName}
                </TableCell>
            );
        }
    
        if ([
            'NBA Draft Lottery', 'NBA Draft Top 30', 'NBA Draft Top 60',
            'Redraft Lottery', 'Redraft Top 30', 'Redraft Top 60',
            'EPM Lottery', 'EPM Top 30', 'EPM Top 60',
            'EW Lottery', 'EW Top 30', 'EW Top 60',
            'Lottery Rank', 'Top 30 Rank', 'Top 60 Rank'
        ].includes(column.key)) {
            // Determine which value to use based on showPercentile
            let cellValue;
            
            if (showPercentile) {
                // Map ALL columns to their percentile equivalents
                const percentileKeyMap: Record<string, keyof T> = {
                    'Lottery Rank': 'Lottery %ile' as keyof T,
                    'Top 30 Rank': 'Top 30 %ile' as keyof T,
                    'Top 60 Rank': 'Top 60 %ile' as keyof T,
                    'Redraft Lottery': 'R-L %ile' as keyof T,
                    'Redraft Top 30': 'R-T30 %ile' as keyof T,
                    'Redraft Top 60': 'R-T60 %ile' as keyof T,
                    'EPM Lottery': 'EPM-L %ile' as keyof T,
                    'EPM Top 30': 'EPM-T30 %ile' as keyof T,
                    'EPM Top 60': 'EPM-T60 %ile' as keyof T,
                    'EW Lottery': 'EW-L %ile' as keyof T,
                    'EW Top 30': 'EW-T30 %ile' as keyof T,
                    'EW Top 60': 'EW-T60 %ile' as keyof T,
                    'NBA Draft Lottery': 'NBA-L %ile' as keyof T,
                    'NBA Draft Top 30': 'NBA-T30 %ile' as keyof T,
                    'NBA Draft Top 60': 'NBA-T60 %ile' as keyof T,
                };
                const percentileKey = percentileKeyMap[column.key];
                cellValue = percentileKey ? evaluation[percentileKey] : evaluation[key];
            } else {
                cellValue = evaluation[key];
            }
            
            let displayValue = '';
        
            if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
                if (!showPercentile && ['NBA Draft Lottery', 'NBA Draft Top 30', 'NBA Draft Top 60'].includes(column.key)) {
                    // Only format as percentage when NOT in percentile mode
                    const numValue = parseFloat(String(cellValue));
                    
                    if (!isNaN(numValue)) {
                        const percentageValue = Math.abs(numValue) > 1 ? numValue : numValue * 100;
                        displayValue = `${percentageValue.toFixed(1)}%`;
                    } else {
                        displayValue = String(cellValue);
                    }
                } else if (showPercentile) {
                    const numValue = parseFloat(String(cellValue));
                    if (!isNaN(numValue)) {
                        // If value is between 0 and 1 (or exactly 1), treat as decimal and multiply by 100
                        const percentageValue = numValue <= 1 ? numValue * 100 : numValue;
                        // Use toFixed only when needed, otherwise show whole numbers
                        displayValue = percentageValue % 1 === 0 
                            ? `${percentageValue.toFixed(0)}%` 
                            : `${percentageValue.toFixed(1)}%`;
                    } else {
                        displayValue = String(cellValue);
                    }
                } else {
                    displayValue = String(cellValue);
                }
            } else {
                displayValue = 'N/A';
            }
        
            const gradientStyle = getPerformanceGradient(cellValue, column.key);
        
            return (
                <TableCell
                    key={column.key}
                    className="text-center font-medium"
                    style={gradientStyle}
                >
                    {displayValue}
                </TableCell>
            );
        }
        
        if ([
            'Consensus Lottery', 'Consensus Top 30', 'Consensus Top 60'
        ].includes(column.key)) {
            // Handle Consensus columns with percentile
            let cellValue;
            
            if (showPercentile) {
                const percentileKeyMap: Record<string, keyof T> = {
                    'Consensus Lottery': 'Consensus-L %ile' as keyof T,
                    'Consensus Top 30': 'Consensus-T30 %ile' as keyof T,
                    'Consensus Top 60': 'Consensus-T60 %ile' as keyof T,
                };
                const percentileKey = percentileKeyMap[column.key];
                cellValue = percentileKey ? evaluation[percentileKey] : evaluation[key as keyof T];
            } else {
                cellValue = evaluation[key as keyof T];
            }
            
            let displayValue = '';
    
            if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
                if (showPercentile) {
                    const numValue = parseFloat(String(cellValue));
                    if (!isNaN(numValue)) {
                        displayValue = `${numValue.toFixed(1)}%`;
                    } else {
                        displayValue = String(cellValue);
                    }
                } else {
                    displayValue = String(cellValue);
                }
            } else {
                displayValue = 'N/A';
            }
    
            return (
                <TableCell
                    key={column.key}
                    className="text-center font-medium text-gray-300"
                >
                    {displayValue}
                </TableCell>
            );
        }
    
        if (column.key === 'Board Size') {
            const cellValue = evaluation[key];
            return (
                <TableCell key={column.key} className="text-gray-300 text-center">
                    {cellValue || 'N/A'}
                </TableCell>
            );
        }
    
        const cellValue = evaluation[key];
        return (
            <TableCell key={column.key} className="text-gray-300 text-center">
                {typeof cellValue === 'object' ? 'N/A' : String(cellValue || 'N/A')}
            </TableCell>
        );
    };

    return (
        <div className={`max-w-6xl mx-auto px-4 pt-2 ${className}`}>
            <div className="w-full overflow-x-auto bg-[#19191A] rounded-lg border border-gray-700/40">
                <Table>
                    <TableHeader>
                        <TableRow className="border-gray-700/30">
                            {visibleColumns.map((column) => (
                                <TableHead
                                    key={column.key}
                                    className={`text-gray-400 font-semibold cursor-pointer hover:text-gray-200 whitespace-nowrap ${
                                        column.sortable ? '' : 'cursor-default'
                                    } ${column.key === 'Board' ? 'text-left' : 'text-center'}`}
                                    onClick={() => column.sortable && handleSort(column.key as keyof T)}
                                >
                                    {getColumnDisplayLabel(column)}
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
                        {sortedEvaluations.map((evaluation, index) => {
                            const boardName = String(evaluation.Board || '');
                            const shouldHighlight = isHighlightedRow(boardName);
                            
                            return (
                                <TableRow
                                    key={`${evaluation.Board}-${index}`}
                                    className={`border-gray-700/30 ${
                                        shouldHighlight 
                                            ? 'bg-gray-600/30 hover:bg-gray-600/40' 
                                            : 'hover:bg-gray-800/20'
                                    }`}
                                >
                                    {visibleColumns.map((column) => renderCell(evaluation, column))}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}