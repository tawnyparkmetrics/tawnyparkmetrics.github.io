// BaseProspectCard.tsx - Mobile optimized version
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
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
    'Wingspan (in)': string;
    'Height (in)': string;
    'NBA Team': string;
    ABV: string;
    'Actual Pick': string;
    // Use a more permissive but still typed approach
    [key: string]: any;
}

const barlow = Barlow({
    subsets: ['latin'],
    weight: ['400', '700'], // Added regular weight
});

const desktopCollegeNames: { [key: string]: string } = {
    "North Dakota State": "NDSU",
    "Paris Basketball": "Paris",
    "G League Ignite": "Ignite",
    "New Mexico State": "NMSU",
    "Mississippi State": "Mississippi St.",
    "Washington State": "Washington St.",
    "Rip City Remix": "Rip City",
    "UC Santa Barbara": "UCSB",
    "Melbourne United": "Melbourne Utd.",
    "Morehead State": "Morehead St.",
    "San Diego State": "SDSU",
    "San Jose State": "San Jose St.",
    "North Carolina": "UNC",
    "Michigan State": "Michigan St.",
    "Northwest Missouri State": "NW Missouri St.",
    "Florida State": "FSU",
    "OTE City Reapers": "OTE Reapers"
}

const mobileCollegeNames: { [key: string]: string } = {
    "UC Santa Barbara": "UCSB",
    "G League Ignite": "Ignite",
    "JL Bourg-en-Bresse": "JL Bourg",
    "Cholet Basket": "Cholet",
    "KK Crvena Zvezda": "KK Crvena",
    "Ratiopharm Ulm": "Ulm",
    "Washington State": "WSU",
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
    "Northwest Missouri State": "NW Missouri St.",
    "Metropolitans 92": "Metro 92",
    "Cal State Northridge": "CSUN",
    "Mississippi State" : "Mississippi St."
}

const draftShort: { [key: string]: string } = {
    "G League Elite Camp": "G League Elite",
    "Portsmouth Invitational": "P.I.T."
}

interface BaseProspectCardProps {
    prospect: DraftProspect;
    rank: string | number;
    selectedYear: number;
    isMobile?: boolean;
    children?: React.ReactNode; // For dropdown content
    onExpand?: (isExpanded: boolean) => void;
    className?: string;
    isDraftMode?: boolean;
    draftYear?: string;
    imageYear?: string;
}

const preNBALogoSizes: { [key: string]: { width: number; height: number; leftOffset?: number } } = {
    "Arkansas": { width: 175, height: 175, leftOffset: -30 },
    "Texas": { width: 150, height: 150, leftOffset: -10 },
    "VCU": { width: 150, height: 150, leftOffset: -10 },
    "Poitiers Basket 86": { width: 150, height: 150, leftOffset: -20 },
    "Illawarra": { width: 150, height: 150, leftOffset: -15 },
    "Florida": { width: 125, height: 125, leftOffset: -10 },
    "Trento": { width: 150, height: 150, leftOffset: -15 },
    "Missouri": { width: 150, height: 150, leftOffset: -15 },
    "North Dakota State": { width: 150, height: 150, leftOffset: -15 },
    "Providence": { width: 150, height: 150, leftOffset: -20 },
    "Penn State": { width: 150, height: 150, leftOffset: -20 },
    "Nebraska": { width: 100, height: 100 },
    "Georgia": { width: 125, height: 125 }, //off on mobile
    "Liberty": { width: 125, height: 125 },
}

const nbaLogoSizes: { [key: string]: { width: number; height: number; rightOffset?: number } } = {
    "New Orleans Pelicans": { width: 175, height: 175, rightOffset: -20 },
    "Oklahoma City Thunder": { width: 150, height: 150, rightOffset: -10 },
    "Los Angeles Lakers": { width: 150, height: 150, rightOffset: -10 },
    "Orlando Magic": { width: 150, height: 150 },
    "NBA Combine": { width: 70, height: 70, rightOffset: 20 },
}

