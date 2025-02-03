"use client";
import React, { useState, useMemo, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { LucideUser, ChevronDown, ChevronUp } from 'lucide-react';
import Papa from 'papaparse';
import { Barlow } from 'next/font/google';
import { motion, AnimatePresence } from 'framer-motion';

//fix dropdown stretch and compress issue

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

// Define keys that can be sorted
type SortKey = keyof Pick<DraftProspect,
  'Actual Pick' |
  'Pred. Y1 Rank' |
  'Pred. Y2 Rank' |
  'Pred. Y3 Rank' |
  'Avg. Rank Y1-Y3' |
  'Pred. Y4 Rank' |
  'Pred. Y5 Rank' |
  'Avg. Rank Y1-Y5'
>;

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['700'], // Use 700 for bold text
});

const ProspectCard: React.FC<{ prospect: DraftProspect }> = ({ prospect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const playerSummary = prospect.Summary || "A detailed scouting report would go here, describing the player's strengths, weaknesses, and projected role in the NBA.";
  const playerImageUrl = `/player_images2024/${prospect.Name} BG Removed.png`;
  const prenbalogoUrl = `/prenba_logos/${prospect['Pre-NBA']}.png`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto px-4 mb-4"
    >
      <div className="relative">
        <div
          className="relative h-[400px] group bg-gray-800/20 rounded-xs overflow-hidden"
          style={{ 
            backgroundColor: '#19191A',
            transform: 'translate3d(0,0,0)'
          }}
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
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <LucideUser className="text-gray-500" size={48} />
              </div>
            )}
          </div>

          {/* Large Centered Name */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
              isHovered ? 'opacity-0' : 'opacity-100'
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
            className={`absolute top-0 right-0 h-full w-[300px] backdrop-blur-sm transition-all duration-300 rounded-r-lg ${
              isHovered ? 'opacity-100' : 'opacity-0 translate-x-4 pointer-events-none'
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
                  <div><span className="font-bold text-white">Drafted Team  </span> {prospect.Team}</div>
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
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="relative mt-2"
            >
              <div className="grid grid-cols-2 gap-4 rounded-lg backdrop-blur-sm p-6" style={{ backgroundColor: '#19191A' }}>
                <div className="text-gray-300">
                  <h3 className="font-semibold text-lg mb-3 text-white">Scouting Report</h3>
                  <p className="text-sm leading-relaxed">{playerSummary}</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-800/80 p-4 rounded-lg">
                    <h3 className="font-semibold text-white mb-3">Projected Rankings</h3>
                    <div className="space-y-2 text-sm">
                      {['Y1', 'Y2', 'Y3', 'Y4', 'Y5'].map((year) => (
                        <div key={year} className="flex justify-between text-gray-300">
                          <span>Year {year.slice(1)}:</span>
                          <span>{prospect[`Pred. ${year} Rank` as keyof DraftProspect]}</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-semibold border-t border-gray-700 pt-2 text-blue-400">
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

function ClientSidePage({ initialProspects }: { initialProspects: DraftProspect[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('Actual Pick');

  const sortedProspects = useMemo(() => {
    return [...initialProspects].sort((a, b) => {
      const valueA = a[sortKey];
      const valueB = b[sortKey];

      // Handle cases where either value is null, undefined, empty string, or 'N/A'
      if (!valueA || valueA === 'N/A') return 1;  // Move a to the end
      if (!valueB || valueB === 'N/A') return -1; // Move b to the end

      // If both values exist, sort numerically
      return Number(valueA) - Number(valueB);
    });
  }, [initialProspects, sortKey]);

  const sortButtons: SortKey[] = [
    'Actual Pick',
    'Pred. Y1 Rank',
    'Pred. Y2 Rank',
    'Pred. Y3 Rank',
    'Avg. Rank Y1-Y3',
    'Pred. Y4 Rank',
    'Pred. Y5 Rank',
    'Avg. Rank Y1-Y5'
  ];

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: '#19191A' }}>
      <div className="max-w-[800px] mx-auto px-4 mb-8">
        <div className="flex flex-wrap justify-center gap-2">
          {sortButtons.map((key) => (
            <button
              key={key}
              onClick={() => setSortKey(key)}
              className={`
                px-3 py-1.5 rounded text-sm font-medium transition-colors duration-200
                ${sortKey === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
              `}
            >
              {key}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        {sortedProspects.map((prospect) => (
          <ProspectCard key={prospect.Name} prospect={prospect} />
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

  return <ClientSidePage initialProspects={prospects} />;
}