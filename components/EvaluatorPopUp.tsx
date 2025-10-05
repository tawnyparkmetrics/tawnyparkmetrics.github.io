import React, { useState, useEffect } from 'react';
import { X, Lock } from 'lucide-react';

// Dictionary of evaluators whose rankings are behind paywalls
const PAYWALLED_EVALUATORS: Record<string, string> = {
    'Sam Vecenie (The Athletic)': 'this board is hidden behind a NYTimes subscription/paywall',
    'John Hollinger (The Athletic)': 'this board is hidden behind a NYTimes subscription/paywall'
};

interface PlayerRanking {
    rank: number;
    name: string;
    draftPick?: number;
    consensusRank?: number;
    preNBA?: string;
    vsConsensus?: number;
}

interface EvaluatorPopUpProps {
    isOpen: boolean;
    onClose: () => void;
    evaluatorName: string;
    year: number;
    csvData?: string;
    csvFileName?: string;
    allEvaluations?: any[];
}

export function EvaluatorPopUpModel({
    isOpen,
    onClose,
    evaluatorName,
    year,
    csvData,
    csvFileName,
    allEvaluations
}: EvaluatorPopUpProps) {
    const [rankings, setRankings] = useState<PlayerRanking[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && evaluatorName) {
            // Check if this evaluator is paywalled
            if (PAYWALLED_EVALUATORS[evaluatorName]) {
                setLoading(false);
                return;
            }
            loadRankings();
        }
    }, [isOpen, evaluatorName, year, csvData]);

    const loadRankings = async () => {
        setLoading(true);
        setError(null);

        try {
            // Check if we have CSV data
            if (!csvData) {
                setError('CSV data not loaded yet. Please wait...');
                setLoading(false);
                return;
            }

            const fileContent = csvData;

            // Parse CSV - the first row contains column headers including evaluator names
            const lines = fileContent.split('\n').map((line: string) => line.trim()).filter((line: string) => line);

            if (lines.length < 2) {
                throw new Error('CSV file does not have enough rows');
            }

            // First row contains all column headers (player info columns + evaluator names starting around column 33)
            const headerLine = lines[0];
            const headers = parseCSVLine(headerLine);

            console.log('Total columns:', headers.length);
            console.log('Columns 30-40:', headers.slice(30, 40));
            console.log('Looking for evaluator:', evaluatorName);

            // Find the evaluator's column index
            let evaluatorIndexFinal = headers.findIndex(header => {
                const cleanHeader = header.trim().toLowerCase().replace('@', '');
                const cleanEvaluator = evaluatorName.toLowerCase().replace('@', '').trim();
                return cleanHeader === cleanEvaluator;
            });

            if (evaluatorIndexFinal === -1) {
                // Try a more lenient match
                evaluatorIndexFinal = headers.findIndex(header =>
                    header.trim().toLowerCase().includes(evaluatorName.toLowerCase().replace('@', '').trim())
                );

                if (evaluatorIndexFinal === -1) {
                    throw new Error(`Evaluator "${evaluatorName}" not found in CSV. Available columns 30-40: ${headers.slice(30, 40).join(', ')}`);
                }
            }

            console.log('Found evaluator at column index:', evaluatorIndexFinal);
            console.log('Evaluator column name:', headers[evaluatorIndexFinal]);

            // Get the "Name" column index (should be first column or early in the list)
            const nameIndex = headers.findIndex(header =>
                header.trim().toLowerCase() === 'name'
            );

            if (nameIndex === -1) {
                throw new Error('Name column not found in CSV');
            }

            console.log('Name column at index:', nameIndex);

            // Get the "Actual Pick" column index
            const draftPickIndex = headers.findIndex(header =>
                header.trim().toLowerCase() === 'actual pick'
            );

            // Get the "Rank" column index (consensus rank)
            const consensusRankIndex = headers.findIndex(header =>
                header.trim().toLowerCase() === 'rank'
            );

            // Get the "Pre-NBA" column index
            const preNBAIndex = headers.findIndex(header =>
                header.trim().toLowerCase() === 'pre-nba'
            );

            console.log('Draft Pick column at index:', draftPickIndex);
            console.log('Consensus Rank column at index:', consensusRankIndex);
            console.log('Pre-NBA column at index:', preNBAIndex);

            // Parse player data starting from row 2 (index 1, since row 1/index 0 is headers)
            const playerRankings: PlayerRanking[] = [];

            console.log('Starting to parse players from row 2 (index 1)');
            console.log('Total data rows to process:', lines.length - 1);

            for (let i = 1; i < lines.length; i++) {
                const cells = parseCSVLine(lines[i]);

                if (cells.length <= Math.max(nameIndex, evaluatorIndexFinal)) {
                    continue;
                }

                const playerName = cells[nameIndex]?.trim();
                const rankValue = cells[evaluatorIndexFinal]?.trim();
                const draftPickValue = draftPickIndex !== -1 ? cells[draftPickIndex]?.trim() : undefined;
                const consensusRankValue = consensusRankIndex !== -1 ? cells[consensusRankIndex]?.trim() : undefined;
                const preNBAValue = preNBAIndex !== -1 ? cells[preNBAIndex]?.trim() : undefined;

                if (i <= 5) {
                    console.log(`Row ${i}: Player="${playerName}", Rank="${rankValue}", Draft Pick="${draftPickValue}", Consensus="${consensusRankValue}", Pre-NBA="${preNBAValue}"`);
                }

                if (playerName && rankValue && rankValue !== '' && rankValue !== 'NA' && rankValue !== 'N/A' && rankValue !== '-') {
                    const rank = parseFloat(rankValue);
                    if (!isNaN(rank)) {
                        const ranking: PlayerRanking = {
                            rank: Math.round(rank),
                            name: playerName
                        };

                        // Add draft pick if available
                        if (draftPickValue && draftPickValue !== '' && draftPickValue !== 'NA' && draftPickValue !== 'N/A' && draftPickValue !== '-') {
                            const draftPick = parseFloat(draftPickValue);
                            if (!isNaN(draftPick)) {
                                ranking.draftPick = Math.round(draftPick);
                            }
                        }

                        // Add consensus rank if available
                        if (consensusRankValue && consensusRankValue !== '' && consensusRankValue !== 'NA' && consensusRankValue !== 'N/A' && consensusRankValue !== '-') {
                            const consensusRank = parseFloat(consensusRankValue);
                            if (!isNaN(consensusRank)) {
                                ranking.consensusRank = Math.round(consensusRank);
                                // Calculate vs. Consensus
                                ranking.vsConsensus = ranking.consensusRank - ranking.rank;
                            }
                        }

                        // Add Pre-NBA if available
                        if (preNBAValue && preNBAValue !== '' && preNBAValue !== 'NA' && preNBAValue !== 'N/A' && preNBAValue !== '-') {
                            ranking.preNBA = preNBAValue;
                        }

                        playerRankings.push(ranking);
                    }
                }
            }

            console.log('Total rankings found:', playerRankings.length);

            // Sort by rank
            playerRankings.sort((a, b) => a.rank - b.rank);
            setRankings(playerRankings);

        } catch (err) {
            console.error('Error loading rankings:', err);
            setError(err instanceof Error ? err.message : 'Failed to load rankings');
        } finally {
            setLoading(false);
        }
    };

    // Helper function to parse CSV line (handles quotes and commas)
    const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }

        result.push(current);
        return result.map(cell => cell.trim().replace(/^"|"$/g, ''));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-[#19191A] border border-gray-700/40 rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col mx-4 md:mx-0">
                {/* Header */}
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-700/30">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-100">
                            {evaluatorName}
                        </h2>
                        <p className="text-xs md:text-sm text-gray-400 mt-1">
                            {year} NBA Draft Board
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-200 transition-colors"
                    >
                        <X size={20} className="md:hidden" />
                        <X size={24} className="hidden md:block" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto pt-0 px-3 md:px-6 pb-4 md:pb-6">
                    {/* Check if evaluator is paywalled */}
                    {PAYWALLED_EVALUATORS[evaluatorName] ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4">
                            <div className="bg-gray-800/40 rounded-full p-6 mb-4">
                                <Lock size={48} className="text-gray-400" />
                            </div>
                            <p className="text-gray-300 text-center max-w-md">
                                {PAYWALLED_EVALUATORS[evaluatorName]}
                            </p>
                        </div>
                    ) : (
                        <>
                            {loading && (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-gray-400">Loading rankings...</div>
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-900/20 border border-red-700/40 rounded-lg p-4">
                                    <p className="text-red-300">{error}</p>
                                </div>
                            )}

                            {!loading && !error && rankings.length === 0 && (
                                <div className="text-center py-12 text-gray-400">
                                    No rankings found for this evaluator
                                </div>
                            )}

                            {!loading && !error && rankings.length > 0 && (
                                <div className="space-y-2">
                                    {/* Column Headers - Desktop */}
                                    <div className="hidden md:flex sticky top-0 -mt-1 bg-[#19191A] z-10 items-center gap-4 px-3 pt-2 pb-2 border-b border-gray-700/30">
                                        <div className="flex-shrink-0 w-12 text-center">
                                            <span className="text-xs font-bold text-white uppercase">
                                                Rank
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-xs font-bold text-white uppercase">
                                                Player
                                            </span>
                                        </div>
                                        <div className="flex-shrink-0 w-16 text-center">
                                            <span className="text-xs font-bold text-white uppercase">
                                                Pre-NBA
                                            </span>
                                        </div>
                                        <div className="flex-shrink-0 w-20 text-center">
                                            <span className="text-xs font-bold text-white uppercase">
                                                Pick
                                            </span>
                                        </div>
                                        <div className="flex-shrink-0 w-20 text-center">
                                            <span className="text-xs font-bold text-white uppercase">
                                                Consensus
                                            </span>
                                        </div>
                                        <div className="flex-shrink-0 w-20 text-center">
                                            <span className="text-xs font-bold text-white uppercase">
                                                vs Cons.
                                            </span>
                                        </div>
                                    </div>

                                    {/* Player Rows */}
                                    {rankings.map((ranking) => (
                                        <div key={`${ranking.rank}-${ranking.name}`}>
                                            {/* Desktop View */}
                                            <div className="hidden md:flex items-center gap-4 p-3 bg-gray-800/30 hover:bg-gray-800/50 rounded-lg transition-colors">
                                                <div className="flex-shrink-0 w-12 text-center">
                                                    <span className="text-lg font-bold text-blue-400">
                                                        {ranking.rank}
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    <span className="text-gray-200 font-medium">
                                                        {ranking.name}
                                                    </span>
                                                </div>
                                                <div className="flex-shrink-0 w-16 text-center">
                                                    {ranking.preNBA ? (
                                                        <img 
                                                        src={`/prenba_logos/${ranking.preNBA}.png`}
                                                        alt={ranking.preNBA}
                                                            className="w-8 h-8 mx-auto object-contain"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        <span className="text-sm text-gray-500">-</span>
                                                    )}
                                                </div>
                                                <div className="flex-shrink-0 w-20 text-center">
                                                    {ranking.draftPick ? (
                                                        <span className="text-sm text-gray-300">
                                                            {ranking.draftPick}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-gray-300">UDFA</span>
                                                    )}
                                                </div>
                                                <div className="flex-shrink-0 w-20 text-center">
                                                    {ranking.consensusRank ? (
                                                        <span className="text-sm text-gray-300">
                                                            {ranking.consensusRank}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-gray-300">UDFA</span>
                                                    )}
                                                </div>
                                                <div className="flex-shrink-0 w-20 text-center">
                                                    {ranking.vsConsensus !== undefined ? (
                                                        <span className={`text-sm font-medium ${
                                                            ranking.vsConsensus > 0 ? 'text-green-400' : 
                                                            ranking.vsConsensus < 0 ? 'text-red-400' : 
                                                            'text-gray-300'
                                                        }`}>
                                                            {ranking.vsConsensus > 0 ? '+' : ''}{ranking.vsConsensus}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-gray-500">-</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Mobile View */}
                                            <div className="md:hidden bg-gray-800/30 hover:bg-gray-800/50 rounded-lg p-3 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg font-bold text-blue-400 flex-shrink-0">
                                                        {ranking.rank}
                                                    </span>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-gray-200 font-medium">
                                                                {ranking.name}
                                                            </span>
                                                            {ranking.preNBA && (
                                                                <img 
                                                                    src={`/prenba_logos/${ranking.preNBA}.png`}
                                                                    alt={ranking.preNBA}
                                                                    className="w-5 h-5 object-contain"
                                                                    onError={(e) => {
                                                                        e.currentTarget.style.display = 'none';
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap gap-3 text-xs">
                                                            <span className="text-gray-400">
                                                                Pick: <span className="text-gray-300">{ranking.draftPick || 'UDFA'}</span>
                                                            </span>
                                                            <span className="text-gray-400">
                                                                Consensus: <span className="text-gray-300">{ranking.consensusRank || 'UDFA'}</span>
                                                            </span>
                                                            {ranking.vsConsensus !== undefined && (
                                                                <span className="text-gray-400">
                                                                    vs Cons: <span className={`font-medium ${
                                                                        ranking.vsConsensus > 0 ? 'text-green-400' : 
                                                                        ranking.vsConsensus < 0 ? 'text-red-400' : 
                                                                        'text-gray-300'
                                                                    }`}>
                                                                        {ranking.vsConsensus > 0 ? '+' : ''}{ranking.vsConsensus}
                                                                    </span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default EvaluatorPopUpModel;