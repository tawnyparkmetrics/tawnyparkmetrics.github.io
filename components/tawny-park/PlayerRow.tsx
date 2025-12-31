import React from 'react';
import { PlayerCard } from './PlayerCard';
import { DataSquare } from './DataSquare';

export interface Metric {
    label: string;
    value: string | number;
    highlight?: boolean;
}

interface PlayerRowProps {
    name: string;
    metrics: Metric[];
    rank?: number;
}

export function PlayerRow({ name, metrics, rank }: PlayerRowProps) {
    return (
        <div className="flex items-center gap-1 group transition-all duration-300 hover:bg-white/5 rounded-sm">
            {/* Player Name Section - Fixed Width */}
            <div className="w-56 flex-shrink-0">
                <PlayerCard name={name} />
            </div>

            {/* Metrics Section - Flexible Row */}
            <div className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar mask-gradient-right">
                {metrics.map((metric, index) => (
                    <div key={index} className="flex-shrink-0 w-14 h-14">
                        <DataSquare
                            label={metric.label}
                            value={metric.value}
                            highlight={metric.highlight}
                        />
                    </div>
                ))}

                {/* Optional Rank Box removed from here as it likely belongs in the main metrics array now */}
            </div>
        </div>
    );
}
