"use client";
import React from 'react';

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
          <div className="w-24 h-24 mx-auto my-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
              <path d="M12 7c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1s1-.45 1-1V8c0-.55-.45-1-1-1zm0 8c-.55 0-1 .45-1 1s.45 1 1 1s1-.45 1-1s-.45-1-1-1z" />
            </svg>
          </div>
        );
      case 'development':
        return (
          <div className="w-24 h-24 mx-auto my-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8z" />
              <path d="M15.88 8.29L10 14.17l-1.88-1.88a.996.996 0 1 0-1.41 1.41l2.59 2.59c.39.39 1.02.39 1.41 0L17 9.7a.996.996 0 0 0 0-1.41c-.39-.39-1.03-.39-1.12 0z" />
            </svg>
          </div>
        );
      case 'testing':
        return (
          <div className="w-24 h-24 mx-auto my-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
              <path d="M9 12H7v-2h2v2zm0 4H7v-2h2v2zm4-4h-2v-2h2v2zm4 0h-2v-2h2v2zm-4 4h-2v-2h2v2zm4 0h-2v-2h2v2z" />
            </svg>
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
          subtext="(planned feature)" 
          isActive={currentStage === 'brainstorming'} 
        />
        
        <div className="text-3xl text-gray-500 mt-2 mx-4">→</div>
        
        <DevelopmentStage 
          stage="development" 
          text="in development" 
          subtext="(work in progress)" 
          isActive={currentStage === 'development'} 
        />
        
        <div className="text-3xl text-gray-500 mt-2 mx-4">→</div>
        
        <DevelopmentStage 
          stage="testing" 
          text="testing deployment" 
          subtext="(finalizing)" 
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