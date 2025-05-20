"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import { LucideUser, ChevronDown, ChevronUp, X, SlidersHorizontal } from 'lucide-react';
import Papa from 'papaparse';
import { Barlow } from 'next/font/google';
import { AnimatePresence, motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Cell, Bar, BarChart, LabelList } from 'recharts';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
//import Link from 'next/link';
import { Search, Table as TableIcon, LockIcon, UnlockIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { TooltipProps } from 'recharts';
//import ComingSoon from '@/components/ui/ComingSoon'; // Import the ComingSoon component
import NavigationHeader from '@/components/NavigationHeader';

type PositionRanks = {
  Y1: number;
  Y2: number;
  Y3: number;
  Y4: number;
  Y5: number;
  Y1Y3: number;
  Y1Y5: number;
};

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
  'Pred. Y1 EPM': number;
  'Pred. Y2 EPM': number;
  'Pred. Y3 EPM': number;
  'Pred. Y4 EPM': number;
  'Pred. Y5 EPM': number;
  'Avg. EPM Y1-Y3': number;
  'Avg. EPM Y1-Y5': number;
  'Height': string;
  'Height (in)': string;
  'Wingspan': string;
  'Wing - Height': string;
  'Weight (lbs)': string;
  'Role': string;
  Summary?: string;
  originalRank?: number;
  Size: number;
  Athleticism: number;
  Defense: number;
  Rebounding: number;
  Scoring: number;
  Passing: number;
  Shooting: number;
  Efficiency: number;
  'Tier': string;
  'Comp1': string;
  'Similarity1': number;
  'Comp2': string;
  'Similarity2': number;
  'Comp3': string;
  'Similarity3': number;
  'Comp4': string;
  'Similarity4': number;
  'Comp5': string;
  'Similarity5': number;

  positionRanks: {
    Y1: number;
    Y2: number;
    Y3: number;
    Y4: number;
    Y5: number;
    Y1Y3: number; // Position-specific 3-year average rank
    Y1Y5: number; // Position-specific 5-year average rank
  };
  avg3YEPM: number; // Global 3-year average EPM value
  avg5YEPM: number; // Global 5-year average EPM value
  globalRank3Y: number; // Global 3-year average EPM rank
  globalRank5Y: number; // Global 5-year average EPM rank

  // These are the keys you're using for sorting and display
  'Rank Y1-Y3': number; // Global 3-year average EPM rank
  'Rank Y1-Y5': number; // Global 5-year average EPM rank
}

const tierColors: { [key: string]: string } = {
  'All-Time Great': '#FF66C4',
  'All-NBA Caliber': '#E9A2FF',
  'Fringe All-Star': '#5CE1E6',
  'Quality Starter': '#7ED957',
  'Solid Rotation': '#FFDE59',
  'Bench Reserve': '#FFA455',
  'Fringe NBA': '#FF5757',
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
  NYK: "New York Knicks",
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
}

