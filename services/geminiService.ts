
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GeminiCommandConfig, Message, ToolType, EntityType, ClaudeCodeConfig, OpenCodeConfig } from '../types';
import { GEMINI_SYSTEM_PROMPT, CLAUDE_CODE_SYSTEM_PROMPT, OPEN_CODE_SYSTEM_PROMPT, MCP_SERVERS, VARIANT_SYSTEM_PROMPT, TEMPLATE_DESCRIPTION_SYSTEM_PROMPT, TEMPLATE_TAGS_SYSTEM_PROMPT } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

// --- Prompt Constructors ---

function constructGeminiInitialPrompt(config: GeminiCommandConfig): string {
  const scopePath = config.scope === 'Global' ? '~/.gemini/commands/' : '[project]/.gemini/commands/';
  const fullPath = `${scopePath}${config.namespace}/${config.commandName}.toml`;

  const mcpIntegrationSection = config.mcpServers && config.mcpServers.length > 0
    ? `
**MCP Integration**:
The user has indicated the command should be aware of the following MCP servers. Integrate them into the prompt's capabilities and instructions where relevant.
${config.mcpServers.map(id => {
    const server = MCP_SERVERS.find(s => s.id === id);
    return `- **${server?.name || id}**: ${server?.description || 'A model context protocol server.'}`;
}).join('\n')}
`
    : '';

  return `
Based on the SFL framework, generate a TOML file for the following Gemini CLI command.

**Command Specifications:**
- **Objective**: ${config.objective}
- **Scope**: ${config.scope}
- **File Path**: \`${fullPath}\`
- **Argument Strategy**: ${config.argStrategy}
${mcpIntegrationSection}

Generate the complete TOML file content now.
`;
}

function constructClaudeCodeInitialPrompt(config: ClaudeCodeConfig): string {
    const mcpIntegrationSection = config.mcpServers && config.mcpServers.length > 0
    ? `
It should be aware of the following MCP servers: ${config.mcpServers.join(', ')}. Integrate their capabilities where relevant.
` : '';

    return `
Generate a Markdown file with YAML frontmatter for a Claude-Code ${config.entityType}.

**Specifications:**
- **Objective**: ${config.objective}
- **Entity Type**: ${config.entityType}
- **Name**: ${config.name}
- **Description**: ${config.description}
- **Tools**: ${config.tools}
${mcpIntegrationSection}

Generate the complete file content now.
`;
}

function constructOpenCodeInitialPrompt(config: OpenCodeConfig): string {
     const mcpIntegrationSection = config.mcpServers && config.mcpServers.length > 0
    ? `
It should be aware of the following MCP servers: ${config.mcpServers.join(', ')}. Integrate their capabilities where relevant.
` : '';

    return `
Generate a Markdown file with YAML frontmatter for an OpenCode Agent.

**Specifications:**
- **Objective**: ${config.objective}
- **Description**: ${config.description}
- **Mode**: ${config.mode}
- **Model**: ${config.model}
- **Tools**: ${config.tools}
- **Permissions**: ${config.permissions}
- **Temperature**: ${config.temperature}
${mcpIntegrationSection}

Generate the complete file content now.
`;
}

// --- Main Service Functions ---

type ConfigType = GeminiCommandConfig | ClaudeCodeConfig | OpenCodeConfig;

export const generateInitialArtifact = async (tool: ToolType, config: ConfigType): Promise<string> => {
  let prompt: string;
  let systemInstruction: string;

  switch (tool) {
    case ToolType.ClaudeCode:
      prompt = constructClaudeCodeInitialPrompt(config as ClaudeCodeConfig);
      systemInstruction = CLAUDE_CODE_SYSTEM_PROMPT;
      break;
    case ToolType.OpenCode:
      prompt = constructOpenCodeInitialPrompt(config as OpenCodeConfig);
      systemInstruction = OPEN_CODE_SYSTEM_PROMPT;
      break;
    case ToolType.GeminiCLI:
    default:
      prompt = constructGeminiInitialPrompt(config as GeminiCommandConfig);
      systemInstruction = GEMINI_SYSTEM_PROMPT;
      break;
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: { systemInstruction },
    });
    return response.text.trim();
  } catch (error) {
    console.error(`Error generating initial ${tool} artifact:`, error);
    const detailedError = getDetailedError(error);
    return `# ERROR: Failed to generate the ${tool} artifact.\n#\n# Reason: ${detailedError}`;
  }
};


