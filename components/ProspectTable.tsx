import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from 'next/image';
import { ChevronDown, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

// Logo components
const NBATeamLogo = ({ NBA }: { NBA: string }) => {
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

// Tier colors for styling
const tierColors: { [key: string]: string } = {
    'All-Time Great': '#FF66C4',
    'All-NBA Caliber': '#E9A2FF',
    'Fringe All-Star': '#5CE1E6',
    'Quality Starter': '#7ED957',
    'Solid Rotation': '#FFDE59',
    'Bench Reserve': '#FFA455',
    'Fringe NBA': '#FF5757',
    // Add numeric tiers for Andre's page
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

// Column configuration interface
export interface ColumnConfig {
    key: string;
    label: string;
    category: string;
    visible: boolean;
    sortable: boolean;
}

// Generic prospect interface that can be extended
export interface BaseProspect {
    Name: string;
    'Actual Pick': string;
    'NBA Team': string;
    'Pre-NBA': string;
    'League': string;
    'Height': string;
    'Height (in)': string;
    'Wingspan': string;
    'Wingspan (in)': string;
    'Wing - Height': string;
    'Weight (lbs)': string;
    'Role': string;
    'Age': string;
    'Tier': string;
    [key: string]: any;
}

export interface ProspectTableProps<T extends BaseProspect> {
    prospects: T[];
    rankingSystem: Map<string, number>;
    initialColumns: ColumnConfig[];
    tierRankMap?: { [key: string]: number }; // For custom tier sorting
    className?: string;
    categories?: string[]; // Optional: pass custom categories
    lockedColumns?: string[]; // Optional: specify which columns can't be toggled
}

export function ProspectTable<T extends BaseProspect>({
    prospects,
    rankingSystem,
    initialColumns,
    tierRankMap,
    className = '',
    categories,
    lockedColumns = ['Rank', 'Name']
}: ProspectTableProps<T>) {
    const [sortConfig, setSortConfig] = useState<{ key: keyof T | 'Rank'; direction: 'ascending' | 'descending' } | null>(null);
    const [columnSelectorOpen, setColumnSelectorOpen] = useState(false);
    const [columns, setColumns] = useState<ColumnConfig[]>(initialColumns || []);
    const rotationRef = useRef(0);

    const handleSort = (key: keyof T | 'Rank') => {
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

    // Column selector functionality built directly into the component
    const handleToggleColumn = useCallback((key: string) => {
        // Prevent toggling locked columns
        if (lockedColumns.includes(key)) return;
        
        const updatedColumns = columns.map(col => 
            col.key === key ? { ...col, visible: !col.visible } : col
        );
        
        setColumns(updatedColumns);
    }, [columns, lockedColumns]);

    const handleToggleCategory = useCallback((category: string) => {
        // Filter out locked columns from category columns
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
    }, [columns, lockedColumns]);

    const visibleColumns = columns.filter(col => col.visible);


    const sortedProspects = useMemo(() => {
        if (!sortConfig) return prospects;

        const sortableProspects = [...prospects].sort((a, b) => {
            let aValue: unknown;
            let bValue: unknown;

            if (sortConfig.key === 'Rank') {
                aValue = rankingSystem.get(a.Name) || 0;
                bValue = rankingSystem.get(b.Name) || 0;
            } else {
                aValue = a[sortConfig.key];
                bValue = b[sortConfig.key];
            }

            // Handle NA values
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
            if (aIsNA && bIsNA) return 0;

            // Handle Tier column with custom ranking
            if (sortConfig.key === 'Tier') {
                if (tierRankMap) {
                    // Use custom tier ranking map if provided
                    const aRank = tierRankMap[aValue as keyof typeof tierRankMap] || 999;
                    const bRank = tierRankMap[bValue as keyof typeof tierRankMap] || 999;
                    return sortConfig.direction === 'ascending'
                        ? aRank - bRank
                        : bRank - aRank;
                } else {
                    // Default numeric sorting for tier
                    const aNum = parseInt(aValue as string) || 0;
                    const bNum = parseInt(bValue as string) || 0;
                    return sortConfig.direction === 'ascending'
                        ? aNum - bNum
                        : bNum - aNum;
                }
            }

            // Handle Height (convert to inches)
            if (sortConfig.key === 'Height') {
                const aNum = parseFloat(a['Height (in)'] as string) || 0;
                const bNum = parseFloat(b['Height (in)'] as string) || 0;
                return sortConfig.direction === 'ascending'
                    ? aNum - bNum
                    : bNum - aNum;
            }

            // Handle Wingspan (convert to inches)
            if (sortConfig.key === 'Wingspan') {
                const aNum = parseFloat(a['Wingspan (in)'] as string) || 0;
                const bNum = parseFloat(b['Wingspan (in)'] as string) || 0;
                return sortConfig.direction === 'ascending'
                    ? aNum - bNum
                    : bNum - aNum;
            }

            // Handle Weight
            if (sortConfig.key === 'Weight (lbs)') {
                const aNum = parseInt(aValue as string) || 0;
                const bNum = parseInt(bValue as string) || 0;
                return sortConfig.direction === 'ascending'
                    ? aNum - bNum
                    : bNum - aNum;
            }

            // For numeric columns, try to parse as numbers
            const aNum = parseFloat(aValue as string);
            const bNum = parseFloat(bValue as string);

            if (!isNaN(aNum) && !isNaN(bNum)) {
                // Both are valid numbers
                return sortConfig.direction === 'ascending' ? aNum - bNum : bNum - aNum;
            }

            // Default string comparison for non-numeric values
            const aStr = aValue === undefined ? '' : String(aValue);
            const bStr = bValue === undefined ? '' : String(bValue);

            if (sortConfig.direction === 'ascending') {
                return aStr.localeCompare(bStr);
            } else {
                return String(bValue).localeCompare(String(aValue));
            }
        });

        return sortableProspects;
    }, [prospects, sortConfig, tierRankMap]);

    // Get unique categories from columns or use passed categories
    const displayCategories = categories || [...new Set((columns || []).map(col => col.category))];

    // Helper function to render cell content
    const renderCell = (prospect: T, column: ColumnConfig) => {
        const key = column.key as keyof T;

        // Handle special cases for different column types
        if (column.key === 'Rank') {
            return (
                <TableCell key={column.key} className="text-gray-300 font-semibold">
                    {rankingSystem.get(prospect.Name) || 'N/A'}
                </TableCell>
            );
        }

        if (column.key === 'Name') {
            return (
                <TableCell key={column.key} className="font-semibold text-gray-300 whitespace-nowrap">
                    {prospect.Name}
                </TableCell>
            );
        }

        if (column.key === 'League') {
            return (
                <TableCell key={column.key} className="text-gray-300 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                        <LeagueLogo league={prospect['League']} />
                        <span>{prospect['League']}</span>
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
                <TableCell key={column.key} className="text-gray-300">
                    {Number(prospect['Actual Pick']) >= 61 ? "Undrafted" : prospect['Actual Pick']}
                </TableCell>
            );
        }

        if (column.key === 'NBA Team') {
            return (
                <TableCell key={column.key} className="text-gray-300 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                        <NBATeamLogo NBA={prospect['NBA Team']} />
                        <span>{prospect['NBA Team']}</span>
                    </div>
                </TableCell>
            );
        }

        // Handle Rank columns - display as whole numbers
        if (column.key.includes('Rank') && !column.key.includes('Position')) {
            const rankValue = prospect[key];
            return (
                <TableCell key={column.key} className="text-gray-300">
                    {typeof rankValue === 'number' ? rankValue.toString() : String(rankValue || '')}
                </TableCell>
            );
        }

        // Handle comparison columns
        if (['Comp1', 'Comp2', 'Comp3', 'Comp4', 'Comp5'].includes(column.key)) {
            const compValue = prospect[key];
            return (
                <TableCell key={column.key} className="text-gray-300 whitespace-nowrap">
                    {String(compValue || '')}
                </TableCell>
            );
        }

        // Handle Tier column with color styling
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
                        {prospect.Tier}
                    </span>
                </TableCell>
            );
        }

        // Handle positionRanks object - skip it as it's not meant for display
        if (column.key === 'positionRanks') {
            return (
                <TableCell key={column.key} className="text-gray-300">
                    N/A
                </TableCell>
            );
        }

        // Default case for other columns
        const cellValue = prospect[key];
        return (
            <TableCell key={column.key} className="text-gray-300">
                {typeof cellValue === 'object' ? 'N/A' : String(cellValue || '')}
            </TableCell>
        );
    };

    return (
        <div className={`max-w-6xl mx-auto px-4 pt-2 ${className}`}>
            {/* Built-in Column Selector - mimicking CustomSelector style */}
            <div className="mb-4 relative">
                {/* Toggle Button */}
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
                        <span className="font-medium text-sm md:text-base">Customize Table Columns</span>
                    </div>
                    <motion.div
                        animate={{ rotate: columnSelectorOpen ? 180 : 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        <ChevronDown className="h-4 w-4" />
                    </motion.div>
                </motion.button>

                {/* Collapsible Content */}
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
                                // Filter out locked columns from the dropdown options
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

            {/* Table */}
            <div className="w-full overflow-x-auto bg-[#19191A] rounded-lg border border-gray-700/40">
                <Table>
                    <TableHeader>
                        <TableRow className="border-gray-700/30">
                            {visibleColumns.map((column) => (
                                <TableHead
                                    key={column.key}
                                    className={`text-gray-400 font-semibold cursor-pointer hover:text-gray-200 whitespace-nowrap ${column.sortable ? '' : 'cursor-default'}`}
                                    onClick={() => column.sortable && handleSort(column.key as keyof T | 'Rank')}
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
                        {sortedProspects.map((prospect) => (
                            <TableRow
                                key={prospect.Name}
                                className="hover:bg-gray-800/20 border-gray-700/30"
                            >
                                {visibleColumns.map((column) => renderCell(prospect, column))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}