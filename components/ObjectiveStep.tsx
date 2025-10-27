import React from 'react';
import { ToolType, EntityType } from '../types';

interface ObjectiveStepProps {
  objective: string;
  setObjective: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
  tool: ToolType;
  entityType?: EntityType;
}

const ObjectiveStep: React.FC<ObjectiveStepProps> = ({ objective, setObjective, onNext, onBack, tool, entityType }) => {
  const entityName = entityType ? `${entityType}` : 'Command';
  const title = `Step 2: Define Your ${entityName}'s Objective`;
  const placeholderText = 
    tool === ToolType.GeminiCLI 
      ? "e.g., Create a command that summarizes a Git diff and suggests a commit message."
      : `e.g., An agent that reviews code for security vulnerabilities based on OWASP top 10.`;


  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-[#e2a32d]">{title}</h2>
        <p className="text-[#95aac0] mt-1">
          Describe what you want your {tool} {entityName.toLowerCase()} to do. Be as specific as possible.
        </p>
      </div>
      
      <textarea
        value={objective}
        onChange={(e) => setObjective(e.target.value)}
        placeholder={placeholderText}
        className="w-full h-48 p-4 bg-[#333e48] border border-[#5c6f7e] rounded-lg focus:ring-2 focus:ring-[#e2a32d] focus:border-[#e2a32d] outline-none resize-y text-gray-200 placeholder:text-[#95aac0] transition-colors"
      />

      <div className="flex justify-between">
        <button onClick={onBack} className="px-6 py-2 bg-[#333e48] text-gray-200 font-semibold rounded-lg border border-[#5c6f7e] hover:bg-[#5c6f7e] transition-all">
          Back
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

export default ObjectiveStep;