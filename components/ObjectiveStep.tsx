import React from 'react';

interface ObjectiveStepProps {
  objective: string;
  setObjective: (value: string) => void;
  onNext: () => void;
}

const ObjectiveStep: React.FC<ObjectiveStepProps> = ({ objective, setObjective, onNext }) => {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-[#e2a32d]">Step 1: Define Your Command's Objective</h2>
        <p className="text-[#95aac0] mt-1">
          Describe what you want your Gemini CLI command to do. Be as specific as possible.
        </p>
      </div>
      
      <textarea
        value={objective}
        onChange={(e) => setObjective(e.target.value)}
        placeholder="e.g., Create a command that summarizes a Git diff for the current branch and suggests a commit message."
        className="w-full h-48 p-4 bg-[#333e48] border border-[#5c6f7e] rounded-lg focus:ring-2 focus:ring-[#e2a32d] focus:border-[#e2a32d] outline-none resize-y text-gray-200 placeholder:text-[#95aac0] transition-colors"
      />

      <div className="flex justify-end">
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

export default ObjectiveStep;