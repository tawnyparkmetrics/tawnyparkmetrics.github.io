import React from 'react';

interface DataSquareProps {
    label: string;
    value: string | number;
    highlight?: boolean;
}

export function DataSquare({ label, value, highlight = false }: DataSquareProps) {
    return (
        <div
            className={`
        aspect-square flex items-center justify-center p-1 border transition-all duration-300 group relative
        ${highlight
                    ? 'border-cyan-500 bg-cyan-950/20 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : 'border-gray-800 bg-gray-900/30 hover:border-gray-600 hover:bg-gray-800/50'
                }
      `}
            title={label}
        >
            <span className={`text-lg font-bold font-mono leading-none ${highlight ? 'text-cyan-300' : 'text-gray-300'}`}>
                {value}
            </span>

            {/* Corner accents */}
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-transparent group-hover:border-white/20 transition-colors" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-transparent group-hover:border-white/20 transition-colors" />
        </div>
    );
}
