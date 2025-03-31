"use client";
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { LucideUser, X, ChevronDown, Filter} from 'lucide-react';
import Papa from 'papaparse';
import { Barlow } from 'next/font/google';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ComingSoon from '@/components/ui/ComingSoon'; // Import the ComingSoon component
import { Search, Table as TableIcon } from 'lucide-react';
import { Input } from '@/components/ui/input'; // Import the Input component
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


export interface DraftProspect {
  Name: string;
  'Actual Pick': string;
  'NBA Team': string;
  'Pre-NBA': string;

  'Height': string;
  'Weight (lbs)': string;
  'Role': string;

  "NCAAM": string;

  Summary?: string;
  originalRank?: number;

  'ABV': string;

}

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
  "Eastern Kentucky": "EKU",
  "Western Carolina": "WCU"
}

const teamNames: { [key: string]: string } = {
  CHA: "Charlotte Hornets",
  GSW: "Golden State Warriors",
  LAL: "Los Angeles Lakers",
  LAC: "Los Angeles Clippers",
  BOS: "Boston Celtics",
  MIA: "Miami Heat",
  CHI: "Chicago Bulls",
  DAL: "Dallas Mavericks",
  PHX: "Phoenix Suns",
  MIL: "Milwaukee Bucks",
  WAS: "Washington Wizards",
  HOU: "Houston Rockets",
  MEM: "Memphis Grizzlies",
  SAC: "Sacramento Kings",
  OKC: "Okhlahoma City Thunder",
  NYK: "Brooklyn Nets",
  SAS: "San Antonio Spurs",
  IND: "Indiana Pacers",
  TOR: "Toronto Raptors",
  NOP: "New Orleans Pelicans",
  ATL: "Atlanta Hawks",
  PHI: "Philadelphia 76ers",
  DET: "Detroit Pistons",
  ORL: "Orlando Magic",
  MIN: "Minnesota Timberwolves",
  UTA: "Utah Jazz",
  DEN: "Denver Nuggets",
  POR: "Portland Trailblazers",
  CLE: "Cleveland Cavaliers",
  NCAA: "NC"
}
// interface EPMModelProps {
//   isOpen: boolean;
//   onClose: () => void;
//   prospects: DraftProspect[]; // All prospects.
//   selectedPosition: string | null;
//   selectedProspect?: DraftProspect; // Pass the selected prospect
//   allProspects: DraftProspect[];
//   graphType?: 'EPM' | 'rankings'; // Optional prop to determine graph type
// }

// interface PayloadItem {
//   dataKey: string;
//   color: string;
//   value: string | number;
// }

// type CustomTooltipProps = TooltipProps<number | string, string> & {
//   active?: boolean;
//   payload?: PayloadItem[];
//   label?: string;
// };

// const prepareChartData = (prospects: DraftProspect[]) => {
//   const years = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'];
//   const chartData: Record<string, number>[] = years.map(year => ({ year }));

//   prospects.forEach(prospect => {
//     chartData.forEach(yearData => {
//       yearData[prospect.Name] = prospect[`Pred. ${year.split(' ')[1]} Rank`];
//     });
//   });

//   return chartData;
// };


// for individual player graphs
// const EPMModel = (props: EPMModelProps) => {
//   const { isOpen, onClose, selectedPosition, allProspects, focusedProspect } = props;

//   const graphData = React.useMemo(() => {
//     // Create data points for years 1-5
//     return [1, 2, 3, 4, 5].map(year => {
//       const dataPoint: Record<string, number | string> = { name: `Year ${year}` };

//       // Add background comparison lines data
//       allProspects.forEach(prospect => {
//         const rankValue = prospect[`Pred. Y${year} Rank` as keyof DraftProspect];
//         if (rankValue && !isNaN(parseFloat(rankValue as string))) {
//           dataPoint[prospect.Name] = parseFloat(rankValue as string);
//         }
//       });

//       return dataPoint;
//     });
//   }, [allProspects]);

//   interface TooltipPayload {
//     dataKey: string;
//     value: number;
//     stroke: string;
//   }

//   // Custom tooltip component
//   const CustomTooltip: React.FC<{ active?: boolean; payload?: TooltipPayload[]; label?: string }> = ({ active, payload, label }) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="bg-[#19191A] border border-gray-700 p-3 rounded-lg">
//           <p className="text-gray-400 mb-2">{label}</p>
//           {payload.map((entry) => (
//             entry.value && (
//               <div
//                 key={entry.dataKey}
//                 className="flex items-center gap-2"
//               >
//                 <div
//                   className="w-2 h-2 rounded-full"
//                   style={{
//                     backgroundColor: entry.stroke,
//                     opacity: entry.dataKey === focusedProspect?.Name ? 1 : 0.4
//                   }}
//                 />
//                 <span className="text-white">{entry.dataKey}</span>
//                 <span className="text-gray-400">Rank {entry.value}</span>
//               </div>
//             )
//           ))}
//         </div>
//       );
//     }
//     return null;
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="bg-[#19191A] text-white max-w-4xl">
//         <DialogHeader>
//           <DialogTitle className="text-xl font-bold text-white">
//             {focusedProspect
//               ? `${focusedProspect.Name} - Projected Rankings`
//               : 'Projected Rankings Comparison'}
//             {selectedPosition && ` - ${selectedPosition}s`}
//           </DialogTitle>
//           <button
//             onClick={onClose}
//             className="absolute right-4 top-4 text-gray-400 hover:text-white"
//           >
//             <X size={20} />
//           </button>
//         </DialogHeader>

