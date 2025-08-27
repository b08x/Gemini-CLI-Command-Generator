
import React, { useState, useCallback, useEffect } from 'react';
import { WizardStep, CommandScope, ArgStrategy, Message, CommandConfig, Template } from './types';
import ObjectiveStep from './components/ObjectiveStep';
import ConfigStep from './components/ConfigStep';
import RefineStep from './components/RefineStep';
import HomeStep from './components/HomeStep';
import TemplateListStep from './components/TemplateListStep';
import VariantObjectiveStep from './components/VariantObjectiveStep';
import SaveTemplateModal from './components/SaveTemplateModal';
import Icon from './components/Icon';
import { generateInitialToml, refineToml, generateVariantFromTemplate } from './services/geminiService';
import { getTemplates, saveTemplates } from './services/templateService';

interface HistoryEntry {
  toml: string;
  messages: Message[];
}

const parseConfigFromToml = (toml: string): Partial<CommandConfig> => {
    const config: Partial<CommandConfig> = {};

    // Regex to capture: optional path prefix, namespace, and command name from the TOML comment
    const pathCommentRegex = /#\s*(?:(~|\[project\])\/.+\/)?([^/]+)\/([^/.\s]+)\.toml/;
    const pathMatch = toml.match(pathCommentRegex);

    if (pathMatch) {
        const scopeIdentifier = pathMatch[1]; // '~' or '[project]' or undefined
        config.scope = scopeIdentifier === '~' ? CommandScope.Global : CommandScope.Project; // Default to Project if no identifier
        config.namespace = pathMatch[2];
        config.commandName = pathMatch[3];
    }

    // Parse ArgStrategy from prompt
    const promptMatch = toml.match(/prompt\s*=\s*"""([\s\S]*?)"""/);
    if (promptMatch && promptMatch[1]) {
        const promptContent = promptMatch[1];
        if (promptContent.includes('{{args}}')) {
            config.argStrategy = ArgStrategy.Injection;
        } else {
            config.argStrategy = ArgStrategy.Default;
        }
    }

    return config;
};

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<WizardStep>(WizardStep.Home);

  // State for wizard inputs
  const [objective, setObjective] = useState<string>('');
  const [scope, setScope] = useState<CommandScope>(CommandScope.Global);
  const [namespace, setNamespace] = useState<string>('');
  const [commandName, setCommandName] = useState<string>('');
  const [argStrategy, setArgStrategy] = useState<ArgStrategy>(ArgStrategy.Injection);
  const [mcpServers, setMcpServers] = useState<string[]>([]);
  
  // State for generated content and chat history
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // State for templates
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  
  useEffect(() => {
    setTemplates(getTemplates());
  }, []);

  // Derived state from history
  const currentHistoryEntry = history[historyIndex];
  const tomlContent = currentHistoryEntry?.toml || '';
  const messages = currentHistoryEntry?.messages || [];
  const previousTomlContent = historyIndex > 0 ? history[historyIndex - 1].toml : null;
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const resetWizardState = () => {
    setObjective('');
    setScope(CommandScope.Global);
    setNamespace('');
    setCommandName('');
    setArgStrategy(ArgStrategy.Injection);
    setMcpServers([]);
    setHistory([]);
    setHistoryIndex(-1);
    setSelectedTemplateId(null);
  }

  const handleGoHome = () => {
    // The window.confirm dialog can be unreliable in certain sandboxed environments,
    // causing the button to appear to do nothing. Removing it ensures functionality.
    // A custom modal could be added back later if a confirmation is desired.
    resetWizardState();
    setCurrentStep(WizardStep.Home);
  };

  const handleSelectTemplate = (id: string) => {
    const template = templates.find(t => t.id === id);
    if (!template) return;

    const parsedConfig = parseConfigFromToml(template.toml);

    // Pre-fill state for the ConfigStep
    setScope(parsedConfig.scope || CommandScope.Global);
    setNamespace(parsedConfig.namespace || '');
    setCommandName(parsedConfig.commandName || '');
    setArgStrategy(parsedConfig.argStrategy || ArgStrategy.Injection);
    setMcpServers([]); // Templates don't store MCP servers

    setSelectedTemplateId(id);
    setObjective(''); // Clear objective for the new variant
    setCurrentStep(WizardStep.VariantObjective);
  };

  const handleGenerateInitial = useCallback(async () => {
    setIsLoading(true);
    setCurrentStep(WizardStep.Refine);
    const config: CommandConfig = { objective, scope, namespace, commandName, argStrategy, mcpServers };
    const generatedToml = await generateInitialToml(config);
    setHistory([{ toml: generatedToml, messages: [] }]);
    setHistoryIndex(0);
    setIsLoading(false);
  }, [objective, scope, namespace, commandName, argStrategy, mcpServers]);

  const handleGenerateVariant = useCallback(async () => {
    const template = templates.find(t => t.id === selectedTemplateId);
    if (!template || !objective) return;

    setIsLoading(true);
    setCurrentStep(WizardStep.Refine);
    
    const config: CommandConfig = { objective, scope, namespace, commandName, argStrategy, mcpServers };

    const generatedToml = await generateVariantFromTemplate(template.toml, objective, config);
    setHistory([{ toml: generatedToml, messages: [] }]);
    setHistoryIndex(0);
    setIsLoading(false);
  }, [objective, templates, selectedTemplateId, scope, namespace, commandName, argStrategy, mcpServers]);

  const handleGenerate = () => {
    if (selectedTemplateId) {
        handleGenerateVariant();
    } else {
        handleGenerateInitial();
    }
  };

  const handleSendMessage = useCallback(async (userInput: string) => {
    if (!currentHistoryEntry) return;
    
    setIsLoading(true);

    const userMessage: Message = { role: 'user', content: userInput };
    const apiMessages = [...currentHistoryEntry.messages, userMessage];
    
    const refinedToml = await refineToml(currentHistoryEntry.toml, apiMessages);

    const modelMessage: Message = { role: 'model', content: "I have updated the TOML based on your request. Any other changes?" };
    const newFullMessages = [...apiMessages, modelMessage];
    
    const newEntry: HistoryEntry = {
      toml: refinedToml,
      messages: newFullMessages,
    };
    
    const newHistory = [...history.slice(0, historyIndex + 1), newEntry];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    setIsLoading(false);
  }, [history, historyIndex, currentHistoryEntry]);
  
  const handleUndo = () => {
    if (canUndo) setHistoryIndex(historyIndex - 1);
  };

  const handleRedo = () => {
    if (canRedo) setHistoryIndex(historyIndex + 1);
  };

  const handleSaveTemplate = (name: string, description: string) => {
    const newTemplate: Template = {
      id: Date.now().toString(),
      name,
      description,
      toml: tomlContent,
    };
    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    saveTemplates(updatedTemplates);
    setIsSaveModalOpen(false);
  };

  const renderStep = () => {
    switch (currentStep) {
      case WizardStep.Home:
        return <HomeStep onStartFromScratch={() => setCurrentStep(WizardStep.Objective)} onStartFromTemplate={() => setCurrentStep(WizardStep.SelectTemplate)} />;
      case WizardStep.Objective:
        return <ObjectiveStep objective={objective} setObjective={setObjective} onNext={() => setCurrentStep(WizardStep.Config)} onBack={() => setCurrentStep(WizardStep.Home)} />;
      case WizardStep.Config:
        const fromTemplateFlow = !!selectedTemplateId;
        return <ConfigStep 
                  scope={scope} setScope={setScope}
                  namespace={namespace} setNamespace={setNamespace}
                  commandName={commandName} setCommandName={setCommandName}
                  argStrategy={argStrategy} setArgStrategy={setArgStrategy}
                  mcpServers={mcpServers} setMcpServers={setMcpServers}
                  onBack={() => setCurrentStep(fromTemplateFlow ? WizardStep.VariantObjective : WizardStep.Objective)}
                  onGenerate={handleGenerate}
                />;
      case WizardStep.SelectTemplate:
        return <TemplateListStep templates={templates} onSelectTemplate={handleSelectTemplate} onBack={() => setCurrentStep(WizardStep.Home)} />;
      case WizardStep.VariantObjective: {
        const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
        if (!selectedTemplate) {
          setCurrentStep(WizardStep.SelectTemplate); // safety check
          return null;
        }
        return <VariantObjectiveStep template={selectedTemplate} objective={objective} setObjective={setObjective} onNext={() => setCurrentStep(WizardStep.Config)} onBack={() => setCurrentStep(WizardStep.SelectTemplate)} />
      }
      case WizardStep.Refine:
        if (isLoading && historyIndex < 0) return null; // Prevents flashing old content on first load

        return <RefineStep 
                 tomlContent={tomlContent}
                 previousTomlContent={previousTomlContent}
                 messages={messages}
                 onSendMessage={handleSendMessage}
                 isLoading={isLoading}
                 onBack={() => setCurrentStep(WizardStep.Config)}
                 onGoHome={handleGoHome}
                 onUndo={handleUndo}
                 canUndo={canUndo}
                 onRedo={handleRedo}
                 canRedo={canRedo}
                 commandName={commandName}
                 namespace={namespace}
                 onSaveAsTemplate={() => setIsSaveModalOpen(true)}
                />;
      default:
        return null;
    }
  };

  return (
    <>
      <SaveTemplateModal 
        isOpen={isSaveModalOpen} 
        onClose={() => setIsSaveModalOpen(false)} 
        onSave={handleSaveTemplate}
        templates={templates}
        tomlContent={tomlContent}
      />
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
          {isLoading && (historyIndex === -1) ? (
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
    </>
  );
};

export default App;
