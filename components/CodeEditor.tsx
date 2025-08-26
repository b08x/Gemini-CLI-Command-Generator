import React from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, readOnly = false, placeholder }) => {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      readOnly={readOnly}
      placeholder={placeholder}
      className="w-full h-full p-4 font-mono text-sm bg-[#212934] border border-[#5c6f7e] rounded-lg focus:ring-2 focus:ring-[#e2a32d] focus:border-[#e2a32d] outline-none resize-none leading-relaxed text-gray-200 placeholder:text-[#95aac0]"
      spellCheck="false"
    />
  );
};

export default CodeEditor;