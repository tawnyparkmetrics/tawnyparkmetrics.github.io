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
}

export function ContributorEvaluationTable<T extends BaseContributorEvaluation>({
    evaluations,
    initialColumns,
    className = '',
    categories,
    lockedColumns = ['Board']
}: ContributorEvaluationTableProps<T>) {
    const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: 'ascending' | 'descending' } | null>(null);
    const [columnSelectorOpen, setColumnSelectorOpen] = useState(false);
    const [columns, setColumns] = useState<ContributorColumnConfig[]>([]);
    const [consensusFilter, setConsensusFilter] = useState<'lottery' | 'top30' | 'top60'>('lottery');
    const rotationRef = useRef(0);

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

    // Load saved column visibility state
    useEffect(() => {
        try {
            const savedState = JSON.parse(localStorage.getItem(storageKey) || '{}');

            const updatedColumns = initialColumns.map(col => ({
                ...col,
                visible: savedState[col.key] !== undefined ? savedState[col.key] : col.visible
            }));

            setColumns(updatedColumns);
        } catch (error) {
            console.warn('Failed to load saved column state:', error);
            setColumns(initialColumns);
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

    const handleToggleColumn = useCallback((key: string) => {
        if (lockedColumns.includes(key)) return;

        const updatedColumns = columns.map(col =>
            col.key === key ? { ...col, visible: !col.visible } : col
        );

        setColumns(updatedColumns);
        saveColumnState(updatedColumns);
    }, [columns, lockedColumns, saveColumnState]);

    const handleToggleCategory = useCallback((category: string) => {
        const categoryColumns = columns.filter(col =>
            col.category === category && !lockedColumns.includes(col.key)
        );
        const allVisible = categoryColumns.every(col => col.visible);

        const updatedColumns = columns.map(col => {
            if (col.category === category && !lockedColumns.includes(col.key)) {
                return { ...col, visible: !allVisible };
            }
            return col;
        });

        setColumns(updatedColumns);
        saveColumnState(updatedColumns);
    }, [columns, lockedColumns, saveColumnState]);

    const handleConsensusFilter = useCallback((filter: 'lottery' | 'top30' | 'top60') => {
        setConsensusFilter(filter);
        
        const filterSuffixes = {
            'lottery': 'Lottery',
            'top30': 'Top 30', 
            'top60': 'Top 60'
        };
        
        const targetSuffix = filterSuffixes[filter];
        
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
                if (filter === 'lottery' && col.key === 'Lottery Rank') return { ...col, visible: true };
                if (filter === 'top30' && col.key === 'Top 30 Rank') return { ...col, visible: true };
                if (filter === 'top60' && col.key === 'Top 60 Rank') return { ...col, visible: true };
                return { ...col, visible: false };
            }
            
            return col;
        });
        
        setColumns(updatedColumns);
        saveColumnState(updatedColumns);
    }, [columns, lockedColumns, saveColumnState]);

    const visibleColumns = columns.filter(col => col.visible);

    // Helper function to create unique identifier for stable sorting
    const createUniqueId = (evaluation: T): string => {
        return [
            evaluation.Board,
            evaluation['Board Size'] || ''
        ].join('|');
    };

    // Helper function to get performance gradient styling for hit rates
    const getPerformanceGradient = (value: any, key: string): { backgroundColor: string; color: string } => {
        if (value === null || value === undefined || value === '' || isNaN(parseFloat(String(value)))) {
            return { backgroundColor: 'transparent', color: '#d1d5db' };
        }

        const numValue = parseFloat(String(value));
        let intensity: number;

        // For hit rates (percentage values), higher is better
        if (key.includes('Lottery') || key.includes('Top 30') || key.includes('Top 60')) {
            // Normalize percentage values (0-100 to 0-1)
            intensity = Math.min(Math.max(numValue / 100, 0), 1);
        } else if (key.includes('Rank')) {
            // For rank columns, lower numbers are better
            // Assume ranks go from 1 to ~20 for contributors
            intensity = 1 - Math.min(Math.max((numValue - 1) / 19, 0), 1);
        } else {
            // Default neutral
            intensity = 0.5;
        }

        // Ensure minimum visibility
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
            return (
                <TableCell key={column.key} className="font-semibold text-gray-300 whitespace-nowrap">
                    {evaluation.Board}
                </TableCell>
            );
        }

        // Handle performance metrics with gradient styling
        if ([
            'Consensus Lottery', 'Consensus Top 30', 'Consensus Top 60',
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
                        displayValue = `${numValue.toFixed(1)}%`;
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
            {/* Controls Row */}
            <div className="mb-4 flex flex-col sm:flex-row gap-4">
                {/* Column Selector - Shortened */}
                <div className="flex-1 relative">
                    <motion.button
                        onClick={() => setColumnSelectorOpen(!columnSelectorOpen)}
                        className="w-full flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 bg-[#19191A] border border-gray-800 rounded-lg text-gray-400 hover:border-gray-700 transition-colors"
                        whileTap={{ scale: 0.98 }}
                        type="button"
                    >
                        <div className="flex items-center gap-2">
                            <motion.div
                                animate={{
                                    rotate: columnSelectorOpen ? (rotationRef.current += 360) : (rotationRef.current += 360)
                                }}
                                transition={{ duration: 0.5, ease: 'easeInOut' }}
                                key={`settings-${columnSelectorOpen}`}
                            >
                                <Settings className="h-4 w-4" />
                            </motion.div>
                            <span className="font-medium text-sm md:text-base">Customize Columns</span>
                        </div>
                        <motion.div
                            animate={{ rotate: columnSelectorOpen ? 180 : 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                            <ChevronDown className="h-4 w-4" />
                        </motion.div>
                    </motion.button>

                    <div
                        className="overflow-hidden transition-all duration-300 ease-in-out relative z-50"
                        style={{
                            maxHeight: columnSelectorOpen ? '1000px' : '0px',
                            opacity: columnSelectorOpen ? 1 : 0
                        }}
                    >
                        <div className="bg-[#19191A] border border-gray-800 rounded-lg p-3 md:p-4 mt-2 shadow-lg max-h-[80vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                {displayCategories.map(category => {
                                    const categoryColumns = columns.filter(col =>
                                        col.category === category && !lockedColumns.includes(col.key)
                                    );
                                    const visibleCount = categoryColumns.filter(col => col.visible).length;
                                    const totalCount = categoryColumns.length;

                                    return (
                                        <div key={category} className="space-y-2 md:space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-gray-400 font-medium text-xs md:text-sm">{category}</h4>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleToggleCategory(category);
                                                    }}
                                                    className="text-xs text-gray-300 hover:text-white px-1.5 md:px-2 py-0.5 md:py-1 rounded hover:bg-gray-800/50 transition-colors"
                                                >
                                                    {visibleCount === totalCount ? 'Hide All' : 'Show All'}
                                                </button>
                                            </div>
                                            <div className="space-y-1 md:space-y-2">
                                                {categoryColumns.map(column => (
                                                    <div
                                                        key={column.key}
                                                        className="flex items-center gap-2 md:gap-3 p-1.5 md:p-2 rounded hover:bg-gray-800/50 cursor-pointer transition-colors"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleToggleColumn(column.key);
                                                        }}
                                                    >
                                                        <div className="relative flex-shrink-0">
                                                            <div className={`
                                                                w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200
                                                                ${column.visible
                                                                    ? 'bg-blue-500 border-blue-500'
                                                                    : 'bg-gray-800 border-gray-600 hover:border-gray-500'
                                                                }
                                                            `}>
                                                                {column.visible && (
                                                                    <svg
                                                                        className="w-3 h-3 text-white transition-all duration-150"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                        style={{
                                                                            transform: column.visible ? 'scale(1)' : 'scale(0)',
                                                                            opacity: column.visible ? 1 : 0
                                                                        }}
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={2}
                                                                            d="M5 13l4 4L19 7"
                                                                        />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span className="text-gray-400 text-xs md:text-sm cursor-pointer flex-1 select-none">
                                                            {column.label}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Consensus Filter Switcher */}
                <div className="flex-shrink-0">
                    <div className="flex items-center gap-1 p-1 bg-[#19191A] border border-gray-800 rounded-lg">
                        <motion.button
                            onClick={() => handleConsensusFilter('lottery')}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                consensusFilter === 'lottery'
                                    ? 'bg-blue-500 text-white shadow-sm'
                                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                            }`}
                            whileTap={{ scale: 0.95 }}
                        >
                            Lottery
                        </motion.button>
                        <motion.button
                            onClick={() => handleConsensusFilter('top30')}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                consensusFilter === 'top30'
                                    ? 'bg-blue-500 text-white shadow-sm'
                                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                            }`}
                            whileTap={{ scale: 0.95 }}
                        >
                            Top 30
                        </motion.button>
                        <motion.button
                            onClick={() => handleConsensusFilter('top60')}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                consensusFilter === 'top60'
                                    ? 'bg-blue-500 text-white shadow-sm'
                                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                            }`}
                            whileTap={{ scale: 0.95 }}
                        >
                            Top 60
                        </motion.button>
                    </div>
                </div>
            </div>

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