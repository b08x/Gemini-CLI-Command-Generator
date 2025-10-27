
import React, { useState } from 'react';
import { Template } from '../types';
import Icon from './Icon';

interface ViewTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: Template | null;
}

const ViewTemplateModal: React.FC<ViewTemplateModalProps> = ({ isOpen, onClose, template }) => {
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen || !template) {
    return null;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(template.content).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error("Failed to copy content: ", err);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-[#333e48] rounded-xl border border-[#5c6f7e] shadow-2xl w-full max-w-2xl p-8 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-[#e2a32d]">{template.name}</h2>
            <p className="text-[#95aac0] mt-1">{template.description}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-[#5c6f7e] ml-4">
            <Icon path="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" className="w-6 h-6 text-gray-400" />
          </button>
        </div>
        
        {template.tags && template.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2 flex-shrink-0">
            {template.tags.map(tag => (
              <span key={tag} className="px-2.5 py-1 bg-[#5c6f7e]/50 text-xs font-medium text-gray-300 rounded-full capitalize">{tag}</span>
            ))}
          </div>
        )}

        <div className="flex-grow bg-[#212934] border border-[#5c6f7e] rounded-lg overflow-hidden flex flex-col min-h-0">
           <div className="flex justify-between items-center p-3 bg-[#212934] border-b border-[#5c6f7e]">
               <h3 className="font-mono text-sm text-gray-400">Template Content</h3>
               <button
                    onClick={handleCopy}
                    className={`flex items-center gap-2 px-3 py-1 font-semibold rounded-md border transition-all text-sm ${
                    isCopied
                        ? 'bg-green-600 text-white border-green-500'
                        : 'bg-[#333e48] text-gray-200 border-[#5c6f7e] hover:bg-[#5c6f7e]'
                    }`}
                >
                    <Icon
                    path={
                        isCopied
                        ? 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' // Checkmark
                        : 'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-5zm0 16H8V7h11v14z' // Copy
                    }
                    className="w-5 h-5"
                    />
                    {isCopied ? 'Copied!' : 'Copy'}
              </button>
           </div>
           <div className="flex-grow overflow-auto p-4">
               <pre className="whitespace-pre-wrap leading-relaxed text-sm font-mono text-gray-200">
                {template.content}
               </pre>
           </div>
        </div>

        <div className="flex justify-end gap-4 mt-8 flex-shrink-0">
          <button onClick={onClose} className="px-6 py-2 bg-[#5c6f7e] text-white font-semibold rounded-lg hover:bg-[#95aac0] transition-all">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewTemplateModal;