// BaseProspectCard.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { User as LucideUser } from 'lucide-react';
import { Barlow } from 'next/font/google';

interface DraftProspect {
    Name: string;
    'Pre-NBA': string;
    Role: string;
    Age: string;
    Height: string;
    Wingspan: string;
    'Wing - Height': string;
    'Weight (lbs)': string;
    'NBA Team': string;
    ABV: string;
    'Actual Pick': string;
    // Use a more permissive but still typed approach
    [key: string]: any;
}

const NBATeamLogo = ({ NBA }: { NBA: string }) => {
    const [logoError, setNBALogoError] = useState(false);
    const teamLogoUrl = `/nbateam_logos/${NBA}.png`;

    if (logoError) {
        return <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
            <span className="text-xs text-gray-400">{NBA}</span>
        </div>;
    }

    return (
        <div className="h-16 w-16 relative">
            <Image
                src={teamLogoUrl}
                alt={`${NBA} logo`}
                fill
                className={`object-contain ${NBA === 'Duke' ? 'brightness-125' : ''}`}
                onError={() => setNBALogoError(true)}
            />
        </div>
    );
};

const barlow = Barlow({
    subsets: ['latin'],
    weight: ['700'], // Use 700 for bold text
});

const collegeNames: { [key: string]: string } = {
    "UC Santa Barbara": "UCSB",
    "G League Ignite": "Ignite",
    "JL Bourg-en-Bresse": "JL Bourg",
    "Cholet Basket": "Cholet",
    "KK Crvena Zvezda": "KK Crvena",
    "Ratiopharm Ulm": "Ulm",
    "Washington State": "Washington St.",
    "KK Mega Basket": "KK Mega",
    "Melbourne United": "Melbourne Utd",
    "Eastern Kentucky": "EKU",
    "Western Carolina": "WCU",
    "KK Cedevita Olimpija": "KK C. Olimpija",
    "North Dakota State": "NDSU",
    "Delaware Blue Coats": "Del. Blue Coats",
    "Pallacanestro Reggiana": "Reggiana",
    "New Mexico State": "NMSU",
    "Fortitudo Bologna": "Ft. Bologna",
    "CB Gran Canaria": "Gran Canaria",
    "Baloncesto Málaga": "Málaga",
    "OTE City Reapers": "OTE Reapers",
}

const draftShort: { [key: string]: string } = {
    "G League Elite Camp": "G League Elite",
    "Portsmouth Invitational": "P.I.T."
}

interface BaseProspectCardProps {
    prospect: DraftProspect;
    rank: string | number;
    selectedYear: number | string;
    isMobile?: boolean;
    children?: React.ReactNode; // For dropdown content
    onExpand?: (isExpanded: boolean) => void;
    className?: string;
    isDraftMode?: boolean; // NEW PROP: Indicates if we're viewing draft results vs rankings
    draftYear?: string; // NEW PROP: To indicate if we're in 2020-2025 view
    imageYear?: string; // NEW PROP: For specifying which player_images folder to use
}

