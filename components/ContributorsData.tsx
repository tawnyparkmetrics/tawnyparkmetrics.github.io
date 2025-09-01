import React, { useState, useEffect, useMemo, useRef } from 'react';

// Interface for individual contributor information
interface ContributorInfo {
    name: string;
    url: string;
    totalRanks: number; // Number of prospects ranked by this contributor
    averageProspectsRanked: number; // For individual contributors, this will be the same as totalRanks
}


// Add this library at the top of your ContributorsData component file, outside the component
const CONTRIBUTOR_URLS: Record<string, string> = {
    // Media Outlets
    'Sam Vecenie (The Athletic)': 'https://theathletic.com/author/sam-vecenie/',
    'John Hollinger (The Athletic)': 'https://www.nytimes.com/athletic/3365655/2022/06/16/nba-draft-2022-top-75-prospects/',
    'Nick Heintzman':'https://www.nba-draft-scouting.com/post/2022-nba-draft-big-board',
    'CBS Sports': 'https://www.cbssports.com/nba/draft/',
    'ESPN': 'https://www.espn.com/nba/draft/',
    'The Ringer': 'https://www.theringer.com/nba',
    'Yahoo': 'https://sports.yahoo.com/nba/',
    'Fansided': 'https://fansided.com/nba/',
    'TPM': 'https://www.theplayersmedia.com/',
    'MavsDraft': 'https://mavsdraft.com/final-2022-nba-draft-big-board/',
    "Kevin O'Conner (The Ringer)": 'https://nbadraft.theringer.com/2021/',

    // Draft Sites
    'Tankathon': 'https://www.tankathon.com/',
    'NBADraft.net': 'https://www.nbadraft.net/',
    'NBA Draft Room': 'https://www.nbadraftroom.com/',
    'NBA Draft Network': 'https://www.nbadraftnetwork.com/',
    'NBADraftFuture': 'https://nbadraftfuture.com/',

    // Analytics Sites
    'No Ceilings': 'https://www.noceilings.com/',
    'CraftedNBA': 'https://craftednba.com/',
    'Swish Theory': 'https://swishtheory.com/',
    'Opta': 'https://www.optasports.com/',
    'the center hub': 'https://thecenterhub.net/',
    'databallr': 'https://databallr.com/',
};

// Helper function to generate Twitter URL from handle
const getTwitterUrl = (handle: string): string => {
    // Remove @ if present and any extra characters
    const cleanHandle = handle.replace('@', '').trim();
    return `https://twitter.com/${cleanHandle}`;
};

// Helper function to get URL for a contributor
const getContributorUrl = (contributorName: string): string => {
    // Check if it's a Twitter handle (starts with @)
    if (contributorName.startsWith('@')) {
        return getTwitterUrl(contributorName);
    }

    // Check if it's in our library
    if (CONTRIBUTOR_URLS[contributorName]) {
        return CONTRIBUTOR_URLS[contributorName];
    }

    // Return empty string if no URL found
    return '';
};

// Interface for overall contributor statistics
interface ContributorStats {
    totalContributors: number;
    totalRanks: number;
    averageProspectsPerBoard: number; // Average prospects ranked across all contributors
}

// Props for the ContributorsData component
interface ContributorsDataProps {
    selectedYear: '2025' | '2024' | '2023' | '2022' | '2021' | '2020';
    searchQuery?: string;
    onYearChange?: (year: '2025' | '2024' | '2023' | '2022' | '2021' | '2020') => void;
}

declare const Papa: any;

