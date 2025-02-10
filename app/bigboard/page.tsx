"use client";
import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { LucideUser, ChevronDown, ChevronUp } from 'lucide-react';
import Papa from 'papaparse';
import { Barlow } from 'next/font/google';
import { motion } from 'framer-motion';
import Link from 'next/link';

export interface DraftProspect {
  Name: string;
  'Actual Pick': string;
  Team: string;
  'Pre-NBA': string;
  Position: string;
  Age: string;
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

const yearSortKeys = [
  'Pred. Y1 Rank',
  'Pred. Y2 Rank',
  'Pred. Y3 Rank',
  'Pred. Y4 Rank',
  'Pred. Y5 Rank'
];

const timelineFilterKeys = [
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

const TimelineFilter = ({ 
  selectedSortKey, 
  setSelectedSortKey,
  selectedPosition,
  setSelectedPosition 
}: { 
  selectedSortKey: string, 
  setSelectedSortKey: (key: string) => void,
  selectedPosition: string | null,
  setSelectedPosition: (position: string | null) => void
}) => {
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
      <div className="absolute top-4 left-4">
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-gray-800/20 text-white rounded-xs text-sm font-medium hover:bg-gray-700 transition-colors duration-300"
        >
          ← Home
        </Link>
      </div>

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
        </div>
      </div>
    </div>
  );
};


const ProspectCard: React.FC<{ prospect: DraftProspect }> = ({ prospect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const draftedTeam = teamNames[prospect.Team] || prospect.Team;
  const playerSummary = prospect.Summary || "A detailed scouting report would go here, describing the player's strengths, weaknesses, and projected role in the NBA.";
  const playerImageUrl = `/player_images2024/${prospect.Name} BG Removed.png`;
  const prenbalogoUrl = `/prenba_logos/${prospect['Pre-NBA']}.png`;


  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        opacity: { duration: 0.3 },
        y: { duration: 0.5 },
        layout: { duration: 0.5 }
      }}
      className="max-w-5xl mx-auto px-4"
      style={{ marginBottom: '1rem' }}
    >
      <div className="relative">
        <div
          className="relative h-[400px] group bg-gray-800/20 rounded-xs"
          style={{ backgroundColor: '#19191A' }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Background Pre-NBA Logo */}
          <div className="absolute inset-0 flex items-center justify-start pl-12 opacity-20">
            {!logoError ? (
              <Image
                src={prenbalogoUrl}
                alt={prospect['Pre-NBA']}
                width={200}
                height={200}
                className="object-contain transition-transform duration-300 group-hover:scale-105 grayscale group-hover:grayscale-0"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="w-48 h-48 bg-gray-800 rounded-full flex items-center justify-center">
                <span className="text-xl text-gray-400">{prospect['Pre-NBA']}</span>
              </div>
            )}
          </div>

          {/* Player Image */}
          <div className="absolute inset-0 flex justify-center">
            {!imageError ? (
              <Image
                src={playerImageUrl}
                alt={prospect.Name}
                fill
                className="object-contain transition-transform duration-300 group-hover:scale-105 grayscale group-hover:grayscale-0"
                onError={() => setImageError(true)}
                sizes="800px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <LucideUser className="text-gray-500" size={48} />
              </div>
            )}
          </div>

