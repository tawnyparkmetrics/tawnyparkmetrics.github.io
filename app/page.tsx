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
  const playerSummary = prospect.Summary || "A detailed scouting report would go here, describing the player's strengths, weaknesses, and projected role in the NBA. This should include information about their playing style, physical attributes, and potential impact at the next level.";

  const playerimageUrl = `/player_images2024/${prospect.Name} BG Removed.png`;
  const prenbalogoUrl = `/prenba-logos/${prospect['Pre-NBA']}.png`;

  return (
    <div className="bg-gray-800 rounded-xs shadow-xs w-[800px] mx-auto overflow-visible">
      {/* Header with full-width image background */}
      <div
        className="relative h-24 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Player Image */}
        {!imageError ? (
          <Image
            src={playerimageUrl}
            alt={prospect.Name}
            fill
            className="object-cover grayscale"
            onError={() => setImageError(true)}
            sizes="800px"
          />
        ) : (
          <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
            <LucideUser className="text-gray-500" size={32} />
          </div>
        )}
        
        {/* Dark overlay for better text visibility */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Content overlay */}
        <div className="absolute inset-0 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white text-center">{prospect.Name}</h2>
          {isExpanded ? (
            <ChevronUp className="text-white h-6 w-6" />
          ) : (
            <ChevronDown className="text-white h-6 w-6" />
          )}
        </div>
      </div>

      {/* Rest of your existing expanded content */}
      {isExpanded && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-700">
          {/* Left Column - Player Summary */}
          <div className="text-gray-300">
            <h3 className="font-semibold text-lg mb-3 text-white">Scouting Report</h3>
            <p className="text-sm leading-relaxed">{playerSummary}</p>
          </div>

          {/* Right Column - Stats and Info */}
          <div className="space-y-4">
            {/* Basic Info Section */}
            <div className="bg-gray-800 p-4 rounded-xs">
              <h3 className="font-semibold text-white mb-3">Basic Information</h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Pick:</span>
                  <span>{prospect['Actual Pick']}</span>
                </div>
                <div className="flex justify-between">
                  <span>Team:</span>
                  <span>{prospect.Team}</span>
                </div>
                <div className="flex justify-between">
                  <span>Position:</span>
                  <span>{prospect.Position}</span>
                </div>
                <div className="flex justify-between">
                  <span>Age:</span>
                  <span>{prospect.Age}</span>
                </div>
                <div className="flex justify-between col-span-2">
                  <span>Pre-NBA:</span>
                  <span>{prospect['Pre-NBA']}</span>
                </div>
              </div>
            </div>

            {/* Rankings Section */}
            <div className="bg-gray-800 p-4 rounded-xs">
              <h3 className="font-semibold text-white mb-3">Projected Rankings</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Year 1:</span>
                  <span>{prospect['Pred. Y1 Rank']}</span>
                </div>
                <div className="flex justify-between">
                  <span>Year 2:</span>
                  <span>{prospect['Pred. Y2 Rank']}</span>
                </div>
                <div className="flex justify-between">
                  <span>Year 3:</span>
                  <span>{prospect['Pred. Y3 Rank']}</span>
                </div>
                <div className="flex justify-between font-semibold border-t border-gray-600 pt-2">
                  <span>3Y Avg:</span>
                  <span>{prospect['Avg. Rank Y1-Y3']}</span>
                </div>
                <div className="flex justify-between">
                  <span>Year 4:</span>
                  <span>{prospect['Pred. Y4 Rank']}</span>
                </div>
                <div className="flex justify-between">
                  <span>Year 5:</span>
                  <span>{prospect['Pred. Y5 Rank']}</span>
                </div>
                <div className="flex justify-between font-semibold border-t border-gray-600 pt-2">
                  <span>5Y Avg:</span>
                  <span>{prospect['Avg. Rank Y1-Y5']}</span>
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