"use client";
import React from 'react';
import Image from 'next/image';

interface DevelopmentStageProps {
  stage: 'brainstorming' | 'development' | 'testing';
  text: string;
  subtext: string;
  isActive?: boolean;
}

const DevelopmentStage: React.FC<DevelopmentStageProps> = ({ stage, text, subtext, isActive = false }) => {
  const getIcon = () => {
    switch (stage) {
      case 'brainstorming':
        return (
          <div className="w-24 h-24 mx-auto my-4 relative">
            <Image 
              src="/icons/Brainstorming_Icon.png" 
              alt="Brainstorming icon" 
              width={96} 
              height={96}
              className={`${isActive ? 'opacity-100' : 'opacity-50'}`}
            />
          </div>
        );
      case 'development':
        return (
          <div className="w-24 h-24 mx-auto my-4 relative">
            <Image 
              src="/icons/In_Development_Icon.png" 
              alt="In Development Icon" 
              width={96} 
              height={96}
              className={`${isActive ? 'opacity-100' : 'opacity-50'}`}
            />
          </div>
        );
      case 'testing':
        return (
          <div className="w-24 h-24 mx-auto my-4 relative">
            <Image 
              src="/icons/Testing_Deployment_Icon.png" 
              alt="Testing Development Icon" 
              width={96} 
              height={96}
              className={`${isActive ? 'opacity-100' : 'opacity-50'}`}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex flex-col items-center mx-6 ${isActive ? 'text-white' : 'text-gray-500'}`}>
      <div className="text-2xl font-bold">{text}</div>
      <div className="text-center">
        {getIcon()}
      </div>
      <div className="text-lg text-center">({subtext})</div>
    </div>
  );
};

interface ComingSoonProps {
  feature: string;
  currentStage: 'brainstorming' | 'development' | 'testing';
  onClose?: () => void;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ feature, currentStage, onClose }) => {
  return (
    <div className="fixed inset-0 bg-[#19191A] flex flex-col items-center justify-center z-50">
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
      
      <h1 className="text-white text-7xl font-bold mb-16">COMING SOON</h1>
      
      <div className="flex flex-row justify-center items-start mb-16">
        <DevelopmentStage 
          stage="brainstorming" 
          text="brainstorming" 
          subtext="planned feature" 
          isActive={currentStage === 'brainstorming'} 
        />
        
        <div className="text-3xl text-gray-500 mt-2 mx-4">→</div>
        
        <DevelopmentStage 
          stage="development" 
          text="in development" 
          subtext="work in progress" 
          isActive={currentStage === 'development'} 
        />
        
        <div className="text-3xl text-gray-500 mt-2 mx-4">→</div>
        
        <DevelopmentStage 
          stage="testing" 
          text="testing deployment" 
          subtext="finalizing" 
          isActive={currentStage === 'testing'} 
        />
      </div>
      
      <div className="text-gray-400 text-xl">
        The {feature} feature is currently {
          currentStage === 'brainstorming' ? 'being planned' :
          currentStage === 'development' ? 'under development' : 'being tested'
        }
      </div>
    </div>
  );
};

export default ComingSoon;