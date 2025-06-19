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
        return 'Featuring prospects ranked by predicted EPM using up to 535 unique predictors.';
      case 'Andre Liu':
        return 'Featuring prospect analysis via original metrics and clustered tiers.';
      default:
        return '';
    }
  };
  
  const getTitle = (firstName: string, author: string) => {
    if (author === 'Andre Liu') {
      return `${firstName}'s Flagg Plant Score`;
    }
    return `${firstName}'s Draft Board`;
  };
  
  return (
    <div className={`bg-[#19191A] border-b border-gray-800 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4 pl-2 md:pl-0 md:ml-[3.25rem]">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {getTitle(firstName, author)}
          </h1>
          <p className="mt-2 text-gray-400 text-sm md:text-base max-w-2xl">
            {getDescription(author)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DraftPageHeader;