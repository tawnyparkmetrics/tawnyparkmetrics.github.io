"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuGroup,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import { LucideUser, ChevronDown, ChevronUp, X, SlidersHorizontal, BarChart as BarChartIcon } from 'lucide-react';
import Papa from 'papaparse';
import { Barlow } from 'next/font/google';
import { AnimatePresence, motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { TooltipProps } from 'recharts';
import ComingSoon from '@/components/ui/ComingSoon'; // Import the ComingSoon component


export interface DraftProspect {
  Name: string;
  'Actual Pick': string;
  NBA: string;
  'NBA Team': string;
  'Pre-NBA': string;
  Position: string;
  Age: string;
  'Team Color': string;
  'Pred. Y1 Rank': number;
  'Pred. Y2 Rank': number;
  'Pred. Y3 Rank': number;
  'Avg. Rank Y1-Y3': string;
  'Pred. Y4 Rank': number;
  'Pred. Y5 Rank': number;
  'Avg. Rank Y1-Y5': string;

  'Pred. Y1 EPM': string;
  'Pred. Y2 EPM': string;
  'Pred. Y3 EPM': string;
  'Pred. Y4 EPM': string;
  'Pred. Y5 EPM': string;

  'Height': string;
  'Wingspan': string;
  'Wing - Height': string;
  'Weight (lbs)': string;
  'Role': string;

  Summary?: string;
  originalRank?: number;

}

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['700'], // Use 700 for bold text
});

const teamNames: { [key: string]: string } = {
  CHA: "Charlotte Hornets",
  GS: "Golden State Warriors",
  LAL: "Los Angeles Lakers",
  LAC: "Los Angeles Clippers",
  BOS: "Boston Celtics",
  MIA: "Miami Heat",
  NYK: "New York Knicks",
  CHI: "Chicago Bulls",
  DAL: "Dallas Mavericks",
  PHX: "Phoenix Suns",
  MIL: "Milwaukee Bucks",
  WAS: "Washington Wizards",
  HOU: "Houston Rockets",
  MEM: "Memphis Grizzlies",
  SAC: "Sacramento Kings",
  OKC: "Okhlahoma City Thunder",
  NY: "Brooklyn Nets",
  SA: "San Antonio Spurs",
  IND: "Indiana Pacers",
  TOR: "Toronto Raptors",
  NO: "New Orleans Pelicans",
  ATL: "Atlanta Hawks",
  PHI: "Philadelphia 76ers",
  DET: "Detroit Pistons",
  ORL: "Orlando Magic",
  MIN: "Minnesota Timberwolves",
  UTA: "Utah Jazz",
  DEN: "Denver Nuggets",
  POR: "Portland Trailblazers",
  CLE: "Cleveland Cavaliers",
}

// ALL GRAPHING NECESSITIES ARE HERE
interface EPMModelProps {
  isOpen: boolean;
  onClose: () => void;
  prospects: DraftProspect[]; // All prospects.
  selectedPosition: string | null;
  selectedProspect?: DraftProspect; // Pass the selected prospect
  allProspects: DraftProspect[];
}

interface PayloadItem {
  dataKey: string;
  color: string;
  value: string | number;
}

type CustomTooltipProps = TooltipProps<number | string, string> & {
  active?: boolean;
  payload?: PayloadItem[];
  label?: string;
};

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

