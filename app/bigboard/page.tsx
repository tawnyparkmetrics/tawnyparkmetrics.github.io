"use client";
import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { LucideUser, ChevronDown, ChevronUp, X } from 'lucide-react';
import Papa from 'papaparse';
import { Barlow } from 'next/font/google';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';


export interface DraftProspect {
  Name: string;
  'Actual Pick': string;
  NBA: string;
  'Pre-NBA': string;
  Position: string;
  Age: string;
  'Team Color': string;
  'Pred. Y1 Rank': string;
  'Pred. Y2 Rank': string;
  'Pred. Y3 Rank': string;
  'Avg. Rank Y1-Y3': string;
  'Pred. Y4 Rank': string;
  'Pred. Y5 Rank': string;
  'Avg. Rank Y1-Y5': string;

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
  TOR: "Toronot Raptors",
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

interface EPMModelProps {
  isOpen: boolean;
  onClose: () => void;
  prospects: DraftProspect[];
  selectedPosition: string | null;
  allProspects: DraftProspect[]; // Add this prop for comparison
  focusedProspect?: DraftProspect; // Add this prop to identify the selected player
}

const EPMModel = (props: EPMModelProps) => {
  const { isOpen, onClose, selectedPosition, allProspects, focusedProspect } = props;

  const graphData = React.useMemo(() => {
    // Create data points for years 1-5
    return [1, 2, 3, 4, 5].map(year => {
      const dataPoint: Record<string, number | string> = { name: `Year ${year}` };

      // Add background comparison lines data
      allProspects.forEach(prospect => {
        const rankValue = prospect[`Pred. Y${year} Rank` as keyof DraftProspect];
        if (rankValue && !isNaN(parseFloat(rankValue as string))) {
          dataPoint[prospect.Name] = parseFloat(rankValue as string);
        }
      });

      return dataPoint;
    });
  }, [allProspects]);

  interface TooltipPayload {
    dataKey: string;
    value: number;
    stroke: string;
  }

  // Custom tooltip component
  const CustomTooltip: React.FC<{ active?: boolean; payload?: TooltipPayload[]; label?: string }> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#19191A] border border-gray-700 p-3 rounded-lg">
          <p className="text-gray-400 mb-2">{label}</p>
          {payload.map((entry) => (
            entry.value && (
              <div
                key={entry.dataKey}
                className="flex items-center gap-2"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: entry.stroke,
                    opacity: entry.dataKey === focusedProspect?.Name ? 1 : 0.4
                  }}
                />
                <span className="text-white">{entry.dataKey}</span>
                <span className="text-gray-400">Rank {entry.value}</span>
              </div>
            )
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#19191A] text-white max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {focusedProspect
              ? `${focusedProspect.Name} - Projected Rankings`
              : 'Projected Rankings Comparison'}
            {selectedPosition && ` - ${selectedPosition}s`}
          </DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </DialogHeader>

        <div className="mt-4 p-4 bg-gray-800/20 rounded-lg">
          <LineChart
            width={800}
            height={400}
            data={graphData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="name"
              stroke="#666"
            />
            <YAxis
              stroke="#666"
              domain={[0, 'dataMax']}
              reversed={true}
              label={{
                value: 'Rank',
                angle: -90,
                position: 'insideLeft',
                style: { fill: '#666' }
              }}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Background comparison lines */}
            {allProspects.map((prospect) => {
              if (focusedProspect && prospect.Name === focusedProspect.Name) return null;
              return (
                <Line
                  key={prospect.Name}
                  type="monotone"
                  dataKey={prospect.Name}
                  stroke={`#444444`}
                  strokeWidth={1}
                  dot={false}
                  opacity={0.2}
                  activeDot={false}
                />
              );
            })}

            {/* Focused player line */}
            {focusedProspect && (
              <Line
                key={focusedProspect.Name}
                type="monotone"
                dataKey={focusedProspect.Name}
                stroke={`#${focusedProspect['Team Color']}`} // Make sure this matches your CSV column name exactly
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: `#${focusedProspect['Team Color']}`,
                  strokeWidth: 0
                }}
              />
            )}
          </LineChart>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface NavigationHeaderProps {
  activeTab?: string;
}

const NavigationHeader: React.FC<NavigationHeaderProps> = ({ activeTab }) => {
  const tabs = [
    { name: 'Home', href: '/' },
    { name: 'Draft Board', href: '/bigboard' },
  ];

  return (
    <>
      {/* Fixed header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#19191A] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Navigation Tabs */}
            <div className="flex space-x-4">
              {tabs.map((tab) => (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`
                    px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                    ${activeTab === tab.name
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'
                    }
                  `}
                >
                  {tab.name}
                </Link>
              ))}
            </div>

            {/* TPM Logo */}
            <div className={`${barlow.className} text-4xl font-bold text-white italic`}>
              TPM
            </div>
          </div>
        </div>
      </div>

      {/* Spacer div to prevent content from hiding behind fixed header */}
      <div className="h-16"></div>
    </>
  );
};

