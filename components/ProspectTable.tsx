import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from 'next/image';
import CustomSelector, { ColumnConfig } from '@/components/CustomSelector';

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
    [key: string]: any; // Allow additional properties
}

export interface ProspectTableProps<T extends BaseProspect> {
    prospects: T[];
    rankingSystem: Map<string, number>;
    columns: ColumnConfig[];
    tierRankMap?: { [key: string]: number }; // For custom tier sorting
    className?: string;
}

export function ProspectTable<T extends BaseProspect>({
    prospects,
    rankingSystem,
    columns,
    tierRankMap,
    className = ''
}: ProspectTableProps<T>) {
    const [sortConfig, setSortConfig] = useState<{ key: keyof T | 'Rank'; direction: 'ascending' | 'descending' } | null>(null);
    const [columnSelectorOpen, setColumnSelectorOpen] = useState(false);

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

    return (
        <div className={`max-w-6xl mx-auto px-4 pt-2 ${className}`}>
            {/* Column Selector */}
            <div className="mb-2">
                <CustomSelector
                    columns={columns}
                    onColumnsChange={(newColumns) => {
                        // This would need to be handled by the parent component
                        // For now, we'll just log the change
                        console.log('Columns changed:', newColumns);
                    }}
                    isOpen={columnSelectorOpen}
                    onToggle={() => setColumnSelectorOpen(!columnSelectorOpen)}
                />
            </div>

            <div className="w-full overflow-x-auto bg-[#19191A] rounded-lg border border-gray-800">
                <Table>
                    <TableHeader className="sticky top-0 z-10 bg-[#19191A] border-b border-gray-800">
                        <TableRow>
                            {columns.filter(col => col.visible).map((column) => (
                                <TableHead
                                    key={column.key}
                                    className={`text-gray-400 cursor-pointer hover:text-gray-200 whitespace-nowrap ${column.sortable ? '' : 'cursor-default'}`}
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
                                className="hover:bg-gray-800/20"
                            >
                                {columns.filter(col => col.visible).map((column) => {
                                    const key = column.key as keyof T;

                                    // Handle special cases for different column types
                                    if (column.key === 'Rank') {
                                        return (
                                            <TableCell key={column.key} className="text-gray-300">
                                                {rankingSystem.get(prospect.Name) || 'N/A'}
                                            </TableCell>
                                        );
                                    }

                                    if (column.key === 'Name') {
                                        return (
                                            <TableCell key={column.key} className="font-medium text-gray-300 whitespace-nowrap">
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
                                                {Number(prospect['Actual Pick']) >= 60 ? "Undrafted" : prospect['Actual Pick']}
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
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
} 