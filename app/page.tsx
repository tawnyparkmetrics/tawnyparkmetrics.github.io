"use client";
import React, { useState, useMemo, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { LucideUser, ChevronDown, ChevronUp } from 'lucide-react';
import Papa from 'papaparse';

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

const ProspectCard: React.FC<{ prospect: DraftProspect }> = ({ prospect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  
  const playerSummary = prospect.Summary || "A detailed scouting report would go here, describing the player's strengths, weaknesses, and projected role in the NBA.";
  const playerImageUrl = `/player_images2024/${prospect.Name} BG Removed.png`;
  const prenbalogoUrl = `/prenba-logos/${prospect['Pre-NBA']}.png`;

  return (
    <div className="w-[800px] mx-auto">
      {/* Header section with integrated player image, logo, and name */}
      <div 
        className="relative h-48 cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/0 to-gray-900" />
        
        {/* Player Image */}
        <div className="absolute inset-0 flex justify-center">
          {!imageError ? (
            <Image
              src={playerImageUrl}
              alt={prospect.Name}
              fill
              className="object-contain transition-transform duration-300 group-hover:scale-105 grayscale hover:grayscale-0"
              onError={() => setImageError(true)}
              sizes="800px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <LucideUser className="text-gray-500" size={48} />
            </div>
          )}
        </div>

        {/* Pre-NBA Logo */}
        <div className="absolute top-4 left-4 w-16 h-16">
          {!logoError ? (
            <Image
              src={prenbalogoUrl}
              alt={prospect['Pre-NBA']}
              width={64}
              height={64}
              className="object-contain grayscale"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
              <span className="text-xs text-gray-400">{prospect['Pre-NBA']}</span>
            </div>
          )}
        </div>

        {/* Name and expand button */}
        <div className="absolute bottom-0 inset-x-0 p-4 flex items-end justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">{prospect.Name}</h2>
            <p className="text-sm text-gray-300">{prospect.Position} • {prospect.Age} years</p>
          </div>
          {isExpanded ? (
            <ChevronUp className="text-white h-6 w-6" />
          ) : (
            <ChevronDown className="text-white h-6 w-6" />
          )}
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-4 grid grid-cols-2 gap-4 bg-gray-800/50 p-6 rounded-xs backdrop-blur-sm">
          {/* Left Column - Player Summary */}
          <div className="text-gray-300">
            <h3 className="font-semibold text-lg mb-3 text-white">Scouting Report</h3>
            <p className="text-sm leading-relaxed">{playerSummary}</p>
          </div>

          {/* Right Column - Stats and Info */}
          <div className="space-y-4">
            {/* Basic Info Section */}
            <div className="bg-gray-800/80 p-4 rounded-xs">
              <h3 className="font-semibold text-white mb-3">Basic Information</h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                <div>Pick: {prospect['Actual Pick']}</div>
                <div>Team: {prospect.Team}</div>
              </div>
            </div>

            {/* Rankings Section */}
            <div className="bg-gray-800/80 p-4 rounded-xs">
              <h3 className="font-semibold text-white mb-3">Projected Rankings</h3>
              <div className="space-y-2 text-sm">
                {['Y1', 'Y2', 'Y3'].map((year) => (
                  <div key={year} className="flex justify-between text-gray-300">
                    <span>Year {year.slice(1)}:</span>
                    <span>{prospect[`Pred. ${year} Rank` as keyof DraftProspect]}</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold border-t border-gray-700 pt-2 text-blue-400">
                  <span>3Y Average:</span>
                  <span>{prospect['Avg. Rank Y1-Y3']}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
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
    <div className="min-h-screen bg-gray-900 py-8">
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