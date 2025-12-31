import React from 'react';
import { GridContainer } from '../../components/tawny-park/GridContainer';
import { PlayerRow, Metric } from '../../components/tawny-park/PlayerRow';

import NavigationHeader from '@/components/NavigationHeader';

export default function TawnyParkModelPage() {

    // Headers for the grid
    const HEADERS = [
        "AGE", "ROLE", "SIZE", "ATHL", "SHOT", "IN ARC", "PASS", "REB", "DEF", "AIO", "CONS.", "eOPP", "EPM", "RANK", "MIN.", "STDEV", "RANGE"
    ];

    // Helper to generate metrics for a player
    // Values are placeholders mostly, with some randomization for variety
    const createMetrics = (baseId: string, rank: number): Metric[] => [
        { label: "AGE", value: "19.2" },
        { label: "ROLE", value: "W/F" },
        { label: "SIZE", value: "70.9", highlight: true },
        { label: "ATHL", value: "80.3", highlight: true },
        { label: "SHOT", value: "37.6" },
        { label: "IN ARC", value: "50" },
        { label: "PASS", value: "45" },
        { label: "REB", value: "62" },
        { label: "DEF", value: "78" },
        { label: "AIO", value: "65" },
        { label: "CONS.", value: "88" },
        { label: "eOPP", value: "54" },
        { label: "EPM", value: "+4.2" },
        { label: "RANK", value: rank, highlight: true },
        { label: "MIN.", value: "24" },
        { label: "STDEV", value: "3.2" },
        { label: "RANGE", value: "LOW" },
    ];

    const players = [
        { name: "Cooper Flagg", rank: 1 },
        { name: "Ace Bailey", rank: 2 },
        { name: "Dylan Harper", rank: 3 },
        { name: "V.J. Edgecombe", rank: 4 },
        { name: "Nolan Traore", rank: 5 },
        { name: "Tre Johnson", rank: 6 },
        { name: "Drake Powell", rank: 7 },
        { name: "Ian Jackson", rank: 8 },
        { name: "Hugo Gonzalez", rank: 9 },
        { name: "Carter Bryant", rank: 10 },
    ];

    return (
        <>
            <NavigationHeader />
            <GridContainer>
                {/* Header Row */}
                <div className="flex items-center gap-1 mb-2 px-1 opacity-50 text-[10px] font-mono tracking-wider">
                    <div className="w-56 pl-2">PROSPECT</div>
                    <div className="flex-1 flex gap-1">
                        {HEADERS.map((h, i) => (
                            <div key={i} className="w-14 text-center">{h}</div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    {players.map((player) => (
                        <PlayerRow
                            key={player.rank}
                            name={player.name}
                            metrics={createMetrics(player.name, player.rank)}
                        />
                    ))}
                </div>

            </GridContainer>
        </>
    );
}
