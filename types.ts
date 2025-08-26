
export enum WizardStep {
  Objective,
  Config,
  Refine,
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
}

export interface Message {
  role: 'user' | 'model';
  content: string;
}
