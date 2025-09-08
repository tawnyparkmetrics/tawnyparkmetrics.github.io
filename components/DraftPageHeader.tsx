import React from 'react';

export interface DraftPageHeaderProps {
  author: 'Max Savin' | 'Nick Kalinowski' | 'Andre Liu' | 'Consensus' | 'Draft History' | '2020-2025 NBA Draft History'; // Added the new specific type
  className?: string;
  selectedYear?: number | string; // Allow selectedYear to be a string (e.g., '2020-2025')
}

const getBoardCount = (year: number | string | undefined) => {
  const numericYear = typeof year === 'string' ? parseInt(year) : year;

  switch (numericYear) {
    case 2020:
      return 64; // or whatever value you want for 2020
    case 2021:
      return 104; // or whatever value you want for 2021
    case 2022:
      return 100; // or whatever value you want for 2022
    case 2023:
      return 71; // or whatever value you want for 2023
    case 2024:
      return 111; // or whatever value you want for 2024
    case 2025:
      return 164; // or whatever value you want for 2025
    default:
      return 20; // default fallback value
  }
};

const DraftPageHeader: React.FC<DraftPageHeaderProps> = ({ author, className = '', selectedYear }) => {
  // Get first name for the display
  const firstName = author.split(' ')[0];

  // Get description based on author
  const getDescription = (author: string) => {
    switch (author) {
      case 'Max Savin':
        return 'Featuring EPM projections, prospect tiers, skills graphs, and player comps.';
      case 'Nick Kalinowski':
        return 'Ranking prospects by predicted EPM using up to 500+ unique predictors.';
      case 'Andre Liu':
        return 'Analyzing prospects via original metrics and clustered tiers.';
      case 'Draft History':
      case '2020-2025 NBA Draft History': // No description for this case
        return '';
      case 'Consensus':
        return (
          <>
            Aggregate of {getBoardCount(selectedYear || 2025)} boards, all published before the {selectedYear ?? ''} NBA Draft. Only displaying prospects who appear on at least ~5% of boards. Prospects are ordered via a weighted combination of average (mean) rank & inclusion rate.
          </>
        );
      default:
        return '';
    }
  };

  const getTitle = (firstName: string, author: string, selectedYear?: number | string) => {
    // Handle the explicit '2020-2025 NBA Draft History' author type
    if (author === '2020-2025 NBA Draft History') {
      return '2020-2025 NBA Draft History';
    }
    if (author === 'Andre Liu') {
      return `${firstName}'s Flagg Plant Score`;
    }
    if (author === 'Consensus') {
      return selectedYear ? `${selectedYear} NBA Draft Internet Consensus` : `NBA Draft Internet Consensus`;
    }
    // Updated logic for 'Draft History' author
    if (author === 'Draft History') {
      // Check if selectedYear is the string '2020-2025'
      if (selectedYear === '2020-2025') {
        return '2020-2025 NBA Draft History'; // Specific title for the range
      }
      return selectedYear ? `${selectedYear} NBA Draft` : `NBA Draft`; // For single years
    }
    return `${firstName}'s Draft Model`;
  };

  const getDescriptionMaxWidth = (author: string) => {
    return author === 'Consensus' ? 'max-w-6xl' : 'max-w-2xl';
  };

  return (
    <div className={`bg-[#19191A] border-b border-gray-800 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3 pl-2 md:pl-0 md:ml-[3.25rem]">
          <h1 className="text-xl md:text-2xl font-semibold text-white">
            {getTitle(firstName, author, selectedYear)}
          </h1>
          <p className={`mt-1 text-gray-400 text-xs md:text-sm ${getDescriptionMaxWidth(author)}`}>
            {getDescription(author)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DraftPageHeader;