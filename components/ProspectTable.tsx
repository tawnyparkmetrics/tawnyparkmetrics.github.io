import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
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

const NationalityLogo = ({ nationality }: { nationality: string }) => {
    const [logoError, setLogoError] = useState(false);
    const nationalityUrl = `/nationality/${nationality}.png`;

    if (logoError) {
        return <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
            <span className="text-xs text-gray-400">{nationality}</span>
        </div>;
    }

    return (
        <div className="h-6 w-6 relative">
            <Image
                src={nationalityUrl}
                alt={`${nationality} flag`}
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
    'Draft Year'?: string; // Add Draft Year to help with uniqueness
    'Nationality'?: string; // Add National column for nationality
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
    showTierPrefix?: boolean; // Optional: whether to show "Tier" prefix
    draftYear?: string; // Add draftYear prop to conditionally show Draft Year column
}

export function ProspectTable<T extends BaseProspect>({
    prospects,
    rankingSystem,
    initialColumns,
    tierRankMap,
    className = '',
    categories,
    lockedColumns = ['Rank', 'Name'],
    showTierPrefix = false,
    draftYear
}: ProspectTableProps<T>) {
    const [sortConfig, setSortConfig] = useState<{ key: keyof T | 'Rank'; direction: 'ascending' | 'descending' } | null>(null);
    const [columnSelectorOpen, setColumnSelectorOpen] = useState(false);
    const [columns, setColumns] = useState<ColumnConfig[]>([]);
    const rotationRef = useRef(0);

    // Filter columns based on draftYear - only show Draft Year column for 2020-2025
    const filteredInitialColumns = useMemo(() => {
        if (draftYear === '2020-2025') {
            // Show all columns including Draft Year
            return initialColumns;
        } else {
            // Filter out Draft Year column for single year views
            return initialColumns.filter(col => col.key !== 'Draft Year');
        }
    }, [initialColumns, draftYear]);

    // Auto-generate a unique identifier based on the column structure
    const tableId = useMemo(() => {
        // Create a hash-like identifier from the column keys and categories
        const columnSignature = filteredInitialColumns
            .map(col => `${col.key}:${col.category}`)
            .sort()
            .join('|');

        // Simple hash function to create a shorter, consistent identifier
        let hash = 0;
        for (let i = 0; i < columnSignature.length; i++) {
            const char = columnSignature.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }

        return `table-${Math.abs(hash)}`;
    }, [filteredInitialColumns]);

    // Create a storage key based on auto-generated tableId for persistence
    const storageKey = `prospect-table-columns-${tableId}`;

    // Load saved column visibility state on component mount
    useEffect(() => {
        try {
            const savedState = JSON.parse(localStorage.getItem(storageKey) || '{}');

            // Merge saved visibility state with filtered initial columns
            const updatedColumns = filteredInitialColumns.map(col => ({
                ...col,
                visible: savedState[col.key] !== undefined ? savedState[col.key] : col.visible
            }));

            setColumns(updatedColumns);
        } catch (error) {
            console.warn('Failed to load saved column state:', error);
            setColumns(filteredInitialColumns);
        }
    }, [filteredInitialColumns, storageKey]);

    // Save column visibility state whenever it changes
    const saveColumnState = useCallback((updatedColumns: ColumnConfig[]) => {
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
        saveColumnState(updatedColumns);
    }, [columns, lockedColumns, saveColumnState]);

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
        saveColumnState(updatedColumns);
    }, [columns, lockedColumns, saveColumnState]);

    const visibleColumns = columns.filter(col => col.visible);

    // Helper function to format tier display
    const formatTierDisplay = (tierValue: string | number): string => {
        if (!tierValue && tierValue !== 0) return '';

        // Always add "Tier" prefix to the number
        return `Tier ${tierValue}`;
    };

    // Helper function to create a unique identifier for each prospect
    const createUniqueId = (prospect: T): string => {
        // Create a unique identifier using Name, Pre-NBA, and Draft Year (if available)
        const parts = [
            prospect.Name,
            prospect['Pre-NBA'],
            prospect['Draft Year'] || '',
            prospect['NBA Team'] // Add NBA Team as additional differentiator
        ];
        return parts.join('|');
    };

    const sortedProspects = useMemo(() => {
        if (!sortConfig) return prospects;

        // Create prospects with unique identifiers and original indices for stable sorting
        const prospectsWithId = prospects.map((prospect, originalIndex) => ({
            ...prospect,
            _uniqueId: createUniqueId(prospect),
            _originalIndex: originalIndex
        }));

        const sortableProspects = [...prospectsWithId].sort((a, b) => {
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
            if (aIsNA && bIsNA) {
                // For NA values, maintain stable sort using unique ID and original index
                const uniqueIdCompare = a._uniqueId.localeCompare(b._uniqueId);
                return uniqueIdCompare !== 0 ? uniqueIdCompare : a._originalIndex - b._originalIndex;
            }

            // Handle Tier column with custom ranking
            if (sortConfig.key === 'Tier') {
                if (tierRankMap) {
                    // Use custom tier ranking map if provided
                    const aRank = tierRankMap[aValue as keyof typeof tierRankMap] || 999;
                    const bRank = tierRankMap[bValue as keyof typeof tierRankMap] || 999;
                    const tierCompare = sortConfig.direction === 'ascending'
                        ? aRank - bRank
                        : bRank - aRank;

                    // If tier ranks are equal, use stable sort
                    return tierCompare !== 0 ? tierCompare : (a._uniqueId.localeCompare(b._uniqueId) || a._originalIndex - b._originalIndex);
                } else {
                    // Default numeric sorting for tier
                    const aNum = parseInt(aValue as string) || 0;
                    const bNum = parseInt(bValue as string) || 0;
                    const tierCompare = sortConfig.direction === 'ascending'
                        ? aNum - bNum
                        : bNum - aNum;

                    return tierCompare !== 0 ? tierCompare : (a._uniqueId.localeCompare(b._uniqueId) || a._originalIndex - b._originalIndex);
                }
            }

            // Handle Height (convert to inches)
            if (sortConfig.key === 'Height') {
                const aNum = parseFloat(a['Height (in)'] as string) || 0;
                const bNum = parseFloat(b['Height (in)'] as string) || 0;
                const heightCompare = sortConfig.direction === 'ascending'
                    ? aNum - bNum
                    : bNum - aNum;

                return heightCompare !== 0 ? heightCompare : (a._uniqueId.localeCompare(b._uniqueId) || a._originalIndex - b._originalIndex);
            }

            // Handle Wingspan (convert to inches)
            if (sortConfig.key === 'Wingspan') {
                const aNum = parseFloat(a['Wingspan (in)'] as string) || 0;
                const bNum = parseFloat(b['Wingspan (in)'] as string) || 0;
                const wingspanCompare = sortConfig.direction === 'ascending'
                    ? aNum - bNum
                    : bNum - aNum;

                return wingspanCompare !== 0 ? wingspanCompare : (a._uniqueId.localeCompare(b._uniqueId) || a._originalIndex - b._originalIndex);
            }

            // Handle Weight
            if (sortConfig.key === 'Weight (lbs)') {
                const aNum = parseInt(aValue as string) || 0;
                const bNum = parseInt(bValue as string) || 0;
                const weightCompare = sortConfig.direction === 'ascending'
                    ? aNum - bNum
                    : bNum - aNum;

                return weightCompare !== 0 ? weightCompare : (a._uniqueId.localeCompare(b._uniqueId) || a._originalIndex - b._originalIndex);
            }

            // Handle Age
            if (sortConfig.key === 'Age') {
                const aNum = parseFloat(aValue as string) || 0;
                const bNum = parseFloat(bValue as string) || 0;
                const ageCompare = sortConfig.direction === 'ascending'
                    ? aNum - bNum
                    : bNum - aNum;

                return ageCompare !== 0 ? ageCompare : (a._uniqueId.localeCompare(b._uniqueId) || a._originalIndex - b._originalIndex);
            }

            // Handle Draft Year
            if (sortConfig.key === 'Draft Year') {
                const aNum = parseInt(aValue as string) || 0;
                const bNum = parseInt(bValue as string) || 0;
                const yearCompare = sortConfig.direction === 'ascending'
                    ? aNum - bNum
                    : bNum - aNum;

                return yearCompare !== 0 ? yearCompare : (a._uniqueId.localeCompare(b._uniqueId) || a._originalIndex - b._originalIndex);
            }

            // For numeric columns, try to parse as numbers
            const aNum = parseFloat(aValue as string);
            const bNum = parseFloat(bValue as string);

            if (!isNaN(aNum) && !isNaN(bNum)) {
                // Both are valid numbers
                const numericCompare = sortConfig.direction === 'ascending' ? aNum - bNum : bNum - aNum;
                return numericCompare !== 0 ? numericCompare : (a._uniqueId.localeCompare(b._uniqueId) || a._originalIndex - b._originalIndex);
            }

            // Default string comparison for non-numeric values
            const aStr = aValue === undefined ? '' : String(aValue);
            const bStr = bValue === undefined ? '' : String(bValue);

            let stringCompare: number;
            if (sortConfig.direction === 'ascending') {
                stringCompare = aStr.localeCompare(bStr);
            } else {
                stringCompare = bStr.localeCompare(aStr);
            }

            // If string comparison is equal, use secondary sort by Draft Pick (ascending - lower pick numbers first)
            if (stringCompare === 0) {
                const aPickValue = a['Actual Pick'];
                const bPickValue = b['Actual Pick'];

                // Handle "Undrafted" or picks >= 61 as higher numbers
                const getPickNumber = (pick: any): number => {
                    if (!pick) return 999;
                    const pickNum = Number(pick);
                    return pickNum >= 61 ? 999 : pickNum;
                };

                const aPickNum = getPickNumber(aPickValue);
                const bPickNum = getPickNumber(bPickValue);

                const pickCompare = aPickNum - bPickNum; // Always ascending for draft pick
                return pickCompare !== 0 ? pickCompare : (a._uniqueId.localeCompare(b._uniqueId) || a._originalIndex - b._originalIndex);
            }

            return stringCompare;
        });

        // Remove the added properties before returning
        return sortableProspects.map((item) => {
            const { _uniqueId, _originalIndex, ...prospect } = item;
            return prospect;
        }) as unknown as T[];
    }, [prospects, sortConfig, tierRankMap, rankingSystem]);

    // Get unique categories from columns or use passed categories
    const displayCategories = categories || [...new Set((columns || []).map(col => col.category))];

    // Helper function to render cell content
    const renderCell = (prospect: T, column: ColumnConfig) => {
        const key = column.key as keyof T;

        // Handle special cases for different column types
        if (column.key === 'Rank') {
            return (
                <TableCell key={column.key} className="text-gray-300 font-semibold text-center">
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
                    <div className="flex gap-2">
                        <LeagueLogo league={prospect['League']} />
                        <span>{prospect['League']}</span>
                    </div>
                </TableCell>
            );
        }

        if (column.key === 'Pre-NBA') {
            return (
                <TableCell key={column.key} className="text-gray-300 whitespace-nowrap">
                    <div className="flex gap-2">
                        <PreNBALogo preNBA={prospect['Pre-NBA']} />
                        <span>{prospect['Pre-NBA']}</span>
                    </div>
                </TableCell>
            );
        }

        if (column.key === 'Actual Pick') {
            return (
                <TableCell key={column.key} className="text-gray-300 text-center">
                    {Number(prospect['Actual Pick']) >= 61 ? "Undrafted" : prospect['Actual Pick']}
                </TableCell>
            );
        }


        if (column.key === 'NBA Team') {
            return (
                <TableCell key={column.key} className="text-gray-300 whitespace-nowrap">
                    <div className="flex gap-2">
                        <NBATeamLogo NBA={prospect['NBA Team']} />
                        <span>{prospect['NBA Team']}</span>
                    </div>
                </TableCell>
            );
        }

        if (column.key === 'Nationality') {
            return (
                <TableCell key={column.key} className="text-gray-300 whitespace-nowrap">
                    <div className="flex gap-2">
                        {prospect['Nationality'] ? (
                            <>
                                <NationalityLogo nationality={prospect['Nationality'] as string} />
                                <span>{prospect['Nationality']}</span>
                            </>
                        ) : (
                            <span>-</span>
                        )}
                    </div>
                </TableCell>
            );
        }

        // Handle Draft Year column
        if (column.key === 'Draft Year') {
            return (
                <TableCell key={column.key} className="text-gray-300 text-center">
                    {prospect['Draft Year'] || 'N/A'}
                </TableCell>
            );
        }

        // Handle Height, Wingspan, Wing - Height, Weight, and Age columns with centering
        if (['Height', 'Wingspan', 'Wing - Height', 'Weight (lbs)', 'Age'].includes(column.key)) {
            return (
                <TableCell key={column.key} className="text-gray-300 text-center">
                    {prospect[key] || 'N/A'}
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

        // Helper function to get blue gradient intensity for consensus range columns
        const getConsensusRankGradient = (value: any, key: string): { backgroundColor: string; color: string } => {
            if (value === null || value === undefined || value === '' || isNaN(parseFloat(String(value)))) {
                return { backgroundColor: 'transparent', color: '#d1d5db' }; // gray-300
            }

            const numValue = parseFloat(String(value));
            let intensity: number;

            if (key === 'COUNT') {
                // For COUNT, higher values are better (more consensus)
                // Normalize based on typical range (assume max around 150 contributors)
                intensity = Math.min(numValue / 150, 1);
            } else if (key === 'RANGE') {
                // For RANGE, lower values are better (less spread in rankings)
                // Normalize based on typical range (assume max around 60)
                const normalizedValue = Math.min(numValue / 60, 1);
                intensity = 1 - normalizedValue; // Invert so lower range = brighter
            } else if (key === 'STDEV') {
                // For STDEV, lower values are better (less deviation)
                // Normalize based on typical range (assume max around 20)
                const normalizedValue = Math.min(numValue / 20, 1);
                intensity = 1 - normalizedValue; // Invert so lower stdev = brighter
            } else {
                // For MEAN, MEDIAN, MODE, HIGH, LOW - lower ranks are better
                // Normalize based on draft range (1-60)
                const normalizedValue = Math.min(numValue / 60, 1);
                intensity = 1 - normalizedValue; // Invert so lower rank = brighter
            }

            // Ensure minimum visibility
            intensity = Math.max(0.1, Math.min(1, intensity));

            // Create blue gradient
            const backgroundColor = `rgba(59, 130, 246, ${0.1 + intensity * 0.4})`;
            const textColor = intensity > 0.3 ? '#ffffff' : '#e5e7eb';

            return { backgroundColor, color: textColor };
        };

        // Helper function to get blue gradient intensity for consensus range columns
        const getConsensusRangeGradient = (value: any, key: string): { backgroundColor: string; color: string } => {
            if (value === null || value === undefined || value === '' || isNaN(parseFloat(String(value)))) {
                return { backgroundColor: 'transparent', color: '#d1d5db' }; // gray-300
            }



            const numValue = parseFloat(String(value));

            // For percentage values, higher percentages should be brighter blue
            // Normalize to 0-1 range where 1 is brightest blue
            const intensity = Math.min(numValue, 1); // Cap at 1 (100%)

            // Create blue gradient - brighter blue for higher values, darker for lower
            const blueIntensity = Math.max(0.1, intensity); // Minimum 10% intensity for visibility
            const backgroundColor = `rgba(59, 130, 246, ${0.1 + blueIntensity * 0.4})`; // Blue with variable alpha
            const textColor = intensity > 0.3 ? '#ffffff' : '#e5e7eb'; // White text for high intensity, light gray for low

            return { backgroundColor, color: textColor };
        };

        const getEPMProjectionGradient = (value: any, key: string): { backgroundColor: string; color: string } => {
            if (value === null || value === undefined || value === '' || isNaN(parseFloat(String(value)))) {
                return { backgroundColor: 'transparent', color: '#d1d5db' }; // gray-300
            }

            const numValue = parseFloat(String(value));

            // For EPM projections, lower rank numbers are better (rank 1 = brightest, rank 100 = darkest)
            // Normalize based on 1-100 range
            const normalizedValue = Math.min((numValue - 1) / 99, 1); // Convert 1-100 to 0-1 range
            const intensity = 1 - normalizedValue; // Invert so rank 1 = intensity 1, rank 100 = intensity 0

            // Ensure minimum visibility for very high ranks
            const finalIntensity = Math.max(0.05, Math.min(1, intensity));

            // Create blue gradient
            const backgroundColor = `rgba(59, 130, 246, ${0.1 + finalIntensity * 0.5})`;
            const textColor = finalIntensity > 0.4 ? '#ffffff' : '#e5e7eb';

            return { backgroundColor, color: textColor };
        };

        // Handle Consensus Rank columns with blue gradient
        if (['MEAN', 'MEDIAN', 'MODE', 'HIGH', 'LOW', 'RANGE', 'STDEV', 'COUNT'].includes(column.key)) {
            const cellValue = prospect[key];
            let displayValue = '';

            if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
                const numValue = parseFloat(String(cellValue));
                if (!isNaN(numValue)) {
                    // Format based on column type
                    if (column.key === 'STDEV') {
                        displayValue = numValue.toFixed(1);
                    } else if (column.key === 'COUNT') {
                        displayValue = numValue.toString();
                    } else {
                        // For rank columns, show as whole numbers or 1 decimal if needed
                        displayValue = numValue % 1 === 0 ? numValue.toString() : numValue.toFixed(1);
                    }
                } else {
                    displayValue = String(cellValue);
                }
            }

            const gradientStyle = getConsensusRankGradient(cellValue, column.key);

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

        if (['1 - 3', '4 - 14', '15 - 30', '31 - 59', 'Undrafted', 'Inclusion Rate'].includes(column.key)) {
            const cellValue = prospect[key];
            let displayValue = '';

            if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
                const numValue = parseFloat(String(cellValue));
                if (!isNaN(numValue)) {
                    // Convert decimal to percentage (multiply by 100) and format to 1 decimal place
                    displayValue = `${(numValue * 100).toFixed(1)}%`;
                } else {
                    displayValue = String(cellValue);
                }
            }

            const gradientStyle = getConsensusRangeGradient(cellValue, column.key);

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

        if (['Pred. Y1 Rank', 'Pred. Y2 Rank', 'Pred. Y3 Rank', 'Pred. Y4 Rank', 'Pred. Y5 Rank', 'Rank Y1-Y3', 'Rank Y1-Y5'].includes(column.key)) {
            const cellValue = prospect[key];
            let displayValue = '';

            if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
                const numValue = parseFloat(String(cellValue));
                if (!isNaN(numValue)) {
                    // Show as whole numbers or 1 decimal if needed
                    displayValue = numValue % 1 === 0 ? numValue.toString() : numValue.toFixed(1);
                } else {
                    displayValue = String(cellValue);
                }
            } else {
                displayValue = 'N/A';
            }

            const gradientStyle = getEPMProjectionGradient(cellValue, column.key);

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

        // Handle Tier column with color styling and conditional "Tier" prefix
        if (column.key === 'Tier') {
            const displayValue = showTierPrefix ? formatTierDisplay(prospect.Tier) : prospect.Tier;
            // Use the original tier value for color lookup
            const tierColorKey = prospect.Tier;

            return (
                <TableCell key={column.key} className="text-gray-300 whitespace-nowrap">
                    <div className="flex justify-center">
                        <span
                            className="px-2 py-1 rounded text-sm font-bold"
                            style={{
                                backgroundColor: `${tierColors[tierColorKey] ? tierColors[tierColorKey] + '4D' : 'transparent'}`,
                                color: tierColors[tierColorKey] || 'inherit',
                                border: `1px solid ${tierColors[tierColorKey] || 'transparent'}`,
                            }}
                        >
                            {displayValue}
                        </span>
                    </div>
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
                                    className={`text-gray-400 font-semibold cursor-pointer hover:text-gray-200 whitespace-nowrap ${column.sortable ? '' : 'cursor-default'} ${
                                        // Center specific columns that should be centered
                                        ['Draft Age', 'Age', 'Actual Pick', 'Draft Year', 'Height', 'Wingspan', 'Wing - Height', 'Weight (lbs)', '1 - 3', '4 - 14', '15 - 30', '31 - 59'].includes(column.key) ? 'text-center' : ''
                                        }`}
                                    onClick={() => column.sortable && handleSort(column.key as keyof T | 'Rank')}
                                >
                                    {/* Display shortened labels for Range Consensus columns in table headers */}
                                    {['1 - 3', '4 - 14', '15 - 30', '31 - 59'].includes(column.key)
                                        ? column.key  // Show just "1 - 3", "4 - 14", etc.
                                        : column.label  // Show full label for all other columns
                                    }
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
                        {sortedProspects.map((prospect, index) => (
                            <TableRow
                                key={`${prospect.Name}-${prospect['Pre-NBA']}-${prospect['Draft Year'] || ''}-${index}`}
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