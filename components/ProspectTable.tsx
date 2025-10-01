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
    'Draft Year'?: string;
    'Nationality'?: string;
    [key: string]: any;
}

export interface ProspectTableProps<T extends BaseProspect> {
    prospects: T[];
    rankingSystem: Map<string, number>;
    initialColumns: ColumnConfig[];
    tierRankMap?: { [key: string]: number };
    className?: string;
    categories?: string[];
    lockedColumns?: string[];
    showTierPrefix?: boolean;
    draftYear?: string;
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
            return initialColumns;
        } else {
            return initialColumns.filter(col => col.key !== 'Draft Year');
        }
    }, [initialColumns, draftYear]);

    // Use the current page URL path as the storage key (calculated once on mount)
    const storageKey = useMemo(() => {
        if (typeof window !== 'undefined') {
            const pathname = window.location.pathname;
            const sanitized = pathname.replace(/[^a-zA-Z0-9]/g, '-');
            const key = `prospect-table-columns${sanitized}`;
            console.log('🔑 Storage key created:', key, 'from pathname:', pathname);
            return key;
        }
        return 'prospect-table-columns-default';
    }, []);

    // Load saved column visibility state on component mount
    useEffect(() => {
        try {
            const savedState = JSON.parse(localStorage.getItem(storageKey) || '{}');
            console.log('📥 Loading saved state:', savedState);
            console.log('📋 Available columns:', filteredInitialColumns.map(c => c.key));

            const updatedColumns = filteredInitialColumns.map(col => ({
                ...col,
                visible: savedState[col.key] !== undefined ? savedState[col.key] : col.visible
            }));

            console.log('✅ Updated columns:', updatedColumns.map(c => `${c.key}: ${c.visible}`));
            setColumns(updatedColumns);
        } catch (error) {
            console.warn('Failed to load saved column state:', error);
            setColumns(filteredInitialColumns);
        }
    }, [storageKey]); // Only re-run when storageKey changes (which it shouldn't)

    // Separate effect to update columns when filteredInitialColumns changes (e.g., year switch)
    useEffect(() => {
        if (columns.length === 0) return; // Skip if columns not yet initialized

        // Only sync if the column keys have actually changed (not just reference)
        const currentKeys = new Set(columns.map(c => c.key));
        const newKeys = new Set(filteredInitialColumns.map(c => c.key));
        
        const keysChanged = currentKeys.size !== newKeys.size || 
            [...currentKeys].some(key => !newKeys.has(key));

        if (!keysChanged) return; // Skip if just a reference change, not actual column changes

        try {
            const rawValue = localStorage.getItem(storageKey);
            console.log('🔄 Raw localStorage value:', rawValue, 'for key:', storageKey);
            
            const savedState = JSON.parse(rawValue || '{}');
            console.log('🔄 Updating columns for new data, saved state:', savedState);

            const updatedColumns = filteredInitialColumns.map(col => ({
                ...col,
                visible: savedState[col.key] !== undefined ? savedState[col.key] : col.visible
            }));

            console.log('🔄 Reapplied columns:', updatedColumns.map(c => `${c.key}: ${c.visible}`));
            setColumns(updatedColumns);
        } catch (error) {
            console.warn('Failed to update column state:', error);
        }
    }, [filteredInitialColumns, columns, storageKey]);

    // Save column visibility state whenever it changes
    const saveColumnState = useCallback((updatedColumns: ColumnConfig[]) => {
        try {
            const visibilityState = updatedColumns.reduce((acc, col) => {
                acc[col.key] = col.visible;
                return acc;
            }, {} as Record<string, boolean>);

            console.log('💾 Saving state:', visibilityState); // Debug log
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

    const visibleColumns = columns.filter(col => col.visible);

    // Helper function to format tier display
    const formatTierDisplay = (tierValue: string | number): string => {
        if (!tierValue && tierValue !== 0) return '';
        return `Tier ${tierValue}`;
    };

    // Helper function to create a unique identifier for each prospect
    const createUniqueId = (prospect: T): string => {
        const parts = [
            prospect.Name,
            prospect['Pre-NBA'],
            prospect['Draft Year'] || '',
            prospect['NBA Team']
        ];
        return parts.join('|');
    };

    const sortedProspects = useMemo(() => {
        if (!sortConfig) return prospects;

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

            if (sortConfig.key === 'Tier') {
                if (tierRankMap) {
                    const aRank = tierRankMap[aValue as keyof typeof tierRankMap] || 999;
                    const bRank = tierRankMap[bValue as keyof typeof tierRankMap] || 999;
                    const tierCompare = sortConfig.direction === 'ascending'
                        ? aRank - bRank
                        : bRank - aRank;

                    return tierCompare !== 0 ? tierCompare : (a._uniqueId.localeCompare(b._uniqueId) || a._originalIndex - b._originalIndex);
                } else {
                    const aNum = parseInt(aValue as string) || 0;
                    const bNum = parseInt(bValue as string) || 0;
                    const tierCompare = sortConfig.direction === 'ascending'
                        ? aNum - bNum
                        : bNum - aNum;

                    return tierCompare !== 0 ? tierCompare : (a._uniqueId.localeCompare(b._uniqueId) || a._originalIndex - b._originalIndex);
                }
            }

            if (sortConfig.key === 'Height') {
                const aNum = parseFloat(a['Height (in)'] as string) || 0;
                const bNum = parseFloat(b['Height (in)'] as string) || 0;
                const heightCompare = sortConfig.direction === 'ascending'
                    ? aNum - bNum
                    : bNum - aNum;

                return heightCompare !== 0 ? heightCompare : (a._uniqueId.localeCompare(b._uniqueId) || a._originalIndex - b._originalIndex);
            }

            if (sortConfig.key === 'Wingspan') {
                const aNum = parseFloat(a['Wingspan (in)'] as string) || 0;
                const bNum = parseFloat(b['Wingspan (in)'] as string) || 0;
                const wingspanCompare = sortConfig.direction === 'ascending'
                    ? aNum - bNum
                    : bNum - aNum;

                return wingspanCompare !== 0 ? wingspanCompare : (a._uniqueId.localeCompare(b._uniqueId) || a._originalIndex - b._originalIndex);
            }

            if (sortConfig.key === 'Weight (lbs)') {
                const aNum = parseInt(aValue as string) || 0;
                const bNum = parseInt(bValue as string) || 0;
                const weightCompare = sortConfig.direction === 'ascending'
                    ? aNum - bNum
                    : bNum - aNum;

                return weightCompare !== 0 ? weightCompare : (a._uniqueId.localeCompare(b._uniqueId) || a._originalIndex - b._originalIndex);
            }

            if (sortConfig.key === 'Age') {
                const aNum = parseFloat(aValue as string) || 0;
                const bNum = parseFloat(bValue as string) || 0;
                const ageCompare = sortConfig.direction === 'ascending'
                    ? aNum - bNum
                    : bNum - aNum;

                return ageCompare !== 0 ? ageCompare : (a._uniqueId.localeCompare(b._uniqueId) || a._originalIndex - b._originalIndex);
            }

            if (sortConfig.key === 'Draft Year') {
                const aNum = parseInt(aValue as string) || 0;
                const bNum = parseInt(bValue as string) || 0;
                const yearCompare = sortConfig.direction === 'ascending'
                    ? aNum - bNum
                    : bNum - aNum;

                return yearCompare !== 0 ? yearCompare : (a._uniqueId.localeCompare(b._uniqueId) || a._originalIndex - b._originalIndex);
            }

            const aNum = parseFloat(aValue as string);
            const bNum = parseFloat(bValue as string);

            if (!isNaN(aNum) && !isNaN(bNum)) {
                const numericCompare = sortConfig.direction === 'ascending' ? aNum - bNum : bNum - aNum;
                return numericCompare !== 0 ? numericCompare : (a._uniqueId.localeCompare(b._uniqueId) || a._originalIndex - b._originalIndex);
            }

            const aStr = aValue === undefined ? '' : String(aValue);
            const bStr = bValue === undefined ? '' : String(bValue);

            let stringCompare: number;
            if (sortConfig.direction === 'ascending') {
                stringCompare = aStr.localeCompare(bStr);
            } else {
                stringCompare = bStr.localeCompare(aStr);
            }

            if (stringCompare === 0) {
                const aPickValue = a['Actual Pick'];
                const bPickValue = b['Actual Pick'];

                const getPickNumber = (pick: any): number => {
                    if (!pick) return 999;
                    const pickNum = Number(pick);
                    return pickNum >= 61 ? 999 : pickNum;
                };

                const aPickNum = getPickNumber(aPickValue);
                const bPickNum = getPickNumber(bPickValue);

                const pickCompare = aPickNum - bPickNum;
                return pickCompare !== 0 ? pickCompare : (a._uniqueId.localeCompare(b._uniqueId) || a._originalIndex - b._originalIndex);
            }

            return stringCompare;
        });

        return sortableProspects.map((item) => {
            const { _uniqueId, _originalIndex, ...prospect } = item;
            return prospect;
        }) as unknown as T[];
    }, [prospects, sortConfig, tierRankMap, rankingSystem]);

    const displayCategories = categories || [...new Set((columns || []).map(col => col.category))];

    // Helper function to render cell content
    const renderCell = (prospect: T, column: ColumnConfig) => {
        const key = column.key as keyof T;

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

        if (column.key === 'Draft Year') {
            return (
                <TableCell key={column.key} className="text-gray-300 text-center">
                    {prospect['Draft Year'] || 'N/A'}
                </TableCell>
            );
        }

        if (['Height', 'Wingspan', 'Wing - Height', 'Weight (lbs)', 'Age'].includes(column.key)) {
            return (
                <TableCell key={column.key} className="text-gray-300 text-center">
                    {prospect[key] || 'N/A'}
                </TableCell>
            );
        }

        if (['Comp1', 'Comp2', 'Comp3', 'Comp4', 'Comp5'].includes(column.key)) {
            const compValue = prospect[key];
            return (
                <TableCell key={column.key} className="text-gray-300 whitespace-nowrap">
                    {String(compValue || '')}
                </TableCell>
            );
        }

        const getConsensusRankGradient = (value: any, key: string): { backgroundColor: string; color: string } => {
            if (value === null || value === undefined || value === '' || isNaN(parseFloat(String(value)))) {
                return { backgroundColor: 'transparent', color: '#d1d5db' };
            }

            const numValue = parseFloat(String(value));
            let intensity: number;

            if (key === 'COUNT') {
                intensity = Math.min(numValue / 150, 1);
            } else if (key === 'RANGE') {
                const normalizedValue = Math.min(numValue / 60, 1);
                intensity = 1 - normalizedValue;
            } else if (key === 'STDEV') {
                const normalizedValue = Math.min(numValue / 20, 1);
                intensity = 1 - normalizedValue;
            } else {
                const normalizedValue = Math.min(numValue / 60, 1);
                intensity = 1 - normalizedValue;
            }

            intensity = Math.max(0.1, Math.min(1, intensity));

            const backgroundColor = `rgba(59, 130, 246, ${0.1 + intensity * 0.4})`;
            const textColor = intensity > 0.3 ? '#ffffff' : '#e5e7eb';

            return { backgroundColor, color: textColor };
        };

        const getConsensusRangeGradient = (value: any, key: string): { backgroundColor: string; color: string } => {
            if (value === null || value === undefined || value === '' || isNaN(parseFloat(String(value)))) {
                return { backgroundColor: 'transparent', color: '#d1d5db' };
            }

            const numValue = parseFloat(String(value));
            const intensity = Math.min(numValue, 1);
            const blueIntensity = Math.max(0.1, intensity);
            const backgroundColor = `rgba(59, 130, 246, ${0.1 + blueIntensity * 0.4})`;
            const textColor = intensity > 0.3 ? '#ffffff' : '#e5e7eb';

            return { backgroundColor, color: textColor };
        };

        const getEPMProjectionGradient = (value: any, key: string): { backgroundColor: string; color: string } => {
            if (value === null || value === undefined || value === '' || isNaN(parseFloat(String(value)))) {
                return { backgroundColor: 'transparent', color: '#d1d5db' };
            }

            const numValue = parseFloat(String(value));
            const normalizedValue = Math.min((numValue - 1) / 99, 1);
            const intensity = 1 - normalizedValue;
            const finalIntensity = Math.max(0.05, Math.min(1, intensity));

            const backgroundColor = `rgba(59, 130, 246, ${0.1 + finalIntensity * 0.5})`;
            const textColor = finalIntensity > 0.4 ? '#ffffff' : '#e5e7eb';

            return { backgroundColor, color: textColor };
        };

        if (['MEAN', 'MEDIAN', 'MODE', 'HIGH', 'LOW', 'RANGE', 'STDEV', 'COUNT'].includes(column.key)) {
            const cellValue = prospect[key];
            let displayValue = '';

            if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
                const numValue = parseFloat(String(cellValue));
                if (!isNaN(numValue)) {
                    if (column.key === 'STDEV') {
                        displayValue = numValue.toFixed(1);
                    } else if (column.key === 'COUNT') {
                        displayValue = numValue.toString();
                    } else {
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

        if (['1 - 3', '4 - 14', '15 - 30', '2nd Round', 'Undrafted', 'Inclusion Rate'].includes(column.key)) {
            const cellValue = prospect[key];
            let displayValue = '';

            if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
                const numValue = parseFloat(String(cellValue));
                if (!isNaN(numValue)) {
                    let percentage: number;
                    
                    if (numValue <= 1) {
                        percentage = numValue * 100;
                    } else {
                        percentage = numValue;
                    }
                    
                    if (column.key === 'Inclusion Rate') {
                        percentage = Math.round(percentage);
                    }
                    
                    displayValue = `${percentage % 1 === 0 ? percentage.toString() : percentage.toFixed(1)}%`;
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

        if (['Pred. Y1 Rank', 'Pred. Y2 Rank', 'Pred. Y3 Rank', 'Pred. Y4 Rank', 'Pred. Y5 Rank', 'Y1 Rank', 'Y2 Rank', 'Y3 Rank', 'Y4 Rank', 'Y5 Rank', 'Rank Y1-Y3', 'Rank Y1-Y5'].includes(column.key)) {
            const cellValue = prospect[key];
            let displayValue = '';

            if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
                const numValue = parseFloat(String(cellValue));
                if (!isNaN(numValue)) {
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
                    style={{
                        backgroundColor: gradientStyle.backgroundColor,
                        color: gradientStyle.color
                    }}
                >
                    {displayValue}
                </TableCell>
            );
        }

        if (column.key.includes('Rank') && !column.key.includes('Position')) {
            const rankValue = prospect[key];
            return (
                <TableCell key={column.key} className="text-gray-300">
                    {typeof rankValue === 'number' ? rankValue.toString() : String(rankValue || '')}
                </TableCell>
            );
        }

        if (column.key === 'Tier') {
            const displayValue = showTierPrefix ? formatTierDisplay(prospect.Tier) : prospect.Tier;
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

        if (column.key === 'positionRanks') {
            return (
                <TableCell key={column.key} className="text-gray-300">
                    N/A
                </TableCell>
            );
        }

        const cellValue = prospect[key];
        return (
            <TableCell key={column.key} className="text-gray-300">
                {typeof cellValue === 'object' ? 'N/A' : String(cellValue || '')}
            </TableCell>
        );
    };

    return (
        <div className={`max-w-6xl mx-auto px-4 pt-2 ${className}`}>
            {/* Built-in Column Selector */}
            <div className="mb-4 relative">
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
                    className="overflow-hidden transition-all duration-300 ease-in-out absolute left-0 right-0 z-10"
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
                                                className="text-xs text-gray-300 hover:text-white px-1.5 md:px-2 py-0.5 md:py-1 rounded hover:bg-[#19191A] transition-colors"
                                            >
                                                {visibleCount === totalCount ? 'Hide All' : 'Show All'}
                                            </button>
                                        </div>
                                        <div className="space-y-1 md:space-y-2">
                                            {categoryColumns.map(column => (
                                                <div
                                                    key={column.key}
                                                    className="flex items-center gap-2 md:gap-3 p-1.5 md:p-2 rounded hover:bg-[#19191A] cursor-pointer transition-colors"
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
                                                        {column.key === 'Age' ? 'Draft Age' : column.label}
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
                                        ['Draft Age', 'Age', 'Actual Pick', 'Draft Year', 'Height', 'Wingspan', 'Wing - Height', 'Weight (lbs)', '1 - 3', '4 - 14', '15 - 30', '2nd Round', 'Inclusion Rate'].includes(column.key) ? 'text-center' : ''
                                        }`}
                                    onClick={() => column.sortable && handleSort(column.key as keyof T | 'Rank')}
                                >
                                    {['1 - 3', '4 - 14', '15 - 30', '2nd Round'].includes(column.key)
                                        ? column.key
                                        : column.key === 'Inclusion Rate'
                                            ? 'IR'
                                            : column.label
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