interface TimelineFilterProps {
  selectedSortKey: string;
  setSelectedSortKey: (key: string) => void;
  selectedPosition: string | null;
  setSelectedPosition: (position: string | null) => void;
  filteredProspects: DraftProspect[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const TimelineFilter = ({
  selectedSortKey,
  setSelectedSortKey,
  selectedPosition,
  setSelectedPosition,
  filteredProspects,
  searchQuery,
  setSearchQuery
}: TimelineFilterProps) => {
  const [isGraphModelOpen, setIsGraphModelOpen] = useState(false);

  const yearSortKeys = [
    { key: 'Actual Pick', label: 'Draft' },
    { key: 'Pred. Y1 Rank', label: 'Y1' },
    { key: 'Pred. Y2 Rank', label: 'Y2' },
    { key: 'Pred. Y3 Rank', label: 'Y3' },
    { key: 'Pred. Y4 Rank', label: 'Y4' },
    { key: 'Pred. Y5 Rank', label: 'Y5' }
  ];

  const averageKeys = [
    { key: 'Avg. Rank Y1-Y3', label: '3Y Avg' },
    { key: 'Avg. Rank Y1-Y5', label: '5Y Avg' }
  ];

  const positions = [
    { key: 'Guard', label: 'Guards' },
    { key: 'Wing', label: 'Wings' },
    { key: 'Big', label: 'Bigs' }
  ];

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

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="relative mt-12">
        {/* Timeline Track */}
        <div className="relative h-24 flex items-center justify-center mb-8">
          <div className="absolute w-full h-1 bg-gray-700/30" />

          {selectedSortKey && (
            <motion.div
              className="absolute h-1 bg-white-500/4"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.5 }}
            />
          )}

          <div className="relative w-full flex justify-between items-center px-12">
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
                    rounded-full border-4 cursor-pointer
                    ${shouldHighlight(item.key)
                      ? 'bg-blue-500 border-blue-300 w-12 h-12'
                      : 'bg-gray-800 border-gray-700 w-8 h-8 hover:border-gray-600'
                    }
                  `}
                  animate={{
                    scale: shouldHighlight(item.key) ? 1.2 : 1,
                    transition: { duration: 0.3 }
                  }}
                />

                <motion.span
                  className={`
                    absolute -bottom-8 whitespace-nowrap text-sm font-medium
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

        {/* Combined Average and Position Filters */}
        <div className="flex justify-end items-center space-x-4 mt-8">

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 bg-gray-800/20 border-gray-800 text-gray-300 placeholder-gray-500 rounded-lg focus:border-blue-500/30 focus:ring-1 focus:ring-blue-500/30"
            />
          </div>

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

          {/* Add EPM Model */}
          <EPMModel
            isOpen={isGraphModelOpen}
            onClose={() => setIsGraphModelOpen(false)}
            prospects={filteredProspects}
            selectedPosition={selectedPosition}
            allProspects={filteredProspects}
          />
        </div>
      </div>
    </div>
  );
};