export const refineArtifact = async (currentArtifact: string, messages: Message[], tool: ToolType): Promise<string> => {
    if (messages.length === 0) return currentArtifact;

    const systemInstruction = tool === ToolType.GeminiCLI ? GEMINI_SYSTEM_PROMPT : tool === ToolType.ClaudeCode ? CLAUDE_CODE_SYSTEM_PROMPT : OPEN_CODE_SYSTEM_PROMPT;

    const prompt = `
You are in a refinement loop for a ${tool} configuration file. You will be given the current file content and a user request to modify it.

**Current File Content:**
\`\`\`${tool === ToolType.GeminiCLI ? 'toml' : 'markdown'}
${currentArtifact}
\`\`\`

**User's Refinement Request:**
${messages[messages.length - 1].content}

**Your Task:**
Based on the user's latest request, generate the new, complete file. Your output MUST ONLY be the raw, updated file content.
`;
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: { systemInstruction },
        });
        return response.text.trim();
    } catch (error) {
        console.error(`Error refining ${tool} artifact:`, error);
        const detailedError = getDetailedError(error);
        const errorHeader = `# ERROR: The AI failed to refine the artifact.\n#\n# Reason: ${detailedError}\n#\n# Your previous version has been preserved below.`;
        return `${errorHeader}\n\n${currentArtifact}`;
    }
};

export const generateVariantFromTemplate = async (baseContent: string, objective: string, tool: ToolType, config: ConfigType): Promise<string> => {
  const prompt = `
Please generate a new variant of the following ${tool} configuration file based on the new objective and specifications.

**Base File (Your Starting Point):**
\`\`\`${tool === ToolType.GeminiCLI ? 'toml' : 'markdown'}
${baseContent}
\`\`\`

**New Objective for the Variant:**
"${objective}"

**New Specifications:**
${JSON.stringify(config, null, 2)}

**Your Task:**
Modify the base file to create a new artifact that accomplishes the new objective and conforms to the new specifications. Update all relevant metadata (e.g., descriptions, paths, names) and the core prompt logic.

Return only the raw, complete, and valid file content for the new variant.
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: VARIANT_SYSTEM_PROMPT,
      },
    });
    return response.text.trim();
  } catch (error) {
    console.error(`Error generating ${tool} variant:`, error);
    const detailedError = getDetailedError(error);
    return `# ERROR: Failed to generate the command variant.\n#\n# Reason: ${detailedError}`;
  }
};

export const generateTemplateDescription = async (content: string): Promise<string> => {
    try {
        const prompt = `
        Here is the configuration file. Please generate the description.
        \`\`\`
        ${content}
        \`\`\`
        `;
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: TEMPLATE_DESCRIPTION_SYSTEM_PROMPT,
            },
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating template description:", error);
        return "A reusable command template.";
    }
};

export const generateTemplateTags = async (content: string): Promise<string[]> => {
    try {
        const prompt = `
        Here is the configuration file. Please generate the tags.
        \`\`\`
        ${content}
        \`\`\`
        `;
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: TEMPLATE_TAGS_SYSTEM_PROMPT,
                responseMimeType: "application/json",
            },
        });
        
        const responseText = response.text.trim();
        const cleanedText = responseText.replace(/^```json\s*|```\s*$/g, '').trim();
        const tags = JSON.parse(cleanedText);
        
        if (Array.isArray(tags) && tags.every(t => typeof t === 'string')) {
            return tags;
        }
        return [];
    } catch (error) {
        console.error("Error generating or parsing template tags:", error);
        return [];
    }
};

// --- Utility Functions ---

function getDetailedError(error: any): string {
    if (error instanceof Error) {
        if (error.message.includes('API key')) {
            return "Invalid or missing API Key. Please ensure your API_KEY environment variable is set correctly.";
        } else if (error.message.toLowerCase().includes('fetch')) {
             return "A network error occurred. Please check your internet connection and try again.";
        } else {
            return error.message;
        }
    }
    return String(error);
}