          {/* Large Centered Name */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'
              }`}
          >
            <div className="text-center z-10">
              <h2
                className={`
                  ${barlow.className} 
                  text-7xl 
                  font-bold 
                  text-white 
                  uppercase 
                  tracking-wider
                  [text-shadow:_0_1px_2px_rgb(0_0_0_/_0.4),_0_2px_4px_rgb(0_0_0_/_0.3),_0_4px_8px_rgb(0_0_0_/_0.5),_0_8px_16px_rgb(0_0_0_/_0.2)]
                `}
              >
                {prospect.Name}
              </h2>
            </div>
          </div>

          {/* Fixed Hover info panel */}
          <div
            className={`absolute top-0 right-0 h-full w-[300px] backdrop-blur-sm transition-all duration-300 rounded-r-lg ${isHovered ? 'opacity-100' : 'opacity-0 translate-x-4 pointer-events-none'
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

        {/* Expand button */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="cursor-pointer w-8 h-8 rounded-full flex hover:bg-gray-800/10 transition-colors duration-200"
        >
          {isExpanded ? (
            <ChevronUp className="text-white h-6 w-6" />
          ) : (
            <ChevronDown className="text-white h-6 w-6" />
          )}
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="grid grid-cols-2 gap-4 rounded-xs backdrop-blur-sm p-6" style={{ backgroundColor: '#19191A' }}>
            <div className="text-gray-300">
              <h3 className="font-semibold text-lg mb-3 text-white">Scouting Report</h3>
              <p className="text-sm leading-relaxed">{playerSummary}</p>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-800/80 p-4 rounded-xs">
                <h3 className="font-semibold text-white mb-3">Projected Rankings</h3>
                <div className="space-y-2 text-sm">
                  {['Y1', 'Y2', 'Y3', 'Y4', 'Y5'].map((year) => (
                    <div key={year} className="flex justify-between text-gray-300">
                      <span>Year {year.slice(1)}:</span>
                      <span>{prospect[`Pred. ${year} Rank` as keyof DraftProspect]}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-semibold border-t border-gray-800/20 pt-2 text-blue-400">
                    <span>3Y Average:</span>
                    <span>{prospect['Avg. Rank Y1-Y3']}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-blue-400">
                    <span>5Y Average:</span>
                    <span>{prospect['Avg. Rank Y1-Y5']}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

function TimelineSlider({ initialProspects }: { initialProspects: DraftProspect[] }) {
  const [selectedSortKey, setSelectedSortKey] = useState<string>('Actual Pick');
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);

  const filteredProspects = useMemo(() => {
    let sortedProspects = [...initialProspects];

    // First apply position filter if selected
    if (selectedPosition) {
      sortedProspects = sortedProspects.filter(prospect => prospect.Role === selectedPosition);
    }

    // Then apply sorting
    if (yearSortKeys.includes(selectedSortKey)) {
      const yearKey = selectedSortKey as keyof DraftProspect;
      sortedProspects = sortedProspects.sort((a, b) => {
        const aValue = a[yearKey];
        const bValue = b[yearKey];

        if (aValue === 'N/A' || aValue === '' || aValue === null || aValue === undefined) {
          return 1;
        }
        if (bValue === 'N/A' || bValue === '' || bValue === null || bValue === undefined) {
          return -1;
        }

        return Number(aValue) - Number(bValue);
      });
    }
    else {
      sortedProspects = sortedProspects.sort((a, b) => {
        const aValue = a[selectedSortKey as keyof DraftProspect];
        const bValue = b[selectedSortKey as keyof DraftProspect];

        if (aValue === 'N/A' || aValue === '' || aValue === null || aValue === undefined) {
          return 1;
        }
        if (bValue === 'N/A' || bValue === '' || bValue === null || bValue === undefined) {
          return -1;
        }

        return Number(aValue) - Number(bValue);
      });
    }

    return sortedProspects;
  }, [initialProspects, selectedSortKey, selectedPosition]);

  return (
    <div className="bg-[#19191A] min-h-screen">
      <TimelineFilter
        selectedSortKey={selectedSortKey}
        setSelectedSortKey={setSelectedSortKey}
        selectedPosition={selectedPosition}
        setSelectedPosition={setSelectedPosition}
      />

      {/* Prospects Grid */}
      <div className="space-y-4 max-w-6xl mx-auto px-4">
        {filteredProspects.map((prospect) => (
          <ProspectCard
            key={prospect.Name}
            prospect={prospect}
          />
        ))}
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

  return <TimelineSlider initialProspects={prospects} />;
}