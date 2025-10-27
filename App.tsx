import React, { useState, useCallback, useEffect } from 'react';
import { WizardStep, CommandScope, ArgStrategy, Message, Template, ToolType, EntityType, GeminiCommandConfig, ClaudeCodeConfig, OpenCodeConfig } from './types';
import { getNewTemplateContent } from './constants';
import ObjectiveStep from './components/ObjectiveStep';
import ConfigStep from './components/ConfigStep';
import RefineStep from './components/RefineStep';
import ToolSelectStep from './components/HomeStep';
import StartStep from './components/StartStep';
import TemplateListStep from './components/TemplateListStep';
import VariantObjectiveStep from './components/VariantObjectiveStep';
import SaveTemplateModal from './components/SaveTemplateModal';
import EditTemplateStep from './components/EditTemplateStep';
import Icon from './components/Icon';
import { generateInitialArtifact, refineArtifact, generateVariantFromTemplate } from './services/geminiService';
import { getTemplates, saveTemplates } from './services/templateService';
import YAML from 'js-yaml';


interface HistoryEntry {
  content: string;
  messages: Message[];
}

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<WizardStep>(WizardStep.Home);
  const [tool, setTool] = useState<ToolType | null>(null);
  const [entityType, setEntityType] = useState<EntityType | null>(null);

  // State for wizard inputs
  const [objective, setObjective] = useState<string>('');
  
  // State for configs
  const [geminiConfig, setGeminiConfig] = useState<GeminiCommandConfig>({
    objective: '', scope: CommandScope.Global, namespace: '', commandName: '', argStrategy: ArgStrategy.Injection, mcpServers: []
  });
  const [claudeConfig, setClaudeConfig] = useState<ClaudeCodeConfig>({
    objective: '', name: '', description: '', tools: 'Read, Write, Edit, Grep, Glob, Bash', entityType: EntityType.Agent, mcpServers: []
  });
  const [openCodeConfig, setOpenCodeConfig] = useState<OpenCodeConfig>({
    objective: '', description: '', mode: 'subagent', model: 'gemini-2.5-pro', tools: '{}', permissions: '{}', temperature: 0.5, entityType: EntityType.Agent, mcpServers: []
  });
  
  // State for generated content and chat history
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // State for templates
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  
  useEffect(() => {
    setTemplates(getTemplates());
  }, []);

  const currentHistoryEntry = history[historyIndex];
  const content = currentHistoryEntry?.content || '';
  const messages = currentHistoryEntry?.messages || [];
  const previousContent = historyIndex > 0 ? history[historyIndex - 1].content : null;
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const resetWizardState = () => {
    setTool(null);
    setEntityType(null);
    setObjective('');
    setGeminiConfig({ objective: '', scope: CommandScope.Global, namespace: '', commandName: '', argStrategy: ArgStrategy.Injection, mcpServers: [] });
    setClaudeConfig({ objective: '', name: '', description: '', tools: 'Read, Write, Edit, Grep, Glob, Bash', entityType: EntityType.Agent, mcpServers: [] });
    setOpenCodeConfig({ objective: '', description: '', mode: 'subagent', model: 'gemini-2.5-pro', tools: '{}', permissions: '{}', temperature: 0.5, entityType: EntityType.Agent, mcpServers: [] });
    setHistory([]);
    setHistoryIndex(-1);
    setSelectedTemplateId(null);
    setEditingTemplate(null);
  }

  const handleGoHome = () => {
    resetWizardState();
    setCurrentStep(WizardStep.Home);
  };

  const handleSelectTemplate = (id: string) => {
    const template = templates.find(t => t.id === id);
    if (!template) return;
    setSelectedTemplateId(id);
    setObjective('');
    setCurrentStep(WizardStep.VariantObjective);
  };

  const getCurrentConfig = () => {
      switch(tool) {
          case ToolType.ClaudeCode: return { ...claudeConfig, objective, entityType };
          case ToolType.OpenCode: return { ...openCodeConfig, objective, entityType };
          case ToolType.GeminiCLI:
          default:
              return { ...geminiConfig, objective };
      }
  }

  const handleGenerate = async () => {
    if (!tool) return;
    setIsLoading(true);
    setCurrentStep(WizardStep.Refine);
    
    const config = getCurrentConfig();
    let generatedContent;

    if (selectedTemplateId) {
        const template = templates.find(t => t.id === selectedTemplateId);
        if(template) {
            generatedContent = await generateVariantFromTemplate(template.content, objective, tool, config);
        } else {
            // Failsafe
            generatedContent = await generateInitialArtifact(tool, config);
        }
    } else {
        generatedContent = await generateInitialArtifact(tool, config);
    }
    
    setHistory([{ content: generatedContent, messages: [] }]);
    setHistoryIndex(0);
    setIsLoading(false);
  };
  
  const handleSendMessage = useCallback(async (userInput: string) => {
    if (!currentHistoryEntry || !tool) return;
    
    setIsLoading(true);
    const userMessage: Message = { role: 'user', content: userInput };
    const apiMessages = [...currentHistoryEntry.messages, userMessage];
    
    const refinedContent = await refineArtifact(currentHistoryEntry.content, apiMessages, tool);

    const modelMessage: Message = { role: 'model', content: "I have updated the artifact based on your request. Any other changes?" };
    
    const newEntry: HistoryEntry = {
      content: refinedContent,
      messages: [...apiMessages, modelMessage],
    };
    
    const newHistory = [...history.slice(0, historyIndex + 1), newEntry];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setIsLoading(false);
  }, [history, historyIndex, currentHistoryEntry, tool]);
  
  const handleUndo = () => { if (canUndo) setHistoryIndex(historyIndex - 1); };
  const handleRedo = () => { if (canRedo) setHistoryIndex(historyIndex + 1); };

  const handleSaveTemplate = (name: string, description: string, tags: string[]) => {
    if (!tool) return;
    const newTemplate: Template = {
      id: Date.now().toString(),
      name, description, content, tags, tool, entityType: entityType || undefined,
    };
    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    saveTemplates(updatedTemplates);
    setIsSaveModalOpen(false);
  };

  const handleDeleteTemplate = (id: string) => {
    if (window.confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      const updatedTemplates = templates.filter(t => t.id !== id);
      setTemplates(updatedTemplates);
      saveTemplates(updatedTemplates);
    }
  };

  const handleStartEditTemplate = (id: string) => {
    const templateToEdit = templates.find(t => t.id === id);
    if (templateToEdit) {
      setEditingTemplate(templateToEdit);
      setCurrentStep(WizardStep.EditTemplate);
    }
  };

  const handleStartNewTemplate = () => {
    if (!tool) return;
    const newTemplate: Template = {
      id: Date.now().toString(),
      name: '',
      description: '',
      content: getNewTemplateContent(tool, entityType || EntityType.Command),
      tags: [],
      tool: tool,
      entityType: entityType || undefined
    };
    setEditingTemplate(newTemplate);
    setCurrentStep(WizardStep.EditTemplate);
  };

  const handleUpdateTemplate = (updatedTemplate: Template) => {
    const isExisting = templates.some(t => t.id === updatedTemplate.id);
    const updatedTemplates = isExisting
      ? templates.map(t => (t.id === updatedTemplate.id ? updatedTemplate : t))
      : [...templates, updatedTemplate];

    setTemplates(updatedTemplates);
    saveTemplates(updatedTemplates);
    setEditingTemplate(null);
    setCurrentStep(WizardStep.SelectTemplate);
  };

  const getFilename = (): string => {
    if (!tool) return "file.txt";
    switch (tool) {
        case ToolType.ClaudeCode:
            return `${claudeConfig.name || 'new-entity'}.md`;
        case ToolType.OpenCode: {
            // Extract description from frontmatter for a better name
             try {
                const frontmatter = YAML.load(content.split('---')[1]) as { description?: string };
                const safeName = frontmatter?.description?.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30) || 'new-agent';
                return `${safeName}.md`;
            } catch(e) {
                return 'new-agent.md';
            }
        }
        case ToolType.GeminiCLI:
        default:
            return `${geminiConfig.namespace}-${geminiConfig.commandName}.toml`;
    }
  }

  const renderStep = () => {
    if (!tool) {
      return <ToolSelectStep onSelectTool={(selectedTool) => { setTool(selectedTool); setCurrentStep(WizardStep.Start); }} />;
    }

    switch (currentStep) {
      case WizardStep.Start:
        return <StartStep 
                  tool={tool}
                  onSetEntityType={setEntityType}
                  onStartFromScratch={() => setCurrentStep(WizardStep.Objective)} 
                  onStartFromTemplate={() => setCurrentStep(WizardStep.SelectTemplate)}
                  onViewTemplates={() => setCurrentStep(WizardStep.SelectTemplate)}
                  onBack={handleGoHome}
                />;
      case WizardStep.Objective:
        return <ObjectiveStep 
                  objective={objective} 
                  setObjective={setObjective} 
                  onNext={() => setCurrentStep(WizardStep.Config)} 
                  onBack={() => setCurrentStep(WizardStep.Start)}
                  tool={tool}
                  entityType={entityType || undefined}
                />;
      case WizardStep.Config:
        return <ConfigStep 
                  tool={tool} entityType={entityType}
                  geminiConfig={geminiConfig} setGeminiConfig={setGeminiConfig}
                  claudeConfig={claudeConfig} setClaudeConfig={setClaudeConfig}
                  openCodeConfig={openCodeConfig} setOpenCodeConfig={setOpenCodeConfig}
                  onBack={() => selectedTemplateId ? setCurrentStep(WizardStep.VariantObjective) : setCurrentStep(WizardStep.Objective)}
                  onGenerate={handleGenerate}
                />;
      case WizardStep.SelectTemplate:
        return <TemplateListStep
                 templates={templates.filter(t => t.tool === tool)}
                 tool={tool}
                 onSelectTemplate={handleSelectTemplate}
                 onEditTemplate={handleStartEditTemplate}
                 onDeleteTemplate={handleDeleteTemplate}
                 onNewTemplate={handleStartNewTemplate}
                 onBack={() => setCurrentStep(WizardStep.Start)}
               />;
      case WizardStep.VariantObjective: {
        const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
        if (!selectedTemplate) {
          setCurrentStep(WizardStep.SelectTemplate);
          return null;
        }
        return <VariantObjectiveStep template={selectedTemplate} objective={objective} setObjective={setObjective} onNext={() => setCurrentStep(WizardStep.Config)} onBack={() => setCurrentStep(WizardStep.SelectTemplate)} />
      }
      case WizardStep.EditTemplate: {
        if (!editingTemplate) {
            setCurrentStep(WizardStep.SelectTemplate);
            return null;
        }
        return <EditTemplateStep
                    template={editingTemplate}
                    onUpdate={handleUpdateTemplate}
                    onCancel={() => { setEditingTemplate(null); setCurrentStep(WizardStep.SelectTemplate); }}
                    existingTemplates={templates}
                />
      }
      case WizardStep.Refine:
        if (isLoading && historyIndex < 0) return null;

        return <RefineStep 
                 content={content}
                 previousContent={previousContent}
                 messages={messages}
                 onSendMessage={handleSendMessage}
                 isLoading={isLoading}
                 onBack={() => setCurrentStep(WizardStep.Config)}
                 onGoHome={handleGoHome}
                 onUndo={handleUndo} canUndo={canUndo}
                 onRedo={handleRedo} canRedo={canRedo}
                 filename={getFilename()}
                 onSaveAsTemplate={() => setIsSaveModalOpen(true)}
                 tool={tool}
                />;
      default:
        return <ToolSelectStep onSelectTool={(selectedTool) => { setTool(selectedTool); setCurrentStep(WizardStep.Start); }} />;
    }
  };

  return (
    <>
      <SaveTemplateModal 
        isOpen={isSaveModalOpen} 
        onClose={() => setIsSaveModalOpen(false)} 
        onSave={handleSaveTemplate}
        templates={templates}
        content={content}
      />
      <div className="min-h-screen bg-[#212934] text-gray-200 flex flex-col p-6 sm:p-8">
        <header className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-[#333e48] rounded-lg">
            <Icon path="M15 4V3H9v1H4v2h1v13c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V6h1V4h-5zm-6 11H7v-2h2v2zm4 0h-2v-2h2v2z" className="w-8 h-8 text-[#e2a32d]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#e2a32d]">AI Developer Tool Generator</h1>
            <p className="text-[#95aac0]">Create commands & agents for Gemini CLI, Claude-Code, and OpenCode.</p>
          </div>
        </header>
        
        <main className="flex-grow bg-[#333e48] p-6 rounded-xl border border-[#5c6f7e] shadow-2xl shadow-black/20">
          {isLoading && (historyIndex === -1) ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#e2a32d]"></div>
              <p className="text-lg text-gray-200">Generating your artifact...</p>
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