// interface ProspectCardProps {
//   prospect: DraftProspect;
//   rank: RankType;
//   filteredProspects: DraftProspect[];
// }

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

  // // Helper function for ordinal suffixes
  // const getOrdinalSuffix = (num: number): string => {
  //   const suffixes = ['th', 'st', 'nd', 'rd'];
  //   const v = num % 100;
  //   return suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
  // };

  // Update hover state when dropdown is expanded
  useEffect(() => {
    if (isExpanded) {
      setIsHovered(true);
    }
  }, [isExpanded]);

  const draftedTeam = teamNames[prospect.NBA] || prospect.NBA;
  const playerSummary = prospect.Summary || "A detailed scouting report would go here, describing the player's strengths, weaknesses, and projected role in the NBA.";
  const playerImageUrl = `/player_images2024/${prospect.Name} BG Removed.png`;
  const prenbalogoUrl = `/prenba_logos/${prospect['Pre-NBA']}.png`;

  return (
    <div className="max-w-5xl mx-auto px-4 mb-4">
      <motion.div layout="position" transition={{ layout: { duration: 0.3, ease: "easeInOut" } }}>
        <div className="relative">
          {/* Main card container - add mouse event handlers here */}
            <div 
            className="relative h-[400px] bg-gray-800/20 rounded-xs" 
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
            <div className="absolute inset-0 flex items-center justify-start pl-12 opacity-20">
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
            <div className="absolute inset-0 flex justify-center overflow-hidden">
              <div className="relative w-[90%] h-[90%] mt-8">
                {!imageError ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={playerImageUrl}
                      alt={prospect.Name}
                      fill
                      className={`
                        object-contain 
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
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white">{prospect.Name}</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <div><span className="font-bold text-white">Height  </span> {prospect.Height}</div>
                  <div><span className="font-bold text-white">Wingspan  </span> {prospect.Wingspan}</div>
                  <div><span className="font-bold text-white">Wing - Height  </span> {prospect['Wing - Height']}</div>
                  <div><span className="font-bold text-white">Weight </span> {prospect['Weight (lbs)']}</div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <div className="space-y-2 text-sm text-gray-300">
                    <div>
                      <span className="font-bold text-white">Draft  </span>
                      {Number(prospect['Actual Pick']) >= 59 ? "Undrafted - " : `${prospect['Actual Pick']} - `}{draftedTeam}
                    </div>
                    <div><span className="font-bold text-white">Position  </span> {prospect.Role}</div>
                    <div><span className="font-bold text-white">Draft Age  </span> {prospect.Age}</div>
                    <div><span className="font-bold text-white">Pre-NBA  </span> {prospect['Pre-NBA']}</div>
                  </div>
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
                <ChevronDown className="text-white h-5 w-5 transition-all duration-300 group-hover:animate-bounce hover:animate-bounce" />
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
              className="grid grid-cols-2 gap-4 rounded-xs backdrop-blur-sm p-6"
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
                      <div>Overall</div>
                      <div>Position</div>
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
                            <div>{prospect[`Pred. ${year} Rank` as keyof DraftProspect]}</div>
                            <div>{positionRank === 0 ? 'N/A' : positionRank}</div>
                          </div>
                        );
                      })}

                      {/* 3 Year Average after Year 3 */}
                      <div className="grid grid-cols-3 gap-4 text-sm text-blue-400">
                        <div>3 Year Average</div>
                        <div>{prospect['Avg. Rank Y1-Y3']}</div>
                        <div>
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
                            <div>{prospect[`Pred. ${year} Rank` as keyof DraftProspect]}</div>
                            <div>{positionRank === 0 ? 'N/A' : positionRank}</div>
                          </div>
                        );
                      })}

                      {/* 5 Year Average after Year 5 */}
                      <div className="grid grid-cols-3 gap-4 text-sm text-blue-400">
                        <div>5 Year Average</div>
                        <div>{prospect['Avg. Rank Y1-Y5']}</div>
                        <div>
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

                  <Button
                    onClick={() => setIsGraphModelOpen(true)}
                    className="mt-4 bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 px-4 py-2 rounded-xs text-sm w-full"
                  >
                    View Graph
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          <EPMModel
            isOpen={isGraphModelOpen}
            onClose={() => setIsGraphModelOpen(false)}
            prospects={[prospect]}
            selectedPosition={null}
            allProspects={filteredProspects}
            focusedProspect={prospect}
          />
        </div>
      </motion.div>
    </div>
  );
};

type RankType = number | 'N/A';

interface ProspectWithRank {
  prospect: DraftProspect;
  originalRank?: RankType;
}

function TimelineSlider({ initialProspects }: { initialProspects: DraftProspect[] }) {
  const [selectedSortKey, setSelectedSortKey] = useState<string>('Actual Pick');
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

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
        const nameParts = prospect.Name.toLowerCase().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts[nameParts.length - 1];
        const nameMatch = firstName.startsWith(query) || lastName.startsWith(query);
        const preNBAMatch = prospect['Pre-NBA'].toLowerCase().includes(query);
        const teamAbbrevMatch = prospect.NBA.toLowerCase().includes(query);
        const teamFullNameMatch = teamNames[prospect.NBA]?.toLowerCase().includes(query);

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
      <TimelineFilter
        selectedSortKey={selectedSortKey}
        setSelectedSortKey={setSelectedSortKey}
        selectedPosition={selectedPosition}
        setSelectedPosition={setSelectedPosition}
        filteredProspects={filteredProspects.map(p => p.prospect)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Prospects Grid */}
      <div className="space-y-4 max-w-6xl mx-auto px-4">
        {filteredProspects.length > 0 ? (
          filteredProspects.map(({ prospect, originalRank }) => (
            <ProspectCard
              key={prospect.Name}
              prospect={prospect}
              rank={originalRank ?? 0}
              filteredProspects={filteredProspects.map(p => p.prospect)}
            />
          ))
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
      <NavigationHeader activeTab="Draft Board" />
      <TimelineSlider initialProspects={prospects} />
    </div>
  );
}