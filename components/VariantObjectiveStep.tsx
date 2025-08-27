import React from 'react';
import { Template } from '../types';

interface VariantObjectiveStepProps {
  template: Template;
  objective: string;
  setObjective: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const VariantObjectiveStep: React.FC<VariantObjectiveStepProps> = ({ template, objective, setObjective, onNext, onBack }) => {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-[#e2a32d]">Step 2: Define Your Variant's Objective</h2>
        <p className="text-[#95aac0] mt-1">
          You've selected the <span className="font-bold text-gray-200">"{template.name}"</span> template. Now, describe how you want to change it.
        </p>
      </div>
      
      <textarea
        value={objective}
        onChange={(e) => setObjective(e.target.value)}
        placeholder="e.g., Modify it to use 'git log' instead of 'git diff' and create a summary of the last 5 commits."
        className="w-full h-48 p-4 bg-[#333e48] border border-[#5c6f7e] rounded-lg focus:ring-2 focus:ring-[#e2a32d] focus:border-[#e2a32d] outline-none resize-y text-gray-200 placeholder:text-[#95aac0] transition-colors"
      />

      <div className="flex justify-between">
        <button onClick={onBack} className="px-6 py-2 bg-[#333e48] text-gray-200 font-semibold rounded-lg border border-[#5c6f7e] hover:bg-[#5c6f7e] transition-all">
          Back to Templates
        </button>
        <button
          onClick={onNext}
          disabled={!objective.trim()}
          className="px-6 py-2 bg-[#c36e26] text-white font-semibold rounded-lg hover:bg-[#b56524] disabled:bg-[#5c6f7e] disabled:cursor-not-allowed transition-all"
        >
          Next: Configure
        </button>
      </div>
    </div>
  );
};

export default VariantObjectiveStep;