
import React from 'react';
import Icon from './Icon';
import { ToolType } from '../types';

interface ToolSelectStepProps {
  onSelectTool: (tool: ToolType) => void;
}

const ToolSelectStep: React.FC<ToolSelectStepProps> = ({ onSelectTool }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-[#e2a32d]">Which tool are you building for?</h2>
        <p className="text-[#95aac0] mt-2 max-w-3xl">
          Select a platform to begin generating a custom command or agent.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        <button
          onClick={() => onSelectTool(ToolType.GeminiCLI)}
          className="group flex flex-col items-center text-center p-8 bg-[#212934] rounded-lg border-2 border-[#5c6f7e] hover:border-[#e2a32d] hover:bg-[#333e48] transition-all duration-300 transform hover:-translate-y-1"
        >
          <Icon path="M15 4V3H9v1H4v2h1v13c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V6h1V4h-5zm-6 11H7v-2h2v2zm4 0h-2v-2h2v2z" className="w-16 h-16 text-[#e2a32d] mb-4 transition-transform group-hover:scale-110" />
          <h3 className="text-2xl font-bold text-gray-200">Gemini CLI</h3>
          <p className="text-[#95aac0] mt-2">
            Generate custom TOML commands for the Gemini CLI.
          </p>
        </button>
        <button
          onClick={() => onSelectTool(ToolType.ClaudeCode)}
          className="group flex flex-col items-center text-center p-8 bg-[#212934] rounded-lg border-2 border-[#5c6f7e] hover:border-[#e2a32d] hover:bg-[#333e48] transition-all duration-300 transform hover:-translate-y-1"
        >
          <Icon path="M19.78 2.22a.75.75 0 00-1.06 0L17 4.94V3a1 1 0 00-2 0v4a1 1 0 001 1h4a1 1 0 000-2h-1.94l2.72-2.72a.75.75 0 000-1.06zM4.22 17.78a.75.75 0 001.06 0L7 15.06V17a1 1 0 002 0v-4a1 1 0 00-1-1H4a1 1 0 000 2h1.94L3.22 16.72a.75.75 0 000 1.06z" className="w-16 h-16 text-[#e2a32d] mb-4 transition-transform group-hover:scale-110" />
          <h3 className="text-2xl font-bold text-gray-200">Claude-Code</h3>
          <p className="text-[#95aac0] mt-2">
            Create Markdown-based Agents and Commands.
          </p>
        </button>
         <button
          onClick={() => onSelectTool(ToolType.OpenCode)}
          className="group flex flex-col items-center text-center p-8 bg-[#212934] rounded-lg border-2 border-[#5c6f7e] hover:border-[#e2a32d] hover:bg-[#333e48] transition-all duration-300 transform hover:-translate-y-1"
        >
          <Icon path="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z" className="w-16 h-16 text-[#e2a32d] mb-4 transition-transform group-hover:scale-110" />
          <h3 className="text-2xl font-bold text-gray-200">OpenCode</h3>
          <p className="text-[#95aac0] mt-2">
            Build terminal-native Agents using Markdown configuration.
          </p>
        </button>
      </div>
    </div>
  );
};

export default ToolSelectStep;
