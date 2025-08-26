import React, { useState, useCallback } from 'react';
import { WizardStep, CommandScope, ArgStrategy, Message, CommandConfig } from './types';
import ObjectiveStep from './components/ObjectiveStep';
import ConfigStep from './components/ConfigStep';
import RefineStep from './components/RefineStep';
import Icon from './components/Icon';
import { generateInitialToml, refineToml } from './services/geminiService';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<WizardStep>(WizardStep.Objective);

  // State for wizard inputs
  const [objective, setObjective] = useState<string>('');
  const [scope, setScope] = useState<CommandScope>(CommandScope.Global);
  const [namespace, setNamespace] = useState<string>('');
  const [commandName, setCommandName] = useState<string>('');
  const [argStrategy, setArgStrategy] = useState<ArgStrategy>(ArgStrategy.Injection);
  const [mcpServers, setMcpServers] = useState<string[]>([]);
  
  // State for generated content and chat
  const [tomlHistory, setTomlHistory] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const currentToml = tomlHistory[tomlHistory.length - 1] || '';
  const previousToml = tomlHistory.length > 1 ? tomlHistory[tomlHistory.length - 2] : null;
  
  const handleNextFromObjective = () => setCurrentStep(WizardStep.Config);
  
  const handleBackToObjective = () => setCurrentStep(WizardStep.Objective);
  
  const handleBackToConfig = () => {
      setMessages([]);
      setTomlHistory([]);
      setCurrentStep(WizardStep.Config);
  };

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setCurrentStep(WizardStep.Refine);
    const config: CommandConfig = { objective, scope, namespace, commandName, argStrategy, mcpServers };
    const generatedToml = await generateInitialToml(config);
    setTomlHistory([generatedToml]);
    setIsLoading(false);
  }, [objective, scope, namespace, commandName, argStrategy, mcpServers]);

  const handleSendMessage = useCallback(async (userInput: string) => {
    const newMessages: Message[] = [...messages, { role: 'user', content: userInput }];
    setMessages(newMessages);
    setIsLoading(true);

    const refinedToml = await refineToml(currentToml, newMessages);
    setTomlHistory(prev => [...prev, refinedToml]);
    setMessages([...newMessages, { role: 'model', content: "I have updated the TOML based on your request. Any other changes?" }]);
    
    setIsLoading(false);
  }, [messages, currentToml]);

  const handleUndo = () => {
    if (tomlHistory.length > 1) {
      setTomlHistory(prev => prev.slice(0, -1));
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case WizardStep.Objective:
        return <ObjectiveStep objective={objective} setObjective={setObjective} onNext={handleNextFromObjective} />;
      case WizardStep.Config:
        return <ConfigStep 
                  scope={scope} setScope={setScope}
                  namespace={namespace} setNamespace={setNamespace}
                  commandName={commandName} setCommandName={setCommandName}
                  argStrategy={argStrategy} setArgStrategy={setArgStrategy}
                  mcpServers={mcpServers} setMcpServers={setMcpServers}
                  onBack={handleBackToObjective}
                  onGenerate={handleGenerate}
                />;
      case WizardStep.Refine:
        return <RefineStep 
                 tomlContent={currentToml}
                 previousTomlContent={previousToml}
                 messages={messages}
                 onSendMessage={handleSendMessage}
                 isLoading={isLoading}
                 onBack={handleBackToConfig}
                 onUndo={handleUndo}
                 canUndo={tomlHistory.length > 1}
                 commandName={commandName}
                 namespace={namespace}
                />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#212934] text-gray-200 flex flex-col p-6 sm:p-8">
      <header className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-[#333e48] rounded-lg">
          <Icon path="M15 4V3H9v1H4v2h1v13c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V6h1V4h-5zm-6 11H7v-2h2v2zm4 0h-2v-2h2v2z" className="w-8 h-8 text-[#e2a32d]" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#e2a32d]">Gemini CLI Command Generator</h1>
          <p className="text-[#95aac0]">Create custom commands with a guided, AI-powered workflow.</p>
        </div>
      </header>
      
      <main className="flex-grow bg-[#333e48] p-6 rounded-xl border border-[#5c6f7e] shadow-2xl shadow-black/20">
        {isLoading && currentStep === WizardStep.Refine && !messages.length ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#e2a32d]"></div>
            <p className="text-lg text-gray-200">Generating your command...</p>
          </div>
        ) : (
          renderStep()
        )}
      </main>

      <footer className="text-center text-[#95aac0] mt-8 text-sm">
        <p>Built with React, Tailwind CSS, and the Gemini API.</p>
      </footer>
    </div>
  );
};

export default App;