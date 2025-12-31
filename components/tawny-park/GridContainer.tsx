import React from 'react';

interface GridContainerProps {
    children: React.ReactNode;
}

export function GridContainer({ children }: GridContainerProps) {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-4 font-mono relative overflow-hidden">
            {/* Background Grid Effect */}
            <div
                className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: `
            linear-gradient(to right, #1a1a1a 1px, transparent 1px),
            linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)
          `,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Glow Effect */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.5)] z-10" />

            {/* Content Container */}
            <div className="relative z-10 w-fit mx-auto flex flex-col gap-1 p-2">
                {children}
            </div>
        </div>
    );
}