// ALL GRAPHING NECESSITIES ARE HERE
interface EPMModelProps {
  isOpen: boolean;
  onClose: () => void;
  prospects: DraftProspect[]; // All prospects.
  selectedPosition: string | null;
  selectedProspect?: DraftProspect; // Pass the selected prospect
  allProspects: DraftProspect[];
  graphType?: 'EPM' | 'rankings'; // Optional prop to determine graph type
  setGraphType?: (type: 'EPM' | 'rankings') => void; // Make optional
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

// const EPMGraphModel: React.FC<EPMModelProps> = ({
//   isOpen,
//   onClose,
//   allProspects,
// }) => {
//   const filteredProspects = allProspects;

//   const prepareChartData = () => {
//     const yearData: { year: string | number;[key: string]: string | number }[] = [];

//     for (let year = 1; year <= 5; year++) {
//       const yearObj: { year: string | number;[key: string]: string | number } = { year };

//       filteredProspects.forEach((prospect) => {
//         const rankKey = `Pred. Y${year} EPM` as keyof DraftProspect;
//         const value = prospect[rankKey];
//         if (typeof value === 'number') {
//           yearObj[prospect.Name] = value;
//         } else {
//           yearObj[prospect.Name] = 0;
//         }
//       });

//       yearData.push(yearObj);
//     }

//     return yearData;
//   };

//   const chartData = prepareChartData();

//   const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="bg-gray-800/90 p-4 rounded-lg shadow-lg border border-gray-700">
//           <p className="font-bold text-white">Year {label}</p>
//           {payload.map((entry: PayloadItem) => (
//             <p key={entry.dataKey} style={{ color: entry.color }}>
//               {entry.dataKey}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
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
//           <AlertDialogTitle className="text-xl">Prospect EPM Progression</AlertDialogTitle>
//           <Button variant="ghost" size="icon" onClick={onClose}>
//             <X className="h-5 w-5" />
//           </Button>
//         </AlertDialogHeader>

//         <CardContent className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>EPM Progression By Player</CardTitle>
//               <CardDescription>Years on X-axis, EPM values on Y-axis</CardDescription>
//             </CardHeader>
//             <ResponsiveContainer width="100%" height={500}>
//               <LineChart data={chartData}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#333" />
//                 <XAxis dataKey="year" type="number" stroke="#888" domain={[1, 5]} /> {/* X-axis domain */}
//                 <YAxis type="number" stroke="#888" domain={[-5, 5]} /> {/* Y-axis domain */}
//                 <Tooltip content={<CustomTooltip />} />
//                 <Legend />
//                 {filteredProspects.map((prospect) => (
//                   <Line
//                     key={prospect.Name}
//                     type="monotone"
//                     dataKey={prospect.Name}
//                     stroke={prospect['Team Color']}
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


interface TimelineFilterProps {
  selectedSortKey: string;
  setSelectedSortKey: (key: string) => void;
  selectedPosition: string | null;
  setSelectedPosition: (position: string | null) => void;
  selectedTier: string | null;  // New prop for tier selection
  setSelectedTier: (tier: string | null) => void;  // New prop for setting tier
  tierRankActive: boolean;
  setTierRankActive: (active: boolean) => void;
  filteredProspects: DraftProspect[];
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
  selectedTier,
  setSelectedTier,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  tierRankActive,
  setTierRankActive,
}: TimelineFilterProps) => {
  const [showFilterSection, setShowFilterSection] = useState(false);
  const [selectedYear, setSelectedYear] = useState('2024');

  // Timeline labels
  const yearSortKeys = [
    { key: 'Actual Pick', label: 'Draft' },
    { key: 'Pred. Y1 Rank', label: 'Y1' },
    { key: 'Pred. Y2 Rank', label: 'Y2' },
    { key: 'Pred. Y3 Rank', label: 'Y3' },
    { key: 'Pred. Y4 Rank', label: 'Y4' },
    { key: 'Pred. Y5 Rank', label: 'Y5' }
  ];

  // Button titles
  const averageKeys = [
    { key: 'Avg. Rank Y1-Y3', label: '3Y Avg' },
    { key: 'Avg. Rank Y1-Y5', label: '5Y Avg' },
  ];

  // For the summary by the filters
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

  // Position labels
  const positions = [
    { key: 'Guard', label: 'Guards' },
    { key: 'Wing', label: 'Wings' },
    { key: 'Big', label: 'Bigs' }
  ];

  // Tier labels - added new tier options
  const tiers = [
    { key: 'All-Time Great', label: 'All-Time Great' },
    { key: 'All-NBA Caliber', label: 'All-NBA Caliber' },
    { key: 'Fringe All-Star', label: 'Fringe All-Star' },
    { key: 'Quality Starter', label: 'Quality Starter' },
    { key: 'Solid Rotation', label: 'Solid Rotation' },
    { key: 'Bench Reserve', label: 'Bench Reserve' },
    { key: 'Fringe NBA', label: 'Fringe NBA' }
  ];

  summaryLabels['Tier Ranked'] = 'Tier Ranking';

  // Function to reset all filters
  const resetFilters = () => {
    setSelectedSortKey('Actual Pick'); // Reset to Draft Order
    setSelectedPosition(null); // Clear position filter
    setSelectedTier(null); // Clear tier filter
    setSearchQuery(''); // Clear search
    setTierRankActive(false); // Reset tier ranking state
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

  // New handler for tier clicks
  const handleTierClick = (tier: string) => {
    if (selectedTier === tier) {
      setSelectedTier(null);
    } else {
      setSelectedTier(tier);
      setTierRankActive(false); // Unselect tier ranking when a specific tier is selected
    }
  };

  // Update the tier ranking toggle handler
  const handleTierRankToggle = () => {
    setTierRankActive(!tierRankActive);
    if (!tierRankActive) {
      setSelectedTier(null); // Unselect specific tier when tier ranking is activated
    }
  };

  // Get active filter summary text
  const getFilterSummary = () => {
    const parts = [];

    // Add tier ranking status first if active
    if (tierRankActive) {
      parts.push('Tiers');
    }

    // Add selected tier if any
    if (selectedTier) {
      parts.push(`Tier: ${selectedTier}`);
    }

    // Add sort method if not tier-related
    if (selectedSortKey && selectedSortKey !== 'Tier Ranked') {
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
    return selectedSortKey !== 'Actual Pick' || selectedPosition !== null || selectedTier !== null || searchQuery.trim() !== '';
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
            <div className="hidden md:flex text-sm text-gray-400 items-center ml-2">
              {getFilterSummary() || "No filters applied"}

              {/* Reset button when filter is collapsed */}
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

        {/* View mode toggle and Year dropdown */}
        <div className="flex items-center space-x-2">
          {/* Year Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium
                  transition-all duration-300
                  bg-gray-800/20 text-gray-300 border border-gray-800 hover:border-gray-700
                  flex items-center gap-2
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {selectedYear}
                <ChevronDown className="h-4 w-4" />
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-32 bg-[#19191A] border-gray-700">
              <DropdownMenuItem
                className="text-gray-400 hover:bg-gray-800/50 cursor-pointer"
                onClick={() => setSelectedYear('2024')}
              >
                2024
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-gray-600 hover:bg-gray-800/50 cursor-not-allowed"
                disabled
              >
                2025
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-700/30 mx-2" />

          {/* View mode toggle */}
          <motion.button
            onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium
              flex items-center
              transition-all duration-300
              ${viewMode === 'table'
                ? 'bg-blue-500/20 text-gray-400 border border-blue-500/30'
                : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <TableIcon className="mr-2 h-4 w-4" />
            {viewMode === 'cards' ? 'Table View' : 'Card View'}
          </motion.button>
        </div>
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
                            rounded-full border-2 md:border-2 cursor-pointer
                            ${shouldHighlight(item.key)
                              ? 'bg-blue-500 border-blue-500 w-8 h-8 md:w-12 md:h-12'
                              : 'bg-gray-800 border-gray-700 w-6 h-6 md:w-8 md:h-8 hover:border-gray-600'
                            }
                          `}
                          animate={{
                            scale: shouldHighlight(item.key) ? 1.2 : 1,
                            rotate: shouldHighlight(item.key) ? 360 : 0,
                            transition: { duration: .75 }
                          }}
                        >
                          <Image
                            src="/icons/filter_basketball.png"
                            alt="Test Basketball"
                            width={48}
                            height={48}
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
                      onClick={() => setShowFilterSection(!showFilterSection)}
                      className="flex items-center gap-2 bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700 px-3 py-2 rounded-lg text-sm"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      Filters
                      {showFilterSection ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Mobile filter content - now directly shown when main filter section is expanded */}
                {showFilterSection && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="md:hidden space-y-3 mb-4 p-3 bg-gray-800/10 rounded-lg border border-gray-800"
                  >
                    {/* Tier Ranking Toggle for Mobile */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      <div className="w-full text-xs text-gray-400 mb-1">Sorting:</div>
                      <motion.button
                        onClick={handleTierRankToggle}
                        className={`
                          px-3 py-1 rounded-lg text-xs font-medium
                          transition-all duration-300
                          ${tierRankActive
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'
                          }
                        `}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {tierRankActive ? (
                          <div className="flex items-center gap-1">
                            <LockIcon className="h-3 w-3" />
                            Tiers
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <UnlockIcon className="h-3 w-3" />
                            Tiers
                          </div>
                        )}
                      </motion.button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <motion.button
                            className={`
                              relative px-3 py-1 rounded-lg text-xs font-medium
                              flex items-center gap-2
                              transition-all duration-300
                              ${selectedTier
                                ? `bg-[${tierColors[selectedTier]}]/20 text-[${tierColors[selectedTier]}] border border-[${tierColors[selectedTier]}]/30`
                                : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'
                              }
                            `}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={selectedTier ? {
                              backgroundColor: `${tierColors[selectedTier]}20`,
                              color: tierColors[selectedTier],
                              borderColor: `${tierColors[selectedTier]}4D`
                            } : {}}
                          >
                            Filter Tiers
                            <ChevronDown className="h-3 w-3" />
                          </motion.button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#19191A] border-gray-700">
                          {tiers.map((tier) => (
                            <DropdownMenuItem
                              key={tier.key}
                              className={`
                                relative text-gray-400 hover:bg-gray-800/50 cursor-pointer rounded-md
                                ${selectedTier === tier.key ? 'bg-blue-500/20 text-blue-400' : ''}
                              `}
                              onClick={() => handleTierClick(tier.key)}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-3 h-3 rounded-sm"
                                  style={{ backgroundColor: tierColors[tier.key] }}
                                ></span>
                                {tier.label}
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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
                  {/* Left section: Reset Button and Search */}
                  <div className="flex items-center space-x-2 flex-grow max-w-md">
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

                  {/* Reset Button */}
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
                    <X className="h-4 w-4" />
                    Reset
                  </motion.button>

                  {/* Divider */}
                  <div className="h-8 w-px bg-gray-700/30 mx-2" />

                  {/* Position Filters */}
                  {positions.map((position) => (
                    <motion.button
                      key={position.key}
                      onClick={() => handlePositionClick(position.key)}
                      className={`
                        px-3 py-2 rounded-lg text-sm font-medium
                        transition-all duration-300 justify-center
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

                  {/* Divider */}
                  <div className="h-8 w-px bg-gray-700/30 mx-2" />

                  {/* Right section: Tier buttons */}
                  <div className="flex items-center space-x-2">
                    {/* Tier Ranked button */}
                    <motion.button
                      onClick={handleTierRankToggle}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium
                        flex items-center gap-2
                        transition-all duration-300
                        ${tierRankActive
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'
                        }
                      `}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Tiers
                      {tierRankActive ? <LockIcon className="h-4 w-4" /> : <UnlockIcon className="h-4 w-4" />}
                    </motion.button>

                    {/* Tier Filters dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <motion.button
                          className={`
                            relative px-4 py-2 rounded-lg text-sm font-medium
                            flex items-center gap-2
                            transition-all duration-300
                            ${selectedTier
                              ? `bg-[${tierColors[selectedTier]}]/20 text-[${tierColors[selectedTier]}] border border-[${tierColors[selectedTier]}]/30`
                              : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'
                            }
                          `}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          style={selectedTier ? {
                            backgroundColor: `${tierColors[selectedTier]}20`,
                            color: tierColors[selectedTier],
                            borderColor: `${tierColors[selectedTier]}4D`
                          } : {}}
                        >
                          Filter Tiers
                          <ChevronDown className="h-4 w-4" />
                        </motion.button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-[#19191A] border-gray-700">
                        {tiers.map((tier) => (
                          <DropdownMenuItem
                            key={tier.key}
                            className={`
                              relative text-gray-400 hover:bg-gray-800/50 cursor-pointer rounded-md
                              ${selectedTier === tier.key ? 'bg-blue-500/20 text-blue-400' : ''}
                            `}
                            onClick={() => handleTierClick(tier.key)}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="w-4 h-4 rounded-sm"
                                style={{ backgroundColor: tierColors[tier.key] }}
                              ></span>
                              {tier.label}
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
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

// const [graphType, setGraphType] = useState('rankings');

const IndividualProspectGraphs: React.FC<EPMModelProps> = ({
  isOpen,
  onClose,
  selectedProspect,
  allProspects,
  graphType = 'rankings',
  setGraphType,
}) => {
  const filteredProspects = useMemo(() => {
    if (!selectedProspect) return [];
    // Filter prospects with the same position as the selected prospect
    return allProspects.filter(p => p.Role === selectedProspect.Role);
  }, [allProspects, selectedProspect]);

  const prepareRankingsChartData = () => {
    const yearData: { year: string | number;[key: string]: string | number }[] = [];

    for (let year = 1; year <= 5; year++) {
      const yearObj: { year: string | number;[key: string]: string | number } = { year };

      filteredProspects.forEach((prospect) => {
        // Get the rank value for the current year
        const rankKey = `Pred. Y${year} Rank` as keyof DraftProspect;
        const rankValue = prospect[rankKey];

        // Convert to number and check if it's valid
        const numValue = Number(rankValue);

        // Only add valid numerical values to the chart data
        if (!isNaN(numValue)) {
          yearObj[prospect.Name] = numValue;
        }
      });

      yearData.push(yearObj);
    }

    return yearData;
  };

  const prepareEpmChartData = () => {
    const yearData: { year: string | number;[key: string]: string | number }[] = [];

    for (let year = 1; year <= 5; year++) {
      const yearObj: { year: string | number;[key: string]: string | number } = { year };

      filteredProspects.forEach((prospect) => {
        // Get the EPM value for the current year
        const epmKey = `Pred. Y${year} EPM` as keyof DraftProspect;
        const epmValue = prospect[epmKey];

        // Convert to number and check if it's valid
        const numValue = Number(epmValue);

        // Only add valid numerical values to the chart data
        if (!isNaN(numValue)) {
          yearObj[prospect.Name] = numValue;
        }
      });

      yearData.push(yearObj);
    }

    return yearData;
  };

  // Calculate chart data
  const rankingsChartData = prepareRankingsChartData();
  const epmChartData = prepareEpmChartData();

  // Use the appropriate data based on the selected graph type
  const chartData = graphType === 'rankings' ? rankingsChartData : epmChartData;

  // Determine Y-axis domain based on data
  const getYAxisDomain = () => {
    if (graphType === 'rankings') {
      // For rankings, lower is better (1 is best)
      return [60, 1]; // Reversed domain for rankings (1 at top, 60 at bottom)
    } else {
      // For EPM, find min and max values with minimal padding
      let min = Infinity;
      let max = -Infinity;

      epmChartData.forEach(yearData => {
        Object.entries(yearData).forEach(([key, value]) => {
          if (key !== 'year' && typeof value === 'number') {
            min = Math.min(min, value);
            max = Math.max(max, value);
          }
        });
      });

      // Add a small padding (5% of the range) to prevent points from touching the edges
      const range = max - min;
      const padding = range * 0.05;
      
      // Round to 1 decimal place for cleaner numbers
      return [
        Math.floor((min - padding) * 10) / 10,
        Math.ceil((max + padding) * 10) / 10
      ];
    }
  };

  const yAxisDomain = getYAxisDomain();

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      // Find which point is actually being hovered by checking the activeDot state 
      // (usually that's the point actively being hovered)
      const activePointIndex = payload.findIndex(entry => entry.payload.activePayload);
      // If we can't determine which one is active, use the last mouse event target
      const activeEntry = activePointIndex >= 0 ? payload[activePointIndex] : payload[payload.length - 1];

      return (
        <div className="bg-gray-800/90 p-4 rounded-lg shadow-lg border border-gray-700">
          <p className="font-bold text-white">{activeEntry.dataKey}</p>
          <p className="text-white">Year {label}</p>
          <p style={{ color: activeEntry.color }} className="text-sm font-bold">
            {graphType === 'rankings' ? 'Rank' : 'EPM'}: {
              typeof activeEntry.value === 'number' ?
                graphType === 'rankings' ? activeEntry.value.toFixed(0) : activeEntry.value.toFixed(2)
                : 'N/A'
            }
          </p>
        </div>
      );
    }
    return null;
  };

  // Check if we have valid data to display
  const hasValidData = chartData.some(yearData => {
    return Object.keys(yearData).some(key => key !== 'year');
  });

  // Sort prospects to ensure selected player is rendered last (appears on top)
  const sortedProspects = useMemo(() => {
    // Create a copy to avoid modifying the original array
    return [...filteredProspects].sort((a, b) => {
      // If a is the selected prospect, it should come last (after b)
      if (a.Name === selectedProspect?.Name) return 1;
      // If b is the selected prospect, it should come last (after a)
      if (b.Name === selectedProspect?.Name) return -1;
      // Otherwise, maintain original order
      return 0;
    });
  }, [filteredProspects, selectedProspect]);

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader className="flex flex-row items-center justify-between">
          <AlertDialogTitle className="text-xl">
            {selectedProspect
              ? `${selectedProspect.Name} ${graphType === 'rankings' ? 'Rankings' : 'EPM'} Comparison ${selectedProspect.Role ? `(${selectedProspect.Role} Comparison)` : ''}`
              : 'Select a Prospect'}
          </AlertDialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </AlertDialogHeader>

        <CardContent className="space-y-6">
          {setGraphType && (
            <div className="flex justify-center space-x-4 mb-4">
              <Button
                variant={graphType === 'rankings' ? "default" : "outline"}
                onClick={() => setGraphType('rankings')}
                className="w-32"
              >
                Rankings
              </Button>
              <Button
                variant={graphType === 'EPM' ? "default" : "outline"}
                onClick={() => setGraphType('EPM')}
                className="w-32"
              >
                Projected EPM
              </Button>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>
                {graphType === 'rankings'
                  ? 'Rankings Progression By Player'
                  : 'EPM Progression By Player'}
              </CardTitle>
              <CardDescription>
                {graphType === 'rankings'
                  ? 'Lower ranking numbers are better (1 = best, displayed at top of chart)'
                  : 'Higher EPM values indicate better performance (displayed higher on chart)'}
              </CardDescription>
            </CardHeader>

            {hasValidData ? (
              <ResponsiveContainer width="100%" height={500}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                  <XAxis
                    dataKey="year"
                    type="number"
                    stroke="#888"
                    domain={[1, 5]}
                    tickCount={5}
                    label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis
                    type="number"
                    stroke="#888"
                    domain={yAxisDomain}
                    tickCount={graphType === 'rankings' ? 6 : 8}
                    tickFormatter={(value) => Math.round(value).toString()}
                    reversed={graphType === 'rankings'} // Set reversed to true for rankings chart
                    label={{
                      value: graphType === 'rankings' ? 'Ranking' : 'EPM Value',
                      angle: -90,
                      position: 'insideLeft'
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
                  <Legend />
                  {sortedProspects.map((prospect) => (
                    <Line
                      key={prospect.Name}
                      type="monotone"
                      dataKey={prospect.Name}
                      stroke={prospect.Name === selectedProspect?.Name ? (prospect['Team Color'] || '#ff0000') : '#cccccc'}
                      strokeWidth={prospect.Name === selectedProspect?.Name ? 3 : 1.5}
                      dot={{ r: 4 }}
                      activeDot={{ r: 8 }}
                      // Ensure selected player has higher z-index
                      z={prospect.Name === selectedProspect?.Name ? 10 : 1}
                      // Only show tooltip for this specific line
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center p-12 text-gray-400">
                <p>No valid data available for this graph type</p>
              </div>
            )}
          </Card>
        </CardContent>
      </AlertDialogContent>
    </AlertDialog>
  );
};

interface ComparisonPlayerData {
  Name: string;
  Tier?: string; // Tier is optional because it might be missing
}

interface ComparisonData {
  name: string;
  similarity: number;
  tier?: string; // Tier is optional
}

interface CustomLabelProps {
  x: number;         // X-coordinate provided by Recharts
  y: number;         // Y-coordinate provided by Recharts
  width: number;     // Width of the bar/area provided by Recharts
  height: number;    // Height of the bar/area provided by Recharts
  value: string;     // The value being displayed (in your case, dataKey="name")
  index: number;     // The index of the data item in the compData array
  // Recharts might pass other properties, but these are the ones you're using.
}

const PlayerComparisonChart: React.FC<{ prospect: DraftProspect }> = ({ prospect }) => {
  const [compData, setCompData] = useState<ComparisonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comparisonPlayerData, setComparisonPlayerData] = useState<ComparisonPlayerData[]>([]);

  const fetchCSVData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('NBA_Draft_EPM - NBA_Draft_Standardized.csv');
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.status}`);
      }
      const text = await response.text();

      const results = Papa.parse<ComparisonPlayerData>(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim()
      });

      if (results.errors.length) {
        throw new Error(`CSV Parse Error: ${results.errors.map(e => e.message).join(', ')}`);
      }

      setComparisonPlayerData(results.data);
      return results.data;
    } catch (err: unknown) { // <-- Changed from 'any' to 'unknown'
      console.error("Error fetching comparison data:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError("An unknown error occurred while fetching data.");
      }
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCSVData();
  }, []);

  useEffect(() => {
    if (comparisonPlayerData.length === 0 || !prospect) return;

    const comps: ComparisonData[] = [];
    for (let i = 1; i <= 5; i++) {
      const compNameKey = `Comp${i}` as keyof DraftProspect;
      const similarityKey = `Similarity${i}` as keyof DraftProspect;

      const compName = prospect[compNameKey] as string | undefined;
      const similarity = prospect[similarityKey] as number | undefined;

      if (compName && similarity !== undefined && compName !== '' && similarity > 0 && compName !== prospect.Name) {
        const comparisonPlayer = comparisonPlayerData.find(player =>
          player.Name && player.Name.trim() === compName.trim());
        const tier = comparisonPlayer?.Tier;

        comps.push({
          name: compName,
          similarity: similarity,
          tier: tier
        });
      }
    }

    const sortedComps = comps
      .sort((a, b) => b.similarity - a.similarity)
      .filter(comp => comp.name !== '');

    setCompData(sortedComps);
  }, [prospect, comparisonPlayerData]);

  // Use the new CustomTooltipProps interface
  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data: ComparisonData = payload[0].payload; // data is now typed as ComparisonData
      return (
        <div className="bg-gray-800/90 p-3 rounded-lg shadow-lg border border-gray-700">
          <p className="text-white font-semibold">{data.name}</p>
          <p className="text-gray-300">Similarity: {data.similarity}%</p>
          {data.tier && <p className="text-gray-300">Tier: {data.tier}</p>}
        </div>
      );
    }
    return null;
  };

  const getColorForTier = (tier?: string): string => {
    if (!tier) return tierColors['Default'] || '#808080'; // Default gray if no tier
    return tierColors[tier] || tierColors['Default'] || '#808080'; // Use the tier color or default
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-400">Loading comparison data...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-400">Error: {error}</div>;
  }

  if (compData.length === 0) {
    return <div className="text-gray-400 text-center py-4">No comparison data available</div>;
  }

  // Use the new CustomLabelProps interface
  const CustomLabel: React.FC<CustomLabelProps> = (props) => {
    const { x, y, height, value, index } = props; // Props are now correctly typed
    const entry = compData[index]; // entry is ComparisonData
    const color = getColorForTier(entry?.tier); // Added optional chaining for safety if entry could be undefined

    // It's good practice to ensure x, y, width, height are defined before using them
    // Recharts should provide them, but defensive checks can be useful.
    // For simplicity here, we assume they are always provided as per the interface.

    return (
      <text
        x={x + 10}
        y={y + height / 2}
        fill={color}
        fontWeight="bold"
        fontSize={12}
        textAnchor="start"
        dominantBaseline="central"
      >
        {value}
      </text>
    );
  };

  return (
    <div className="w-full">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={compData}
            margin={{ top: 5, right: 20, bottom: 5, left: 5 }}
          >
            <XAxis
              type="number"
              domain={[0, 100]}
              hide={true}
            />
            <YAxis
              dataKey="name"
              type="category"
              hide={true}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="similarity"
              radius={[4, 4, 4, 4]}
              strokeWidth={2}
              isAnimationActive={true}
              animationDuration={500}
              animationBegin={0}
              animationEasing="ease-out"
            >
              {compData.map((entry, index) => {
                const color = getColorForTier(entry.tier);
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={color}
                    fillOpacity={0.3}
                    stroke={color}
                  />
                );
              })}
              <LabelList
                dataKey="name"
                content={<CustomLabel x={0} y={0} width={0} height={0} value={''} index={0} />}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Add this new component before the ProspectCard component
