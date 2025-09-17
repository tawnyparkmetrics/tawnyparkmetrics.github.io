import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

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
}

export function ContributorEvaluationTable<T extends BaseContributorEvaluation>({
    evaluations,
    initialColumns,
    className = '',
    categories,
    lockedColumns = ['Board'],
    consensusFilter = 'lottery',
}: ContributorEvaluationTableProps<T>) {
    const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: 'ascending' | 'descending' } | null>(null);
    const [columns, setColumns] = useState<ContributorColumnConfig[]>([]);
    // Remove this line: const [consensusFilter, setConsensusFilter] = useState<'lottery' | 'top30' | 'top60'>('lottery');

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
            
            // Set initial alphabetical sort by Board
            setSortConfig({ key: 'Board' as keyof T, direction: 'ascending' });
        } catch (error) {
            console.warn('Failed to load saved column state:', error);
            setColumns(initialColumns);
            // Still set initial sort even if loading fails
            setSortConfig({ key: 'Board' as keyof T, direction: 'ascending' });
        }
    }, [initialColumns, storageKey]);

    // Save column visibility state
    const saveColumnState = useCallback((updatedColumns: ContributorColumnConfig[]) => {
        try {
            const visibilityState = updatedColumns.reduce((acc, col) => {
                acc[col.key] = col.visible;
                return acc;
            }, {} as Record<string, boolean>);

            localStorage.setItem(storageKey, JSON.stringify(visibilityState));
        } catch (error) {
            console.warn('Failed to save column state:', error);
        }
    }, [storageKey]);

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

    // Track the previous consensus filter to avoid unnecessary updates
    const prevConsensusFilterRef = useRef(consensusFilter);

    // Function to get display label for columns based on consensus filter
    const getColumnDisplayLabel = (column: ContributorColumnConfig): string => {
        // Keep rank columns as-is (they should show "Lottery Rank", "Top 30 Rank", etc.)
        if (column.key.includes('Rank')) {
            return column.label;
        }

        // For performance metric columns, remove the filter suffix
        if (column.key.includes('Lottery') || column.key.includes('Top 30') || column.key.includes('Top 60')) {
            if (column.key.includes('Consensus')) return 'Consensus';
            if (column.key.includes('NBA Draft')) return 'NBA Draft';
            if (column.key.includes('Redraft')) return 'Redraft';
            if (column.key.includes('EPM')) return 'EPM';
            if (column.key.includes('EW')) return 'EW';
        }

        // Return original label for all other columns
        return column.label;
    };

    // Apply consensus filter when the prop changes
    useEffect(() => {
        // Only apply if we have columns loaded, a valid consensus filter, and the filter actually changed
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
                // Always keep Board and Board Size visible
                if (lockedColumns.includes(col.key) || col.key === 'Board Size') {
                    return col;
                }
                
                // Show/hide columns based on consensus filter
                if (col.key.includes('Lottery') || col.key.includes('Top 30') || col.key.includes('Top 60')) {
                    return { ...col, visible: col.key.includes(targetSuffix) };
                }
                
                // For rank columns, show based on filter
                if (col.key.includes('Rank')) {
                    if (consensusFilter === 'lottery' && col.key === 'Lottery Rank') return { ...col, visible: true };
                    if (consensusFilter === 'top30' && col.key === 'Top 30 Rank') return { ...col, visible: true };
                    if (consensusFilter === 'top60' && col.key === 'Top 60 Rank') return { ...col, visible: true };
                    return { ...col, visible: false };
                }
                
                return col;
            });
            
            setColumns(updatedColumns);
            // Manually save state without depending on the callback
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
    }, [consensusFilter, initialColumns.length, storageKey]); // Only essential dependencies

    const visibleColumns = columns.filter(col => col.visible);

    // Helper function to create unique identifier for stable sorting
    const createUniqueId = (evaluation: T): string => {
        return [
            evaluation.Board,
            evaluation['Board Size'] || ''
        ].join('|');
    };

    // Calculate data ranges for gradient normalization
    const dataRanges = useMemo(() => {
        const ranges: Record<string, { min: number; max: number }> = {};
        
        // Get all gradient-eligible columns (excluding Consensus)
        const gradientColumns = [
            'NBA Draft Lottery', 'NBA Draft Top 30', 'NBA Draft Top 60',
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

    // Helper function to get performance gradient styling for hit rates
    const getPerformanceGradient = (value: any, key: string): { backgroundColor: string; color: string } => {
        // No gradient for Consensus columns
        if (key.includes('Consensus')) {
            return { backgroundColor: 'transparent', color: '#d1d5db' };
        }

        if (value === null || value === undefined || value === '' || isNaN(parseFloat(String(value)))) {
            return { backgroundColor: 'transparent', color: '#d1d5db' };
        }

        const numValue = parseFloat(String(value));
        let intensity: number;

        // Get the data range for this column
        const range = dataRanges[key];
        if (!range || range.min === range.max) {
            // If no range or all values are the same, use neutral intensity
            intensity = 0.5;
        } else {
            // Normalize the value within the actual data range
            const normalizedValue = (numValue - range.min) / (range.max - range.min);
            
            // For NBA Draft columns (correlation %), higher is better
            if (key.includes('NBA Draft')) {
                intensity = normalizedValue;
            }
            // For MAE columns (Redraft, EPM, EW), lower is better (inverse)
            else if (key.includes('Redraft') || key.includes('EPM') || key.includes('EW')) {
                intensity = 1 - normalizedValue;
            }
            // For rank columns, lower numbers are better (inverse)
            else if (key.includes('Rank')) {
                intensity = 1 - normalizedValue;
            }
            // Default case
            else {
                intensity = normalizedValue;
            }
        }

        // Ensure minimum visibility and cap at maximum
        intensity = Math.max(0.1, Math.min(1, intensity));

        // Create blue gradient (consistent with your existing tables)
        const backgroundColor = `rgba(59, 130, 246, ${0.1 + intensity * 0.4})`;
        const textColor = intensity > 0.3 ? '#ffffff' : '#e5e7eb';

        return { backgroundColor, color: textColor };
    };

    const sortedEvaluations = useMemo(() => {
        if (!sortConfig) return evaluations;

        const evaluationsWithId = evaluations.map((evaluation, originalIndex) => ({
            ...evaluation,
            _uniqueId: createUniqueId(evaluation),
            _originalIndex: originalIndex
        }));

        const sortableEvaluations = [...evaluationsWithId].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            // Handle NA/null values
            const isNAValue = (value: unknown): boolean => {
                if (value === null || value === undefined) return true;
                if (typeof value === 'string') {
                    return value.toLowerCase() === 'na' || value.toLowerCase() === 'n/a' || value.trim() === '';
                }
                return false;
            };

            const aIsNA = isNAValue(aValue);
            const bIsNA = isNAValue(bValue);

            // Put NA values at the end
            if (aIsNA && !bIsNA) return 1;
            if (!aIsNA && bIsNA) return -1;
            if (aIsNA && bIsNA) {
                const uniqueIdCompare = a._uniqueId.localeCompare(b._uniqueId);
                return uniqueIdCompare !== 0 ? uniqueIdCompare : a._originalIndex - b._originalIndex;
            }

            // Special handling for Board column - clean @ symbols for comparison
            if (sortConfig.key === 'Board') {
                const aCleanBoard = String(aValue || '').replace(/^@/, '');
                const bCleanBoard = String(bValue || '').replace(/^@/, '');
                const boardCompare = sortConfig.direction === 'ascending' 
                    ? aCleanBoard.localeCompare(bCleanBoard) 
                    : bCleanBoard.localeCompare(aCleanBoard);
                return boardCompare !== 0 ? boardCompare : (a._uniqueId.localeCompare(b._uniqueId) || a._originalIndex - b._originalIndex);
            }

            // Handle numeric values
            const aNum = parseFloat(aValue as string);
            const bNum = parseFloat(bValue as string);

            if (!isNaN(aNum) && !isNaN(bNum)) {
                const numericCompare = sortConfig.direction === 'ascending' ? aNum - bNum : bNum - aNum;
                return numericCompare !== 0 ? numericCompare : (a._uniqueId.localeCompare(b._uniqueId) || a._originalIndex - b._originalIndex);
            }

            // Handle string values
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
    }, [evaluations, sortConfig]);

    const displayCategories = categories || [...new Set(columns.map(col => col.category))];

    // Helper function to render cell content
    const renderCell = (evaluation: T, column: ContributorColumnConfig) => {
        const key = column.key as keyof T;

        if (column.key === 'Board') {
            // Remove @ symbol from board names for display
            const cleanBoardName = String(evaluation.Board || '').replace(/^@/, '');
            return (
                <TableCell key={column.key} className="font-semibold text-gray-300 whitespace-nowrap">
                    {cleanBoardName}
                </TableCell>
            );
        }

        // Handle performance metrics with gradient styling (excluding Consensus)
        if ([
            'NBA Draft Lottery', 'NBA Draft Top 30', 'NBA Draft Top 60',
            'Redraft Lottery', 'Redraft Top 30', 'Redraft Top 60',
            'EPM Lottery', 'EPM Top 30', 'EPM Top 60',
            'EW Lottery', 'EW Top 30', 'EW Top 60',
            'Lottery Rank', 'Top 30 Rank', 'Top 60 Rank'
        ].includes(column.key)) {
            const cellValue = evaluation[key];
            let displayValue = '';

            if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
                // Only format NBA Draft columns as percentages
                if (['NBA Draft Lottery', 'NBA Draft Top 30', 'NBA Draft Top 60'].includes(column.key)) {
                    const numValue = parseFloat(String(cellValue));
                    if (!isNaN(numValue)) {
                        displayValue = `${(numValue * 100).toFixed(1)}%`;
                    } else {
                        displayValue = String(cellValue);
                    }
                } else {
                    // For all other columns, display exactly as they appear in the spreadsheet
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

        // Handle Consensus columns without gradient
        if ([
            'Consensus Lottery', 'Consensus Top 30', 'Consensus Top 60'
        ].includes(column.key)) {
            const cellValue = evaluation[key];
            let displayValue = '';

            if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
                displayValue = String(cellValue);
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

        // Handle Board Size as a simple number
        if (column.key === 'Board Size') {
            const cellValue = evaluation[key];
            return (
                <TableCell key={column.key} className="text-gray-300 text-center">
                    {cellValue || 'N/A'}
                </TableCell>
            );
        }

        // Default case for other columns
        const cellValue = evaluation[key];
        return (
            <TableCell key={column.key} className="text-gray-300 text-center">
                {typeof cellValue === 'object' ? 'N/A' : String(cellValue || 'N/A')}
            </TableCell>
        );
    };

    return (
        <div className={`max-w-6xl mx-auto px-4 pt-2 ${className}`}>
            {/* Remove the entire Controls Row section - it's now handled by the parent */}
            
            {/* Table */}
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
                        {sortedEvaluations.map((evaluation, index) => (
                            <TableRow
                                key={`${evaluation.Board}-${index}`}
                                className="hover:bg-gray-800/20 border-gray-700/30"
                            >
                                {visibleColumns.map((column) => renderCell(evaluation, column))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}