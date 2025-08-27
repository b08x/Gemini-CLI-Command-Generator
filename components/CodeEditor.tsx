import React, { useRef, useLayoutEffect } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, readOnly = false, placeholder }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Reset height to recalculate
      textarea.style.height = `${textarea.scrollHeight}px`; // Set to content height
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      readOnly={readOnly}
      placeholder={placeholder}
      className="w-full p-4 font-mono text-sm bg-[#212934] border border-[#5c6f7e] rounded-lg focus:ring-2 focus:ring-[#e2a32d] focus:border-[#e2a32d] outline-none resize-none leading-relaxed text-gray-200 placeholder:text-[#95aac0] overflow-hidden"
      spellCheck="false"
      rows={1}
    />
  );
};

export default CodeEditor;
