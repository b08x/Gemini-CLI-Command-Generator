
import React from 'react';
import { diffLines } from 'diff';
import Icon from './Icon';
import { TomlValidationResult } from '../services/tomlValidationService';

interface CodeViewerProps {
  newContent: string;
  oldContent: string | null;
  validationResult: TomlValidationResult;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ newContent, oldContent, validationResult }) => {
  const isErrorState = newContent.trim().startsWith('# ERROR:');
  const isInvalidToml = !validationResult.isValid;

  const changes = diffLines(oldContent ?? newContent, newContent);

  const containerClasses = `w-full h-full font-mono text-sm bg-[#212934] border rounded-lg overflow-hidden flex flex-col
    ${isErrorState ? 'border-red-500/50' : isInvalidToml ? 'border-yellow-500/50' : 'border-[#5c6f7e]'}`;

  return (
    <div className={containerClasses}>
      {isErrorState && (
        <div className="flex items-center gap-3 p-3 bg-red-900/40 text-red-200 border-b border-red-500/50 flex-shrink-0">
          <Icon path="M12 2L1 21h22L12 2zm0 16c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-4v-4h2v4h-2z" className="w-6 h-6" />
          <h3 className="font-bold text-base">Generation Failed</h3>
        </div>
      )}
      {isInvalidToml && !isErrorState && (
         <div className="flex items-center gap-3 p-3 bg-yellow-900/40 text-yellow-200 border-b border-yellow-500/50 flex-shrink-0">
          <Icon path="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" className="w-6 h-6" />
          <div>
            <h3 className="font-bold text-base">Structure Warning</h3>
            <p className="text-sm">{validationResult.message}</p>
          </div>
        </div>
      )}
      <div className="flex-grow overflow-auto p-4">
        <pre className="whitespace-pre-wrap leading-relaxed">
          {changes.map((part, i) => {
            const style = {
              backgroundColor: part.added ? 'rgba(16, 185, 129, 0.2)' : part.removed ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
              textDecoration: part.removed ? 'line-through' : 'none',
              color: part.removed ? 'rgba(239, 68, 68, 0.8)' : '#e5e7eb',
            };
            
            return (
              <span key={i} style={style}>
                {part.value}
              </span>
            );
          })}
        </pre>
      </div>
    </div>
  );
};

export default CodeViewer;
