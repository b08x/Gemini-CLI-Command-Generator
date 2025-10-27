
import React from 'react';
import Icon from './Icon';
import { ToolType, EntityType } from '../types';

interface StartStepProps {
  tool: ToolType;
  onSetEntityType: (type: EntityType) => void;
  onStartFromScratch: () => void;
  onStartFromTemplate: () => void;
  onViewTemplates: () => void;
  onBack: () => void;
}

const StartStep: React.FC<StartStepProps> = ({ tool, onSetEntityType, onStartFromScratch, onStartFromTemplate, onViewTemplates, onBack }) => {
  const needsEntityType = tool === ToolType.ClaudeCode || tool === ToolType.OpenCode;

  const handleSelectEntityType = (type: EntityType) => {
    onSetEntityType(type);
    onStartFromScratch();
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold text-[#e2a32d]">Create a new {tool} artifact</h2>
          <p className="text-[#95aac0] mt-2 max-w-3xl">
            {needsEntityType
              ? `First, choose whether you want to create an Agent or a Command. Then, start from scratch or a template.`
              : `Generate a new command from scratch, create a variant from a template, or manage your existing library.`}
          </p>
        </div>
         <button onClick={onBack} className="px-6 py-2 bg-[#333e48] text-gray-200 font-semibold rounded-lg border border-[#5c6f7e] hover:bg-[#5c6f7e] transition-all">
          Back
        </button>
      </div>

      <div className="flex-grow flex items-center justify-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
          {needsEntityType ? (
            <>
              <button
                onClick={() => handleSelectEntityType(EntityType.Agent)}
                className="group flex flex-col items-center text-center p-8 bg-[#212934] rounded-lg border-2 border-[#5c6f7e] hover:border-[#e2a32d] hover:bg-[#333e48] transition-all duration-300 transform hover:-translate-y-1"
              >
                <Icon path="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" className="w-16 h-16 text-[#e2a32d] mb-4 transition-transform group-hover:scale-110" />
                <h3 className="text-2xl font-bold text-gray-200">Create Agent</h3>
                <p className="text-[#95aac0] mt-2">
                  Build a new autonomous agent with specialized skills.
                </p>
              </button>
              <button
                onClick={() => handleSelectEntityType(EntityType.Command)}
                className="group flex flex-col items-center text-center p-8 bg-[#212934] rounded-lg border-2 border-[#5c6f7e] hover:border-[#e2a32d] hover:bg-[#333e48] transition-all duration-300 transform hover:-translate-y-1"
              >
                <Icon path="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zM4 18V6h16v12H4zm6-10.5l4 4-4 4-1.41-1.41L11.17 12l-2.58-2.59L10 7.5z" className="w-16 h-16 text-[#e2a32d] mb-4 transition-transform group-hover:scale-110" />
                <h3 className="text-2xl font-bold text-gray-200">Create Command</h3>
                <p className="text-[#95aac0] mt-2">
                  Define a reusable, parameterized prompt for automation.
                </p>
              </button>
            </>
          ) : (
            <button
              onClick={onStartFromScratch}
              className="group flex flex-col items-center text-center p-8 bg-[#212934] rounded-lg border-2 border-[#5c6f7e] hover:border-[#e2a32d] hover:bg-[#333e48] transition-all duration-300 transform hover:-translate-y-1"
            >
              <Icon path="M14 10H2v2h12v-2zm0-4H2v2h12V6zM2 16h8v-2H2v2zm19.5-4.5L23 13l-6.99 7-4.51-4.5L13 14l3.01 3L20 14.5z" className="w-16 h-16 text-[#e2a32d] mb-4 transition-transform group-hover:scale-110" />
              <h3 className="text-2xl font-bold text-gray-200">Start from Scratch</h3>
              <p className="text-[#95aac0] mt-2">
                Begin with a fresh objective and configure a new command.
              </p>
            </button>
          )}

          <button
            onClick={onViewTemplates}
            className="group flex flex-col items-center text-center p-8 bg-[#212934] rounded-lg border-2 border-[#5c6f7e] hover:border-[#e2a32d] hover:bg-[#333e48] transition-all duration-300 transform hover:-translate-y-1"
          >
            <Icon path="M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z" className="w-16 h-16 text-[#e2a32d] mb-4 transition-transform group-hover:scale-110" />
            <h3 className="text-2xl font-bold text-gray-200">Manage Templates</h3>
            <p className="text-[#95aac0] mt-2">
              Browse, edit, and create new variations from your library.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartStep;
