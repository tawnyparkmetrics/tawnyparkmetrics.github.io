import React, { useCallback } from 'react';
import { Settings, ChevronDown } from 'lucide-react';

interface ColumnConfig {
    key: string;
    label: string;
    category: string; // Made flexible to accept any category
    visible: boolean;
    sortable: boolean;
}

interface ColumnSelectorProps {
    columns: ColumnConfig[];
    onColumnsChange: (columns: ColumnConfig[]) => void;
    isOpen: boolean;
    onToggle: () => void;
    categories?: string[]; // Optional: pass custom categories
    lockedColumns?: string[]; // Optional: specify which columns can't be toggled
}
/**
 * Utility function to determine if the device is mobile based on window width.
 * Returns true if window.innerWidth < 768 (Tailwind's sm breakpoint).
 */
export const isMobileDevice = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
};

/**
 * Utility classNames for mobile consistency.
 * Use these in your filter containers to ensure proper width and overflow handling.
 */
export const mobileFilterContainerClass =
    "w-full max-w-full overflow-x-auto flex flex-wrap gap-2 px-1 py-2";

/**
 * Example usage in a filter container:
 * <div className={isMobileDevice() ? mobileFilterContainerClass : "your-desktop-class"}>
 *   ...filter buttons...
 * </div>
 *
 * This ensures that on mobile, the filter container is full width, allows horizontal scrolling if needed,
 * and has consistent padding/gap.
 */

const ColumnSelector: React.FC<ColumnSelectorProps> = ({ 
    columns, 
    onColumnsChange, 
    isOpen, 
    onToggle,
    categories,
    lockedColumns = ['Rank', 'Name'] // Default locked columns
}) => {
    const handleToggleColumn = useCallback((key: string) => {
        // Prevent toggling locked columns
        if (lockedColumns.includes(key)) return;
        
        const updatedColumns = columns.map(col => 
            col.key === key ? { ...col, visible: !col.visible } : col
        );
        
        // Update immediately without debouncing
        onColumnsChange(updatedColumns);
    }, [columns, onColumnsChange, lockedColumns]);

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
        
        // Update immediately without debouncing
        onColumnsChange(updatedColumns);
    }, [columns, onColumnsChange, lockedColumns]);

    // Get unique categories from columns or use passed categories
    const displayCategories = categories || [...new Set(columns.map(col => col.category))];

    return (
        <div className="mb-4 relative">
            {/* Toggle Button */}
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 bg-[#19191A] border border-gray-800 rounded-lg text-gray-400 hover:border-gray-700 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <div 
                        className="transition-transform duration-300 ease-in-out"
                        style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    >
                        <Settings className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-sm md:text-base">Customize Table Columns</span>
                </div>
                <div 
                    className="transition-transform duration-300 ease-in-out"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                    <ChevronDown className="h-4 w-4" />
                </div>
            </button>

            {/* Collapsible Content */}
            <div 
                className="overflow-hidden transition-all duration-300 ease-in-out relative z-50"
                style={{ 
                    maxHeight: isOpen ? '1000px' : '0px',
                    opacity: isOpen ? 1 : 0
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
    );
};

export default ColumnSelector;
export type { ColumnConfig, ColumnSelectorProps };