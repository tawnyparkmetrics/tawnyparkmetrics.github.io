"use client"
import React, { useState, useMemo, useEffect } from 'react';
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
}

type SortKey = 'Actual Pick' | 'Pred. Y1 Rank' | 'Pred. Y2 Rank' | 'Pred. Y3 Rank' |
  'Avg. Rank Y1-Y3' | 'Pred. Y4 Rank' | 'Pred. Y5 Rank' | 'Avg. Rank Y1-Y5';

const ProspectCard: React.FC<{ prospect: DraftProspect }> = ({ prospect }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gray-800 rounded-xs shadow-xs w-[800px] mx-auto overflow-hidden">
      {/* Always visible header */}
      <div 
        className="p-4 flex items-center cursor-pointer hover:bg-gray-750 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Player Image */}
        <div className="bg-gray-700 w-16 h-16 flex items-center justify-center rounded-xs flex-shrink-0">
          <LucideUser className="text-gray-500" size={32} />
        </div>
        
        {/* Name and button */}
        <div className="flex-grow ml-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{prospect.Name}</h2>
          {isExpanded ? (
            <ChevronUp className="text-gray-400 h-6 w-6" />
          ) : (
            <ChevronDown className="text-gray-400 h-6 w-6" />
          )}
        </div>
      </div>

      {/* Expandable content */}
      {isExpanded && (
        <div className="border-t border-gray-700 p-6">
          <div className="flex space-x-6">
            {/* Player Basic Info */}
            <div className="flex-grow">
              <div className="grid grid-cols-3 gap-y-2 text-gray-300">
                <p>Pick: {prospect['Actual Pick']}</p>
                <p>Team: {prospect.Team}</p>
                <p>Position: {prospect.Position}</p>
                <p>Age: {prospect.Age}</p>
                <p>Pre-NBA: {prospect['Pre-NBA']}</p>
              </div>
            </div>
            
            {/* Ranking Information */}
            <div className="bg-gray-700 p-4 rounded-xs text-gray-300 w-40 flex-shrink-0">
              <h3 className="font-semibold text-center mb-3">Rankings</h3>
              <div className="space-y-2 text-sm">
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