const mobileViewPlayerName: { [key: string]: string } = {
    "Cameron Matthews": "Cam Matthews",
    "Matthew Cleveland": "Matt Cleveland",
    "K. Van der Vuurst de Vries": "K. Van Der Vuurst",
    "Kaodirichi Akobundu-Ehiogu": "K. Akobundu-Ehiogu",
    "Walter Clayton Jr.": "Walter Clayton",
    "Josiah-Jordan James": "Josiah J. James",
    "Terrence Shannon Jr.": "Terrence Shannon",
    "Carlton Carrington": "Bub Carrington",
    "Olivier-Maxence Prosper": "Olivier M. Prosper",
    "Nikos Rogkavopoulos": "N. Rogkavopoulos",
    "Vincent Valerio-Bodon": "Vincent V. Bodon",
    "Javon Freeman-Liberty": "J. Freeman-Liberty",
    "Giordano Bortolani": "Gio Bortolani",
    "Marcus Bingham Jr.": "Marcus Bingham",
    "Kenneth Lofton Jr.": "Kenny Lofton",
    "Michael Foster Jr.": "Michael Foster",
    "Vince Williams Jr.": "Vince Williams",
    "Patrick Baldwin Jr.": "Patrick Baldwin",
    "TyTy Washington Jr.": "Tyty Washington",
    "Brandon Boston Jr.": "BJ Boston",
    "Jeremiah Robinson-Earl": "J. Robinson-Earl",
    "Sandro Mamukelashvili": "Sandro Mamu",
    "Duane Washington Jr.": "Duane Washington",
    "Chaundee Brown Jr.": "Chaundee Brown",
    "De'Riante Jenkins": "De'Rian Jenkins",
    "Jon Axel Gudmundsson": "J. Axel Gudmundsson",
    "Rayshaun Hammonds": "Ray Hammonds",
}

const desktopViewPlayerName: { [key: string]: string } = {
    "K. Van der Vuurst de Vries": "K. Van Der Vuurst",
    "Kaodirichi Akobundu-Ehiogu": "K. Akobundu-Ehiogu"
}