//         <div className="mt-4 p-4 bg-gray-800/20 rounded-lg">
//           <LineChart
//             width={800}
//             height={400}
//             data={graphData}
//             margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
//           >
//             <CartesianGrid strokeDasharray="3 3" stroke="#333" />
//             <XAxis
//               dataKey="name"
//               stroke="#666"
//             />
//             <YAxis
//               stroke="#666"
//               domain={[0, 'dataMax']}
//               reversed={true}
//               label={{
//                 value: 'Rank',
//                 angle: -90,
//                 position: 'insideLeft',
//                 style: { fill: '#666' }
//               }}
//             />
//             <Tooltip content={<CustomTooltip />} />

//             {/* Background comparison lines */}
//             {allProspects.map((prospect) => {
//               if (focusedProspect && prospect.Name === focusedProspect.Name) return null;
//               return (
//                 <Line
//                   key={prospect.Name}
//                   type="monotone"
//                   dataKey={prospect.Name}
//                   stroke={`#444444`}
//                   strokeWidth={1}
//                   dot={false}
//                   opacity={0.2}
//                   activeDot={false}
//                 />
//               );
//             })}

//             {/* Focused player line */}
//             {focusedProspect && (
//               <Line
//                 key={focusedProspect.Name}
//                 type="monotone"
//                 dataKey={focusedProspect.Name}
//                 stroke={`#${focusedProspect['Team Color']}`} // Make sure this matches your CSV column name exactly
//                 strokeWidth={3}
//                 dot={{
//                   r: 4,
//                   fill: `#${focusedProspect['Team Color']}`,
//                   strokeWidth: 0
//                 }}
//               />
//             )}
//           </LineChart>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

interface NavigationHeaderProps {
  activeTab?: string;
}

interface MenuItem {
  name: string;
  href: string;
  available: boolean;
  stage?: 'brainstorming' | 'development' | 'testing';
}

const NavigationHeader: React.FC<NavigationHeaderProps> = ({ activeTab }) => {
  const [DraftDropdownOpen, setTpmDropdownOpen] = useState(false);
  const [NBADropdownOpen, setModelsDropdownOpen] = useState(false);
  const DraftDropdownRef = useRef<HTMLDivElement>(null);
  const NBADropdownRef = useRef<HTMLDivElement>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState('');
  const [developmentStage, setDevelopmentStage] = useState<'brainstorming' | 'development' | 'testing'>('development');

  // Only Home as regular tab
  const homeTab = { name: 'Home', href: '/' };

  // TPM dropdown items
  const DraftDropdownItems = [
    { name: 'Max Savin', href: '/TPM_Draft_Page', available: true },
    { name: 'Nick Kalinowski', href: '/Nick_Draft_Page', available: true },
  ];

  // Models dropdown items
  const NBADropdownItems = [
    { name: 'Max Savin', href: '/TPM_FVC', available: false, stage: 'testing' as const },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (DraftDropdownRef.current && !DraftDropdownRef.current.contains(event.target as Node)) {
        setTpmDropdownOpen(false);
      }
      if (NBADropdownRef.current && !NBADropdownRef.current.contains(event.target as Node)) {
        setModelsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleTpmDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setTpmDropdownOpen(!DraftDropdownOpen);
    if (NBADropdownOpen) setModelsDropdownOpen(false);
  };

  const toggleModelsDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setModelsDropdownOpen(!NBADropdownOpen);
    if (DraftDropdownOpen) setTpmDropdownOpen(false);
  };

  const handleItemClick = (e: React.MouseEvent, item: MenuItem) => {
    if (!item.available) {
      e.preventDefault();
      setComingSoonFeature(item.name);
      if (item.stage) {
        setDevelopmentStage(item.stage);
      }
      setShowComingSoon(true);
      setTpmDropdownOpen(false);
      setModelsDropdownOpen(false);
    }
  };

  return (
    <>
      {/* Fixed header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-[#19191A] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Navigation Tabs */}
            <div className="flex space-x-4">
              {/* Home tab */}
              <Link
                href={homeTab.href}
                className={`
                  px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                  ${activeTab === homeTab.name
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'
                  }
                `}
              >
                {homeTab.name}
              </Link>

              {/* Draft Dropdown */}
              <div className="relative" ref={DraftDropdownRef}>
                <button
                  onClick={toggleTpmDropdown}
                  className={`
                    px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                    ${activeTab === 'Draft'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'
                    }
                    flex items-center
                  `}
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={DraftDropdownOpen}
                >
                  Draft
                  <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Draft Dropdown menu */}
                {DraftDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      {DraftDropdownItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.available ? item.href : '#'}
                          className={`
                            block px-4 py-2 text-sm transition-colors duration-200
                            ${item.available
                              ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                              : 'text-gray-500 hover:bg-gray-700'
                            }
                          `}
                          role="menuitem"
                          onClick={(e) => handleItemClick(e, item)}
                        >
                          {item.name}
                          {!item.available && (
                            <span className="ml-2 text-xs text-gray-500"></span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* NBA Dropdown */}
              <div className="relative" ref={NBADropdownRef}>
                <button
                  onClick={toggleModelsDropdown}
                  className={`
                    px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                    ${activeTab === 'NBA'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'
                    }
                    flex items-center
                  `}
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={NBADropdownOpen}
                >
                  NBA
                  <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* NBA Dropdown menu */}
                {NBADropdownOpen && (
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      {NBADropdownItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.available ? item.href : '#'}
                          className={`
                            block px-4 py-2 text-sm transition-colors duration-200
                            ${item.available
                              ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                              : 'text-gray-500 hover:bg-gray-700'
                            }
                          `}
                          role="menuitem"
                          onClick={(e) => handleItemClick(e, item)}
                        >
                          {item.name}
                          {!item.available && (
                            <span className="ml-2 text-xs text-gray-500"></span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* TPM Logo on the right */}
            <div className={`text-4xl font-bold text-white`}>
              TPM
            </div>
          </div>
        </div>
      </div>

      {/* Spacer div to prevent content from hiding behind fixed header */}
      <div className="h-16"></div>

      {/* Coming Soon overlay */}
      {showComingSoon && (
        <ComingSoon
          feature={comingSoonFeature}
          currentStage={developmentStage}
          onClose={() => setShowComingSoon(false)}
        />
      )}
    </>
  );
};

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
        className="object-contain"
        onError={() => setNBALogoError(true)}
      />
    </div>
  );
};

// const IndividualProspectGraphs: React.FC<EPMModelProps> = ({
//   isOpen,
//   onClose,
//   selectedProspect,
//   allProspects,
//   graphType = 'rankings', // Default to rankings if not specified
// }) => {
//   const filteredProspects = useMemo(() => {
//     if (!selectedProspect) return [];
//     return allProspects.filter(p => p.Position === selectedProspect.Position);
//   }, [allProspects, selectedProspect]);

//   const prepareRankingsChartData = () => {
//     const yearData: { year: string | number;[key: string]: string | number }[] = [];

//     for (let year = 1; year <= 5; year++) {
//       const yearObj: { year: string | number;[key: string]: string | number } = { year };

//       filteredProspects.forEach((prospect) => {
//         const rankKey = `Pred. Y${year} Rank` as keyof DraftProspect;
//         yearObj[prospect.Name] = prospect[rankKey] ?? 0;
//       });

//       yearData.push(yearObj);
//     }

//     return yearData;
//   };

//   const prepareEpmChartData = () => {
//     const yearData: { year: string | number;[key: string]: string | number }[] = [];

//     for (let year = 1; year <= 5; year++) {
//       const yearObj: { year: string | number;[key: string]: string | number } = { year };

//       filteredProspects.forEach((prospect) => {
//         const epmKey = `Pred. Y${year} EPM` as keyof DraftProspect;
//         yearObj[prospect.Name] = prospect[epmKey] ?? 0;
//       });

//       yearData.push(yearObj);
//     }

//     return yearData;
//   };

//   const rankingsChartData = prepareRankingsChartData();
//   const epmChartData = prepareEpmChartData();

//   // Use the appropriate data based on the selected graph type
//   const chartData = graphType === 'rankings' ? rankingsChartData : epmChartData;

//   const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
//           <p className="font-bold text-white">Year {label}</p>
//           {payload.map((entry: PayloadItem) => (
//             <p key={entry.dataKey} style={{ color: entry.color }}>
//               {entry.dataKey}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
//               {graphType === 'rankings' ? ' (rank)' : ' (EPM)'}
//             </p>
//           ))}
//         </div>
//       );
//     }
//     return null;
//   };

//   return (
//     <AlertDialog open={isOpen} onOpenChange={onClose}>
//       <AlertDialogContent className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
//         <AlertDialogHeader className="flex flex-row items-center justify-between">
//           <AlertDialogTitle className="text-xl">
//             {selectedProspect
//               ? `${selectedProspect.Name} ${graphType === 'rankings' ? 'Rankings' : 'EPM'} Comparison ${selectedProspect.Position === 'Wing' ? '(Wing Comparison)' : ''}`
//               : 'Select a Prospect'}
//           </AlertDialogTitle>
//           <Button variant="ghost" size="icon" onClick={onClose}>
//             <X className="h-5 w-5" />
//           </Button>
//         </AlertDialogHeader>

//         <CardContent className="space-y-6">
//           <div className="flex justify-center space-x-4 mb-4">
//             <Button
//               variant={graphType === 'rankings' ? "default" : "outline"}
//               onClick={() => onClose()} // Close and reopen with rankings type
//               className="w-32"
//             >
//               Rankings
//             </Button>
//             <Button
//               variant={graphType === 'EPM' ? "default" : "outline"}
//               onClick={() => onClose()} // Close and reopen with EPM type
//               className="w-32"
//             >
//               Projected EPM
//             </Button>
//           </div>

//           <Card>
//             <CardHeader>
//               <CardTitle>
//                 {graphType === 'rankings'
//                   ? 'Rankings Progression By Player'
//                   : 'EPM Progression By Player'}
//               </CardTitle>
//               <CardDescription>
//                 Years on X-axis, {graphType === 'rankings' ? 'Ranking values' : 'EPM values'} on Y-axis
//               </CardDescription>
//             </CardHeader>
//             <ResponsiveContainer width="100%" height={500}>
//               <LineChart data={chartData}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#333" />
//                 <XAxis dataKey="year" type="number" stroke="#888" domain={[1, 5]} />
//                 <YAxis
//                   type="number"
//                   stroke="#888"
//                   domain={graphType === 'rankings' ? [-5, 5] : [-5, 5]}
//                 // For rankings, you might want to invert the axis so lower (better) ranks are at the top
//                 // Consider: reversed={graphType === 'rankings'}
//                 />
//                 <Tooltip content={<CustomTooltip />} />
//                 <Legend />
//                 {filteredProspects.map((prospect) => (
//                   <Line
//                     key={prospect.Name}
//                     type="monotone"
//                     dataKey={prospect.Name}
//                     stroke={prospect.Name === selectedProspect?.Name ? prospect['Team Color'] : 'lightgray'}
//                     strokeWidth={prospect.Name === selectedProspect?.Name ? 3 : 1}
//                     activeDot={{ r: 8 }}
//                   />
//                 ))}
//               </LineChart>
//             </ResponsiveContainer>
//           </Card>
//         </CardContent>
//       </AlertDialogContent>
//     </AlertDialog>
//   );
// };

const ProspectCard: React.FC<{ prospect: DraftProspect; rank: RankType; filteredProspects: DraftProspect[] }> = ({ prospect, rank, filteredProspects }) => {
  // Find the actual rank of this prospect in the filtered and sorted list
  const actualRank = filteredProspects.findIndex(p => p.Name === prospect.Name) + 1;
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileInfoExpanded, setIsMobileInfoExpanded] = useState(false);
  const [, setIsDropdownOpen] = useState(false);
  const DraftDropdownRef = useRef<HTMLDivElement>(null);
  const NBADropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (DraftDropdownRef.current && !DraftDropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (NBADropdownRef.current && !NBADropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Set initial value
    checkMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);

    // Cleanup
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

  // Handle card click for mobile
  const handleCardClick = () => {
    if (isMobile) {
      if (isMobileInfoExpanded) {
        setIsMobileInfoExpanded(false);
      } else {
        setIsExpanded(!isExpanded);
      }
    }
  };

  // Update hover state when dropdown is expanded
  useEffect(() => {
    if (isExpanded && !isMobile) {
      setIsHovered(true);
    }
  }, [isExpanded, isMobile]);

  const playerImageUrl = `/player_images2024/${prospect.Name} BG Removed.png`;
  const prenbalogoUrl = `/prenba_logos/${prospect['Pre-NBA']}.png`;

  return (
    <div className={`mx-auto px-4 mb-4 ${isMobile ? 'max-w-sm' : 'max-w-5xl'}`}>
      <motion.div layout="position" transition={{ layout: { duration: 0.3, ease: "easeInOut" } }}>
        <div className="relative">
          {/* Main card container - add mouse event handlers here */}
          <div
            className={`
              relative overflow-hidden transition-all duration-300 border rounded-xl border-gray-700/50 shadow-[0_0_15px_rgba(255,255,255,0.07)] 
              ${!isMobile ? 'h-[400px] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:border-gray-600/50' : 'h-[100px]'}
            `}
            style={{ backgroundColor: '#19191A' }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleCardClick}
          >
            {/* Rank Number */}
            <motion.div
              layout="position"
              className={`
                ${barlow.className}
                ${isMobile ? 'absolute top-1 right-3 z-20' : 'absolute top-6 right-8 z-20 transition-opacity duration-300'}
                ${((isHovered && !isMobile) || isExpanded) ? 'opacity-100' : 'opacity-100'}
              `}
            >
              {/* Change here for rank number formating for mobile view */}
              <div className={`
                ${barlow.className} 
                ${isMobile ? 'text-1xl' : 'text-6xl'} 
                font-bold
                text-white
                select-none
                ${((isHovered && !isMobile) || isExpanded) ? (!isMobile ? 'mr-[300px]' : '') : ''} 
              `}>
                {actualRank}
              </div>
            </motion.div>

            {/* Background Pre-NBA Logo */}
            <div className={`
              absolute inset-0 flex items-center justify-start 
              ${isMobile ? 'pl-4' : 'pl-12'} 
              transition-opacity duration-300 
              ${((isHovered && !isMobile) || isExpanded) ? 'opacity-90' : 'opacity-20'}
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

            {/* Player Image */}
            <div className="absolute inset-0 flex justify-center items-end overflow-hidden">
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
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${((isHovered && !isMobile) || isExpanded) ? 'opacity-0' : 'opacity-100'}`}
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

            {/* Info panel - different for mobile/desktop */}
            {isMobile ? (
              // Mobile info panel (when expanded)
              isExpanded && ( // Only render if isExpanded is true
                <div style={{ backgroundColor: 'rgba(25, 25, 26, 0.9)' }}></div>
              )
            ) : (
              // Desktop hover info panel
              <div
                className={`absolute top-0 right-0 h-full w-[300px] backdrop-blur-sm transition-all duration-300 rounded-r-lg ${(isHovered || isExpanded) ? 'opacity-100' : 'opacity-0 translate-x-4 pointer-events-none'
                  }`}
                style={{ backgroundColor: 'rgba(25, 25, 26, 0.9)' }}
              >
                <div className="p-6 space-y-4 flex flex-col">
                  <h3 className="text-lg font-semibold text-white">{prospect.Name}</h3>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div><span className="font-bold text-white">Height  </span> {prospect.Height}</div>
                    <div><span className="font-bold text-white">Weight </span> {prospect['Weight (lbs)']}</div>
                  </div>

                  <div className="pt-4 border-t border-gray-700">
                    <div className="space-y-2 text-sm text-gray-300">
                      <div><span className="font-bold text-white">Pre-NBA  </span> {prospect['Pre-NBA']}</div>
                      <div><span className="font-bold text-white">Position  </span> {prospect.Role}</div>
                      <div>
                        <span className="font-bold text-white">Draft  </span>
                        {Number(prospect['Actual Pick']) >= 59 ? "Undrafted - " : `${prospect['Actual Pick']} - ${prospect['NBA Team'] !== 'NCAA' ? prospect['NBA Team'] : 'Unsigned'}`}
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

          {/* Mobile Info Dropdown */}
          {isMobile && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-2 p-4 rounded-xl border border-gray-700/50 shadow-[0_0_15px_rgba(255,255,255,0.07)] relative" // Added 'relative' here
              style={{ backgroundColor: 'rgba(25, 25, 26, 0.9)' }}
            >
              <h3 className="text-lg font-semibold text-white mb-2">{prospect.Name}</h3>
              {/* <div className="transform scale-50 origin-top-right">
                <NBATeamLogo NBA={prospect['NBA Team']}/>
              </div> */}
              <div className="grid grid-cols-2 gap-2">
                {/* Draft Information Column */}
                <div>
                  <h4 className="font-semibold text-white text-sm mb-1">Draft Information</h4>
                  <div className="space-y-1 text-xs text-gray-300">
                    <div>
                      <span className="font-bold text-white">Pre-NBA </span>
                      {collegeNames[prospect['Pre-NBA']]
                        ? collegeNames[prospect['Pre-NBA']]
                        : prospect['Pre-NBA']}
                    </div>
                    <div><span className="font-bold text-white">Position </span> {prospect.Role}</div>
                    <div>
                      <span className="font-bold text-white">Draft </span>
                      {Number(prospect['Actual Pick']) >= 59 ? "Undrafted - " : `${prospect['Actual Pick']} - ${prospect['ABV'] !== 'NCAA' ? prospect['ABV'] : 'Unsigned'}`}
                    </div>
                  </div>
                </div>

                {/* Physicals Column */}
                <div className="ml-2">
                  <h4 className="font-semibold text-white text-sm mb-1">Physicals</h4>
                  <div className="space-y-1 text-xs text-gray-300">
                    <div><span className="font-bold text-white">Height </span> {prospect.Height}</div>
                    <div><span className="font-bold text-white">Weight </span> {prospect['Weight (lbs)']}</div>
                  </div>
                </div>
              </div>
              {/* Team Logo in Top Right */}
              <div className="absolute top-3.5 right-3.5 transform scale-50 origin-top-right">
                <NBATeamLogo NBA={prospect['NBA Team']} /> {/* Adjust size as needed */}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Divider - only show for desktop */}
      {!isMobile && (
        <div>
          <div className="h-px w=3/4 bg-gray my-5" />
          <div className="h-px w-full bg-gray-700/30 my -8" />
          <div className="h-px w=3/4 bg-gray my-5" />
        </div>
      )}
    </div>
  );
};

type RankType = number | 'N/A';

interface ProspectFilterProps {
  prospects: DraftProspect[];
  onFilteredProspectsChange?: (filteredProspects: DraftProspect[]) => void;
  rank: Record<string, RankType>;
  onViewModeChange?: (mode: 'card' | 'table') => void; // New prop
}

const ProspectFilter: React.FC<ProspectFilterProps> = ({
  prospects,
  onFilteredProspectsChange,
  onViewModeChange
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filter, setFilter] = useState<'NCAA' | 'Int'>('NCAA');
  const [roleFilter, setRoleFilter] = useState<'all' | 'Guard' | 'Wing' | 'Big'>('all');
  const [, setLocalFilteredProspects] = useState(prospects);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    if (onViewModeChange) {
      onViewModeChange(viewMode);
    }
  }, [viewMode, onViewModeChange]);

  const hasActiveFilters = () => {
    return (
      roleFilter !== 'all' ||
      searchQuery !== ''
    );
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilter('NCAA');
    setRoleFilter('all');
    setLocalFilteredProspects(prospects);
    setIsMobileFilterOpen(false);

    if (onFilteredProspectsChange) {
      onFilteredProspectsChange(prospects);
    }
  };

  useEffect(() => {
    let results = prospects;

    if (filter === 'NCAA') {
      results = results.filter((prospect) => prospect.NCAAM === '1');
    } else if (filter === 'Int') {
      results = results.filter((prospect) => prospect.NCAAM === '0');
    }

    if (roleFilter !== 'all') {
      results = results.filter((prospect) => prospect.Role === roleFilter);
    }

    if (searchQuery) {
      const searchTermLower = searchQuery.toLowerCase();
      results = results.filter(
        (prospect) =>
          prospect.Name.toLowerCase().includes(searchTermLower) ||
          (prospect['Pre-NBA'] && prospect['Pre-NBA'].toLowerCase().includes(searchTermLower)) ||
          (prospect['NBA Team'] && prospect['NBA Team'].toLowerCase().includes(searchTermLower))
      );
    }

    setLocalFilteredProspects(results);

    if (onFilteredProspectsChange) {
      onFilteredProspectsChange(results);
    }
  }, [prospects, filter, searchQuery, roleFilter, onFilteredProspectsChange]);

  return (
    <div className="sticky top-14 z-30 bg-[#19191A] border-b border-gray-800 max-w-6xl mx-auto">
      {/* Mobile Filter Toggle Button */}
      <div className="sm:hidden px-4 py-3">
        <motion.button
          onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          className="w-full flex items-center justify-center bg-gray-800/20 text-gray-300 border border-gray-800 rounded-lg py-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Filter className="mr-2 h-5 w-5" />
          {isMobileFilterOpen ? 'Close Filters' : 'Open Filters'}
          <ChevronDown className={`ml-2 h-5 w-5 transform transition-transform ${isMobileFilterOpen ? 'rotate-180' : ''}`} />
        </motion.button>
      </div>

      {/* Filter Content (Desktop and Mobile) */}
      <div className={`
        px-4 py-3 
        sm:grid sm:grid-cols-[1fr_auto] sm:gap-4 
        flex flex-col
        ${isMobileFilterOpen ? 'block' : 'hidden sm:grid'}
      `}>
        {/* Search and Reset Section */}
        <div className="flex flex-wrap items-center w-full mb-3 sm:mb-0">
          <div className="relative flex-grow max-w-full mr-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-gray-800/20 border-gray-800 text-gray-300 placeholder-gray-500 rounded-lg focus:border-blue-500/30 focus:ring-1 focus:ring-blue-500/30"
            />
          </div>

          {/* Reset button */}
          {hasActiveFilters() && (
            <motion.button
              onClick={resetFilters}
              className="ml-2 flex items-center text-red-400 hover:text-red-300 bg-gray-800/20 border border-gray-800 hover:border-red-700/30 px-3 py-2 rounded-lg text-xs"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="h-4 w-4" />
              Reset
            </motion.button>
          )} 
        </div>

        {/* Filters and View Mode Container */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end space-x-2">
          {/* Mobile Only: League Section */}
          <div className="w-full sm:hidden mb-4">
            <div className="text-sm text-gray-400 mb-2">League:</div>
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={() => setFilter(filter === 'NCAA' ? 'Int' : 'NCAA')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${filter === 'NCAA' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                NCAA
              </motion.button>
              <motion.button
                onClick={() => setFilter(filter === 'Int' ? 'NCAA' : 'Int')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${filter === 'Int' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Int. & G League
              </motion.button>
            </div>
          </div>

          {/* Mobile Only: Position Section */}
          <div className="w-full sm:hidden mb-4">
            <div className="text-sm text-gray-400 mb-2">Positions:</div>
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={() => setRoleFilter(roleFilter === 'Guard' ? 'all' : 'Guard')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${roleFilter === 'Guard' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Guards
              </motion.button>
              <motion.button
                onClick={() => setRoleFilter(roleFilter === 'Wing' ? 'all' : 'Wing')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${roleFilter === 'Wing' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Wings
              </motion.button>
              <motion.button
                onClick={() => setRoleFilter(roleFilter === 'Big' ? 'all' : 'Big')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${roleFilter === 'Big' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Bigs
              </motion.button>
            </div>
          </div>

          {/* Desktop Filters (unchanged) */}
          <div className="hidden sm:flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end space-x-2">
            {/* League Filters */}
            <div className="flex items-center space-x-2 mb-2 sm:mb-0">
              <motion.button
                onClick={() => setFilter(filter === 'NCAA' ? 'Int' : 'NCAA')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${filter === 'NCAA' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                NCAA
              </motion.button>
              <motion.button
                onClick={() => setFilter(filter === 'Int' ? 'NCAA' : 'Int')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${filter === 'Int' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Int. & G League
              </motion.button>
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-gray-700/30 mx-2" />

            {/* Position Filters */}
            <div className="flex items-center space-x-2 mb-2 sm:mb-0">
              <motion.button
                onClick={() => setRoleFilter(roleFilter === 'Guard' ? 'all' : 'Guard')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${roleFilter === 'Guard' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Guards
              </motion.button>
              <motion.button
                onClick={() => setRoleFilter(roleFilter === 'Wing' ? 'all' : 'Wing')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${roleFilter === 'Wing' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Wings
              </motion.button>
              <motion.button
                onClick={() => setRoleFilter(roleFilter === 'Big' ? 'all' : 'Big')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${roleFilter === 'Big' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Bigs
              </motion.button>
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-gray-700/30 mx-2" />
          </div>

          {/* View Mode Toggle */}
          <motion.button
            onClick={() => setViewMode(viewMode === 'card' ? 'table' : 'card')}
            className={`
              px-3 py-2 rounded-lg text-sm font-medium flex items-center
              transition-all duration-300
              ${viewMode === 'table'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <TableIcon className="mr-2 h-4 w-4" />
            {viewMode === 'card' ? 'Table View' : 'Card View'}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default function DraftProspectsPage() {
  const [prospects, setProspects] = useState<DraftProspect[]>([]);
  const [filteredProspects, setFilteredProspects] = useState<DraftProspect[]>([]);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof DraftProspect | 'Rank';
    direction: 'ascending' | 'descending';
  } | null>(null);

  useEffect(() => {
    async function fetchDraftProspects() {
      try {
        const response = await fetch('/Nick Kalinowski 2024 NBA Draft Results.csv');
        const csvText = await response.text();

        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            const prospectData = results.data as DraftProspect[];
            setProspects(prospectData);
            setFilteredProspects(prospectData);
          }
        });
      } catch (error) {
        console.error('Error fetching draft prospects:', error);
      }
    }

    fetchDraftProspects();
  }, []);

  // Function to handle sorting
  const handleSort = (key: keyof DraftProspect | 'Rank') => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    // If already sorting by this key, toggle direction
    if (sortConfig && sortConfig.key === key) {
      direction = sortConfig.direction === 'ascending' ? 'descending' : 'ascending';
    }
    
    setSortConfig({ key, direction });
  };

  // Apply sorting to the filtered prospects
  const sortedProspects = React.useMemo(() => {
    const sortableProspects = [...filteredProspects];
    
    if (!sortConfig) {
      return sortableProspects;
    }

    sortableProspects.sort((a, b) => {
      // Handle Rank column specially (it's not in the data)
      if (sortConfig.key === 'Rank') {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      
      let aValue = a[sortConfig.key as keyof DraftProspect];
      let bValue = b[sortConfig.key as keyof DraftProspect];

      // Handle specific columns
      if (sortConfig.key === 'Actual Pick') {
        // Convert to numbers for sorting
        const aNum = parseInt(aValue as string) || 99; // Use 99 for undrafted
        const bNum = parseInt(bValue as string) || 99;
        return sortConfig.direction === 'ascending' 
          ? aNum - bNum 
          : bNum - aNum;
      }
      
      // Handle Height (convert to inches)
      if (sortConfig.key === 'Height') {
        const aInches = heightToInches(aValue as string);
        const bInches = heightToInches(bValue as string);
        return sortConfig.direction === 'ascending' 
          ? aInches - bInches 
          : bInches - aInches;
      }

      // Handle Weight
      if (sortConfig.key === 'Weight (lbs)') {
        const aNum = parseInt(aValue as string) || 0;
        const bNum = parseInt(bValue as string) || 0;
        return sortConfig.direction === 'ascending' 
          ? aNum - bNum 
          : bNum - aNum;
      }

      // Default string comparison
      if (aValue === undefined) aValue = '';
      if (bValue === undefined) bValue = '';
      
      if (sortConfig.direction === 'ascending') {
        return String(aValue).localeCompare(String(bValue));
      } else {
        return String(bValue).localeCompare(String(aValue));
      }
    });
    
    return sortableProspects;
  }, [filteredProspects, sortConfig]);

  // Helper function to convert height to inches
  const heightToInches = (height: string): number => {
    if (!height) return 0;
    
    // Handle format like "6'8"
    const parts = height.split("'");
    if (parts.length === 2) {
      const feet = parseInt(parts[0]) || 0;
      const inches = parseInt(parts[1]) || 0;
      return (feet * 12) + inches;
    }
    
    return 0;
  };

  // Render the table with sorting functionality
  const ProspectTable = ({
    prospects,
  }: {
    prospects: DraftProspect[],
    rank: Record<string, RankType>
  }) => {
    return (
      <div className="max-w-6xl mx-auto px-4 pt-8">
        <div className="w-full overflow-x-auto bg-[#19191A] rounded-lg border border-gray-800">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className={`text-gray-400 cursor-pointer hover:text-gray-200`}
                  onClick={() => handleSort('Rank')}
                >
                  Rank
                  {sortConfig?.key === 'Rank' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHead>
                <TableHead 
                  className="text-gray-400 cursor-pointer hover:text-gray-200"
                  onClick={() => handleSort('Name')}
                >
                  Name
                  {sortConfig?.key === 'Name' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHead>
                <TableHead 
                  className="text-gray-400 cursor-pointer hover:text-gray-200"
                  onClick={() => handleSort('Role')}
                >
                  Position
                  {sortConfig?.key === 'Role' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHead>
                <TableHead 
                  className="text-gray-400 cursor-pointer hover:text-gray-200"
                  onClick={() => handleSort('Pre-NBA')}
                >
                  Pre-NBA
                  {sortConfig?.key === 'Pre-NBA' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHead>
                <TableHead 
                  className="text-gray-400 cursor-pointer hover:text-gray-200"
                  onClick={() => handleSort('Actual Pick')}
                >
                  Draft Pick
                  {sortConfig?.key === 'Actual Pick' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHead>
                <TableHead 
                  className="text-gray-400 cursor-pointer hover:text-gray-200"
                  onClick={() => handleSort('NBA Team')}
                >
                  NBA Team
                  {sortConfig?.key === 'NBA Team' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHead>
                <TableHead 
                  className="text-gray-400 cursor-pointer hover:text-gray-200"
                  onClick={() => handleSort('Height')}
                >
                  Height
                  {sortConfig?.key === 'Height' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHead>
                <TableHead 
                  className="text-gray-400 cursor-pointer hover:text-gray-200"
                  onClick={() => handleSort('Weight (lbs)')}
                >
                  Weight
                  {sortConfig?.key === 'Weight (lbs)' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prospects.map((prospect, index) => (
                <TableRow
                  key={prospect.Name}
                  className="hover:bg-gray-800/20"
                >
                  <TableCell className="text-gray-300">{index + 1}</TableCell>
                  <TableCell className="font-medium text-gray-300">{prospect.Name}</TableCell>
                  <TableCell className="text-gray-300">{prospect.Role}</TableCell>
                  <TableCell className="text-gray-300">{prospect['Pre-NBA']}</TableCell>
                  <TableCell className="text-gray-300">
                    {Number(prospect['Actual Pick']) >= 59 ? "Undrafted" : prospect['Actual Pick']}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {teamNames[prospect['NBA Team']] || prospect['NBA Team']}
                  </TableCell>
                  <TableCell className="text-gray-300">{prospect.Height}</TableCell>
                  <TableCell className="text-gray-300">{prospect['Weight (lbs)']}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#19191A]">
      <NavigationHeader activeTab="Nick Kalinowski" />

      <ProspectFilter
        prospects={prospects}
        onFilteredProspectsChange={setFilteredProspects}
        rank={{}}
        onViewModeChange={setViewMode}
      />

      {viewMode === 'card' ? (
        <div className="max-w-6xl mx-auto px-4 pt-8">
          {sortedProspects.map((prospect, index) => (
            <ProspectCard
              key={prospect.Name}
              prospect={prospect}
              rank={index + 1}
              filteredProspects={sortedProspects}
            />
          ))}
        </div>
      ) : (
        <ProspectTable
          prospects={sortedProspects}
          rank={{}}
        />
      )}
    </div>
  );
}