export const BaseProspectCard: React.FC<BaseProspectCardProps> = ({
    prospect,
    rank,
    selectedYear,
    isMobile = false,
    children,
    onExpand,
    className = '',
    isDraftMode = false, // NEW PROP: Default to false (rankings mode)
    draftYear, // NEW PROP: To indicate if we're in 2020-2025 view
    imageYear // NEW PROP: For specifying which player_images folder to use
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [logoError, setLogoError] = useState(false);

    // Check if device is mobile
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            // You can pass this back to parent if needed
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleMouseEnter = () => {
        if (!isMobile) {
            setIsHovered(true);
        }
    };

    const handleMouseLeave = () => {
        if (!isMobile && !isExpanded) {
            setIsHovered(false);
        }
    };

    // Update hover state when dropdown is expanded
    useEffect(() => {
        if (isExpanded && !isMobile) {
            setIsHovered(true);
        }
    }, [isExpanded, isMobile]);

    const handleCardClick = () => {
        const newExpanded = !isExpanded;
        setIsExpanded(newExpanded);
        if (!newExpanded && !isMobile) {
            setIsHovered(false);
        } else if (newExpanded && !isMobile) {
            setIsHovered(true);
        }
        onExpand?.(newExpanded);
    };

    // Dynamic player image URL for years 2020-2025
    const getPlayerImageUrl = (selectedYear: number | string, prospect: DraftProspect): string => {
        let yearToUse: number;
        
        // If imageYear is provided, use it directly
        if (imageYear) {
            yearToUse = parseInt(imageYear);
            console.log(`🖼️ ${prospect.Name}: Using imageYear=${imageYear}, using year=${yearToUse}`);
        } else if (selectedYear === '2020-2025') {
            // Use the prospect's actual draft year from their data
            const prospectYear = prospect['Draft Year'] ? parseInt(prospect['Draft Year'].toString()) : 2025;
            yearToUse = prospectYear;
            
            // Debug log to verify
            console.log(`🔍 ${prospect.Name}: selectedYear=${selectedYear}, Draft Year=${prospect['Draft Year']}, using year=${yearToUse}`);
        } else {
            yearToUse = typeof selectedYear === 'string' ? parseInt(selectedYear) : selectedYear;
            console.log(`📅 ${prospect.Name}: selectedYear=${selectedYear}, using year=${yearToUse}`);
        }
        
        // Validate year range
        if (yearToUse < 2020 || yearToUse > 2025) {
            console.warn(`⚠️ Year ${yearToUse} is outside the supported range (2020-2025). Falling back to 2024.`);
            yearToUse = 2024;
        }
    
        const finalPath = `/player_images${yearToUse}/${prospect.Name} BG Removed.png`;
        console.log(`🖼️ Final image path: ${finalPath}`);
        
        return finalPath;
    };

    const playerImageUrl = getPlayerImageUrl(selectedYear, prospect);
    const prenbalogoUrl = `/prenba_logos/${prospect['Pre-NBA']}.png`;

    // Helper function to get shortened college name
    const getShortenedCollegeName = (collegeName: string): string => {
        return collegeNames[collegeName] || collegeName;
    };

    // Helper function to get draft team name (shortened for mobile)
    const getDraftTeamName = (isMobileView: boolean) => {
        // Determine draft picks limit based on year
        const getDraftPicksLimit = (year: number): number => {
            switch (year) {
                case 2020:
                    return 60;
                case 2021:
                    return 60;
                case 2022:
                    return 58;
                case 2023:
                    return 58;
                case 2024:
                    return 58; // 2024 had 58 picks
                case 2025:
                    return 59; // 2025 has 59 picks (or adjust based on actual)
                default:
                    return 60; // Default fallback
            }
        };

        // Ensure selectedYear is a number for getDraftPicksLimit
        const yearNum = typeof selectedYear === 'string' ? parseInt(selectedYear) : selectedYear;
        const picksLimit = getDraftPicksLimit(yearNum);
        const actualPick = prospect['Actual Pick'];
        const team = isMobileView ? prospect.ABV : prospect['NBA Team'];
        
        // Add draft year in parentheses for 2020-2025 view
        const draftYearSuffix = draftYear === '2020-2025' && prospect['Draft Year'] ? ` (${prospect['Draft Year']})` : '';

        if (
            actualPick !== undefined &&
            actualPick !== null &&
            String(actualPick).trim() !== '' &&
            !isNaN(Number(actualPick)) &&
            Number(actualPick) <= picksLimit
        ) {
            const pickTeam = `${actualPick} - ${team}${draftYearSuffix}`;
            if (isMobileView) {
                return Object.keys(draftShort).reduce((name, longName) => {
                    return name.replace(longName, draftShort[longName]);
                }, pickTeam);
            }
            return pickTeam;
        } else {
            const udfaTeam = `UDFA - ${team}${draftYearSuffix}`;
            if (isMobileView) {
                return Object.keys(draftShort).reduce((name, longName) => {
                    return name.replace(longName, draftShort[longName]);
                }, udfaTeam);
            }
            return udfaTeam;
        }
    };

    return (
        <div className={`mx-auto px-4 mb-4 ${isMobile ? 'max-w-sm' : 'max-w-5xl'} ${className}`}>
            <motion.div layout="position" transition={{ layout: { duration: 0.3, ease: "easeInOut" } }}>
                <div className="relative">
                    {/* Main card container */}
                    <div
                        className={`
              relative overflow-hidden transition-all duration-300 border rounded-xl border-gray-700/50 shadow-[0_0_15px_rgba(255,255,255,0.07)] 
              ${!isMobile ? 'h-[400px] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:border-gray-600/50 cursor-pointer' : 'h-[100px] cursor-pointer'}
              isolate
            `}
                        style={{ backgroundColor: '#19191A' }}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        onClick={handleCardClick}
                    >
                        {/* Background Pre-NBA Logo */}
                        <div className={`
              absolute inset-0 flex items-center justify-start 
              ${isMobile ? 'pl-4' : 'pl-12'} 
              transition-opacity duration-300 
              ${((isHovered && !isMobile) || isExpanded) ? 'opacity-90' : 'opacity-20'}
              z-10
            `}>
                            {!logoError ? (
                                <Image
                                    src={prenbalogoUrl}
                                    alt={prospect['Pre-NBA']}
                                    width={isMobile ? 70 : 200}
                                    height={isMobile ? 70 : 200}
                                    className={`object-contain transition-transform duration-300 ${((isHovered && !isMobile) || isExpanded) ? 'scale-105 grayscale-0' : 'grayscale'}`}
                                    onError={() => setLogoError(true)}
                                />
                            ) : (
                                <div className={`${isMobile ? 'w-24 h-24' : 'w-48 h-48'} bg-gray-800 rounded-full flex items-center justify-center`}>
                                    <span className={`${isMobile ? 'text-sm' : 'text-xl'} text-gray-400`}>{prospect['Pre-NBA']}</span>
                                </div>
                            )}
                        </div>

                        {/* Rank Number - Now behind player image */}
                        <motion.div
                            layout="position"
                            className={`
        ${barlow.className}
        ${isMobile ? 'absolute top-1 right-3 z-20' : 'absolute top-6 right-8 z-45 transition-opacity duration-300'}
        ${((isHovered && !isMobile) || isExpanded) ? 'opacity-100' : 'opacity-100'}
    `}
                        >
                            <div className={`
        ${barlow.className} 
        ${isMobile ? 'text-1xl' : 'text-6xl'} 
        font-bold
        text-white
        select-none
        ${((isHovered && !isMobile) || isExpanded) ? (!isMobile ? 'mr-[300px]' : '') : ''} 
    `}>
                                {(() => {
                                    // FIXED LOGIC: Only show UDFA in draft mode, otherwise always show rank
                                    if (!isDraftMode) {
                                        // For rankings mode (Max's page, Nick's page, Andre's page, Consensus page)
                                        // Always show the actual rank regardless of draft outcome
                                        console.log(`${prospect.Name} in rankings mode - showing rank: ${rank}`);
                                        return rank;
                                    }

                                    // For draft mode only - check if player should show UDFA
                                    const getDraftPicksLimit = (year: number): number => {
                                        switch (year) {
                                            case 2020:
                                                return 60;
                                            case 2021:
                                                return 60;
                                            case 2022:
                                                return 58;
                                            case 2023:
                                                return 58;
                                            case 2024:
                                                return 58; // 2024 had 58 picks
                                            case 2025:
                                                return 59; // 2025 has 59 picks
                                            default:
                                                return 60; // Default fallback
                                        }
                                    };

                                    const picksLimit = getDraftPicksLimit(Number(selectedYear));
                                    const actualPick = prospect['Actual Pick'];
                                    const actualPickNum = Number(actualPick);

                                    // Debug logging for draft mode
                                    console.log('Debug UDFA check (draft mode):', {
                                        playerName: prospect.Name,
                                        actualPick: actualPick,
                                        actualPickNum: actualPickNum,
                                        selectedYear: selectedYear,
                                        picksLimit: picksLimit,
                                        isUndrafted: actualPick && actualPick.trim() !== '' && actualPickNum > picksLimit,
                                        rank: rank
                                    });

                                    // Check if player is undrafted
                                    if (actualPick && actualPick.trim() !== '') {
                                        // Check if actualPick is already "UDFA" string
                                        if (actualPick.toString().toUpperCase() === 'UDFA') {
                                            console.log(`${prospect.Name} should show UDFA (string match)`);
                                            return 'UDFA';
                                        }
                                        // Check if actualPick is a number greater than draft limit
                                        if (!isNaN(actualPickNum) && actualPickNum > picksLimit) {
                                            console.log(`${prospect.Name} should show UDFA (number > limit)`);
                                            return 'UDFA';
                                        }
                                    }

                                    // Return the original rank for drafted players in draft mode
                                    console.log(`${prospect.Name} should show rank: ${rank}`);
                                    return rank;
                                })()}
                            </div>
                        </motion.div>

                        {/* Player Image - Now in front of rank number */}
                        <div className="absolute inset-0 flex justify-center items-end overflow-hidden z-30">
                            <div className={`relative ${isMobile ? 'w-[90%] h-[90%]' : 'w-[90%] h-[90%]'}`}>
                                {!imageError ? (
                                    <div className="relative w-full h-full flex items-end justify-center">
                                        <Image
                                            src={playerImageUrl}
                                            alt={prospect.Name}
                                            fill
                                            className={`
                        object-contain 
                        object-bottom
                        transition-all duration-300 
                        ${((isHovered && !isMobile) || isExpanded) ? 'scale-105 grayscale-0' : 'grayscale'}
                      `}
                                            onError={() => setImageError(true)}
                                            sizes={isMobile ? "400px" : "800px"}
                                            priority
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <LucideUser className="text-gray-500" size={isMobile ? 32 : 48} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Large Centered Name */}
                        <motion.div
                            layout="position"
                            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 z-40 ${((isHovered && !isMobile) || isExpanded) ? 'opacity-0' : 'opacity-100'}`}
                        >
                            <div className="text-center z-10">
                                <h2 className={`
                  ${barlow.className} 
                  ${isMobile ? 'text-1xl' : 'text-7xl'}
                  font-bold 
                  text-white 
                  uppercase 
                  tracking-wider
                  [text-shadow:_0_1px_2px_rgb(0_0_0_/_0.4),_0_2px_4px_rgb(0_0_0_/_0.3),_0_4px_8px_rgb(0_0_0_/_0.5),_0_8px_16px_rgb(0_0_0_/_0.2)]
                `}>
                                    {prospect.Name}
                                </h2>
                            </div>
                        </motion.div>

                        {/* Desktop hover info panel */}
                        {!isMobile && (
                            <div
                                className={`absolute top-0 right-0 h-full w-[300px] backdrop-blur-sm transition-all duration-300 rounded-r-lg z-50 ${(isHovered || isExpanded) ? 'opacity-100' : 'opacity-0 translate-x-4 pointer-events-none'
                                    }`}
                                style={{ backgroundColor: 'rgba(25, 25, 26, 0.9)' }}
                            >
                                <div className="p-6 space-y-4 flex flex-col">
                                    <h3 className="text-lg font-semibold text-white">{prospect.Name}</h3>
                                    <div className="space-y-2 text-sm text-gray-300">
                                        <div><span className="font-bold text-white">Height  </span> {prospect.Height}</div>
                                        <div><span className="font-bold text-white">Wingspan  </span> {prospect.Wingspan}</div>
                                        <div><span className="font-bold text-white">Wing - Height  </span> {prospect['Wing - Height']}</div>
                                        <div><span className="font-bold text-white">Weight </span> {prospect['Weight (lbs)']}</div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-700">
                                        <div className="space-y-2 text-sm text-gray-300">
                                            <div><span className="font-bold text-white">Pre-NBA  </span> {prospect['Pre-NBA']}</div>
                                            <div><span className="font-bold text-white">Position  </span> {prospect.Role}</div>
                                            <div><span className="font-bold text-white">Draft Age  </span> {prospect.Age}</div>
                                            <div>
                                                <span className="font-bold text-white">Draft  </span>
                                                {getDraftTeamName(false)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* NBA Team logo */}
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                                        <NBATeamLogo NBA={prospect['NBA Team']} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Click to View Text - Desktop only */}
                    {!isExpanded && !isMobile && children && (
                        <div className="text-center mt-2">
                            <p className={`text-gray-500 text-sm font-bold ${isHovered ? 'animate-pulse' : ''}`}>
                                Click Card to View More Information
                            </p>
                        </div>
                    )}

                    {/* Mobile Info Dropdown */}
                    {isMobile && isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-2 p-4 rounded-xl border border-gray-700/50 shadow-[0_0_15px_rgba(255,255,255,0.07)] relative"
                            style={{ backgroundColor: 'rgba(25, 25, 26, 0.9)' }}
                        >
                            <h3 className="text-lg font-semibold text-white mb-2">{prospect.Name}</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {/* Draft Information Column */}
                                <div>
                                    <h4 className="font-semibold text-white text-sm mb-1">Draft Information</h4>
                                    <div className="space-y-1 text-xs text-gray-300">
                                        <div>
                                            <span className="font-bold text-white">Pre-NBA </span>
                                            {getShortenedCollegeName(prospect['Pre-NBA'])}
                                        </div>
                                        <div><span className="font-bold text-white">Position </span> {prospect.Role}</div>
                                        <div><span className="font-bold text-white">Draft Age </span> {prospect.Age}</div>
                                        <div>
                                            <span className="font-bold text-white">Draft </span>
                                            {getDraftTeamName(true)}
                                        </div>
                                    </div>
                                </div>

                                {/* Physicals Column */}
                                <div className="ml-2">
                                    <h4 className="font-semibold text-white text-sm mb-1">Physicals</h4>
                                    <div className="space-y-1 text-xs text-gray-300">
                                        <div><span className="font-bold text-white">Height </span> {prospect.Height}</div>
                                        <div><span className="font-bold text-white">Wingspan </span> {prospect.Wingspan}</div>
                                        <div><span className="font-bold text-white">Wing - Height </span> {prospect['Wing - Height']}</div>
                                        <div><span className="font-bold text-white">Weight </span> {prospect['Weight (lbs)']}</div>
                                    </div>
                                </div>
                            </div>
                            {/* Team Logo in Top Right */}
                            <div className="absolute top-3.5 right-3.5 transform scale-50 origin-top-right">
                                <NBATeamLogo NBA={prospect['NBA Team']} />
                            </div>
                        </motion.div>
                    )}

                    {/* Expanded Dropdown Content */}
                    {children && (
                        <div
                            className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                                }`}
                        >
                            <div className="rounded-xl backdrop-blur-sm p-4 mt-2 border border-gray-700/50 shadow-[0_0_15px_rgba(255,255,255,0.07)]"
                                style={{ backgroundColor: '#19191A' }}>
                                {children}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Divider - Desktop only */}
            {!isMobile && (
                <div>
                    <div className="h-px w-3/4 bg-gray my-5" />
                    <div className="h-px w-full bg-gray-700/30 my-8" />
                    <div className="h-px w-3/4 bg-gray my-5" />
                </div>
            )}
        </div>
    );
};