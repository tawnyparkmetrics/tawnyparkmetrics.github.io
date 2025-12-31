import React from 'react';

interface PlayerCardProps {
    name: string;
}

export function PlayerCard({ name }: PlayerCardProps) {
    return (
        <div className="h-14 w-full border-l-4 border-cyan-400 bg-gray-900/50 p-2 flex items-center backdrop-blur-sm shadow-[0_0_15px_rgba(34,211,238,0.05)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <h1 className="text-sm font-bold tracking-tight text-white uppercase truncate">
                {name}
            </h1>

            {/* Decorative tech lines */}
            <div className="absolute top-0 right-0 w-12 h-[1px] bg-cyan-500/30" />
            <div className="absolute bottom-0 right-0 w-8 h-[1px] bg-cyan-500/30" />
        </div>
    );
}