const SpiderChart: React.FC<{ prospect: DraftProspect }> = ({ prospect }) => {
  // Debug logging for Athleticism
  console.log('Prospect:', prospect.Name);

  // Add validation and ensure proper number conversion
  const getAttributeValue = (value: string | number | undefined): number => {
    if (value === undefined) return 0;
    // Handle empty strings
    if (value === '') return 0;
    // Handle string numbers with potential whitespace
    if (typeof value === 'string') {
      value = value.trim();
    }
    const numValue = Number(value);
    // Debug logging for conversion
    console.log('Converting value:', value, 'to number:', numValue);
    return !isNaN(numValue) ? numValue : 0;
  };

  const attributes = [
    {
      name: 'Size',
      value: getAttributeValue(prospect.Size)
    },
    {
      name: 'Athleticism',
      value: getAttributeValue(prospect.Athleticism)
    },
    {
      name: 'Defense',
      value: getAttributeValue(prospect.Defense)
    },
    {
      name: 'Rebounding',
      value: getAttributeValue(prospect.Rebounding)
    },
    {
      name: 'Scoring',
      value: getAttributeValue(prospect.Scoring)
    },
    {
      name: 'Passing',
      value: getAttributeValue(prospect.Passing)
    },
    {
      name: 'Shooting',
      value: getAttributeValue(prospect.Shooting)
    },
    {
      name: 'Efficiency',
      value: getAttributeValue(prospect.Efficiency)
    }
  ];

  // Log the final attributes array
  console.log('Final attributes:', attributes);

  return (
    <div className="w-full h-[300px]"> {/* Added fixed height container */}
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart
          data={attributes}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <PolarGrid stroke="#999" />
          <PolarAngleAxis 
            dataKey="name" 
            fontSize={12}
            tick={{ fill: '#fff' }}
          />
          <Radar
            name={prospect.Name}
            dataKey="value"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

const ProspectCard: React.FC<{ prospect: DraftProspect; rank: RankType; filteredProspects: DraftProspect[] }> = ({ prospect, filteredProspects }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [isGraphModelOpen, setIsGraphModelOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [graphType, setGraphType] = useState<'rankings' | 'EPM'>('rankings');
  const [isMobileInfoExpanded, setIsMobileInfoExpanded] = useState(false);
  const [activeChart, setActiveChart] = useState('spider');
  
  // Calculate dynamic rankings based on the current filtered prospects
  const dynamicRankings = useMemo(() => {
    // Create sorted arrays of filtered prospects for 3-year and 5-year averages
    const sortedBy3YAvg = [...filteredProspects].sort(
      (a, b) => Number(b['Avg. EPM Y1-Y3']) - Number(a['Avg. EPM Y1-Y3'])
    );
    
    const sortedBy5YAvg = [...filteredProspects].sort(
      (a, b) => Number(b['Avg. EPM Y1-Y5']) - Number(a['Avg. EPM Y1-Y5'])
    );
    
    // Find the current prospect's position in these sorted arrays
    const rank3Y = sortedBy3YAvg.findIndex(p => p.Name === prospect.Name) + 1;
    const rank5Y = sortedBy5YAvg.findIndex(p => p.Name === prospect.Name) + 1;
    
    // Get position-specific rankings
    const samePositionProspects = filteredProspects.filter(p => p.Role === prospect.Role);
    
    const sortedBy3YAvgPosition = [...samePositionProspects].sort(
      (a, b) => Number(b['Avg. EPM Y1-Y3']) - Number(a['Avg. EPM Y1-Y3'])
    );
    
    const sortedBy5YAvgPosition = [...samePositionProspects].sort(
      (a, b) => Number(b['Avg. EPM Y1-Y5']) - Number(a['Avg. EPM Y1-Y5'])
    );
    
    const positionRank3Y = sortedBy3YAvgPosition.findIndex(p => p.Name === prospect.Name) + 1;
    const positionRank5Y = sortedBy5YAvgPosition.findIndex(p => p.Name === prospect.Name) + 1;
    
    return {
      overall3Y: rank3Y,
      overall5Y: rank5Y,
      position3Y: positionRank3Y,
      position5Y: positionRank5Y
    };
  }, [prospect.Name, filteredProspects, prospect.Role]);

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

  // Update hover state when dropdown is expanded
  useEffect(() => {
    if (isExpanded && !isMobile) {
      setIsHovered(true);
    }
  }, [isExpanded, isMobile]);

  const draftedTeam = teamNames[prospect.NBA] || prospect.NBA;
  const playerImageUrl = `/player_images2024/${prospect.Name} BG Removed.png`;
  const prenbalogoUrl = `/prenba_logos/${prospect['Pre-NBA']}.png`;

  const getPositionRank = (year: string): string => {
    if (!prospect.positionRanks) return 'N/A';
    const yearKey = year as keyof PositionRanks;
    const rank = prospect.positionRanks[yearKey];
    return rank ? rank.toString() : 'N/A';
  };

  // Calculate the current rank based on the filtered and sorted prospects
  const currentRank = useMemo(() => {
    const index = filteredProspects.findIndex(p => p.Name === prospect.Name);
    return index + 1; // Add 1 to make it 1-based indexing
  }, [prospect.Name, filteredProspects]);

  return (
    <div className={`mx-auto px-4 mb-4 ${isMobile ? 'max-w-sm' : 'max-w-5xl'}`}>
      <motion.div layout="position" transition={{ layout: { duration: 0.3, ease: "easeInOut" } }}>
        <div className="relative">
          {/* Main card container - add mouse event handlers here */}
          <div
            className={`
              relative overflow-hidden transition-all duration-300 border rounded-xl border-gray-700/50 shadow-[0_0_15px_rgba(255,255,255,0.07)] 
              ${!isMobile ? 'h-[400px] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:border-gray-600/50 cursor-pointer' : 'h-[100px] cursor-pointer'}
            `}
            style={{ backgroundColor: '#19191A' }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => {
              if (isMobile) {
                if (isMobileInfoExpanded) {
                  setIsMobileInfoExpanded(false);
                } else {
                  setIsExpanded(!isExpanded);
                }
              } else {
                setIsExpanded(!isExpanded);
                if (!isExpanded) {
                  setIsHovered(true);
                }
              }
            }}
          >
            {/* Rank Number - Now using the dynamic currentRank */}
            <motion.div
              layout="position"
              className={`
                ${barlow.className}
                ${isMobile ? 'absolute top-1 right-3 z-20' : 'absolute top-6 right-8 z-20 transition-opacity duration-300'}
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
                {currentRank}
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
            {isMobile ? (isExpanded && (
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
                        {Number(prospect['Actual Pick']) >= 59 ? "UDFA - " : `${prospect['Actual Pick']} - `}{draftedTeam}
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

          {/* Click to View Text - Now properly positioned under the card, desktop only */}
          {!isExpanded && !isMobile && (
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
                      {collegeNames[prospect['Pre-NBA']]
                        ? collegeNames[prospect['Pre-NBA']]
                        : prospect['Pre-NBA']}
                    </div>
                    <div><span className="font-bold text-white">Position </span> {prospect.Role}</div>
                    <div><span className="font-bold text-white">Draft Age </span> {prospect.Age}</div>
                    <div>
                      <span className="font-bold text-white">Draft </span>
                      {Number(prospect['Actual Pick']) >= 59 ? "UDFA - " : `${prospect['Actual Pick']} - `}{prospect.NBA}
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

          {/* Expanded View - Charts and Rankings */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl backdrop-blur-sm p-4 mt-2 border border-gray-700/50 shadow-[0_0_15px_rgba(255,255,255,0.07)]"
              style={{ backgroundColor: '#19191A' }}
            >
              {/* Mobile - Chart Toggle tabs */}
              {isMobile && (
                <div className="mb-4 border-b border-gray-700">
                  <div className="flex space-x-2 mb-2">
                    <button
                      onClick={() => setActiveChart('spider')}
                      className={`py-2 px-3 text-xs font-medium rounded-t-md transition-all duration-200
                      ${activeChart === 'spider'
                          ? 'bg-gray-800 text-white border-b-2 border-blue-500'
                          : 'text-gray-400 hover:text-gray-300'}`}
                    >
                      Skills
                    </button>
                    <button
                      onClick={() => setActiveChart('comparison')}
                      className={`py-2 px-3 text-xs font-medium rounded-t-md transition-all duration-200
                      ${activeChart === 'comparison'
                          ? 'bg-gray-800 text-white border-b-2 border-blue-500'
                          : 'text-gray-400 hover:text-gray-300'}`}
                    >
                      Comps
                    </button>
                  </div>
                </div>
              )}

              {/* Expanded View Content */}
              <div className={`${isMobile ? '' : 'grid grid-cols-2 gap-4'}`}>
                {/* Charts Column - Always show on mobile, above rankings */}
                <div className="text-gray-300 px-2"> {/* Added px-2 for side margins */}
                  {/* Tier display with color border */}
                  <h3 className="font-semibold text-lg mb-3 text-white mt-2">
                    Prospect Tier: <span
                      className="px-2 py-1 rounded text-sm"
                      style={{
                        backgroundColor: `${tierColors[prospect.Tier] ? tierColors[prospect.Tier] + '4D' : 'transparent'}`,
                        color: tierColors[prospect.Tier] || 'inherit',
                        border: `1px solid ${tierColors[prospect.Tier] || 'transparent'}`,
                      }}
                    >
                      {prospect.Tier}
                    </span>
                  </h3>

                  {/* Chart Container */}
                  <div className={`mb-4 ${!isMobile ? 'h-64' : 'h-[300px]'}`}>
                    {activeChart === 'spider' ? (
                      <SpiderChart prospect={prospect} />
                    ) : (
                      <PlayerComparisonChart prospect={prospect} />
                    )}
                  </div>
                </div>

                {/* Rankings Column */}
                <div className="space-y-4 flex flex-col justify-start px-2">
                  <h3 className="font-semibold text-lg mb-3 text-white mt-2">
                    Projected EPM Rankings
                  </h3>
                  {/* Rankings Table */}
                  <div className="w-full">
                    <div className="grid grid-cols-3 gap-4 mb-2 text-sm font-semibold text-gray-400 border-b border-gray-700 pb-2">
                      <div>Year</div>
                      <div className="text-center">Overall</div>
                      <div className="text-center">Position</div>
                    </div>
                    <div className="space-y-3"> {/* Increased space-y from 2 to 3 */}
                      {/* Show individual years */}
                      {['Y1', 'Y2', 'Y3'].map((year) => (
                        <div key={year} className="grid grid-cols-3 gap-4 text-sm text-gray-300">
                          <div>Year {year.slice(1)}</div>
                          <div className="text-center">
                            {(() => {
                              const rankKey = `Pred. ${year} Rank` as keyof DraftProspect;
                              const rankValue = prospect[rankKey];
                              const numValue = Number(rankValue);
                              return !isNaN(numValue) ? numValue : 'N/A';
                            })()}
                          </div>
                          <div className="text-center">{getPositionRank(year)}</div>
                        </div>
                      ))}

                      {/* 3 Year Average */}
                      <div className="grid grid-cols-3 gap-4 text-sm text-blue-400">
                        <div>3 Year Avg</div>
                        <div className="text-center">
                          {dynamicRankings.overall3Y}
                        </div>
                        <div className="text-center">{dynamicRankings.position3Y}</div>
                      </div>

                      {/* Show remaining individual years */}
                      {['Y4', 'Y5'].map((year) => (
                        <div key={year} className="grid grid-cols-3 gap-4 text-sm text-gray-300">
                          <div>Year {year.slice(1)}</div>
                          <div className="text-center">
                            {(() => {
                              const rankKey = `Pred. ${year} Rank` as keyof DraftProspect;
                              const rankValue = prospect[rankKey];
                              const numValue = Number(rankValue);
                              return !isNaN(numValue) ? numValue : 'N/A';
                            })()}
                          </div>
                          <div className="text-center">{getPositionRank(year)}</div>
                        </div>
                      ))}

                      {/* 5 Year Average */}
                      <div className="grid grid-cols-3 gap-4 text-sm text-blue-400">
                        <div>5 Year Avg</div>
                        <div className="text-center">
                          {dynamicRankings.overall5Y}
                        </div>
                        <div className="text-center">{dynamicRankings.position5Y}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop - All buttons row - spans full width below both columns */}
                {!isMobile && (
                  <div className="col-span-2 mt-2">
                    <div className="grid grid-cols-4 gap-2">
                      {/* Chart Toggle Buttons */}
                      <button
                        onClick={() => setActiveChart('spider')}
                        className={`text-sm font-medium py-2 px-4 rounded-md border transition-all duration-200 shadow-sm ${
                          activeChart === 'spider' 
                            ? 'text-blue-400 border-blue-500/30 bg-blue-500/20' 
                            : 'text-gray-400 border-gray-800 hover:border-blue-500/30 bg-gray-800/20 hover:bg-gray-700'
                        }`}
                      >
                        Skills Chart
                      </button>
                      <button
                        onClick={() => setActiveChart('comparison')}
                        className={`text-sm font-medium py-2 px-4 rounded-md border transition-all duration-200 shadow-sm ${
                          activeChart === 'comparison' 
                            ? 'text-blue-400 border-blue-500/30 bg-blue-500/20' 
                            : 'text-gray-400 border-gray-800 hover:border-blue-500/30 bg-gray-800/20 hover:bg-gray-700'
                        }`}
                      >
                        Player Comparisons
                      </button>

                      {/* Graph Buttons */}
                      <motion.button
                        onClick={() => {
                          setGraphType('rankings');
                          setIsGraphModelOpen(true);
                        }}
                        className="bg-gray-800/20 hover:bg-gray-700 text-gray-400 text-sm font-medium py-2 px-4 rounded-md border border-gray-800 hover:border-blue-500/30 transition-all duration-200 shadow-sm"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Rankings Graph
                      </motion.button>
                      <motion.button
                        onClick={() => {
                          setGraphType('EPM');
                          setIsGraphModelOpen(true);
                        }}
                        className="bg-gray-800/20 hover:bg-gray-700 text-gray-400 text-sm font-medium py-2 px-4 rounded-md border border-gray-800 hover:border-blue-500/30 transition-all duration-200 shadow-sm"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        EPM Graph
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>

              {/* Graph Model */}
              {isGraphModelOpen && (
                <IndividualProspectGraphs
                  isOpen={isGraphModelOpen}
                  onClose={() => setIsGraphModelOpen(false)}
                  prospects={filteredProspects}
                  selectedPosition={prospect.Role}
                  selectedProspect={prospect}
                  allProspects={filteredProspects}
                  graphType={graphType}
                  setGraphType={setGraphType}
                />
              )}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Divider */}
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

{/* Player Tables */ }
const ProspectTable = ({ prospects }: { prospects: DraftProspect[], rank: Record<string, RankType> }) => {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof DraftProspect | 'Rank';
    direction: 'ascending' | 'descending';
  } | null>(null);

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
    const sortableProspects = [...prospects];

    if (!sortConfig) {
      return sortableProspects;
    }

    sortableProspects.sort((a, b) => {
      // Handle Rank column specially (use the original index position)
      if (sortConfig.key === 'Rank') {
        const aIndex = prospects.findIndex(p => p.Name === a.Name);
        const bIndex = prospects.findIndex(p => p.Name === b.Name);

        return sortConfig.direction === 'ascending'
          ? aIndex - bIndex  // Sort by original index (ascending)
          : bIndex - aIndex; // Sort by original index (descending)
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

      // Handle Tier sorting
      if (sortConfig.key === 'Tier') {
        const tierRankMap = {
          'All-Time Great': 1,
          'All-NBA Caliber': 2,
          'Fringe All-Star': 3,
          'Quality Starter': 4,
          'Solid Rotation': 5,
          'Bench Reserve': 6,
          'Fringe NBA': 7
        };
        const aRank = tierRankMap[aValue as keyof typeof tierRankMap] || 999;
        const bRank = tierRankMap[bValue as keyof typeof tierRankMap] || 999;
        return sortConfig.direction === 'ascending'
          ? aRank - bRank
          : bRank - aRank;
      }

      // Handle Height (convert to inches)
      if (sortConfig.key === 'Height') {
        const aNum = parseFloat(aValue as string) || 0;
        const bNum = parseFloat(bValue as string) || 0;
        return sortConfig.direction === 'ascending'
          ? aNum - bNum
          : bNum - aNum;
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
  }, [prospects, sortConfig]);

  // Helper function to get the original rank of a prospect
  const getOriginalRank = (prospect: DraftProspect): number => {
    return prospects.findIndex(p => p.Name === prospect.Name) + 1;
  };

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
                onClick={() => handleSort('Tier')}
              >
                Tier
                {sortConfig?.key === 'Tier' && (
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
              <TableHead
                className="text-gray-400 cursor-pointer hover:text-gray-200"
                onClick={() => handleSort('Wing - Height')}
              >
                Wing - Height
                {sortConfig?.key === 'Wing - Height' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                  </span>
                )}
              </TableHead>
              <TableHead
                className="text-gray-400 cursor-pointer hover:text-gray-200"
                onClick={() => handleSort('Age')}
              >
                Age
                {sortConfig?.key === 'Age' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                  </span>
                )}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProspects.map((prospect) => (
              <TableRow
                key={prospect.Name}
                className="hover:bg-gray-800/20"
              >
                <TableCell className="text-gray-300">{getOriginalRank(prospect)}</TableCell>
                <TableCell className="font-medium text-gray-300">{prospect.Name}</TableCell>
                <TableCell className="text-gray-300">{prospect.Role}</TableCell>
                <TableCell className="text-gray-300">{prospect['Pre-NBA']}</TableCell>
                <TableCell className="text-gray-300">
                  {Number(prospect['Actual Pick']) >= 59 ? "Undrafted" : prospect['Actual Pick']}
                </TableCell>
                <TableCell className="text-gray-300">
                  {teamNames[prospect['NBA Team']] || prospect['NBA Team']}
                </TableCell>
                <TableCell className="text-gray-300">{prospect['Tier']}</TableCell>
                <TableCell className="text-gray-300">{prospect.Height}</TableCell>
                <TableCell className="text-gray-300">{prospect['Weight (lbs)']}</TableCell>
                <TableCell className="text-gray-300">{prospect['Wing - Height']}</TableCell>
                <TableCell className="text-gray-300">{prospect.Age}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

type RankType = number | 'N/A';

{/* Filters */ }
function TimelineSlider({ initialProspects }: { initialProspects: DraftProspect[] }) {
  const [selectedSortKey, setSelectedSortKey] = useState<string>('Actual Pick');
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [displayedProspects, setDisplayedProspects] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(false);
  const [, setIsMobile] = useState(false);
  const [tierRankActive, setTierRankActive] = useState(false);


  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle scroll event for infinite loading
  useEffect(() => {
    const handleScroll = () => {
      if (viewMode !== 'cards' || isLoading) return;

      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Load more when user is near bottom (within 100px)
      if (documentHeight - scrollPosition < 100) {
        setIsLoading(true);
        // Simulate loading delay
        setTimeout(() => {
          setDisplayedProspects(prev => prev + 5);
          setIsLoading(false);
        }, 500);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [viewMode, isLoading]);

  // Reset displayed prospects when filters change
  useEffect(() => {
    setDisplayedProspects(5);
  }, [selectedSortKey, selectedPosition, searchQuery, tierRankActive]); // Include tierRankActive

  const filteredProspects = useMemo(() => {
    // Create a map of the initial draft order rank
    const initialRankMap = new Map<string, RankType>(
      initialProspects
        .filter(prospect => prospect['Actual Pick'] && !isNaN(Number(prospect['Actual Pick'])) && Number(prospect['Actual Pick']) <= 58)
        .sort((a, b) => Number(a['Actual Pick']) - Number(b['Actual Pick']))
        .map((prospect, index) => [prospect.Name, index + 1])
    );

    // Add ranks for undrafted players as 'N/A'
    initialProspects.forEach(prospect => {
      if (!initialRankMap.has(prospect.Name)) {
        initialRankMap.set(prospect.Name, 'N/A');
      }
    });

    // Apply filters
    let filtered = [...initialProspects];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(prospect => {
        const fullName = prospect.Name.toLowerCase();
        const nameMatch = fullName.includes(query);
        const preNBAMatch = prospect['Pre-NBA'].toLowerCase().includes(query);
        const teamAbbrevMatch = prospect.NBA.toLowerCase().includes(query);
        const teamFullNameMatch = teamNames[prospect.NBA]?.toLowerCase().includes(query);
        return nameMatch || preNBAMatch || teamAbbrevMatch || teamFullNameMatch;
      });
    }

    // Apply position filter if selected
    if (selectedPosition) {
      filtered = filtered.filter(prospect => prospect.Role === selectedPosition);
    }

    if (selectedTier) {
      filtered = filtered.filter(prospect => prospect.Tier === selectedTier);
    }

    // Define tierRankMap inside useMemo
    const tierRankMap = {
      'All-Time Great': 1,
      'All-NBA Caliber': 2,
      'Fringe All-Star': 3,
      'Quality Starter': 4,
      'Solid Rotation': 5,
      'Bench Reserve': 6,
      'Fringe NBA': 7
    };

    // Sort the filtered prospects
    const sortedFiltered = [...filtered].sort((a, b) => {
      // If tier ranking is active, always sort by tier first
      if (tierRankActive) {
        const aTierRank = tierRankMap[a.Tier as keyof typeof tierRankMap] || 999;
        const bTierRank = tierRankMap[b.Tier as keyof typeof tierRankMap] || 999;
        
        // If tiers are different, sort by tier
        if (aTierRank !== bTierRank) {
          return aTierRank - bTierRank;
        }
        
        // If tiers are the same, sort by the selected metric
        if (selectedSortKey === 'Avg. Rank Y1-Y3' || selectedSortKey === 'Avg. EPM Y1-Y3') {
          const aValue = Number(a['Avg. EPM Y1-Y3']) || 0;
          const bValue = Number(b['Avg. EPM Y1-Y3']) || 0;
          return bValue - aValue; // Higher EPM is better
        } else if (selectedSortKey === 'Avg. Rank Y1-Y5' || selectedSortKey === 'Avg. EPM Y1-Y5') {
          const aValue = Number(a['Avg. EPM Y1-Y5']) || 0;
          const bValue = Number(b['Avg. EPM Y1-Y5']) || 0;
          return bValue - aValue; // Higher EPM is better
        } else {
          // For other metrics, maintain original order within tier
          const aPick = a['Actual Pick'];
          const bPick = b['Actual Pick'];
          if (aPick === 'N/A' || aPick === '' || aPick === null || aPick === undefined) return 1;
          if (bPick === 'N/A' || bPick === '' || bPick === null || bPick === undefined) return -1;
          const aNum = Number(aPick);
          const bNum = Number(bPick);
          if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
          return 0;
        }
      } else {
        // If tier ranking is not active, use normal sorting
        if (selectedSortKey === 'Avg. Rank Y1-Y3' || selectedSortKey === 'Avg. EPM Y1-Y3') {
          const aValue = Number(a['Avg. EPM Y1-Y3']) || 0;
          const bValue = Number(b['Avg. EPM Y1-Y3']) || 0;
          return bValue - aValue; // Higher EPM is better
        } else if (selectedSortKey === 'Avg. Rank Y1-Y5' || selectedSortKey === 'Avg. EPM Y1-Y5') {
          const aValue = Number(a['Avg. EPM Y1-Y5']) || 0;
          const bValue = Number(b['Avg. EPM Y1-Y5']) || 0;
          return bValue - aValue; // Higher EPM is better
        } else {
          const aValue = a[selectedSortKey as keyof DraftProspect];
          const bValue = b[selectedSortKey as keyof DraftProspect];
          if (aValue === 'N/A' || aValue === '' || aValue === null || aValue === undefined) return 1;
          if (bValue === 'N/A' || bValue === '' || bValue === null || bValue === undefined) return -1;
          return Number(aValue) - Number(bValue);
        }
      }
    });

    // Map the sorted and filtered prospects to include their original draft rank
    return sortedFiltered.map(prospect => ({
      prospect,
      originalRank: initialRankMap.get(prospect.Name)
    }));

  }, [initialProspects, selectedSortKey, selectedPosition, searchQuery, selectedTier, tierRankActive]); // Remove tierRankMap from dependencies

  // const handleTierRankClick = () => {
  //   setTierRankActive(prev => !prev); // Toggle Tier Ranked state
  //   setSelectedSortKey('Actual Pick'); // Keep sort key as Actual Pick.
  // };

  return (
    <div className="bg-[#19191A] min-h-screen">
      <TimelineFilter
        selectedSortKey={selectedSortKey}
        setSelectedSortKey={setSelectedSortKey}
        selectedPosition={selectedPosition}
        setSelectedPosition={setSelectedPosition}
        selectedTier={selectedTier}
        setSelectedTier={setSelectedTier}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
        setViewMode={setViewMode}
        tierRankActive={tierRankActive}
        setTierRankActive={setTierRankActive} 
        filteredProspects={[]} 
      />

      <div className="max-w-6xl mx-auto px-4 pt-8">
        {filteredProspects.length > 0 ? (
          viewMode === 'cards' ? (
            <div className="space-y-4">
              {filteredProspects.slice(0, displayedProspects).map(({ prospect, originalRank }) => (
                <ProspectCard
                  key={prospect.Name}
                  prospect={prospect}
                  rank={originalRank ?? 0}
                  filteredProspects={filteredProspects.map(p => p.prospect)}
                />
              ))}
              {isLoading && (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
                </div>
              )}
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
            const prospectData = results.data as DraftProspect[];

            // Calculate position rankings for all prospects
            const prospectsWithRanks = prospectData.map(prospect => {
              // Get all prospects with the same role
              const samePositionProspects = prospectData.filter(p => p.Role === prospect.Role);

              // Calculate position ranks for each year
              const positionRanks = {
                Y1: 0,
                Y2: 0,
                Y3: 0,
                Y4: 0,
                Y5: 0,
                Y1Y3: 0,
                Y1Y5: 0
              };

              // Calculate position ranks for each year
              ['Y1', 'Y2', 'Y3', 'Y4', 'Y5'].forEach(year => {
                const yearKey = `Pred. ${year} EPM` as keyof DraftProspect; // Change to EPM
                const sortedByYear = [...samePositionProspects].sort((a, b) => {
                  const aEPM = Number(a[yearKey]);
                  const bEPM = Number(b[yearKey]);
                  // Sort in descending order for EPM (higher is better)
                  return bEPM - aEPM;
                });
                positionRanks[year as keyof typeof positionRanks] =
                  sortedByYear.findIndex(p => p.Name === prospect.Name) + 1;
              });

              // Calculate 3-year average EPM
              const avg3YEPM = (
                Number(prospect['Pred. Y1 EPM'] || 0) +
                Number(prospect['Pred. Y2 EPM'] || 0) +
                Number(prospect['Pred. Y3 EPM'] || 0)
              ) / 3;
              
              // Calculate 5-year average EPM
              const avg5YEPM = (
                Number(prospect['Pred. Y1 EPM'] || 0) +
                Number(prospect['Pred. Y2 EPM'] || 0) +
                Number(prospect['Pred. Y3 EPM'] || 0) +
                Number(prospect['Pred. Y4 EPM'] || 0) +
                Number(prospect['Pred. Y5 EPM'] || 0)
              ) / 5;

              // Calculate 3-year average rankings
              const allProspectsWith3YAvg = [...prospectData].map(p => {
                const p3YAvg = (
                  Number(p['Pred. Y1 EPM'] || 0) +
                  Number(p['Pred. Y2 EPM'] || 0) +
                  Number(p['Pred. Y3 EPM'] || 0)
                ) / 3;
                return { ...p, avg3YEPM: p3YAvg };
              });

              // Calculate 5-year average rankings
              const allProspectsWith5YAvg = [...prospectData].map(p => {
                const p5YAvg = (
                  Number(p['Pred. Y1 EPM'] || 0) +
                  Number(p['Pred. Y2 EPM'] || 0) +
                  Number(p['Pred. Y3 EPM'] || 0) +
                  Number(p['Pred. Y4 EPM'] || 0) +
                  Number(p['Pred. Y5 EPM'] || 0)
                ) / 5;
                return { ...p, avg5YEPM: p5YAvg };
              });

              // Get global rankings (all positions)
              const sortedBy3YAvgAll = [...allProspectsWith3YAvg].sort((a, b) => b.avg3YEPM - a.avg3YEPM);
              const globalRank3Y = sortedBy3YAvgAll.findIndex(p => p.Name === prospect.Name) + 1;

              const sortedBy5YAvgAll = [...allProspectsWith5YAvg].sort((a, b) => b.avg5YEPM - a.avg5YEPM);
              const globalRank5Y = sortedBy5YAvgAll.findIndex(p => p.Name === prospect.Name) + 1;

              // Get position-specific rankings
              const samePositionProspectsWith3YAvg = allProspectsWith3YAvg.filter(p => p.Role === prospect.Role);
              const sortedBy3YAvgPosition = [...samePositionProspectsWith3YAvg].sort((a, b) => b.avg3YEPM - a.avg3YEPM);
              positionRanks.Y1Y3 = sortedBy3YAvgPosition.findIndex(p => p.Name === prospect.Name) + 1;

              const samePositionProspectsWith5YAvg = allProspectsWith5YAvg.filter(p => p.Role === prospect.Role);
              const sortedBy5YAvgPosition = [...samePositionProspectsWith5YAvg].sort((a, b) => b.avg5YEPM - a.avg5YEPM);
              positionRanks.Y1Y5 = sortedBy5YAvgPosition.findIndex(p => p.Name === prospect.Name) + 1;

              return {
                ...prospect,
                positionRanks,
                avg3YEPM,
                avg5YEPM,
                globalRank3Y,
                globalRank5Y,
                // Add these to be accessible for sorting
                'Avg. EPM Y1-Y3': avg3YEPM,
                'Avg. EPM Y1-Y5': avg5YEPM,
                'Rank Y1-Y3': globalRank3Y,
                'Rank Y1-Y5': globalRank5Y
              };
            });

            setProspects(prospectsWithRanks);
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