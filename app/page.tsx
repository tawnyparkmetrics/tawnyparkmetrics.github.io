"use client"
import React, { useState, useMemo, useEffect } from 'react';
import { LucideUser } from 'lucide-react';
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
}

type SortKey = 'Actual Pick' | 'Pred. Y1 Rank' | 'Pred. Y2 Rank' | 'Pred. Y3 Rank' |
  'Avg. Rank Y1-Y3' | 'Pred. Y4 Rank' | 'Pred. Y5 Rank' | 'Avg. Rank Y1-Y5';

  const ProspectCard: React.FC<{ prospect: DraftProspect }> = ({ prospect }) => {
    return (
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-5xl h-48 shadow-lg mx-auto mb-6">
        <div className="flex h-full space-x-6">
          {/* Player Image Placeholder - now with min-width to prevent shrinking */}
          <div className="bg-gray-700 w-36 min-w-[9rem] flex items-center justify-center rounded-lg">
            <LucideUser className="text-gray-500" size={72} />
          </div>
          
          {/* Player Basic Info - with text truncation */}
          <div className="flex-grow flex flex-col justify-center min-w-0">
          <h2 className="text-2xl font-bold text-white mb-3 truncate">{prospect.Name}</h2>
          <div className="grid grid-rows-2 gap-y-2">
            {/* Top row with 3 values */}
            <div className="grid grid-cols-3 gap-4 text-gray-300">
              <p className="truncate"><b>Draft Pick:</b> {prospect['Actual Pick'] || 'N/A'}</p>
              <p className="truncate"><b>Position:</b> {prospect.Position || 'N/A'}</p>
              <p className="truncate"><b>Team:</b> {prospect.Team || 'N/A'}</p>
            </div>
            {/* Bottom row with 2 values */}
            <div className="grid grid-cols-2 gap-4 text-gray-300">
              <p className="truncate"><b>Pre-NBA:</b> {prospect['Pre-NBA'] || 'N/A'}</p>
              <p className="truncate"><b>Age:</b> {prospect.Age || 'N/A'}</p>
            </div>
          </div>
        </div>
          
          {/* Ranking Information - now with min-width to prevent shrinking */}
          <div className="w-64 min-w-[16rem] bg-gray-700 p-4 rounded flex flex-col justify-center">
            <h3 className="font-semibold mb-2 text-center text-white">Rankings</h3>
            <div className="grid grid-cols-2 gap-2 text-gray-300">
              <p className="truncate">Year 1: {prospect['Pred. Y1 Rank'] || 'N/A'}</p>
              <p className="truncate">Year 2: {prospect['Pred. Y2 Rank'] || 'N/A'}</p>
              <p className="truncate">Year 3: {prospect['Pred. Y3 Rank'] || 'N/A'}</p>
              <p className="truncate">Year 4: {prospect['Pred. Y4 Rank'] || 'N/A'}</p>
              <p className="truncate">Year 5: {prospect['Pred. Y5 Rank'] || 'N/A'}</p>
              <p className="truncate">Avg: {prospect['Avg. Rank Y1-Y5'] || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };
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
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {sortButtons.map((key) => (
            <button
              key={key}
              onClick={() => setSortKey(key)}
              className={`
                px-4 py-2 rounded
                ${sortKey === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
              `}
            >
              {key}
            </button>
          ))}
        </div>
        
        <div className="space-y-6">
          {sortedProspects.map((prospect) => (
            <ProspectCard key={prospect.Name} prospect={prospect} />
          ))}
        </div>
      </div>
    </div>
  );
}