
import React from 'react';
import { CommandScope, ArgStrategy, ToolType, EntityType, GeminiCommandConfig, ClaudeCodeConfig, OpenCodeConfig } from '../types';
import { MCP_SERVERS } from '../constants';

// --- Gemini Config Form ---
const GeminiConfigForm: React.FC<{
  config: GeminiCommandConfig,
  setConfig: (c: GeminiCommandConfig) => void
}> = ({ config, setConfig }) => {
  const { scope, namespace, commandName, argStrategy } = config;
  const scopePath = scope === CommandScope.Global ? '~/.gemini/commands/' : '[project]/.gemini/commands/';
  const fullPath = `${scopePath}${namespace}/${commandName}.toml`;

  return <>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h3 className="font-semibold text-lg mb-2 text-[#e2a32d]">Command Scope</h3>
        <div className="flex flex-col gap-3">
          {(Object.values(CommandScope)).map(s => (
            <label key={s} className="flex items-center p-4 bg-[#333e48] rounded-lg border-2 border-[#5c6f7e] has-[:checked]:border-[#e2a32d] cursor-pointer transition-colors">
              <input type="radio" name="scope" value={s} checked={scope === s} onChange={() => setConfig({...config, scope: s})} className="w-5 h-5 accent-[#e2a32d]"/>
              <span className="ml-4"><span className="font-bold text-gray-200">{s}</span><p className="text-sm text-[#95aac0]">{s === CommandScope.Global ? 'Available everywhere' : 'Specific to this project'}</p></span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-lg mb-2 text-[#e2a32d]">Command Naming</h3>
        <div className="flex flex-col gap-3">
          <input type="text" value={namespace} onChange={e => setConfig({...config, namespace: e.target.value})} placeholder="Namespace (e.g., git)" className="p-3 bg-[#333e48] border border-[#5c6f7e] rounded-lg outline-none focus:ring-2 focus:ring-[#e2a32d] placeholder:text-[#95aac0]" />
          <input type="text" value={commandName} onChange={e => setConfig({...config, commandName: e.target.value})} placeholder="Command name (e.g., commit)" className="p-3 bg-[#333e48] border border-[#5c6f7e] rounded-lg outline-none focus:ring-2 focus:ring-[#e2a32d] placeholder:text-[#95aac0]" />
        </div>
        <div className="mt-4 p-3 bg-[#212934] rounded-lg text-sm font-mono">
          <p className="text-[#95aac0]">Path: <span className="text-green-400">{fullPath}</span></p>
          <p className="text-[#95aac0]">Usage: <span className="text-[#e2a32d]">g {namespace}:{commandName}</span></p>
        </div>
      </div>
    </div>
    <div>
        <h3 className="font-semibold text-lg mb-2 text-[#e2a32d]">Argument Strategy</h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.values(ArgStrategy)).map(as => (
            <label key={as} className="flex flex-col p-4 bg-[#333e48] rounded-lg border-2 border-[#5c6f7e] has-[:checked]:border-[#e2a32d] cursor-pointer transition-colors">
              <div className="flex items-center">
                  <input type="radio" name="argStrategy" value={as} checked={argStrategy === as} onChange={() => setConfig({...config, argStrategy: as})} className="w-5 h-5 accent-[#e2a32d]"/>
                  <span className="ml-3 font-bold text-gray-200">{as}</span>
              </div>
               <p className="text-sm text-[#95aac0] mt-2">
                  {as === ArgStrategy.Injection ? 'Best for simple, single inputs.' : as === ArgStrategy.Default ? 'For complex flags and multiple args.' : 'Command takes no direct input.'}
               </p>
            </label>
          ))}
        </div>
    </div>
  </>
};

// --- Claude-Code Config Form ---
const ClaudeCodeConfigForm: React.FC<{
  config: ClaudeCodeConfig,
  setConfig: (c: ClaudeCodeConfig) => void,
  entityType: EntityType
}> = ({ config, setConfig, entityType }) => {
  const { name, description, tools } = config;
  return <>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       <div>
        <label htmlFor="cc-name" className="block text-sm font-medium text-gray-300 mb-2">{entityType} Name</label>
        <input id="cc-name" type="text" value={name} onChange={e => setConfig({...config, name: e.target.value})} placeholder="e.g., code-reviewer" className="p-3 w-full bg-[#333e48] border border-[#5c6f7e] rounded-lg outline-none focus:ring-2 focus:ring-[#e2a32d] placeholder:text-[#95aac0]" />
      </div>
      <div>
        <label htmlFor="cc-tools" className="block text-sm font-medium text-gray-300 mb-2">Tools</label>
        <input id="cc-tools" type="text" value={tools} onChange={e => setConfig({...config, tools: e.target.value})} placeholder="e.g., Read, Write, Bash" className="p-3 w-full bg-[#333e48] border border-[#5c6f7e] rounded-lg outline-none focus:ring-2 focus:ring-[#e2a32d] placeholder:text-[#95aac0]" />
         <p className="text-xs text-[#95aac0] mt-2">Comma-separated list of required tools.</p>
      </div>
    </div>
    <div>
      <label htmlFor="cc-desc" className="block text-sm font-medium text-gray-300 mb-2">Invocation Description</label>
      <input id="cc-desc" type="text" value={description} onChange={e => setConfig({...config, description: e.target.value})} placeholder={`When to invoke this ${entityType.toLowerCase()}`} className="p-3 w-full bg-[#333e48] border border-[#5c6f7e] rounded-lg outline-none focus:ring-2 focus:ring-[#e2a32d] placeholder:text-[#95aac0]" />
      <p className="text-xs text-[#95aac0] mt-2">A concise, one-sentence trigger description.</p>
    </div>
  </>;
};

// --- OpenCode Config Form ---
const OpenCodeConfigForm: React.FC<{
  config: OpenCodeConfig,
  setConfig: (c: OpenCodeConfig) => void
}> = ({ config, setConfig }) => {
  const { description, mode, model, tools, permissions, temperature } = config;
  return <>
    <div>
        <label htmlFor="oc-desc" className="block text-sm font-medium text-gray-300 mb-2">Invocation Description</label>
        <input id="oc-desc" type="text" value={description} onChange={e => setConfig({...config, description: e.target.value})} placeholder="e.g., A security auditor agent" className="p-3 w-full bg-[#333e48] border border-[#5c6f7e] rounded-lg outline-none focus:ring-2 focus:ring-[#e2a32d] placeholder:text-[#95aac0]" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label htmlFor="oc-model" className="block text-sm font-medium text-gray-300 mb-2">Model</label>
        <input id="oc-model" type="text" value={model} onChange={e => setConfig({...config, model: e.target.value})} placeholder="e.g., gemini-2.5-pro" className="p-3 w-full bg-[#333e48] border border-[#5c6f7e] rounded-lg outline-none focus:ring-2 focus:ring-[#e2a32d] placeholder:text-[#95aac0]" />
      </div>
      <div>
          <h3 className="font-medium text-gray-300 mb-2">Agent Mode</h3>
          <div className="flex gap-3">
            {(['primary', 'subagent', 'all'] as const).map(m => (
              <label key={m} className="flex items-center p-3 flex-1 bg-[#333e48] rounded-lg border-2 border-[#5c6f7e] has-[:checked]:border-[#e2a32d] cursor-pointer transition-colors">
                <input type="radio" name="oc-mode" value={m} checked={mode === m} onChange={() => setConfig({...config, mode: m})} className="w-5 h-5 accent-[#e2a32d]"/>
                <span className="ml-3 font-bold text-gray-200 capitalize">{m}</span>
              </label>
            ))}
          </div>
      </div>
    </div>
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label htmlFor="oc-tools" className="block text-sm font-medium text-gray-300 mb-2">Tools (JSON)</label>
        <input id="oc-tools" type="text" value={tools} onChange={e => setConfig({...config, tools: e.target.value})} placeholder='e.g., {"Read": true}' className="p-3 w-full bg-[#333e48] border border-[#5c6f7e] rounded-lg outline-none focus:ring-2 focus:ring-[#e2a32d] placeholder:text-[#95aac0]" />
      </div>
      <div>
        <label htmlFor="oc-permissions" className="block text-sm font-medium text-gray-300 mb-2">Permissions (JSON)</label>
        <input id="oc-permissions" type="text" value={permissions} onChange={e => setConfig({...config, permissions: e.target.value})} placeholder='e.g., {"Edit": "ask"}' className="p-3 w-full bg-[#333e48] border border-[#5c6f7e] rounded-lg outline-none focus:ring-2 focus:ring-[#e2a32d] placeholder:text-[#95aac0]" />
      </div>
    </div>
    <div>
        <label htmlFor="oc-temp" className="block text-sm font-medium text-gray-300 mb-2">Temperature: <span className="font-bold text-[#e2a32d]">{temperature.toFixed(1)}</span></label>
        <input id="oc-temp" type="range" min="0" max="1" step="0.1" value={temperature} onChange={e => setConfig({...config, temperature: parseFloat(e.target.value)})} className="w-full h-2 bg-[#5c6f7e] rounded-lg appearance-none cursor-pointer accent-[#e2a32d]" />
    </div>
  </>;
};

// --- Main Config Step Component ---
interface ConfigStepProps {
  tool: ToolType;
  entityType: EntityType | null;
  geminiConfig: GeminiCommandConfig;
  setGeminiConfig: (c: GeminiCommandConfig) => void;
  claudeConfig: ClaudeCodeConfig;
  setClaudeConfig: (c: ClaudeCodeConfig) => void;
  openCodeConfig: OpenCodeConfig;
  setOpenCodeConfig: (c: OpenCodeConfig) => void;
  onBack: () => void;
  onGenerate: () => void;
}

const ConfigStep: React.FC<ConfigStepProps> = (props) => {
  const { tool, entityType, onBack, onGenerate } = props;

  const handleMcpServerChange = (serverId: string) => {
      let currentServers: string[];
      let setter: (servers: string[]) => void;

      switch(tool) {
        case ToolType.ClaudeCode: 
            currentServers = props.claudeConfig.mcpServers;
            setter = (s) => props.setClaudeConfig({...props.claudeConfig, mcpServers: s});
            break;
        case ToolType.OpenCode:
             currentServers = props.openCodeConfig.mcpServers;
             setter = (s) => props.setOpenCodeConfig({...props.openCodeConfig, mcpServers: s});
             break;
        default:
            currentServers = props.geminiConfig.mcpServers;
            setter = (s) => props.setGeminiConfig({...props.geminiConfig, mcpServers: s});
      }

      setter(
        currentServers.includes(serverId)
            ? currentServers.filter(id => id !== serverId)
            : [...currentServers, serverId]
      );
  };
  
  const getMcpServers = () => {
      switch(tool) {
          case ToolType.ClaudeCode: return props.claudeConfig.mcpServers;
          case ToolType.OpenCode: return props.openCodeConfig.mcpServers;
          default: return props.geminiConfig.mcpServers;
      }
  }

  const isFormValid = () => {
    switch (tool) {
      case ToolType.GeminiCLI:
        return props.geminiConfig.namespace.trim() && props.geminiConfig.commandName.trim();
      case ToolType.ClaudeCode:
        return props.claudeConfig.name.trim() && props.claudeConfig.description.trim();
      case ToolType.OpenCode:
        return props.openCodeConfig.description.trim() && props.openCodeConfig.model.trim();
      default:
        return false;
    }
  };
  
  const entityName = entityType ? entityType : 'Command';

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-[#e2a32d]">Step 3: Configure Your {entityName}</h2>
        <p className="text-[#95aac0] mt-1">Set the configuration options for your {tool} {entityName.toLowerCase()}.</p>
      </div>

      <div className="flex flex-col gap-6">
        {tool === ToolType.GeminiCLI && <GeminiConfigForm config={props.geminiConfig} setConfig={props.setGeminiConfig} />}
        {/* Fix: Corrected typo from props.setClaudeCode to props.setClaudeConfig */}
        {tool === ToolType.ClaudeCode && entityType && <ClaudeCodeConfigForm config={props.claudeConfig} setConfig={props.setClaudeConfig} entityType={entityType} />}
        {tool === ToolType.OpenCode && entityType && <OpenCodeConfigForm config={props.openCodeConfig} setConfig={props.setOpenCodeConfig} />}
      </div>
      
      {/* MCP Server Integration */}
      <div>
        <h3 className="font-semibold text-lg mb-2 text-[#e2a32d]">MCP Server Integration (Optional)</h3>
        <p className="text-sm text-[#95aac0] mb-4">Select any MCP servers your command should be aware of. This will guide the AI to integrate their capabilities into the prompt.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MCP_SERVERS.map(server => (
            <label key={server.id} className="flex flex-col p-4 bg-[#333e48] rounded-lg border-2 border-[#5c6f7e] has-[:checked]:border-[#e2a32d] cursor-pointer transition-colors">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={getMcpServers().includes(server.id)}
                  onChange={() => handleMcpServerChange(server.id)}
                  className="w-5 h-5 accent-[#e2a32d] bg-[#333e48] border-[#5c6f7e] rounded"
                />
                <span className="ml-3 font-bold text-gray-200">{server.name}</span>
              </div>
              <p className="text-sm text-[#95aac0] mt-2">{server.description}</p>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center mt-4">
        <button onClick={onBack} className="px-6 py-2 bg-[#333e48] text-gray-200 font-semibold rounded-lg border border-[#5c6f7e] hover:bg-[#5c6f7e] transition-all">
          Back
        </button>
        <button onClick={onGenerate} disabled={!isFormValid()} className="px-6 py-2 bg-[#c36e26] text-white font-semibold rounded-lg hover:bg-[#b56524] disabled:bg-[#5c6f7e] disabled:cursor-not-allowed transition-all">
          Generate
        </button>
      </div>
    </div>
  );
};

export default ConfigStep;