export const BaseProspectCard: React.FC<BaseProspectCardProps> = ({
    prospect,
    rank,
    selectedYear,
    isMobile = false,
    children,
    onExpand,
    className = '',
    isDraftMode = false,
    draftYear,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [preNBALogoError, setPreNBALogoError] = useState(false);
    const [nbaLogoError, setNbaLogoError] = useState(false);

    const getPreNBALogoSize = (schoolName: string, isMobile: boolean) => {
        const customSize = preNBALogoSizes[schoolName];

        if (customSize) {
            // If mobile, scale down the custom size proportionally
            if (isMobile) {
                return {
                    width: Math.round(customSize.width * 0.5), // 50% of desktop size for mobile
                    height: Math.round(customSize.height * 0.5)
                };
            }
            return customSize;
        }

        // Default sizes if no custom size specified
        return isMobile ? { width: 50, height: 50 } : { width: 120, height: 120 };
    };

    const getNbaLogoSize = (teamName: string, isMobile: boolean) => {
        const customSize = nbaLogoSizes[teamName];

        if (customSize) {
            // If mobile, scale down the custom size proportionally
            if (isMobile) {
                return {
                    width: Math.round(customSize.width * 0.5), // 50% of desktop size for mobile
                    height: Math.round(customSize.height * 0.5)
                };
            }
            return customSize;
        }

        // Default sizes if no custom size specified
        return isMobile ? { width: 50, height: 50 } : { width: 120, height: 120 };
    };

    // Check if device is mobile
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
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

    const prenbalogoUrl = `/prenba_logos/${prospect['Pre-NBA']}.png`;
    const nbalogoUrl = `/nbateam_logos/${prospect['NBA Team']}.png`

    // Helper function to get player display name
    const getMobilePlayerDisplayName = (isMobileView: boolean): string => {
        if (isMobileView && mobileViewPlayerName[prospect.Name]) {
            return mobileViewPlayerName[prospect.Name];
        }
        return prospect.Name;
    };

    const getDesktopPlayerDisplayName = (): string => {
        if (desktopViewPlayerName[prospect.Name]) {
            return desktopViewPlayerName[prospect.Name];
        }
        return prospect.Name;
    };

    // Helper function to get shortened college name
    const getShortenedCollegeNameMobile = (collegeName: string): string => {
        return mobileCollegeNames[collegeName] || collegeName;
    };

    const getShortenedCollegeNameDesktop = (collegeName: string): string => {
        return desktopCollegeNames[collegeName] || collegeName;
    };

    // Helper function to get draft team name (shortened for mobile)
    const getDraftTeamName = (isMobileView: boolean) => {
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
                    return 58;
                case 2025:
                    return 59;
                default:
                    return 60;
            }
        };

        const yearNum = selectedYear;
        const picksLimit = getDraftPicksLimit(selectedYear);
        const actualPick = prospect['Actual Pick'];
        const team = isMobileView ? prospect.ABV : prospect['NBA Team'];

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
        <div className={`mx-auto px-4 mb-2 ${isMobile ? 'max-w-sm' : 'max-w-5xl'} ${className}`}>
            <motion.div layout="position" transition={{ layout: { duration: 0.3, ease: "easeInOut" } }}>
                <div className="relative">
                    {/* Main card container */}
                    <div
                        className={`
                            relative overflow-hidden transition-all duration-300 border rounded-xl cursor-pointer
                            ${isMobile ? 'h-[80px]' : 'h-[180px]'}
                            ${((isHovered && !isMobile) || isExpanded)
                                ? 'bg-gray-800/20 border-gray-600/50 shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                                : 'bg-[#19191A] border-gray-700/50 shadow-[0_0_15px_rgba(255,255,255,0.07)]'
                            }
                        `}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        onClick={handleCardClick}
                    >
                        {/* Background Pre-NBA Logo */}
                        <div className={`
                            absolute inset-0 flex items-center justify-start 
                            transition-opacity duration-300
                            ${((isHovered && !isMobile) || isExpanded) ? 'opacity-90' : 'opacity-20'}
                            z-10
                        `}
                            style={{
                                paddingLeft: isMobile
                                    ? `${15 + (preNBALogoSizes[prospect['Pre-NBA']]?.leftOffset ? Math.round(preNBALogoSizes[prospect['Pre-NBA']]!.leftOffset! * 0.5) : 0)}px` // Mobile: base 20px + scaled offset
                                    : `${48 + (preNBALogoSizes[prospect['Pre-NBA']]?.leftOffset || 0)}px` // Desktop: base 48px + full offset
                            }}
                        >
                            {(() => {
                                const logoSize = getPreNBALogoSize(prospect['Pre-NBA'], isMobile);
                                return !preNBALogoError ? (
                                    <Image
                                        src={prenbalogoUrl}
                                        alt={prospect['Pre-NBA']}
                                        width={logoSize.width}
                                        height={logoSize.height}
                                        className={`object-contain transition-transform duration-300 ${((isHovered && !isMobile) || isExpanded) ? 'scale-105 grayscale-0' : 'grayscale'}`}
                                        onError={() => setPreNBALogoError(true)}
                                    />
                                ) : (
                                    <div className={`${isMobile ? 'w-8 h-8' : 'w-32 h-32'} bg-gray-800 rounded-full flex items-center justify-center`}>
                                        <span className={`${isMobile ? 'text-xs' : 'text-lg'} text-gray-400`}>{prospect['Pre-NBA']}</span>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Background NBA Logo - Mobile only */}
                        {isMobile && (
                            <div className={`
                                absolute inset-0 flex items-center justify-end 
                                transition-all duration-300
                                ${isExpanded ? 'opacity-10' : 'opacity-5'}
                                z-10
                            `}
                                style={{
                                    paddingRight: `${12 + (nbaLogoSizes[prospect['NBA Team']]?.rightOffset ? Math.round(nbaLogoSizes[prospect['NBA Team']]!.rightOffset! * 0.5) : 0)}px` // Mobile: base 12px + scaled offset
                                }}
                            >
                                {!nbaLogoError ? (
                                    <Image
                                        src={nbalogoUrl}
                                        alt={prospect['NBA Team']}
                                        width={100}
                                        height={100}
                                        className={`object-contain transition-all duration-300 ${isExpanded ? 'grayscale-0' : 'grayscale'}`}
                                        onError={() => setNbaLogoError(true)}
                                    />
                                ) : (
                                    <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                                        <span className="text-xs text-gray-400">{prospect['NBA Team']}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Mobile: Player Name - Centered */}
                        {isMobile ? (
                            <>
                                {/* Player Name - Absolutely centered with forced font size */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <h2 className={`
                                        ${barlow.className} 
                                        font-bold tracking-wide transition-all duration-300
                                        ${((isHovered && !isMobile) || isExpanded)
                                            ? 'text-white drop-shadow-[0_8px_16px_rgba(0,0,0,2)]'
                                            : 'text-[#6c727f] drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]'
                                        }
                                        z-10
                                    `}
                                    style={{ fontSize: '1.25rem', lineHeight: '1.75rem' }} // Force text-xl equivalent
                                    >
                                        {getMobilePlayerDisplayName(true).toUpperCase()}
                                    </h2>
                                </div>

                                {/* Rank Number - Top right */}
                                <div className="absolute top-5 right-3 transform -translate-y-1/2 z-25">
                                    <div className={`
                                        ${barlow.className} 
                                        text-m font-bold tracking-wide transition-all duration-300
                                        ${((isHovered && !isMobile) || isExpanded)
                                            ? 'text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]'
                                            : 'text-[#6c727f] drop-shadow-[0_1px_4px_rgba(0,0,0,1)]'
                                        }
                                    `}
                                    style={{ fontSize: '1rem', lineHeight: '1.5rem' }}
                                    >
                                        {(() => {
                                            if (!isDraftMode) {
                                                return rank;
                                            }

                                            const getDraftPicksLimit = (year: number): number => {
                                                switch (year) {
                                                    case 2020: return 60;
                                                    case 2021: return 60;
                                                    case 2022: return 58;
                                                    case 2023: return 58;
                                                    case 2024: return 58;
                                                    case 2025: return 59;
                                                    default: return 60;
                                                }
                                            };

                                            const picksLimit = getDraftPicksLimit(Number(selectedYear));
                                            const actualPick = prospect['Actual Pick'];
                                            const actualPickNum = Number(actualPick);

                                            if (actualPick && actualPick.trim() !== '') {
                                                if (actualPick.toString().toUpperCase() === 'UDFA') {
                                                    return 'UDFA';
                                                }
                                                if (!isNaN(actualPickNum) && actualPickNum > picksLimit) {
                                                    return 'UDFA';
                                                }
                                            }

                                            return rank;
                                        })()}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Desktop: Rank Number - Top right */}
                                <div className="absolute top-2 right-3 z-25">
                                    <div className={`
                                        ${barlow.className} 
                                        text-4xl font-bold tracking-wide transition-all duration-300
                                        ${((isHovered && !isMobile) || isExpanded)
                                            ? 'text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]'
                                            : 'text-[#6c727f] drop-shadow-[0_1px_4px_rgba(0,0,0,1)]'
                                        }
                                    `}>
                                        {(() => {
                                            if (!isDraftMode) {
                                                return rank;
                                            }

                                            const getDraftPicksLimit = (year: number): number => {
                                                switch (year) {
                                                    case 2020: return 60;
                                                    case 2021: return 60;
                                                    case 2022: return 58;
                                                    case 2023: return 58;
                                                    case 2024: return 58;
                                                    case 2025: return 59;
                                                    default: return 60;
                                                }
                                            };

                                            const picksLimit = getDraftPicksLimit(Number(selectedYear));
                                            const actualPick = prospect['Actual Pick'];
                                            const actualPickNum = Number(actualPick);

                                            if (actualPick && actualPick.trim() !== '') {
                                                if (actualPick.toString().toUpperCase() === 'UDFA') {
                                                    return 'UDFA';
                                                }
                                                if (!isNaN(actualPickNum) && actualPickNum > picksLimit) {
                                                    return 'UDFA';
                                                }
                                            }

                                            return rank;
                                        })()}
                                    </div>
                                </div>

                                {/* Desktop: Player Name - Centered */}
                                <div className="absolute inset-0 flex items-center justify-center -mt-4">
                                    <h2 className={`
                                        ${barlow.className} 
                                        text-5xl font-bold tracking-wide transition-all duration-300
                                        ${((isHovered && !isMobile) || isExpanded)
                                            ? 'text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]'
                                            : 'text-[#6c727f] drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]'
                                        }
                                        z-10
                                    `}>
                                        {getDesktopPlayerDisplayName().toUpperCase()}
                                    </h2>
                                </div>
                            </>
                        )}

                        {/* NBA Team Logo - Desktop only */}
                        {!isMobile && (
                            <div className={`
                                absolute inset-0 flex items-center justify-end 
                                transition-opacity duration-300
                                ${((isHovered && !isMobile) || isExpanded) ? 'opacity-100' : 'opacity-20'}
                                z-10
                            `}
                                style={{
                                    paddingRight: `${48 + (nbaLogoSizes[prospect['NBA Team']]?.rightOffset || 0)}px` // Base 48px + any custom offset
                                }}
                            >
                                {(() => {
                                    const logoSize = getNbaLogoSize(prospect['NBA Team'], isMobile);
                                    return !nbaLogoError ? (
                                        <Image
                                            src={nbalogoUrl}
                                            alt={prospect['NBA Team']}
                                            width={logoSize.width}
                                            height={logoSize.height}
                                            className={`object-contain transition-transform duration-300 ${((isHovered && !isMobile) || isExpanded) ? 'scale-105 grayscale-0' : 'grayscale'}`}
                                            onError={() => setNbaLogoError(true)}
                                        />
                                    ) : (
                                        <div className="w-32 h-32 bg-gray-800 rounded-full flex items-center justify-center">
                                            <span className="text-lg text-gray-400">{prospect['NBA Team']}</span>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        {/* Additional Info Bar (Desktop only) */}
                        {!isMobile && (
                            <div className={`
                                absolute bottom-12 left-1/2 -translate-x-1/2
                                flex items-center whitespace-nowrap tracking-wide text-sm
                                transition-all duration-300 
                                ${((isHovered && !isMobile) || isExpanded)
                                    ? 'text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]'
                                    : 'text-[#6c727f] drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]'
                                }
                            `}>
                                <span>{getShortenedCollegeNameDesktop(prospect['Pre-NBA'])}</span>
                                <div className="mx-1.5 h-4 w-px bg-gray-500"></div>
                                <span>{prospect.Role.toUpperCase()}</span>
                                <div className="mx-1.5 h-4 w-px bg-gray-500"></div>
                                <span>H: {prospect.Height}</span>
                                <div className="mx-1.5 h-4 w-px bg-gray-500"></div>
                                <span>WS: {prospect.Wingspan} {(() => {
                                    const wingspan = prospect.Wingspan;
                                    const heightIn = parseFloat(prospect['Height (in)']) || 0;
                                    const wingspanIn = parseFloat(prospect['Wingspan (in)']) || 0;
                                    const diff = wingspanIn - heightIn;

                                    if (!wingspan || wingspan === 'N/A' || wingspan.toString().toLowerCase() === 'n/a') {
                                        return '';
                                    }

                                    const formattedDiff = parseFloat(diff.toFixed(2));

                                    if (formattedDiff >= 0) {
                                        return `(+${formattedDiff})`;
                                    } else {
                                        return `(${formattedDiff})`;
                                    }
                                })()}</span>
                                <div className="mx-1.5 h-4 w-px bg-gray-500"></div>
                                <span>W: {prospect['Weight (lbs)']} lbs</span>
                                <div className="mx-1.5 h-4 w-px bg-gray-500"></div>
                                <span>AGE: {prospect.Age}</span>
                                <div className="mx-1.5 h-4 w-px bg-gray-500"></div>
                                <span>{getDraftTeamName(true)}</span>
                            </div>
                        )}
                    </div>

                    {/* Click to View Text - Desktop only */}
                    {!isExpanded && !isMobile && children && (
                        <div className="text-center mt-2">
                            <p className={`text-gray-500 text-sm font-bold ${isHovered ? 'animate-pulse' : 'opacity-50'}`}>
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
                            className="mt-2 p-4 rounded-xl border border-gray-700/50 shadow-[0_0_15px_rgba(255,255,255,0.07)] relative bg-gray-800/20"
                        >
                            <div className="flex justify-center gap-8">
                                {/* Draft Information Column */}
                                <div>
                                    <h4 className="font-semibold text-white text-sm mb-1">Draft Information</h4>
                                    <div className="space-y-1 text-xs text-gray-300">
                                        <div>
                                            <span className="font-bold text-white">Pre-NBA </span>
                                            {getShortenedCollegeNameMobile(prospect['Pre-NBA'])}
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
                                <div>
                                    <h4 className="font-semibold text-white text-sm mb-1">Physicals</h4>
                                    <div className="space-y-1 text-xs text-gray-300">
                                        <div><span className="font-bold text-white">Height </span> {prospect.Height}</div>
                                        <div><span className="font-bold text-white">Wingspan </span> {prospect.Wingspan}</div>
                                        <div><span className="font-bold text-white">Wing - Height </span> {prospect['Wing - Height']}</div>
                                        <div><span className="font-bold text-white">Weight </span> {prospect['Weight (lbs)']} lbs</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Expanded Dropdown Content */}
                    {children && (
                        <div
                            className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                                }`}
                        >
                            <div className="rounded-xl backdrop-blur-sm p-4 mt-2 border border-gray-700/50 shadow-[0_0_15px_rgba(255,255,255,0.07)] bg-gray-800/20">
                                {children}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Divider - Desktop only */}
            {!isMobile && (
                <div>
                    <div className="h-px w-3/4 bg-gray my-3" />
                    <div className="h-px w-full bg-gray-800/20 my-3" />
                    <div className="h-px w-3/4 bg-gray my-3" />
                </div>
            )}
        </div>
    );
};