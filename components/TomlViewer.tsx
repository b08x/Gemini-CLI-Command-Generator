import React from 'react';
import { diffLines } from 'diff';

interface TomlViewerProps {
  newToml: string;
  oldToml: string | null;
}

const TomlViewer: React.FC<TomlViewerProps> = ({ newToml, oldToml }) => {
  // If oldToml is null (initial generation), compare newToml to itself to show no changes.
  const changes = diffLines(oldToml ?? newToml, newToml);

  return (
    <div className="w-full h-full p-4 font-mono text-sm bg-[#212934] border border-[#5c6f7e] rounded-lg overflow-auto">
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
  );
};

export default TomlViewer;