const EPMGraphModel: React.FC<EPMModelProps> = ({
  isOpen,
  onClose,
  prospects,
  selectedPosition,
}) => {
  const filteredProspects = selectedPosition
    ? prospects.filter((p) => p.Position === selectedPosition)
    : prospects;

  const prepareChartData = () => {
    const yearData: { year: string | number; [key: string]: string | number }[] = [];

    for (let year = 1; year <= 5; year++) {
      const yearObj: { year: string | number; [key: string]: string | number } = { year };

      filteredProspects.forEach((prospect) => {
        const rankKey = `Pred. Y${year} EPM` as keyof DraftProspect;
        yearObj[prospect.Name] = prospect[rankKey] ?? 0;
      });

      yearData.push(yearObj);
    }

    return yearData;
  };

  const chartData = prepareChartData();

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
          <p className="font-bold text-white">Year {label}</p>
          {payload.map((entry: PayloadItem) => (
            <p key={entry.dataKey} style={{ color: entry.color }}>
              {entry.dataKey}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader className="flex flex-row items-center justify-between">
          <AlertDialogTitle className="text-xl">Prospect EPM Progression</AlertDialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </AlertDialogHeader>

        <CardContent className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>EPM Progression By Player</CardTitle>
              <CardDescription>Years on X-axis, EPM values on Y-axis</CardDescription>
            </CardHeader>
            <ResponsiveContainer width="100%" height={500}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="year" type="number" stroke="#888" domain={[1, 5]} /> {/* X-axis domain */}
                <YAxis type="number" stroke="#888" domain={[-5, 5]} /> {/* Y-axis domain */}
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {filteredProspects.map((prospect) => (
                  <Line
                    key={prospect.Name}
                    type="monotone"
                    dataKey={prospect.Name}
                    stroke={prospect['Team Color']}
                    activeDot={{ r: 8 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </CardContent>
      </AlertDialogContent>
    </AlertDialog>
  );
};

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
    { name: 'Nick Kalinowski', href: '/Nick_Draft_Page', available: false, stage: 'development' as const },
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
              
              {/* TPM Dropdown */}
              <div className="relative" ref={DraftDropdownRef}>
                <button 
                  onClick={toggleTpmDropdown}
                  className={`
                    px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                    ${activeTab === 'TPM' 
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
              
              {/* Models Dropdown */}
              <div className="relative" ref={NBADropdownRef}>
                <button 
                  onClick={toggleModelsDropdown}
                  className={`
                    px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                    ${activeTab === 'Models' 
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
                
                {/* Models Dropdown menu */}
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

interface TimelineFilterProps {
  selectedSortKey: string;
  setSelectedSortKey: (key: string) => void;
  selectedPosition: string | null;
  setSelectedPosition: (position: string | null) => void;
  filteredProspects: DraftProspect[]; // Replace 'any' with your actual prospect type
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: 'cards' | 'table';
  setViewMode: (mode: 'cards' | 'table') => void;
}

const TimelineFilter = ({
  selectedSortKey,
  setSelectedSortKey,
  selectedPosition,
  setSelectedPosition,
  filteredProspects,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
}: TimelineFilterProps) => {
  const [showFilterSection, setShowFilterSection] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isEPMModelOpen, setIsEPMModelOpen] = useState(false);

  const basketballImage = "/icons/filter_basketball.png";

  //timeline labels
  const yearSortKeys = [
    { key: 'Actual Pick', label: 'Draft' },
    { key: 'Pred. Y1 Rank', label: 'Y1' },
    { key: 'Pred. Y2 Rank', label: 'Y2' },
    { key: 'Pred. Y3 Rank', label: 'Y3' },
    { key: 'Pred. Y4 Rank', label: 'Y4' },
    { key: 'Pred. Y5 Rank', label: 'Y5' }
  ];

  //button titles
  const averageKeys = [
    { key: 'Avg. Rank Y1-Y3', label: '3Y Avg' },
    { key: 'Avg. Rank Y1-Y5', label: '5Y Avg' }
  ];

  //for the summary by the filters
  const summaryLabels: { [key: string]: string } = {
    'Actual Pick': 'Draft Order',
    'Pred. Y1 Rank': 'Year 1',
    'Pred. Y2 Rank': 'Year 2',
    'Pred. Y3 Rank': 'Year 3',
    'Pred. Y4 Rank': 'Year 4',
    'Pred. Y5 Rank': 'Year 5',
    'Avg. Rank Y1-Y3': '3 Year Average',
    'Avg. Rank Y1-Y5': '5 Year Average',
  };

  //position labels
  const positions = [
    { key: 'Guard', label: 'Guards' },
    { key: 'Wing', label: 'Wings' },
    { key: 'Big', label: 'Bigs' }
  ];

  // Function to reset all filters
  const resetFilters = () => {
    setSelectedSortKey('Actual Pick'); // Reset to Draft Order
    setSelectedPosition(null); // Clear position filter
    setSearchQuery(''); // Clear search
  };

  const shouldHighlight = (itemKey: string) => {
    if (selectedSortKey === 'Avg. Rank Y1-Y3') {
      return ['Pred. Y1 Rank', 'Pred. Y2 Rank', 'Pred. Y3 Rank'].includes(itemKey);
    }
    if (selectedSortKey === 'Avg. Rank Y1-Y5') {
      return ['Pred. Y1 Rank', 'Pred. Y2 Rank', 'Pred. Y3 Rank', 'Pred. Y4 Rank', 'Pred. Y5 Rank'].includes(itemKey);
    }
    return selectedSortKey === itemKey;
  };

  const handlePositionClick = (position: string) => {
    if (selectedPosition === position) {
      setSelectedPosition(null);
    } else {
      setSelectedPosition(position);
    }
  };

  // Get active filter summary text
  const getFilterSummary = () => {
    const parts = [];

    // Add sort method
    if (selectedSortKey) {
      parts.push(summaryLabels[selectedSortKey] || selectedSortKey);
    }

    // Add position if selected
    if (selectedPosition) {
      parts.push(positions.find(p => p.key === selectedPosition)?.label || selectedPosition);
    }

    // Add search query if present
    if (searchQuery) {
      parts.push(`"${searchQuery}"`);
    }

    return parts.join(' • ');
  };

  // Check if any filters are applied (for conditionally showing reset button)
  const hasActiveFilters = () => {
    // Check if any filter is different from default values
    return selectedSortKey !== 'Actual Pick' || selectedPosition !== null || searchQuery.trim() !== '';
  };

  return (
    <div className="sticky top-14 z-30 bg-[#19191A] border-b border-gray-800 max-w-6xl mx-auto">
      {/* Collapsible trigger button */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/50">
        <div className="flex items-center space-x-2">
          <motion.button
            onClick={() => setShowFilterSection(!showFilterSection)}
            className="flex items-center gap-2 bg-gray-800/20 hover:bg-gray-800/40 text-gray-300 border border-gray-800 hover:border-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {showFilterSection ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
          </motion.button>

          {/* Filter summary text - shows when collapsed */}
          {!showFilterSection && (
            <div className="text-sm text-gray-400 flex items-center ml-2">
              {getFilterSummary() || "No filters applied"}

              {/* New reset button when filter is collapsed */}
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
          )}
        </div>

        {/* View mode toggle - always visible */}
        <motion.button
          onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
          className={`
            px-3 py-2 rounded-lg text-sm font-medium
            transition-all duration-300
            ${viewMode === 'table'
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'
            }
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {viewMode === 'cards' ? 'Table View' : 'Prospect Cards'}
        </motion.button>
      </div>

      {/* Collapsible content */}
      <AnimatePresence>
        {showFilterSection && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-2 md:px-4 py-4 md:py-6">
              <div className="relative">
                {/* Timeline Track - Responsive */}
                <div className="relative h-20 md:h-24 flex items-center justify-center mb-4 md:mb-8">
                  <div className="absolute w-full h-1 bg-gray-700/30" />

                  {selectedSortKey && (
                    <motion.div
                      className="absolute h-1 bg-white-500/4"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.5 }}
                    />
                  )}

                  <div className="relative w-full flex justify-between items-center px-2 md:px-12">
                    {yearSortKeys.map((item) => (
                      <motion.button
                        key={item.key}
                        onClick={() => setSelectedSortKey(item.key)}
                        className={`
                          relative flex flex-col items-center justify-center
                          transition-colors duration-300 rounded-full
                          ${shouldHighlight(item.key) ? 'z-20' : 'z-10'}
                        `}
                        whileHover={{ scale: 1.1 }}
                      >
                        <motion.div
                          className={`
                            rounded-full border-5 md:border-2 cursor-pointer
                            ${shouldHighlight(item.key)
                              ? 'bg-blue-500 border-blue-500 w-8 h-8 md:w-12 md:h-12'
                              : 'bg-gray-800 border-gray-700 w-6 h-6 md:w-8 md:h-8 hover:border-gray-600'
                            }
                          `}
                          animate={{
                            scale: shouldHighlight(item.key) ? 1.2 : 1,
                            rotate: shouldHighlight(item.key) ? 360 : 0,
                            transition: { duration: 0.5 }
                          }}
                          >
                          <img
                            src="/icons/filter_basketball.png" 
                            alt="Test Basketball"
                            className="w-full h-full rounded-full"
                          />
                        </motion.div>
                        
                        <motion.span
                          className={`
                            absolute -bottom-6 whitespace-nowrap text-xs md:text-sm font-medium
                            ${shouldHighlight(item.key) ? 'text-blue-400' : 'text-gray-400'}
                          `}
                          animate={{
                            scale: shouldHighlight(item.key) ? 1.1 : 1,
                            transition: { duration: 0.3 }
                          }}
                        >
                          {item.label}
                        </motion.span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Filter header section - removed redundant reset button */}
                <div className="flex justify-between items-center mb-3">
                  {/* Mobile toggle button for filters - only shown in mobile view */}
                  <div className="flex md:hidden items-center">
                    <button
                      onClick={() => setShowMobileFilters(!showMobileFilters)}
                      className="flex items-center gap-2 bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700 px-3 py-2 rounded-lg text-sm"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      Filters
                      {showMobileFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Mobile filter drawer */}
                {showMobileFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="md:hidden space-y-3 mb-4 p-3 bg-gray-800/10 rounded-lg border border-gray-800"
                  >
                    {/* Position Filters for Mobile */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      <div className="w-full text-xs text-gray-400 mb-1">Position:</div>
                      {positions.map((position) => (
                        <motion.button
                          key={position.key}
                          onClick={() => handlePositionClick(position.key)}
                          className={`
                            px-3 py-1 rounded-lg text-xs font-medium
                            transition-all duration-300
                            ${selectedPosition === position.key
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'
                            }
                          `}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {position.label}
                        </motion.button>
                      ))}
                    </div>

                    {/* Average Filters for Mobile */}
                    <div className="flex flex-wrap gap-2">
                      <div className="w-full text-xs text-gray-400 mb-1">Average:</div>
                      {averageKeys.map((item) => (
                        <motion.button
                          key={item.key}
                          onClick={() => setSelectedSortKey(item.key)}
                          className={`
                            px-3 py-1 rounded-lg text-xs font-medium
                            transition-all duration-300
                            ${selectedSortKey === item.key
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'
                            }
                          `}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {item.label}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Desktop filter bar - hidden on mobile */}
                <div className="hidden md:flex justify-between items-center space-x-4 mt-4">
                  {/* Reset Button and Search Section */}
                  <div className="relative flex items-center space-x-2 flex-grow max-w-md">
                    {/* Reset Button moved to the left of the Search Bar */}
                    <motion.button
                      onClick={resetFilters}
                      className={`
                        flex items-center gap-1 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all duration-200
                        ${hasActiveFilters()
                          ? 'bg-gray-800/20 text-red-400 hover:text-red-300 border border-gray-800 hover:border-red-700/30'
                          : 'bg-gray-800/10 text-gray-500 border border-gray-800/50 opacity-60'
                        }
                      `}
                      whileHover={{ scale: hasActiveFilters() ? 1.05 : 1 }}
                      whileTap={{ scale: hasActiveFilters() ? 0.95 : 1 }}
                      disabled={!hasActiveFilters()}
                    >
                      <X className="h-4 w-4" /> {/* w-10 is what we need */}
                      Reset
                    </motion.button>

                    {/* Search field */}
                    <div className="relative flex-grow">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full bg-gray-800/20 border-gray-800 text-gray-300 placeholder-gray-500 rounded-lg focus:border-blue-500/30 focus:ring-1 focus:ring-blue-500/30"
                      />
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-8 w-px bg-gray-700/30 mx-2" />

                  {/* Graphs button */}
                  <motion.button
                    onClick={() => setIsEPMModelOpen(true)}
                    className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2
                    transition-all duration-300
                    bg-gray-800/20 text-gray-400 
                    border border-gray-800 hover:border-gray-700"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <BarChartIcon className="h-4 w-4" />
                    Graphs
                  </motion.button>

                  {/* EPM Graph Model */}
                  <EPMGraphModel
                    isOpen={isEPMModelOpen}
                    onClose={() => setIsEPMModelOpen(false)}
                    prospects={filteredProspects}
                    selectedPosition={selectedPosition}
                    allProspects={filteredProspects}
                  />

                  {/* Divider */}
                  <div className="h-8 w-px bg-gray-700/30 mx-2" />

                  {/* Position Filters */}
                  {positions.map((position) => (
                    <motion.button
                      key={position.key}
                      onClick={() => handlePositionClick(position.key)}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium
                        transition-all duration-300
                        ${selectedPosition === position.key
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'
                        }
                      `}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {position.label}
                    </motion.button>
                  ))}

                  {/* Divider */}
                  <div className="h-8 w-px bg-gray-700/30 mx-2" />

                  {/* Average Filters */}
                  {averageKeys.map((item) => (
                    <motion.button
                      key={item.key}
                      onClick={() => setSelectedSortKey(item.key)}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium
                        transition-all duration-300
                        ${selectedSortKey === item.key
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'
                        }
                      `}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {item.label}
                    </motion.button>
                  ))}

                  {/* EPM Model */}
                  {/* <EPMModel
                    isOpen={isGraphModelOpen}
                    onClose={() => setIsGraphModelOpen(false)}
                    prospects={filteredProspects}
                    selectedPosition={selectedPosition}
                    allProspects={filteredProspects}
                  /> */}
                </div>
              </div>
            </div>

            {/* Mobile search field */}
            <div className="md:hidden relative mx-2 my-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-gray-800/20 border-gray-800 text-gray-300 placeholder-gray-500 rounded-lg focus:border-blue-500/30 focus:ring-1 focus:ring-blue-500/30"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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

const IndividualProspectGraphs: React.FC<EPMModelProps> = ({
  isOpen,
  onClose,
  selectedProspect,
  allProspects,
}) => {
  const filteredProspects = useMemo(() => {
    if (!selectedProspect) return [];
    return allProspects.filter(p => p.Position === selectedProspect.Position);
  }, [allProspects, selectedProspect]);

  const prepareChartData = () => {
    const yearData: { year: string | number; [key: string]: string | number }[] = [];

    for (let year = 1; year <= 5; year++) {
      const yearObj: { year: string | number; [key: string]: string | number } = { year };

      filteredProspects.forEach((prospect) => {
        const rankKey = `Pred. Y${year} Rank` as keyof DraftProspect;
        yearObj[prospect.Name] = prospect[rankKey] ?? 0;
      });

      yearData.push(yearObj);
    }

    return yearData;
  };

  const chartData = prepareChartData();

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
          <p className="font-bold text-white">Year {label}</p>
          {payload.map((entry: PayloadItem) => (
            <p key={entry.dataKey} style={{ color: entry.color }}>
              {entry.dataKey}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader className="flex flex-row items-center justify-between">
          <AlertDialogTitle className="text-xl">
            {selectedProspect
              ? `${selectedProspect.Name} EPM Comparison ${selectedProspect.Position === 'Wing' ? '(Wing Comparison)' : ''}`
              : 'Select a Prospect'}
          </AlertDialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </AlertDialogHeader>

        <CardContent className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>EPM Progression By Player</CardTitle>
              <CardDescription>Years on X-axis, EPM values on Y-axis</CardDescription>
            </CardHeader>
            <ResponsiveContainer width="100%" height={500}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="year" type="number" stroke="#888" domain={[1, 5]} />
                <YAxis type="number" stroke="#888" domain={[-5, 5]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {filteredProspects.map((prospect) => (
                  <Line
                    key={prospect.Name}
                    type="monotone"
                    dataKey={prospect.Name}
                    stroke={prospect.Name === selectedProspect?.Name ? prospect['Team Color'] : 'lightgray'}
                    strokeWidth={prospect.Name === selectedProspect?.Name ? 3 : 1}
                    activeDot={{ r: 8 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </CardContent>
      </AlertDialogContent>
    </AlertDialog>
  );
};

{/* Player Cards */ }
const ProspectCard: React.FC<{ prospect: DraftProspect; rank: RankType; filteredProspects: DraftProspect[] }> = ({ prospect, rank, filteredProspects }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [isGraphModelOpen, setIsGraphModelOpen] = useState(false);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    if (!isExpanded) {
      setIsHovered(false);
    }
  };

  // Update hover state when dropdown is expanded
  useEffect(() => {
    if (isExpanded) {
      setIsHovered(true);
    }
  }, [isExpanded]);

  const draftedTeam = teamNames[prospect.NBA] || prospect.NBA;
  const playerSummary = prospect.Summary || "A detailed scouting report would go here, describing the player's strengths, weaknesses, and projected role in the NBA.";
  const playerImageUrl = `/player_images2024/${prospect.Name} BG Removed.png`;
  // const getPlayerImageUrl = () => {
//   if (prospect.Name === "Riley Minix") {
//     // Return special URL for Riley Minix
//     return `/player_images2024/Riley Minix BG Removed Top.png`;
//     // Or another variation if needed:
//     // return `/player_images2024_special/Riley Minix BG Removed.png`;
//   }
  
//   // Default URL format for other players
//   return `/player_images2024/${prospect.Name} BG Removed.png`;
// };

  const prenbalogoUrl = `/prenba_logos/${prospect['Pre-NBA']}.png`;

  return (
    <div className="max-w-5xl mx-auto px-4 mb-4">
      <motion.div layout="position" transition={{ layout: { duration: 0.3, ease: "easeInOut" } }}>
        <div className="relative">
          {/* Main card container - add mouse event handlers here */}
          <div
            className="relative h-[400px] rounded-xl border border-gray-700/50 overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.07)] transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:border-gray-600/50"
            style={{ backgroundColor: '#19191A' }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Rank Number */}
            <motion.div
              layout="position"
              className={`
                absolute top-6 right-8 z-20
                transition-opacity duration-300
                ${(isHovered || isExpanded) ? 'opacity-40' : 'opacity-100'}
              `}
            >
              <div className={`
                ${barlow.className}
                text-6xl font-bold
                text-white
                select-none
                transition-all duration-300
                ${(isHovered || isExpanded) ? 'mr-[300px]' : ''}
              `}>
                {typeof rank === 'number' ? rank : 'N/A'}
              </div>
            </motion.div>

            {/* Background Pre-NBA Logo */}
            <div className={`absolute inset-0 flex items-center justify-start pl-12 transition-opacity duration-300 ${(isHovered || isExpanded) ? 'opacity-90' : 'opacity-20'}`}>
              {!logoError ? (
                <Image
                  src={prenbalogoUrl}
                  alt={prospect['Pre-NBA']}
                  width={200}
                  height={200}
                  className={`object-contain transition-transform duration-300 ${(isHovered || isExpanded) ? 'scale-105 grayscale-0' : 'grayscale'}`}
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="w-48 h-48 bg-gray-800 rounded-full flex items-center justify-center">
                  <span className="text-xl text-gray-400">{prospect['Pre-NBA']}</span>
                </div>
              )}
            </div>

            {/* Player Image */}
            <div className="absolute inset-0 flex justify-center items-end overflow-hidden">
              <div className="relative w-[90%] h-[90%]">
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
                        ${(isHovered || isExpanded) ? 'scale-105 grayscale-0' : 'grayscale'}
                      `}
                      onError={() => setImageError(true)}
                      sizes="800px"
                      priority
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <LucideUser className="text-gray-500" size={48} />
                  </div>
                )}
              </div>
            </div>

            {/* Large Centered Name */}
            <motion.div
              layout="position"
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${(isHovered || isExpanded) ? 'opacity-0' : 'opacity-100'}`}
            >
              <div className="text-center z-10">
                <h2 className={`
                  ${barlow.className} 
                  text-7xl 
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

            {/* Hover info panel */}
            <div
              className={`absolute top-0 right-0 h-full w-[300px] backdrop-blur-sm transition-all duration-300 rounded-r-lg ${(isHovered || isExpanded) ? 'opacity-100' : 'opacity-0 translate-x-4 pointer-events-none'
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
                      {Number(prospect['Actual Pick']) >= 59 ? "Undrafted - " : `${prospect['Actual Pick']} - `}{draftedTeam}
                    </div>
                  </div>
                </div>

                {/* NBA Team logo */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                  <NBATeamLogo NBA={prospect['NBA Team']} />
                </div>
              </div>
            </div>
          </div>

          {/* Expand/collapse button */}
          <div className="flex justify-center mt-2">
            <motion.button
              layout="position"
              onClick={() => {
                setIsExpanded(!isExpanded);
                if (!isExpanded) {
                  setIsHovered(true);
                }
              }}
              className={`
                w-10 h-10
                rounded-full
                flex items-center justify-center
                bg-gray-800/20
                hover:bg-gray-800/30
                transition-all duration-300
                border border-gray-700
                hover:border-gray-600
                ${isExpanded ? 'bg-gray-800/30 border-gray-600' : ''}
              `}
              aria-label={isExpanded ? "Collapse details" : "Expand details"}
            >
              {isExpanded ? (
                <ChevronUp className="text-white h-5 w-5" />
              ) : (
                <ChevronDown className="text-white h-5 w-5 transition-all duration-300" />
              )}
            </motion.button>
          </div>

          {/* Expanded content */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 gap-4 rounded-xl backdrop-blur-sm p-6 mt-2 border border-gray-700/50 shadow-[0_0_15px_rgba(255,255,255,0.07)]"
              style={{ backgroundColor: '#19191A' }}
            >
              {/* Scouting Report Column */}
              <div className="text-gray-300">
                <h3 className="font-semibold text-lg mb-3 text-white">Scouting Report</h3>
                <p className="text-sm leading-relaxed">{playerSummary}</p>
              </div>

              {/* Rankings Column */}
              <div className="space-y-4">
                <div className="bg-gray-800/80 p-4 rounded-xs">
                  <h3 className="font-semibold text-white mb-3">Projected Rankings</h3>

                  {/* Rankings Table */}
                  <div className="w-full">
                    <div className="grid grid-cols-3 gap-4 mb-2 text-sm font-semibold text-gray-400 border-b border-gray-700 pb-2">
                      <div>Year</div>
                      <div className="text-center">Overall</div>
                      <div className="text-center">Position</div>
                    </div>
                    <div className="space-y-2">
                      {['Y1', 'Y2', 'Y3'].map((year) => {
                        // Get all prospects with the same role
                        const samePositionProspects = filteredProspects.filter(p => p.Role === prospect.Role);

                        // Sort them by the current year's rank
                        const sortedByYear = samePositionProspects.sort((a, b) => {
                          const aRank = Number(a[`Pred. ${year} Rank` as keyof DraftProspect]);
                          const bRank = Number(b[`Pred. ${year} Rank` as keyof DraftProspect]);
                          return aRank - bRank;
                        });

                        // Find position rank
                        const positionRank = sortedByYear.findIndex(p => p.Name === prospect.Name) + 1;

                        return (
                          <div key={year} className="grid grid-cols-3 gap-4 text-sm text-gray-300">
                            <div>Year {year.slice(1)}</div>
                            <div className="text-center">{prospect[`Pred. ${year} Rank` as keyof DraftProspect]}</div>
                            <div className="text-center">{positionRank === 0 ? 'N/A' : positionRank}</div>
                          </div>
                        );
                      })}

                      {/* 3 Year Average after Year 3 */}
                      <div className="grid grid-cols-3 gap-4 text-sm text-blue-400">
                        <div>3 Year Average</div>
                        <div className="text-center">{prospect['Avg. Rank Y1-Y3']}</div>
                        <div className="text-center">
                          {(() => {
                            const samePositionProspects = filteredProspects.filter(p => p.Role === prospect.Role);
                            const sortedBy3YAvg = samePositionProspects.sort((a, b) => {
                              const aRank = Number(a['Avg. Rank Y1-Y3']);
                              const bRank = Number(b['Avg. Rank Y1-Y3']);
                              return aRank - bRank;
                            });
                            const positionRank = sortedBy3YAvg.findIndex(p => p.Name === prospect.Name) + 1;
                            return positionRank === 0 ? 'N/A' : positionRank;
                          })()}
                        </div>
                      </div>

                      {['Y4', 'Y5'].map((year) => {
                        const samePositionProspects = filteredProspects.filter(p => p.Role === prospect.Role);
                        const sortedByYear = samePositionProspects.sort((a, b) => {
                          const aRank = Number(a[`Pred. ${year} Rank` as keyof DraftProspect]);
                          const bRank = Number(b[`Pred. ${year} Rank` as keyof DraftProspect]);
                          return aRank - bRank;
                        });
                        const positionRank = sortedByYear.findIndex(p => p.Name === prospect.Name) + 1;

                        return (
                          <div key={year} className="grid grid-cols-3 gap-4 text-sm text-gray-300">
                            <div>Year {year.slice(1)}</div>
                            <div className="text-center">{prospect[`Pred. ${year} Rank` as keyof DraftProspect]}</div>
                            <div className="text-center">{positionRank === 0 ? 'N/A' : positionRank}</div>
                          </div>
                        );
                      })}

                      {/* 5 Year Average after Year 5 */}
                      <div className="grid grid-cols-3 gap-4 text-sm text-blue-400">
                        <div>5 Year Average</div>
                        <div className="text-center">{prospect['Avg. Rank Y1-Y5']}</div>
                        <div className="text-center">
                          {(() => {
                            const samePositionProspects = filteredProspects.filter(p => p.Role === prospect.Role);
                            const sortedBy5YAvg = samePositionProspects.sort((a, b) => {
                              const aRank = Number(a['Avg. Rank Y1-Y5']);
                              const bRank = Number(b['Avg. Rank Y1-Y5']);
                              return aRank - bRank;
                            });
                            const positionRank = sortedBy5YAvg.findIndex(p => p.Name === prospect.Name) + 1;
                            return positionRank === 0 ? 'N/A' : positionRank;
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Graphs Button */}
                <div>
                <button
                  onClick={() => setIsGraphModelOpen(true)}
                  className="bg-gray-800 hover:bg-gray-700 text-white py-2 px-3 rounded">
                  View Graphs
                </button>

                {isGraphModelOpen && (
                  <IndividualProspectGraphs
                    isOpen={isGraphModelOpen}
                    onClose={() => setIsGraphModelOpen(false)}
                    prospects={filteredProspects}
                    selectedPosition={prospect.Role}
                    selectedProspect={prospect}
                    allProspects={filteredProspects}
                  />
                )}
              </div>

              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Divider */}
      <div>
        <div className="h-px w=3/4 bg-gray my-5" />
        <div className="h-px w-full bg-gray-700/30 my -8" />
        <div className="h-px w=3/4 bg-gray my-5" />
      </div>
    </div>
  );
};

{/* Player Tables */ }
const ProspectTable = ({ prospects, rank }: { prospects: DraftProspect[], rank: Record<string, RankType> }) => {
  return (
    <div className="w-full overflow-x-auto bg-[#19191A] rounded-lg border border-gray-800">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-gray-400">Rank</TableHead>
            <TableHead className="text-gray-400">Name</TableHead>
            <TableHead className="text-gray-400">Position</TableHead>
            <TableHead className="text-gray-400">Pre-NBA</TableHead>
            <TableHead className="text-gray-400">Draft Pick</TableHead>
            <TableHead className="text-gray-400">NBA Team</TableHead>
            <TableHead className="text-gray-400">Age</TableHead>
            <TableHead className="text-gray-400">Height</TableHead>
            <TableHead className="text-gray-400">Wingspan</TableHead>
            <TableHead className="text-gray-400">Weight</TableHead>
            <TableHead className="text-gray-400">Y1 Rank</TableHead>
            <TableHead className="text-gray-400">Y2 Rank</TableHead>
            <TableHead className="text-gray-400">Y3 Rank</TableHead>
            <TableHead className="text-gray-400">3Y Avg</TableHead>
            <TableHead className="text-gray-400">Y4 Rank</TableHead>
            <TableHead className="text-gray-400">Y5 Rank</TableHead>
            <TableHead className="text-gray-400">5Y Avg</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prospects.map((prospect) => (
            <TableRow
              key={prospect.Name}
              className="hover:bg-gray-800/20"
            >
              <TableCell className="text-gray-300">{rank[prospect.Name]}</TableCell>
              <TableCell className="font-medium text-gray-300">{prospect.Name}</TableCell>
              <TableCell className="text-gray-300">{prospect.Role}</TableCell>
              <TableCell className="text-gray-300">{prospect['Pre-NBA']}</TableCell>
              <TableCell className="text-gray-300">
                {Number(prospect['Actual Pick']) >= 59 ? "Undrafted" : prospect['Actual Pick']}
              </TableCell>
              <TableCell className="text-gray-300">{teamNames[prospect.NBA] || prospect.NBA}</TableCell>
              <TableCell className="text-gray-300">{prospect.Age}</TableCell>
              <TableCell className="text-gray-300">{prospect.Height}</TableCell>
              <TableCell className="text-gray-300">{prospect.Wingspan}</TableCell>
              <TableCell className="text-gray-300">{prospect['Weight (lbs)']}</TableCell>
              <TableCell className="text-gray-300">{prospect['Pred. Y1 Rank']}</TableCell>
              <TableCell className="text-gray-300">{prospect['Pred. Y2 Rank']}</TableCell>
              <TableCell className="text-gray-300">{prospect['Pred. Y3 Rank']}</TableCell>
              <TableCell className="text-blue-400">{prospect['Avg. Rank Y1-Y3']}</TableCell>
              <TableCell className="text-gray-300">{prospect['Pred. Y4 Rank']}</TableCell>
              <TableCell className="text-gray-300">{prospect['Pred. Y5 Rank']}</TableCell>
              <TableCell className="text-blue-400">{prospect['Avg. Rank Y1-Y5']}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

type RankType = number | 'N/A';

{/* Filters */ }
function TimelineSlider({ initialProspects }: { initialProspects: DraftProspect[] }) {
  const [selectedSortKey, setSelectedSortKey] = useState<string>('Actual Pick');
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const filteredProspects = useMemo(() => {
    // First, sort all prospects according to the selected sort key
    const allSortedProspects = [...initialProspects].sort((a, b) => {
      // Special handling for 'Actual Pick'
      if (selectedSortKey === 'Actual Pick') {
        const aValue = a[selectedSortKey];
        const bValue = b[selectedSortKey];

        // If either value is 'N/A' or empty, treat it as greater than draft picks
        if (aValue === 'N/A' || aValue === '' || aValue === null || aValue === undefined) {
          return 1;
        }
        if (bValue === 'N/A' || bValue === '' || bValue === null || bValue === undefined) {
          return -1;
        }

        const aNum = Number(aValue);
        const bNum = Number(bValue);

        // If both are valid numbers
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum;
        }
        return 0;
      } else {
        // Regular sorting for other keys
        const aValue = a[selectedSortKey as keyof DraftProspect];
        const bValue = b[selectedSortKey as keyof DraftProspect];

        if (aValue === 'N/A' || aValue === '' || aValue === null || aValue === undefined) {
          return 1;
        }
        if (bValue === 'N/A' || bValue === '' || bValue === null || bValue === undefined) {
          return -1;
        }

        return Number(aValue) - Number(bValue);
      }
    });

    // Create a map of rankings that preserves draft pick numbers
    const rankMap = new Map<string, RankType>(
      allSortedProspects.map((prospect, index) => {
        if (selectedSortKey === 'Actual Pick') {
          const actualPick = prospect['Actual Pick'];
          // If it's a valid draft pick number and less than or equal to 58, use it
          if (actualPick && !isNaN(Number(actualPick)) && Number(actualPick) <= 58) {
            return [prospect.Name, Number(actualPick)];
          }
          // For undrafted players or invalid numbers, return N/A
          return [prospect.Name, 'N/A'];
        }
        // For other sort keys, use the regular index + 1
        return [prospect.Name, index + 1];
      })
    );

    // Then apply filters while preserving the original ranking
    let filteredProspects = [...allSortedProspects];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filteredProspects = filteredProspects.filter(prospect => {
        //NEED TO FIX THIS ISSUE
        // const nameParts = prospect.Name.toLowerCase().split(' ');
        // const firstName = nameParts[0];
        // const lastName = nameParts[nameParts.length - 1];
        const fullName = prospect.Name.toLowerCase();
        const nameMatch = fullName.includes(query)
        const preNBAMatch = prospect['Pre-NBA'].toLowerCase().includes(query);
        const teamAbbrevMatch = prospect.NBA.toLowerCase().includes(query);
        const teamFullNameMatch = teamNames[prospect.NBA]?.toLowerCase().includes(query);
        //^ this was an attempt to just add the full player name to the search

        return nameMatch || preNBAMatch || teamAbbrevMatch || teamFullNameMatch;
      });
    }

    // Apply position filter if selected
    if (selectedPosition) {
      filteredProspects = filteredProspects.filter(prospect => prospect.Role === selectedPosition);
    }

    // Create array of ProspectWithRank objects
    return filteredProspects.map(prospect => ({
      prospect,
      originalRank: rankMap.get(prospect.Name)
    }));

  }, [initialProspects, selectedSortKey, selectedPosition, searchQuery]);

  return (
    <div className="bg-[#19191A] min-h-screen">
      {/* The NavigationHeader would be outside this component */}

      {/* Sticky Filter Section */}
      <TimelineFilter
        selectedSortKey={selectedSortKey}
        setSelectedSortKey={setSelectedSortKey}
        selectedPosition={selectedPosition}
        setSelectedPosition={setSelectedPosition}
        filteredProspects={filteredProspects.map(p => p.prospect)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Content area - add padding-top to give space after the filters */}
      <div className="max-w-6xl mx-auto px-4 pt-8">
        {filteredProspects.length > 0 ? (
          viewMode === 'cards' ? (
            <div className="space-y-4">
              {filteredProspects.map(({ prospect, originalRank }) => (
                <ProspectCard
                  key={prospect.Name}
                  prospect={prospect}
                  rank={originalRank ?? 0}
                  filteredProspects={filteredProspects.map(p => p.prospect)}
                />
              ))}
            </div>
          ) : (
            <ProspectTable
              prospects={filteredProspects.map(p => p.prospect)}
              rank={Object.fromEntries(
                filteredProspects.map(({ prospect, originalRank }) => [
                  prospect.Name,
                  originalRank ?? 'N/A'
                ])
              )}
            />
          )
        ) : (
          <div className="text-center py-8 text-gray-400">
            No prospects found matching your search criteria
          </div>
        )}
      </div>
    </div>
  );
}

export default function DraftProspectsPage() {
  const [prospects, setProspects] = useState<DraftProspect[]>([]);

  useEffect(() => {
    async function fetchDraftProspects() {
      try {
        const response = await fetch('/2024_Draft_Class.csv');
        const csvText = await response.text();

        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            setProspects(results.data as DraftProspect[]);
          }
        });
      } catch (error) {
        console.error('Error fetching draft prospects:', error);
      }
    }

    fetchDraftProspects();
  }, []);

  return (
    <div className="min-h-screen bg-[#19191A]">
      <NavigationHeader activeTab="Max Savin" />
      <TimelineSlider initialProspects={prospects} />
    </div>
  );
}