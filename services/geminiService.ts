import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { CommandConfig, Message } from '../types';
import { SYSTEM_PROMPT, MCP_SERVERS } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

function constructInitialPrompt(config: CommandConfig): string {
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

**Output Formatting Requirements:**
Your output must be ONLY the raw TOML code, following this exact structure:
1.  A TOML comment line with the full file path. (e.g., \`# ${fullPath}\`)
2.  A blank line.
3.  The \`description\` key-value pair.
4.  A blank line.
5.  The \`prompt\` key-value pair, using multi-line TOML string syntax (\`"""..."""\`).

**Example Structure:**
\`\`\`toml
# ${fullPath}

description = "A brief but clear description of what the command does."

prompt = """
The main prompt content goes here.
It should be well-structured and detailed, following the command's objective.
It can include placeholders like {{args}} or shell commands like !{ls -F} if needed.
"""
\`\`\`

Generate the complete TOML file content now, adhering strictly to these formatting rules.
`;
}

export const generateInitialToml = async (config: CommandConfig): Promise<string> => {
  try {
    const prompt = constructInitialPrompt(config);
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating initial TOML:", error);
    return `# Error: Could not generate TOML file. Please check your API key and network connection.\n# ${error instanceof Error ? error.message : String(error)}`;
  }
};

function constructRefinementPrompt(currentToml: string, messages: Message[]): string {
    const history = messages.map(msg => `${msg.role === 'user' ? 'User Request' : 'Your Previous Response (TOML)'}:\n${msg.content}`).join('\n\n---\n\n');

    return `
You are in a refinement loop for a Gemini CLI command. You will be given the current TOML file and a user request to modify it.

**Current TOML File:**
\`\`\`toml
${currentToml}
\`\`\`

**User's Refinement Request:**
${messages[messages.length - 1].content}

**Chat History for Context:**
${history}

**Your Task:**
Based on the user's latest request and the provided context, generate the new, complete TOML file.

**Output Formatting Requirements:**
- Your output MUST ONLY be the raw, updated TOML code.
- DO NOT include any conversational text, explanations, or markdown formatting like \`\`\`toml.
- Ensure the output is a single, valid TOML file.
`;
}

export const refineToml = async (currentToml: string, messages: Message[]): Promise<string> => {
    if (messages.length === 0) return currentToml;

    try {
        const prompt = constructRefinementPrompt(currentToml, messages);
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: SYSTEM_PROMPT,
            },
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error refining TOML:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        const originalFileName = currentToml.match(/#\s*(.*\.toml)/)?.[1] || 'command.toml';

        return `# Error: Could not refine the TOML file.
# ${errorMessage}
#
# Your original file content is preserved below.
# ${originalFileName}

${currentToml.split('\n').slice(1).join('\n')}
`;
    }
};
