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
                  <div><span className="font-bold text-white">Drafted Team  </span> {draftedTeam}</div>
                  <div><span className="font-bold text-white">Position  </span> {prospect.Role}</div>
                  <div><span className="font-bold text-white">Drafted Age  </span> {prospect.Age}</div>
                  <div><span className="font-bold text-white">College  </span> {prospect['Pre-NBA']}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expand button */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="cursor-pointer w-full py-2 flex items-center justify-center hover:bg-gray-800/10 transition-colors duration-200"
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

  const yearSortKeys = [
    'Pred. Y1 Rank',
    'Pred. Y2 Rank',
    'Pred. Y3 Rank',
    'Pred. Y4 Rank',
    'Pred. Y5 Rank'
  ];

  const additionalSortKeys = [
    'Avg. Rank Y1-Y3',
    'Avg. Rank Y1-Y5'
  ];


  const filteredProspects = useMemo(() => {
    let sortedProspects = [...initialProspects];
  
    // Handle year-based sorting for timeline
    if (yearSortKeys.includes(selectedSortKey)) {
      const yearKey = selectedSortKey as keyof DraftProspect;
      sortedProspects = sortedProspects.sort((a, b) => {
        const aValue = a[yearKey];
        const bValue = b[yearKey];
  
        // Handle invalid or missing values by placing them at the bottom
        if (aValue === 'N/A' || aValue === '' || aValue === null || aValue === undefined) {
          return 1; // a should come after b
        }
        if (bValue === 'N/A' || bValue === '' || bValue === null || bValue === undefined) {
          return -1; // b should come after a
        }
  
        // Now compare the valid values
        return Number(aValue) - Number(bValue);
      });
    }
    // Handle other sorting keys
    else {
      sortedProspects = sortedProspects.sort((a, b) => {
        const aValue = a[selectedSortKey as keyof DraftProspect];
        const bValue = b[selectedSortKey as keyof DraftProspect];
  
        // Handle invalid or missing values by placing them at the bottom
        if (aValue === 'N/A' || aValue === '' || aValue === null || aValue === undefined) {
          return 1; // a should come after b
        }
        if (bValue === 'N/A' || bValue === '' || bValue === null || bValue === undefined) {
          return -1; // b should come after a
        }
  
        // Now compare the valid values
        return Number(aValue) - Number(bValue);
      });
    }
  
    return sortedProspects;
  }, [initialProspects, selectedSortKey]);
  

  return (
    <div className="bg-[#19191A] min-h-screen">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* New Home Navigation Button */}
        <div className="absolute top-4 left-4">
          <Link
            href="/"
            className="
              inline-block 
              px-4 py-2 
              bg-gray-800/20 
              text-white 
              rounded-xs 
              text-sm 
              font-medium 
              hover:bg-gray-700 
              transition-colors 
              duration-300
            "
          >
            ← Home
          </Link>
        </div>

        {/* Main Filter Section */}
        <div className="flex items-center justify-between mb-8 space-x-4">
          {/* Actual Pick Filter */}
          <button
            onClick={() => setSelectedSortKey('Actual Pick')}
            className={`
              px-4 py-2 text-sm font-medium transition-all
              ${selectedSortKey === 'Actual Pick'
                ? 'bg-gray-800/20 text-white'
                : 'bg-gray-800/20 text-gray-400 hover:bg-gray-700'}
            `}
          >
            Actual Pick
          </button>

          {/* Timeline Slider for Year Rankings */}
          <div className="relative flex-grow max-w-3xl">
            <div className="relative h-16 bg-gray-800/20">
              {yearSortKeys.map((key, index) => (
                <motion.div
                  key={key}
                  onClick={() => setSelectedSortKey(key)}
                  className={`
                    absolute top-1/2 -translate-y-1/2 w-12 h-12 
                    cursor-pointer flex items-center justify-between
                    transition-all duration-300 z-10
                    ${selectedSortKey === key
                      ? 'bg-gray-800/20 text-white scale-110 z-10'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-800/20'}
                  `}
                  style={{
                    left: `${(index + 1) * 20}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  Y{index + 1}
                </motion.div>
              ))}
              <motion.div
                className="absolute h-1 bg-white top-1/2 -translate-y-1/2 opacity-30 z-0"
                style={{
                  width: '100%',
                  left: '0%',
                  transformOrigin: 'left center'
                }}
              />
            </div>
          </div>

          {/* Additional Sort Keys */}
          <div className="flex space-x-2">
            {additionalSortKeys.map(key => (
              <button
                key={key}
                onClick={() => setSelectedSortKey(key)}
                className={`
                  px-4 py-2 text-sm font-medium transition-all
                  ${selectedSortKey === key
                    ? 'bg-gray-800/20 text-white'
                    : 'bg-ggray-800/20 text-white hover:bg-gray-700'}
                `}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        {/* Prospects Grid */}
        <div className="space-y-4">
          {filteredProspects.map((prospect) => (
            <ProspectCard
              key={prospect.Name}
              prospect={prospect}
            />
          ))}
        </div>
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