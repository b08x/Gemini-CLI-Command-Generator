import React from 'react';
import { CommandScope, ArgStrategy } from '../types';

interface ConfigStepProps {
  scope: CommandScope;
  setScope: (value: CommandScope) => void;
  namespace: string;
  setNamespace: (value: string) => void;
  commandName: string;
  setCommandName: (value: string) => void;
  argStrategy: ArgStrategy;
  setArgStrategy: (value: ArgStrategy) => void;
  onBack: () => void;
  onGenerate: () => void;
}

const ConfigStep: React.FC<ConfigStepProps> = ({
  scope, setScope, namespace, setNamespace, commandName, setCommandName, argStrategy, setArgStrategy, onBack, onGenerate
}) => {
  const isFormValid = namespace.trim() && commandName.trim();
  const scopePath = scope === CommandScope.Global ? '~/.gemini/commands/' : '[project]/.gemini/commands/';
  const fullPath = `${scopePath}${namespace}/${commandName}.toml`;

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-[#e2a32d]">Step 2: Configure Your Command</h2>
        <p className="text-[#95aac0] mt-1">Set the scope, name, and argument handling strategy.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Scope Selection */}
        <div>
          <h3 className="font-semibold text-lg mb-2 text-[#e2a32d]">Command Scope</h3>
          <div className="flex flex-col gap-3">
            {(Object.values(CommandScope)).map(s => (
              <label key={s} className="flex items-center p-4 bg-[#333e48] rounded-lg border-2 border-[#5c6f7e] has-[:checked]:border-[#e2a32d] cursor-pointer transition-colors">
                <input type="radio" name="scope" value={s} checked={scope === s} onChange={() => setScope(s)} className="w-5 h-5 accent-[#e2a32d]"/>
                <span className="ml-4">
                  <span className="font-bold text-gray-200">{s}</span>
                  <p className="text-sm text-[#95aac0]">{s === CommandScope.Global ? 'Available everywhere' : 'Specific to this project'}</p>
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Naming */}
        <div>
          <h3 className="font-semibold text-lg mb-2 text-[#e2a32d]">Command Naming</h3>
          <div className="flex flex-col gap-3">
            <input type="text" value={namespace} onChange={e => setNamespace(e.target.value)} placeholder="Namespace (e.g., git)" className="p-3 bg-[#333e48] border border-[#5c6f7e] rounded-lg outline-none focus:ring-2 focus:ring-[#e2a32d] placeholder:text-[#95aac0]" />
            <input type="text" value={commandName} onChange={e => setCommandName(e.target.value)} placeholder="Command name (e.g., commit)" className="p-3 bg-[#333e48] border border-[#5c6f7e] rounded-lg outline-none focus:ring-2 focus:ring-[#e2a32d] placeholder:text-[#95aac0]" />
          </div>
          <div className="mt-4 p-3 bg-[#212934] rounded-lg text-sm font-mono">
            <p className="text-[#95aac0]">Path: <span className="text-green-400">{fullPath}</span></p>
            <p className="text-[#95aac0]">Usage: <span className="text-[#e2a32d]">g {namespace}:{commandName}</span></p>
          </div>
        </div>
      </div>

      {/* Argument Strategy */}
      <div>
          <h3 className="font-semibold text-lg mb-2 text-[#e2a32d]">Argument Strategy</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(Object.values(ArgStrategy)).map(as => (
              <label key={as} className="flex flex-col p-4 bg-[#333e48] rounded-lg border-2 border-[#5c6f7e] has-[:checked]:border-[#e2a32d] cursor-pointer transition-colors">
                <div className="flex items-center">
                    <input type="radio" name="argStrategy" value={as} checked={argStrategy === as} onChange={() => setArgStrategy(as)} className="w-5 h-5 accent-[#e2a32d]"/>
                    <span className="ml-3 font-bold text-gray-200">{as}</span>
                </div>
                 <p className="text-sm text-[#95aac0] mt-2">
                    {as === ArgStrategy.Injection ? 'Best for simple, single inputs.' : as === ArgStrategy.Default ? 'For complex flags and multiple args.' : 'Command takes no direct input.'}
                 </p>
              </label>
            ))}
          </div>
      </div>

      <div className="flex justify-between items-center mt-4">
        <button onClick={onBack} className="px-6 py-2 bg-[#333e48] text-gray-200 font-semibold rounded-lg border border-[#5c6f7e] hover:bg-[#5c6f7e] transition-all">
          Back
        </button>
        <button onClick={onGenerate} disabled={!isFormValid} className="px-6 py-2 bg-[#c36e26] text-white font-semibold rounded-lg hover:bg-[#b56524] disabled:bg-[#5c6f7e] disabled:cursor-not-allowed transition-all">
          Generate Command
        </button>
      </div>
    </div>
  );
};

export default ConfigStep;