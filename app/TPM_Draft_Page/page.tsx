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
import { LucideUser, ChevronDown, ChevronUp, X, SlidersHorizontal, } from 'lucide-react';
import Papa from 'papaparse';
import { Barlow } from 'next/font/google';
import { AnimatePresence, motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import Link from 'next/link';
import { Search, Table as TableIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { TooltipProps } from 'recharts';
// import ComingSoon from '@/components/ui/ComingSoon'; // Import the ComingSoon component
import NavigationHeader from '@/components/NavigationHeader';


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
  NYK: "New York Knicks",
  BKN: "Brooklyn Nets",
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
//         yearObj[prospect.Name] = prospect[rankKey] ?? 0;
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
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
}: TimelineFilterProps) => {
  const [showFilterSection, setShowFilterSection] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedYear, setSelectedYear] = useState('2024');

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
                className="text-gray-300 hover:bg-gray-800/50 cursor-pointer"
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
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
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
                <div className="hidden md:flex justify-between items-center space-x-3 mt-4">
                  {/* Reset Button and Search Section */}
                  <div className="relative flex items-center space-x-2 flex-grow max-w-2xl">
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
                      <X className="h-4 w-4" />
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
                  <div className="h-8 w-px bg-gray-700/30" />

                  {/* Position Filters */}
                  <div className="flex items-center space-x-2">
                    {positions.map((position) => (
                      <motion.button
                        key={position.key}
                        onClick={() => handlePositionClick(position.key)}
                        className={`
                          px-3 py-2 rounded-lg text-sm font-medium
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

                  {/* Divider */}
                  <div className="h-8 w-px bg-gray-700/30" />

                  {/* Average Filters */}
                  <div className="flex items-center space-x-2">
                    {averageKeys.map((item) => (
                      <motion.button
                        key={item.key}
                        onClick={() => setSelectedSortKey(item.key)}
                        className={`
                          px-3 py-2 rounded-lg text-sm font-medium
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
    return allProspects.filter(p => p.Position === selectedProspect.Position);
  }, [allProspects, selectedProspect]);

  const prepareRankingsChartData = () => {
    const yearData: { year: string | number;[key: string]: string | number }[] = [];

    for (let year = 1; year <= 5; year++) {
      const yearObj: { year: string | number;[key: string]: string | number } = { year };

      filteredProspects.forEach((prospect) => {
        const rankKey = `Pred. Y${year} Rank` as keyof DraftProspect;
        yearObj[prospect.Name] = prospect[rankKey] ?? 0;
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
        const epmKey = `Pred. Y${year} EPM` as keyof DraftProspect;
        yearObj[prospect.Name] = prospect[epmKey] ?? 0;
      });

      yearData.push(yearObj);
    }

    return yearData;
  };

  const rankingsChartData = prepareRankingsChartData();
  const epmChartData = prepareEpmChartData();

  // Use the appropriate data based on the selected graph type
  const chartData = graphType === 'rankings' ? rankingsChartData : epmChartData;

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800/90 p-4 rounded-lg shadow-lg border border-gray-700">
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
              ? `${selectedProspect.Name} ${graphType === 'rankings' ? 'Rankings' : 'EPM'} Comparison ${selectedProspect.Position === 'Wing' ? '(Wing Comparison)' : ''}`
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
                Years on X-axis, {graphType === 'rankings' ? 'Ranking values' : 'EPM values'} on Y-axis
              </CardDescription>
            </CardHeader>
            <ResponsiveContainer width="100%" height={500}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="year" type="number" stroke="#888" domain={[1, 5]} />
                <YAxis
                  type="number"
                  stroke="#888"
                  domain={graphType === 'rankings' ? [-5, 5] : [-5, 5]}
                  reversed={graphType === 'rankings'}
                />
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

interface ProspectCardProps {
  prospect: DraftProspect;
  isMobile: boolean;
  initialProspects: DraftProspect[];
  rank: RankType;
}

const ProspectCard: React.FC<ProspectCardProps> = ({ prospect, isMobile, initialProspects, rank }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [isGraphModelOpen, setIsGraphModelOpen] = useState(false);
  const [isMobileInfoExpanded, setIsMobileInfoExpanded] = useState(false);
  const [graphType, setGraphType] = useState<'rankings' | 'EPM'>('rankings');

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

  const draftedTeam = teamNames[prospect.NBA] || prospect.NBA;
  const playerSummary = prospect.Summary || "A detailed scouting report would go here, describing the player's strengths, weaknesses, and projected role in the NBA.";
  const playerImageUrl = `/player_images2024/${prospect.Name} BG Removed.png`;
  const prenbalogoUrl = `/prenba_logos/${prospect['Pre-NBA']}.png`;

  // Update the position ranking calculations
  // const calculatePositionRank = (year: string, prospect: DraftProspect): number => {
  //   const samePositionProspects = initialProspects.filter((p: DraftProspect) => p.Role === prospect.Role);
  //   const sortedByYear = samePositionProspects.sort((a: DraftProspect, b: DraftProspect) => {
  //     const aRank = Number(a[`Pred. ${year} Rank` as keyof DraftProspect]);
  //     const bRank = Number(b[`Pred. ${year} Rank` as keyof DraftProspect]);
  //     return aRank - bRank;
  //   });
  //   return sortedByYear.findIndex((p: DraftProspect) => p.Name === prospect.Name) + 1;
  // };

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
              <div className={`
                ${barlow.className} 
                ${isMobile ? 'text-1xl' : 'text-6xl'} 
                font-bold
                text-white
                select-none
                ${((isHovered && !isMobile) || isExpanded) ? (!isMobile ? 'mr-[300px]' : '') : ''} 
              `}>
                {rank}
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

          {/* Expand/collapse button - only show for desktop */}
          {!isMobile && (
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
          )}

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
                    <div><span className="font-bold text-white">Draft Age </span> {prospect.Age}</div>
                    <div>
                      <span className="font-bold text-white">Draft </span>
                      {Number(prospect['Actual Pick']) >= 59 ? "Undrafted - " : `${prospect['Actual Pick']} - ${prospect.NBA}`}
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
                <NBATeamLogo NBA={prospect['NBA Team']} /> {/* Adjust size as needed */}
              </div>
            </motion.div>
          )}

          {/* Expanded content */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`
                grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} 
                gap-4 rounded-xl backdrop-blur-sm p-6 mt-2 border border-gray-700/50 shadow-[0_0_15px_rgba(255,255,255,0.07)]
              `}
              style={{ backgroundColor: '#19191A' }}
            >
              {/* Scouting Report Column */}
              <div className="text-gray-300">
                <h3 className="font-semibold text-lg mb-3 text-white">Scouting Report</h3>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} leading-relaxed`}>{playerSummary}</p>
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
                        const samePositionProspects = initialProspects.filter((p: DraftProspect) => p.Role === prospect.Role);
                        const sortedByYear = samePositionProspects.sort((a: DraftProspect, b: DraftProspect) => {
                          const aRank = Number(a[`Pred. ${year} Rank` as keyof DraftProspect]);
                          const bRank = Number(b[`Pred. ${year} Rank` as keyof DraftProspect]);
                          return aRank - bRank;
                        });
                        const positionRank = sortedByYear.findIndex((p: DraftProspect) => p.Name === prospect.Name) + 1;

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
                        <div>{isMobile ? "3 Year Avg" : "3 Year Average"}</div>
                        <div className="text-center">{prospect['Avg. Rank Y1-Y3']}</div>
                        <div className="text-center">
                          {(() => {
                            const samePositionProspects = initialProspects.filter((p: DraftProspect) => p.Role === prospect.Role);
                            const sortedBy3YAvg = samePositionProspects.sort((a: DraftProspect, b: DraftProspect) => {
                              const aRank = Number(a['Avg. Rank Y1-Y3']);
                              const bRank = Number(b['Avg. Rank Y1-Y3']);
                              return aRank - bRank;
                            });
                            const positionRank = sortedBy3YAvg.findIndex((p: DraftProspect) => p.Name === prospect.Name) + 1;
                            return positionRank === 0 ? 'N/A' : positionRank;
                          })()}
                        </div>
                      </div>

                      {['Y4', 'Y5'].map((year) => {
                        const samePositionProspects = initialProspects.filter((p: DraftProspect) => p.Role === prospect.Role);
                        const sortedByYear = samePositionProspects.sort((a: DraftProspect, b: DraftProspect) => {
                          const aRank = Number(a[`Pred. ${year} Rank` as keyof DraftProspect]);
                          const bRank = Number(b[`Pred. ${year} Rank` as keyof DraftProspect]);
                          return aRank - bRank;
                        });
                        const positionRank = sortedByYear.findIndex((p: DraftProspect) => p.Name === prospect.Name) + 1;

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
                        <div>{isMobile ? "5 Year Avg" : "5 Year Average"}</div>
                        <div className="text-center">{prospect['Avg. Rank Y1-Y5']}</div>
                        <div className="text-center">
                          {(() => {
                            const samePositionProspects = initialProspects.filter((p: DraftProspect) => p.Role === prospect.Role);
                            const sortedBy5YAvg = samePositionProspects.sort((a: DraftProspect, b: DraftProspect) => {
                              const aRank = Number(a['Avg. Rank Y1-Y5']);
                              const bRank = Number(b['Avg. Rank Y1-Y5']);
                              return aRank - bRank;
                            });
                            const positionRank = sortedBy5YAvg.findIndex((p: DraftProspect) => p.Name === prospect.Name) + 1;
                            return positionRank === 0 ? 'N/A' : positionRank;
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Graph buttons */}
                <div className="flex space-x-2 mt-4">
                  <motion.button
                    onClick={() => {
                      setGraphType('rankings');
                      setIsGraphModelOpen(true);
                    }}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 px-3 rounded text-sm flex items-center justify-center transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Rankings Graph
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setGraphType('EPM');
                      setIsGraphModelOpen(true);
                    }}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 px-3 rounded text-sm flex items-center justify-center transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    EPM Graph
                  </motion.button>
                </div>

                {/* Graph Modal */}
                {isGraphModelOpen && (
                  <IndividualProspectGraphs
                    isOpen={isGraphModelOpen}
                    onClose={() => setIsGraphModelOpen(false)}
                    prospects={initialProspects}
                    selectedPosition={prospect.Role}
                    selectedProspect={prospect}
                    allProspects={initialProspects}
                    graphType={graphType}
                    setGraphType={setGraphType}
                  />
                )}
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

  // Helper function to convert height to inches
  // const heightToInches = (height: string): number => {
  //   if (!height) return 0;
    
  //   // Handle format like "6'8"
  //   const parts = height.split("'");
  //   if (parts.length === 2) {
  //     const feet = parseInt(parts[0]) || 0;
  //     const inches = parseInt(parts[1]) || 0;
  //     return (feet * 12) + inches;
  //   }
    
  //   return 0;
  // };

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
            {sortedProspects.map((prospect, index) => (
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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [loadedProspects, setLoadedProspects] = useState<number>(5); // Start with 5 prospects
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

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

  // Handle scroll event
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100 &&
        !isLoading &&
        hasMore &&
        viewMode === 'cards'
      ) {
        setIsLoading(true);
        // Simulate loading delay
        setTimeout(() => {
          setLoadedProspects(prev => {
            const newCount = prev + 5;
            setHasMore(newCount < filteredProspects.length);
            return newCount;
          });
          setIsLoading(false);
        }, 500);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading, hasMore, filteredProspects.length, viewMode]);

  // Reset loaded prospects when filters change
  useEffect(() => {
    setLoadedProspects(5);
    setHasMore(filteredProspects.length > 5);
  }, [filteredProspects.length, selectedSortKey, selectedPosition, searchQuery]);

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
              {filteredProspects.slice(0, loadedProspects).map(({ prospect, originalRank }) => (
                <ProspectCard
                  key={prospect.Name}
                  prospect={prospect}
                  rank={originalRank ?? 0}
                  isMobile={false}
                  initialProspects={initialProspects}
                />
              ))}
              {isLoading && (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
                </div>
              )}
              {!hasMore && loadedProspects > 5 && (
                <div className="text-center py-4 text-gray-400">
                  No more prospects to load
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