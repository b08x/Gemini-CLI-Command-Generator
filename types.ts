
export enum WizardStep {
  Home,
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

export interface CommandConfig {
  objective: string;
  scope: CommandScope;
  namespace: string;
  commandName: string;
  argStrategy: ArgStrategy;
  mcpServers: string[];
}

export interface Message {
  role: 'user' | 'model';
  content: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  toml: string;
}