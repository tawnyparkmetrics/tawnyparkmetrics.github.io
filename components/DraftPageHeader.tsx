import React from 'react';

export interface DraftPageHeaderProps {
  author: 'Max Savin' | 'Nick Kalinowski' | 'Andre Liu';
  className?: string;
}

const DraftPageHeader: React.FC<DraftPageHeaderProps> = ({ author, className = '' }) => {
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
      default:
        return '';
    }
  };
  
  const getTitle = (firstName: string, author: string) => {
    if (author === 'Andre Liu') {
      return `${firstName}'s Flagg Plant Score`;
    }
    return `${firstName}'s Draft Model`;
  };
  
  return (
    <div className={`bg-[#19191A] border-b border-gray-800 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3 pl-2 md:pl-0 md:ml-[3.25rem]">
          <h1 className="text-xl md:text-2xl font-semibold text-white">
            {getTitle(firstName, author)}
          </h1>
          <p className="mt-1 text-gray-400 text-xs md:text-sm max-w-2xl">
            {getDescription(author)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DraftPageHeader;