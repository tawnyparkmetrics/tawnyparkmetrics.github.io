import React from 'react';

export interface DraftPageHeaderProps {
  author: 'Max Savin' | 'Nick Kalinowski' | 'Andre Liu' | 'Consensus' | 'Draft History' | '2020-2025 NBA Draft History';
  className?: string;
  selectedYear?: number | string;
}

const getBoardCount = (year: number | string | undefined) => {
  const numericYear = typeof year === 'string' ? parseInt(year) : year;

  switch (numericYear) {
    case 2020:
      return 63;
    case 2021:
      return 104;
    case 2022:
      return 100;
    case 2023:
      return 71;
    case 2024:
      return 111;
    case 2025:
      return 164;
    default:
      return 20;
  }
};

const DraftPageHeader: React.FC<DraftPageHeaderProps> = ({ author, className = '', selectedYear }) => {
  const firstName = author.split(' ')[0];

  const getDescription = (author: string) => {
    switch (author) {
      case 'Max Savin':
        return 'Featuring EPM projections, prospect tiers, skills graphs, and player comps.';
      case 'Nick Kalinowski':
        return 'Ranking prospects by predicted EPM using 500+ unique predictors.';
      case 'Andre Liu':
        return 'Analyzing prospects via original metrics and clustered tiers.';
      case 'Draft History':
      case '2020-2025 NBA Draft History':
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
    if (author === '2020-2025 NBA Draft History') {
      return '2020-2025 NBA Draft History';
    }
    if (author === 'Andre Liu') {
      return `${firstName}'s Flagg Plant Score`;
    }
    if (author === 'Consensus') {
      return selectedYear ? `${selectedYear} NBA Draft Internet Consensus` : `NBA Draft Internet Consensus`;
    }
    if (author === 'Draft History') {
      if (selectedYear === '2020-2025') {
        return '2020-2025 NBA Draft History';
      }
      return selectedYear ? `${selectedYear} NBA Draft` : `NBA Draft`;
    }
    return `${firstName}'s Draft Model`;
  };

  const getDescriptionMaxWidth = (author: string) => {
    return author === 'Consensus' ? 'max-w-6xl' : 'max-w-2xl';
  };

  // Add more padding specifically for Draft History pages
  const isDraftHistory = author === 'Draft History' || author === '2020-2025 NBA Draft History';
  const paddingClass = isDraftHistory ? 'py-6' : 'py-3';

  return (
    <div className={`bg-[#19191A] border-b border-gray-800 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`${paddingClass} pl-2 md:pl-0 md:ml-[3.25rem]`}>
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