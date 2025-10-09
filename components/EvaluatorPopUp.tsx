import React, { useState, useEffect } from 'react';
import { X, Lock, ExternalLink } from 'lucide-react';

// Dictionary of evaluators whose rankings are behind paywalls
const PAYWALLED_EVALUATORS: Record<string, string> = {
    'Sam Vecenie (The Athletic)': 'this board is hidden behind a NYTimes subscription/paywall',
    'John Hollinger (The Athletic)': 'this board is hidden behind a NYTimes subscription/paywall'
};

const MOBILE_BOARD_NAMES: Record<string, string> = {
    "Sam Vecenie (The Athletic)": "Sam Vecenie",
    "John Hollinger (The Athletic)": "John Hollinger",
    "Kevin Pelton (ESPN)": "Kevin Pelton",
    "Coach Spins (The Box and One)": "Coach Spins",
    "Michael Neff (Swish Theory": "Michael Neff",
    "Kevin O'Connor (The Ringer)": "Kevin O'Connor",
    "@KlineNBA (Fansided)": "@KlineNBA",
    "@supersayansavin (TPM)": "@supersayansavin",
    "TheProcess (Colten Stout)": "Colten Stout",
    "@KevinOConnorNBA (Yahoo)": "Kevin O'Connor",
    "Matt Norlander (CBS Sports)": "Matt Norlander",
    "@JeremyWoo (ESPN)": "@JeremyWoo",
    "@JeremyWoo (Sports Illustrated)": "@JeremyWoo",
    "Kevin Broom (YODA)": "Kevin Broom",
    "Ryan O'Hara (Hoop Scout)": "Ryan O'Hara",
};

// Media logo mapping - maps domain patterns to logo filenames
const MEDIA_LOGOS: Record<string, string> = {
    'x.com': 'x.com',
    'twitter.com': 'x.com',
    'youtube.com': 'youtube.com',
    'reddit.com': 'reddit.com',
    'yahoo.com': 'yahoo.com',
    'bsky.app': 'bsky.app',
    'cbssports.com': 'cbssports.com',
    'espn': 'espn',
    'fansided.com': 'fansided.com',
    'noceilingsnba.com': 'noceilingsnba.com',
    'nytimes.com': 'nytimes.com',
    'on3.com': 'on3.com',
    'si.com': 'si.com',
    'tawnyparkmetrics.com': 'tawnyparkmetrics.com',
    'the-center-hub.com': 'the-center-hub.com',
    'theanalyst.com': 'theanalyst.com',
    'theringer.com': 'theringer.com',
    'bleacherreport.com': 'bleacherreport.com',
};

interface PlayerRanking {
    rank: number;
    name: string;
    draftPick?: number;
    consensusRank?: number;
    preNBA?: string;
    vsConsensus?: number;
}

interface SocialLink {
    url: string;
    iconName: string;
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
    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
    const [boardsCsvData, setBoardsCsvData] = useState<string>('');
    const [popupCsvData, setPopupCsvData] = useState<string>('');

    // Load the Boards Submitted Consensus CSV when component opens
    useEffect(() => {
        if (isOpen) {
            loadBoardsSubmittedCsv();
            loadPopupCsv();
        }
    }, [isOpen, year]);

    const loadBoardsSubmittedCsv = async () => {
        try {
            const csvFileName = `${year} Boards Submitted Consensus.csv`;
            const response = await fetch(`/${csvFileName}`);
            const csvText = await response.text();
            setBoardsCsvData(csvText);
            console.log(`Loaded ${csvFileName}`);
        } catch (error) {
            console.error('Error loading Boards Submitted Consensus CSV:', error);
        }
    };

    const loadPopupCsv = async () => {
        try {
            const csvFileName = `${year} Consensus PopUp.csv`;
            console.log('🔍 POPUP CSV: Attempting to load:', csvFileName);
            const response = await fetch(`/${csvFileName}`);
            console.log('🔍 POPUP CSV: Response status:', response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
            }
            
            const csvText = await response.text();
            console.log('🔍 POPUP CSV: Loaded successfully, length:', csvText.length);
            console.log('🔍 POPUP CSV: First 200 characters:', csvText.substring(0, 200));
            setPopupCsvData(csvText);
        } catch (error) {
            console.error('❌ POPUP CSV: Error loading Consensus PopUp CSV:', error);
        }
    };

    useEffect(() => {
        console.log('🔍 EFFECT: Running with:', { isOpen, evaluatorName, year, hasBoardsData: !!boardsCsvData, hasPopupData: !!popupCsvData });
        
        if (isOpen && evaluatorName) {
            // Extract social links from Boards Submitted Consensus CSV first
            if (boardsCsvData) {
                console.log('🔍 EFFECT: Extracting social links');
                extractSocialLinks();
            }
            
            // Check if this evaluator is paywalled
            if (PAYWALLED_EVALUATORS[evaluatorName]) {
                console.log('🔍 EFFECT: Evaluator is paywalled');
                setLoading(false);
                return;
            }
            
            // Only load rankings if we have the popup CSV data
            if (popupCsvData) {
                console.log('🔍 EFFECT: Loading rankings from popup CSV');
                loadRankings();
            } else {
                console.log('⚠️ EFFECT: Popup CSV data not yet available');
            }
        }
    }, [isOpen, evaluatorName, year, boardsCsvData, popupCsvData]);

    const loadRankings = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('🔍 LOAD RANKINGS: Starting');
            
            // Check if we have Popup CSV data
            if (!popupCsvData) {
                console.log('❌ LOAD RANKINGS: No popup CSV data');
                setError('Popup CSV data not loaded yet. Please wait...');
                setLoading(false);
                return;
            }

            const fileContent = popupCsvData;
            console.log('🔍 LOAD RANKINGS: Using popup CSV, length:', fileContent.length);

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
            console.log('🔍 LOAD RANKINGS: Successfully parsed', playerRankings.length, 'rankings');
            console.log('🔍 LOAD RANKINGS: First 3 rankings:', playerRankings.slice(0, 3));

            // Sort by rank
            playerRankings.sort((a, b) => a.rank - b.rank);
            setRankings(playerRankings);

        } catch (err) {
            console.error('❌ LOAD RANKINGS: Error loading rankings:', err);
            setError(err instanceof Error ? err.message : 'Failed to load rankings');
        } finally {
            console.log('🔍 LOAD RANKINGS: Finished, loading =', false);
            setLoading(false);
        }
    };

    const extractSocialLinks = () => {
        if (!boardsCsvData) return;

        const lines = boardsCsvData.split('\n').map((line: string) => line.trim()).filter((line: string) => line);
        
        if (lines.length < 2) return;

        const headerLine = lines[0];
        const headers = parseCSVLine(headerLine);

        console.log('Boards CSV headers:', headers);

        // Find the Board column and Link columns
        const boardIndex = headers.findIndex(h => h.trim().toLowerCase() === 'board');
        const link1Index = headers.findIndex(h => h.trim().toLowerCase() === 'link 1');
        const link2Index = headers.findIndex(h => h.trim().toLowerCase() === 'link 2');
        const link3Index = headers.findIndex(h => h.trim().toLowerCase() === 'link 3');

        console.log('Board column index:', boardIndex);
        console.log('Link indices:', { link1Index, link2Index, link3Index });

        // Find the row that matches the evaluator
        for (let i = 1; i < lines.length; i++) {
            const cells = parseCSVLine(lines[i]);
            const boardCell = cells[boardIndex]?.trim();

            if (!boardCell) continue;

            // Match evaluator name (handle @ symbols and case insensitivity)
            const cleanBoard = boardCell.toLowerCase().replace('@', '').trim();
            const cleanEvaluator = evaluatorName.toLowerCase().replace('@', '').trim();

            // Use exact match only to avoid confusion between similar names (e.g., ESPN vs Kevin Pelton (ESPN))
            if (cleanBoard === cleanEvaluator) {
                console.log('Found matching board row:', boardCell);

                // Extract links from this row
                const extractedLinks: SocialLink[] = [];
                const links = [
                    link1Index !== -1 ? cells[link1Index]?.trim() : '',
                    link2Index !== -1 ? cells[link2Index]?.trim() : '',
                    link3Index !== -1 ? cells[link3Index]?.trim() : ''
                ].filter(link => link && link !== '' && link !== 'NA' && link !== 'N/A' && link !== '-');

                console.log('Found links:', links);

                links.forEach(url => {
                    // Find matching media logo
                    let matched = false;
                    for (const [domain, iconName] of Object.entries(MEDIA_LOGOS)) {
                        if (url.toLowerCase().includes(domain)) {
                            extractedLinks.push({ url, iconName });
                            console.log(`Matched ${url} to ${iconName}`);
                            matched = true;
                            break;
                        }
                    }
                    // If no match found, add with default icon indicator
                    if (!matched) {
                        extractedLinks.push({ url, iconName: 'default' });
                        console.log(`No match for ${url}, using default icon`);
                    }
                });

                setSocialLinks(extractedLinks);
                console.log('Set social links:', extractedLinks);
                break;
            }
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
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-100">
                                <span className="md:hidden">{MOBILE_BOARD_NAMES[evaluatorName] || evaluatorName}</span>
                                <span className="hidden md:inline">{evaluatorName}</span>
                            </h2>
                            {/* Social Media Icons */}
                            {socialLinks.length > 0 && (
                                <div className="flex items-center gap-4">
                                    {socialLinks.map((link, index) => (
                                        <a
                                            key={index}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group transition-all duration-200"
                                            title={link.url}
                                        >
                                            {link.iconName === 'default' ? (
                                                <ExternalLink 
                                                    size={18}
                                                    className="text-gray-400 group-hover:text-gray-200 transition-all duration-200 group-hover:scale-110"
                                                />
                                            ) : (
                                                <img
                                                    src={`/media_logos/${link.iconName}.png`}
                                                    alt={link.iconName}
                                                    className={`${link.iconName === 'x.com' ? 'w-4 h-4 md:w-4 md:h-4' : link.iconName === 'tawnyparkmetrics.com' ? 'w-6 h-6 md:w-6 md:h-6' : 'w-5 h-5 md:w-5 md:h-5'} object-contain grayscale group-hover:grayscale-0 transition-all duration-200 group-hover:scale-110`}
                                                    style={{
                                                        filter: 'grayscale(100%) brightness(0.85)',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.filter = 'grayscale(0%) brightness(1)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.filter = 'grayscale(100%) brightness(0.85)';
                                                    }}
                                                    onError={(e) => {
                                                        console.error(`Failed to load icon: ${link.iconName}`);
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            )}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                        <p className="text-xs md:text-sm text-gray-400 mt-1">
                            {year} NBA Draft Board
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-200 transition-colors ml-4"
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