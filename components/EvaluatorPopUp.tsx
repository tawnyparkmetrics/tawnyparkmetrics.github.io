import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface PlayerRanking {
  rank: number;
  name: string;
}

interface EvaluatorPopUpProps {
  isOpen: boolean;
  onClose: () => void;
  evaluatorName: string;
  year: number;
  csvData?: string;
  csvFileName?: string;
  allEvaluations?: any[];
}

export function EvaluatorPopUpModel({
  isOpen,
  onClose,
  evaluatorName,
  year,
  csvData,
  csvFileName,
  allEvaluations
}: EvaluatorPopUpProps) {
  const [rankings, setRankings] = useState<PlayerRanking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && evaluatorName) {
      loadRankings();
    }
  }, [isOpen, evaluatorName, year, csvData]);

  const loadRankings = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if we have CSV data
      if (!csvData) {
        setError('CSV data not loaded yet. Please wait...');
        setLoading(false);
        return;
      }

      const fileContent = csvData;
      
      // Parse CSV - the first row contains column headers including evaluator names
      const lines = fileContent.split('\n').map((line: string) => line.trim()).filter((line: string) => line);
      
      if (lines.length < 2) {
        throw new Error('CSV file does not have enough rows');
      }

      // First row contains all column headers (player info columns + evaluator names starting around column 33)
      const headerLine = lines[0];
      const headers = parseCSVLine(headerLine);
      
      console.log('Total columns:', headers.length);
      console.log('Columns 30-40:', headers.slice(30, 40));
      console.log('Looking for evaluator:', evaluatorName);
      
      // Find the evaluator's column index
      let evaluatorIndexFinal = headers.findIndex(header => {
        const cleanHeader = header.trim().toLowerCase().replace('@', '');
        const cleanEvaluator = evaluatorName.toLowerCase().replace('@', '').trim();
        return cleanHeader === cleanEvaluator;
      });

      if (evaluatorIndexFinal === -1) {
        // Try a more lenient match
        evaluatorIndexFinal = headers.findIndex(header => 
          header.trim().toLowerCase().includes(evaluatorName.toLowerCase().replace('@', '').trim())
        );
        
        if (evaluatorIndexFinal === -1) {
          throw new Error(`Evaluator "${evaluatorName}" not found in CSV. Available columns 30-40: ${headers.slice(30, 40).join(', ')}`);
        }
      }
      
      console.log('Found evaluator at column index:', evaluatorIndexFinal);
      console.log('Evaluator column name:', headers[evaluatorIndexFinal]);

      // Get the "Name" column index (should be first column or early in the list)
      const nameIndex = headers.findIndex(header => 
        header.trim().toLowerCase() === 'name'
      );

      if (nameIndex === -1) {
        throw new Error('Name column not found in CSV');
      }

      console.log('Name column at index:', nameIndex);

      // Parse player data starting from row 2 (index 1, since row 1/index 0 is headers)
      const playerRankings: PlayerRanking[] = [];
      
      console.log('Starting to parse players from row 2 (index 1)');
      console.log('Total data rows to process:', lines.length - 1);
      
      for (let i = 1; i < lines.length; i++) {
        const cells = parseCSVLine(lines[i]);
        
        if (cells.length <= Math.max(nameIndex, evaluatorIndexFinal)) {
          continue;
        }

        const playerName = cells[nameIndex]?.trim();
        const rankValue = cells[evaluatorIndexFinal]?.trim();

        if (i <= 5) {
          console.log(`Row ${i}: Player="${playerName}", Rank="${rankValue}"`);
        }

        if (playerName && rankValue && rankValue !== '' && rankValue !== 'NA' && rankValue !== 'N/A' && rankValue !== '-') {
          const rank = parseFloat(rankValue);
          if (!isNaN(rank)) {
            playerRankings.push({
              rank: Math.round(rank),
              name: playerName
            });
          }
        }
      }
      
      console.log('Total rankings found:', playerRankings.length);

      // Sort by rank
      playerRankings.sort((a, b) => a.rank - b.rank);
      setRankings(playerRankings);

    } catch (err) {
      console.error('Error loading rankings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load rankings');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to parse CSV line (handles quotes and commas)
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current);
    return result.map(cell => cell.trim().replace(/^"|"$/g, ''));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[#19191A] border border-gray-700/40 rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/30">
          <div>
            <h2 className="text-2xl font-bold text-gray-100">
              {evaluatorName}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {year} NBA Draft Board
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-400">Loading rankings...</div>
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-700/40 rounded-lg p-4">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {!loading && !error && rankings.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No rankings found for this evaluator
            </div>
          )}

          {!loading && !error && rankings.length > 0 && (
            <div className="space-y-2">
              {rankings.map((ranking) => (
                <div
                  key={`${ranking.rank}-${ranking.name}`}
                  className="flex items-center gap-4 p-3 bg-gray-800/30 hover:bg-gray-800/50 rounded-lg transition-colors"
                >
                  <div className="flex-shrink-0 w-12 text-center">
                    <span className="text-lg font-bold text-blue-400">
                      {ranking.rank}
                    </span>
                  </div>
                  <div className="flex-1">
                    <span className="text-gray-200 font-medium">
                      {ranking.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EvaluatorPopUpModel;