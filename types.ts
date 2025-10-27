
export enum ToolType {
  GeminiCLI = 'Gemini CLI',
  ClaudeCode = 'Claude-Code',
  OpenCode = 'OpenCode',
}

export enum EntityType {
  Command = 'Command',
  Agent = 'Agent',
}


export enum WizardStep {
  Home,
  Start,
  Objective,
  Config,
  SelectTemplate,
  VariantObjective,
  Refine,
  EditTemplate,
}

export enum CommandScope {
  Global = 'Global',
  Project = 'Project',
}

export enum ArgStrategy {
  Injection = '{{args}} injection',
  Default = 'Default append',
  None = 'No arguments',
}

export interface GeminiCommandConfig {
  objective: string;
  scope: CommandScope;
  namespace: string;
  commandName: string;
  argStrategy: ArgStrategy;
  mcpServers: string[];
}

export interface ClaudeCodeConfig {
  objective: string;
  name: string;
  description: string;
  tools: string;
  mcpServers: string[];
  // Fix: Added missing entityType property.
  entityType: EntityType;
}

export interface OpenCodeConfig {
  objective: string;
  description: string;
  mode: 'primary' | 'subagent' | 'all';
  model: string;
  tools: string;
  permissions: string;
  temperature: number;
  mcpServers: string[];
  // Fix: Added missing entityType property.
  entityType: EntityType;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  content: string; // TOML for Gemini, Markdown for others
  tags?: string[];
  tool: ToolType;
  entityType?: EntityType; // For Claude/OpenCode
}