import React from 'react';
import { Template } from '../types';
import Icon from './Icon';

interface TemplateListStepProps {
  templates: Template[];
  onSelectTemplate: (templateId: string) => void;
  onBack: () => void;
}

const TemplateListStep: React.FC<TemplateListStepProps> = ({ templates, onSelectTemplate, onBack }) => {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#e2a32d]">Step 1: Select a Template</h2>
          <p className="text-[#95aac0] mt-1">Choose a base command to generate a variant from.</p>
        </div>
        <button onClick={onBack} className="px-6 py-2 bg-[#333e48] text-gray-200 font-semibold rounded-lg border border-[#5c6f7e] hover:bg-[#5c6f7e] transition-all">
          Back
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-16 bg-[#212934] rounded-lg border border-dashed border-[#5c6f7e]">
          <Icon path="M13 13h-2v-2h2v2zm0-4h-2V5h2v4zM18 2H6c-1.1 0-2 .9-2 2v16h16V4c0-1.1-.9-2-2-2zM8 6h10v2H8V6zm10 8H8v-2h10v2zm-2-4H8v-2h8v2z" className="w-16 h-16 text-[#5c6f7e] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-200">No Templates Found</h3>
          <p className="text-[#95aac0] mt-2">Create a command and save it as a template to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="flex flex-col bg-[#212934] rounded-lg border border-[#5c6f7e] hover:border-[#e2a32d] transition-colors">
              <div className="p-6 flex-grow">
                <h3 className="font-bold text-lg text-gray-200 truncate">{template.name}</h3>
                <p className="text-sm text-[#95aac0] mt-2 h-20 overflow-hidden text-ellipsis">{template.description}</p>
              </div>
              <div className="p-4 bg-[#333e48] border-t border-[#5c6f7e] rounded-b-lg">
                <button onClick={() => onSelectTemplate(template.id)} className="w-full px-4 py-2 bg-[#c36e26] text-white font-semibold rounded-lg hover:bg-[#b56524] transition-all">
                  Select & Continue
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplateListStep;
