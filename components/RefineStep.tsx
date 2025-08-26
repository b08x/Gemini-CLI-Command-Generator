import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import TomlViewer from './TomlViewer';
import ChatMessage from './ChatMessage';
import Icon from './Icon';

interface RefineStepProps {
  tomlContent: string;
  previousTomlContent: string | null;
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onBack: () => void;
  onGoHome: () => void;
  onUndo: () => void;
  canUndo: boolean;
  onRedo: () => void;
  canRedo: boolean;
  commandName: string;
  namespace: string;
}

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e2a32d]"></div>
  </div>
);

const RefineStep: React.FC<RefineStepProps> = ({
  tomlContent, previousTomlContent, messages, onSendMessage, isLoading, onBack, onGoHome, onUndo, canUndo, onRedo, canRedo, commandName, namespace
}) => {
  const [userInput, setUserInput] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (userInput.trim()) {
      onSendMessage(userInput);
      setUserInput('');
    }
  };

  const handleCopy = () => {
    if (!tomlContent) return;
    navigator.clipboard.writeText(tomlContent).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error("Failed to copy TOML content: ", err);
      alert("Failed to copy to clipboard.");
    });
  };

  const handleDownload = () => {
    const blob = new Blob([tomlContent], { type: 'text/toml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${namespace}-${commandName}.toml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)] animate-fade-in">
      {/* Left Panel: Editor and Controls */}
      <div className="flex flex-col bg-[#333e48] rounded-lg border border-[#5c6f7e] overflow-hidden">
        <div className="flex justify-between items-center p-3 bg-[#212934] border-b border-[#5c6f7e]">
           <div className="flex items-center gap-2">
             <button onClick={onGoHome} className="flex items-center gap-2 px-3 py-1 bg-[#333e48] text-gray-200 font-semibold rounded-md border border-[#5c6f7e] hover:bg-[#5c6f7e] transition-all text-sm">
               <Icon path="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" className="w-5 h-5" />
               Home
             </button>
             <button onClick={onBack} className="flex items-center gap-2 px-3 py-1 bg-[#333e48] text-gray-200 font-semibold rounded-md border border-[#5c6f7e] hover:bg-[#5c6f7e] transition-all text-sm">
               <Icon path="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" className="w-5 h-5" />
               Back to Config
             </button>
           </div>
           <h3 className="font-mono text-sm text-green-400">{`${namespace}/${commandName}.toml`}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={isLoading || !tomlContent}
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
              <button onClick={handleDownload} className="flex items-center gap-2 px-3 py-1 bg-[#c36e26] text-white font-semibold rounded-md hover:bg-[#b56524] transition-all text-sm">
                <Icon path="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z" className="w-5 h-5" />
                Download
              </button>
           </div>
        </div>
        <div className="flex-grow p-2 min-h-0">
            <TomlViewer newToml={tomlContent} oldToml={previousTomlContent} />
        </div>
        <div className="flex justify-end items-center gap-2 p-3 bg-[#212934] border-t border-[#5c6f7e]">
            <button onClick={onUndo} disabled={!canUndo || isLoading} className="flex items-center gap-2 px-3 py-1 bg-[#333e48] text-gray-200 font-semibold rounded-md border border-[#5c6f7e] hover:bg-[#5c6f7e] disabled:bg-[#333e48] disabled:text-[#95aac0] disabled:cursor-not-allowed disabled:border-[#5c6f7e] transition-all text-sm">
                <Icon path="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" className="w-5 h-5"/>
                Undo
             </button>
             <button onClick={onRedo} disabled={!canRedo || isLoading} className="flex items-center gap-2 px-3 py-1 bg-[#333e48] text-gray-200 font-semibold rounded-md border border-[#5c6f7e] hover:bg-[#5c6f7e] disabled:bg-[#333e48] disabled:text-[#95aac0] disabled:cursor-not-allowed disabled:border-[#5c6f7e] transition-all text-sm">
                <Icon path="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z" className="w-5 h-5"/>
                Redo
             </button>
        </div>
      </div>
      
      {/* Right Panel: Chat */}
      <div className="flex flex-col bg-[#333e48] rounded-lg border border-[#5c6f7e] overflow-hidden">
        <div className="p-3 bg-[#212934] border-b border-[#5c6f7e]">
            <h3 className="font-semibold text-[#e2a32d]">Refine with AI</h3>
        </div>
        <div className="flex-grow overflow-y-auto p-4">
          <ChatMessage message={{role: 'model', content: "Here is the initial version of your command. How would you like to refine it?\n\nFor example: 'Add a shell command to show the current git branch.' or 'Make the prompt more formal.'"}} />
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}
          {isLoading && <LoadingSpinner />}
          <div ref={chatEndRef} />
        </div>
        <div className="p-4 border-t border-[#5c6f7e] bg-[#212934]">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              placeholder="e.g., Change the description..."
              className="w-full p-3 bg-[#333e48] border border-[#5c6f7e] rounded-lg outline-none focus:ring-2 focus:ring-[#e2a32d] text-gray-200 placeholder:text-[#95aac0]"
              disabled={isLoading}
            />
            <button onClick={handleSend} disabled={isLoading || !userInput.trim()} className="p-3 bg-[#c36e26] rounded-lg hover:bg-[#b56524] disabled:bg-[#5c6f7e] disabled:cursor-not-allowed transition-all">
              <Icon path="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefineStep;
