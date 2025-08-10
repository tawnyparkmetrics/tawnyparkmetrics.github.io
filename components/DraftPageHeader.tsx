import React from 'react';

export interface DraftPageHeaderProps {
  author: 'Max Savin' | 'Nick Kalinowski' | 'Andre Liu' | 'Consensus' | 'Draft History';
  className?: string;
  selectedYear?: number; // Add optional selectedYear prop
}

const DraftPageHeader: React.FC<DraftPageHeaderProps> = ({ author, className = '', selectedYear }) => {
  // Get first name for the display
  const firstName = author.split(' ')[0];

  // Get description based on author
  const getDescription = (author: string) => {
    switch (author) {
      case 'Max Savin':
        return 'Featuring EPM projections, prospect tiers, skills graphs, and player comps.';
      case 'Nick Kalinowski':
        return 'Ranking prospects by predicted EPM using up to 535 unique predictors.';
      case 'Andre Liu':
        return 'Analyzing prospects via original metrics and clustered tiers.';
      case 'Draft History':
        return '';
      case 'Consensus':
        return (
          <>
            Aggregate of 158 boards, all published & submitted before the 2025 NBA Draft. Thank you to everyone who helps put this consensus together, including: <a href="https://twitter.com/mikegrib8" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">@mikegrib8</a>, <a href="https://twitter.com/thegrantedwards" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">@thegrantedwards</a>, <a href="https://twitter.com/codyreeves14" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">@codyreeves14</a>, <a href="https://twitter.com/dualbarl" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">@dualbarl</a>, <a href="https://twitter.com/CannibalSerb" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">@CannibalSerb</a>, <a href="https://twitter.com/bendog28" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">@bendog28</a>, <a href="https://twitter.com/BalaRavikumar5" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">@BalaRavikumar5</a>, & <a href="https://twitter.com/supersayansavin" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">@supersayansavin</a>. Only displaying prospects who appear on at least 10 boards. Prospects are ordered via a weighted combination of average (mean) rank & inclusion rate.
          </>
        );
      default:
        return '';
    }
  };

  const getTitle = (firstName: string, author: string, selectedYear?: number) => {
    if (author === 'Andre Liu') {
      return `${firstName}'s Flagg Plant Score`;
    }
    if (author === 'Consensus') {
      return `2025 NBA Draft Internet Consensus`
    }
    if (author === 'Draft History') {
      return selectedYear ? `${selectedYear} NBA Draft History` : `NBA Draft History`;
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