"use client"
import React, { useState, useMemo } from 'react';
import { LucideUser } from 'lucide-react';
import Papa from 'papaparse';

// Define the type for our draft prospect
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

// Sorting keys for our ranking buttons
type SortKey = 'Actual Pick' | 'Pred. Y1 Rank' | 'Pred. Y2 Rank' | 'Pred. Y3 Rank' | 
               'Avg. Rank Y1-Y3' | 'Pred. Y4 Rank' | 'Pred. Y5 Rank' | 'Avg. Rank Y1-Y5';

// Async function to fetch CSV data
async function fetchDraftProspects(): Promise<DraftProspect[]> {
  const response = await fetch('/2024_Draft_Class.csv');
  const csvText = await response.text();
  
  return new Promise((resolve) => {
    Papa.parse(csvText, {
      header: true,
      complete: (results) => {
        resolve(results.data as DraftProspect[]);
      }
    });
  });
}

const ProspectCard: React.FC<{ prospect: DraftProspect }> = ({ prospect }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 flex space-x-4 w-96 h-48 shadow-lg">
      {/* Player Image Placeholder */}
      <div className="bg-gray-700 w-32 h-full flex items-center justify-center">
        <LucideUser className="text-gray-500" size={64} />
      </div>
      
      {/* Player Basic Info */}
      <div className="flex-grow">
        <h2 className="text-xl font-bold text-white mb-2">{prospect.Name}</h2>
        <div className="text-gray-300 space-y-1">
          <p>Draft Pick: {prospect['Actual Pick']}</p>
          <p>Team: {prospect.Team}</p>
          <p>Pre-NBA: {prospect['Pre-NBA']}</p>
          <p>Position: {prospect.Position}</p>
          <p>Age: {prospect.Age}</p>
        </div>
      </div>
      
      {/* Ranking Information */}
      <div className="w-24 bg-gray-700 p-2 rounded text-center text-sm text-gray-300">
        <h3 className="font-semibold mb-1">Rankings</h3>
        <p>Y1: {prospect['Pred. Y1 Rank']}</p>
        <p>Y2: {prospect['Pred. Y2 Rank']}</p>
        <p>Y3: {prospect['Pred. Y3 Rank']}</p>
        <p>Avg: {prospect['Avg. Rank Y1-Y3']}</p>
      </div>
    </div>
  );
};

export default async function DraftProspectsPage() {
  const prospects = await fetchDraftProspects();

  return <ClientSidePage initialProspects={prospects} />;
}

function ClientSidePage({ initialProspects }: { initialProspects: DraftProspect[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('Actual Pick');

  // Sorting function
  const sortedProspects = useMemo(() => {
    return [...initialProspects].sort((a, b) => 
      Number(a[sortKey]) - Number(b[sortKey])
    );
  }, [initialProspects, sortKey]);

  // Sorting button configuration
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
      
      <div className="flex flex-wrap justify-center gap-6">
        {sortedProspects.map((prospect) => (
          <ProspectCard key={prospect.Name} prospect={prospect} />
        ))}
      </div>
    </div>
  );
}