const ContributorsData: React.FC<ContributorsDataProps> = ({ selectedYear, searchQuery, onYearChange }) => {
    // State to store the list of contributors
    const [contributors, setContributors] = useState<ContributorInfo[]>([]);
    // State to store overall statistics
    const [stats, setStats] = useState<ContributorStats>({
        totalContributors: 0,
        totalRanks: 0,
        averageProspectsPerBoard: 0
    });
    // State to manage overall loading status (including script and data)
    const [loading, setLoading] = useState<boolean>(true);
    // State to track if PapaParse script has loaded
    const [isPapaParseLoaded, setIsPapaParseLoaded] = useState<boolean>(false);
    // State to manage error messages
    const [error, setError] = useState<string | null>(null);

    // Ref to ensure the script is only added once
    const scriptLoadedRef = useRef(false);

    // Available years for the dropdown
    const availableYears: ('2025' | '2024' | '2023' | '2022' | '2021' | '2020')[] = ['2025', '2024', '2023', '2022', '2021', '2020'];

    // Effect hook to dynamically load the PapaParse CDN script
    useEffect(() => {
        // Prevent multiple script loads if the component re-renders
        if (scriptLoadedRef.current) {
            setIsPapaParseLoaded(true); // If already loaded, set state and return
            return;
        }

        // Check if Papa is already globally available (e.g., if another component loaded it)
        if (typeof Papa !== 'undefined') {
            setIsPapaParseLoaded(true);
            scriptLoadedRef.current = true;
            return;
        }

        setLoading(true); // Indicate loading while script is being fetched
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js';
        script.async = true; // Load script asynchronously

        const onScriptLoad = () => {
            console.log('PapaParse script loaded successfully.');
            setIsPapaParseLoaded(true);
            scriptLoadedRef.current = true;
            setLoading(false); // Stop loading after script is loaded
        };

        const onScriptError = () => {
            console.error('Failed to load PapaParse script.');
            setError('Failed to load PapaParse library. Please check your internet connection.');
            setLoading(false); // Stop loading on error
        };

        script.addEventListener('load', onScriptLoad);
        script.addEventListener('error', onScriptError);

        document.head.appendChild(script); // Append script to the document head

        // Cleanup function to remove the script and event listeners if the component unmounts
        return () => {
            script.removeEventListener('load', onScriptLoad);
            script.removeEventListener('error', onScriptError);
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
        };
    }, []); // Empty dependency array means this effect runs only once on mount

    // Effect hook to load contributor data when selectedYear or PapaParse loading state changes
    useEffect(() => {
        // Only proceed if PapaParse is loaded and not already loading data
        if (!isPapaParseLoaded) {
            // If script isn't loaded yet, keep overall loading true and wait
            setLoading(true);
            return;
        }

        const loadContributorsData = async () => {
            // Set loading to true only for data fetching, not for script loading
            // (script loading handled by its own effect)
            if (!scriptLoadedRef.current) { // Ensure script is marked as loaded
                setLoading(true); // Keep general loading state true
            } else {
                setLoading(true); // Reset loading for data fetch
            }
            setError(null); // Clear any previous errors

            try {
                // *** IMPORTANT CHANGE ***
                // Use the new CSV file specifically for contributor information
                const csvFileName = `${selectedYear} Boards Submitted Consensus.csv`;
                const response = await fetch(`/${csvFileName}`); // Fetch the CSV file

                // Check if the network request was successful
                if (!response.ok) {
                    throw new Error(`Failed to load ${csvFileName}. Please ensure the file exists.`);
                }

                const csvText = await response.text(); // Get the CSV content as text

                // Parse the CSV text using PapaParse
                Papa.parse(csvText, {
                    header: true, // Treat the first row as headers
                    skipEmptyLines: true, // Ignore empty rows
                    complete: (results: any) => { // Use 'any' for results to handle PapaParse's generic type
                        try {
                            // Cast the parsed data to an array of records where keys are strings
                            // and values are also strings (as read from CSV)
                            const data = results.data as Record<string, string>[];

                            // If no data is found, set an error
                            if (data.length === 0) {
                                setError(`No contributor data found in ${csvFileName}`);
                                return;
                            }

                            // Map the raw CSV data to the ContributorInfo interface
                            // Updated to use the actual column names from the provided image
                            const contributorInfoArray: ContributorInfo[] = data
                                .map(row => ({
                                    name: row['Board'] || 'Unknown Contributor',
                                    // Use the helper function to get the appropriate URL
                                    url: getContributorUrl(row['Board'] || ''),
                                    totalRanks: parseInt(row['Names Entered'] || '0') || 0,
                                    averageProspectsRanked: parseInt(row['Names Entered'] || '0') || 0,
                                }))
                                .filter(contributor => contributor.totalRanks > 0)
                                .sort((a, b) => b.totalRanks - a.totalRanks);

                            // Calculate overall statistics from the processed contributor array
                            const totalContributors = contributorInfoArray.length;
                            const totalRanks = contributorInfoArray.reduce((sum, c) => sum + c.totalRanks, 0);
                            const averageProspectsPerBoard = totalContributors > 0 ? totalRanks / totalContributors : 0;

                            // Update the state with the new contributors and stats
                            setContributors(contributorInfoArray);
                            setStats({
                                totalContributors,
                                totalRanks,
                                // Round the average to one decimal place for display
                                averageProspectsPerBoard: Math.round(averageProspectsPerBoard * 10) / 10
                            });

                        } catch (parseError) {
                            console.error('Error parsing CSV data:', parseError);
                            setError('Error processing contributor data from the CSV.');
                        }
                    },
                    error: (error: any) => { // Use 'any' for error to handle PapaParse's generic type
                        console.error('Papa Parse error:', error);
                        setError('Error reading the CSV file.');
                    }
                });

            } catch (fetchError) {
                console.error('Error fetching contributors data:', fetchError);
                // Set an informative error message for fetch failures
                setError(`Could not load contributor data for ${selectedYear}. Please check the file path.`);
            } finally {
                setLoading(false); // Set loading to false once fetching is complete (or errors occurred)
            }
        };

        loadContributorsData(); // Call the async function to load data
    }, [selectedYear, isPapaParseLoaded]); // Re-run this effect whenever selectedYear or isPapaParseLoaded changes

    // Memoize the filtered contributors based on the search query
    const filteredContributors = useMemo(() => {
        if (!searchQuery) return contributors; // If no search query, return all contributors

        const query = searchQuery.toLowerCase(); // Convert query to lowercase for case-insensitive search
        return contributors.filter(contributor =>
            contributor.name.toLowerCase().includes(query) // Filter by contributor name
        );
    }, [contributors, searchQuery]); // Re-calculate when contributors or searchQuery changes

    // Display a loading spinner while data is being fetched
    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4">
                <div className="bg-[#19191A] rounded-lg border border-gray-800 p-6">
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Display an error message if data loading failed
    if (error) {
        return (
            <div className="max-w-6xl mx-auto px-4">
                <div className="bg-[#19191A] rounded-lg border border-gray-800 p-6">
                    <div className="text-center py-8 text-red-400">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    // Main component rendering
    return (
        <div className="max-w-6xl mx-auto px-4">
            {/* Tailwind CSS CDN is assumed to be available or loaded elsewhere */}
            <div className="bg-[#19191A] rounded-lg border border-gray-800 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                    <h2 className="text-2xl font-bold text-white">
                        {selectedYear} Consensus Contributors
                    </h2>

                    {/* Year Selection Dropdown */}
                    {onYearChange && (
                        <div className="flex items-center space-x-2">
                            <label htmlFor="year-select" className="text-gray-400 text-sm">
                                Year:
                            </label>
                            <select
                                id="year-select"
                                value={selectedYear}
                                onChange={(e) => onYearChange(e.target.value as '2025' | '2024' | '2023' | '2022' | '2021' | '2020')}
                                className="bg-gray-800 border border-gray-600 text-blue-400 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 transition-colors"
                            >
                                {availableYears.map(year => (
                                    <option key={year} value={year} className="bg-gray-800 text-blue-400">
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-700/50">
                    <p className="text-gray-400 mb-5">
                        Total Contributors: <span className="text-white font-semibold">{stats.totalContributors}</span>,
                        Total Ranks: <span className="text-white font-semibold">{stats.totalRanks}</span>,
                        Prospects Per Board: <span className="text-white font-semibold">{stats.averageProspectsPerBoard}</span>
                    </p>
                </div>

                <p className="text-gray-400 mb-8">
                    Our {selectedYear} consensus board is compiled from rankings provided by the following analysts, scouts, and platforms:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Map through filtered contributors to render each one */}
                    {filteredContributors.map((contributor, index) => (
                        <div
                            key={contributor.name}
                            className="bg-gray-800/20 border border-gray-700/50 rounded-lg p-4 hover:bg-gray-800/30 transition-colors duration-200 hover:border-blue-500/50 group"
                        >
                            {contributor.url ? (
                                // Render a clickable link if a URL is available
                                <a
                                    href={contributor.url}
                                    target="_blank" // Open link in a new tab
                                    rel="noopener noreferrer" // Security best practice for target="_blank"
                                    className="flex items-center space-x-3 w-full"
                                >
                                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                                        <span className="text-blue-400 font-semibold text-sm group-hover:text-blue-300">
                                            {index + 1} {/* Display ranking number */}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-gray-300 font-medium group-hover:text-white transition-colors block">
                                            {contributor.name}
                                        </span>
                                        <span className="text-gray-500 text-xs">
                                            {contributor.totalRanks} prospects ranked
                                        </span>
                                    </div>
                                </a>
                            ) : (
                                // Render a non-clickable div if no URL is available
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                                        <span className="text-blue-400 font-semibold text-sm group-hover:text-blue-300">
                                            {index + 1}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-gray-300 font-medium group-hover:text-white transition-colors block">
                                            {contributor.name}
                                        </span>
                                        <span className="text-gray-500 text-xs">
                                            {contributor.totalRanks} prospects ranked
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Display message if no contributors match the search query */}
                {filteredContributors.length === 0 && searchQuery && (
                    <div className="text-center py-8 text-gray-400">
                        No contributors found matching "{searchQuery}"
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContributorsData;