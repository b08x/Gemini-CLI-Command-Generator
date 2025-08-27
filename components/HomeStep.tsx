import React from 'react';
import Icon from './Icon';

interface HomeStepProps {
  onStartFromScratch: () => void;
  onStartFromTemplate: () => void;
}

const HomeStep: React.FC<HomeStepProps> = ({ onStartFromScratch, onStartFromTemplate }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-[#e2a32d]">How would you like to start?</h2>
        <p className="text-[#95aac0] mt-2 max-w-2xl">
          You can create a new command from scratch or use one of your saved templates as a starting point for a new variant.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <button
          onClick={onStartFromScratch}
          className="group flex flex-col items-center text-center p-8 bg-[#212934] rounded-lg border-2 border-[#5c6f7e] hover:border-[#e2a32d] hover:bg-[#333e48] transition-all duration-300 transform hover:-translate-y-1"
        >
          <Icon path="M14 10H2v2h12v-2zm0-4H2v2h12V6zM2 16h8v-2H2v2zm19.5-4.5L23 13l-6.99 7-4.51-4.5L13 14l3.01 3L20 14.5z" className="w-16 h-16 text-[#e2a32d] mb-4 transition-transform group-hover:scale-110" />
          <h3 className="text-2xl font-bold text-gray-200">Start from Scratch</h3>
          <p className="text-[#95aac0] mt-2">
            Begin with a fresh objective and configure a brand new command.
          </p>
        </button>
        <button
          onClick={onStartFromTemplate}
          className="group flex flex-col items-center text-center p-8 bg-[#212934] rounded-lg border-2 border-[#5c6f7e] hover:border-[#e2a32d] hover:bg-[#333e48] transition-all duration-300 transform hover:-translate-y-1"
        >
          <Icon path="M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z" className="w-16 h-16 text-[#e2a32d] mb-4 transition-transform group-hover:scale-110" />
          <h3 className="text-2xl font-bold text-gray-200">Start from Template</h3>
          <p className="text-[#95aac0] mt-2">
            Select a previously saved command and generate a new variation from it.
          </p>
        </button>
      </div>
    </div>
  );
};

export default HomeStep;
