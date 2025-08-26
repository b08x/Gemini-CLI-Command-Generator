import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { CommandConfig, Message } from '../types';
import { SYSTEM_PROMPT } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

function constructInitialPrompt(config: CommandConfig): string {
  const scopePath = config.scope === 'Global' ? '~/.gemini/commands/' : '[project]/.gemini/commands/';
  const fullPath = `${scopePath}${config.namespace}/${config.commandName}.toml`;

  return `
Based on the SFL framework, generate a TOML file for the following Gemini CLI command.

**Command Specifications:**
- **Objective**: ${config.objective}
- **Scope**: ${config.scope}
- **File Path**: \`${fullPath}\`
- **Argument Strategy**: ${config.argStrategy}

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
    const history = messages.map(msg => `${msg.role === 'user' ? 'User Request' : 'Your Previous Response (as background)'}:\n${msg.content}`).join('\n\n');

    return `
You are refining a Gemini CLI TOML file.

**Current TOML Content:**
\`\`\`toml
${currentToml}
\`\`\`

**Conversation History & Latest Request:**
${history}

Based on the latest user request, update the TOML file.

**Output Formatting Requirements:**
Your response MUST be ONLY the new, complete, and valid TOML file content. Maintain the following structure:
1.  A TOML comment line with the full file path.
2.  A blank line.
3.  The \`description\` key-value pair.
4.  A blank line.
5.  The \`prompt\` key-value pair, using multi-line TOML string syntax (\`"""..."""\`).

Do not add any conversational text, explanations, or markdown.
`;
}


export const refineToml = async (currentToml: string, messages: Message[]): Promise<string> => {
  try {
    const prompt = constructRefinementPrompt(currentToml, messages);
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            systemInstruction: SYSTEM_PROMPT,
        },
    });
    // Sometimes the model might still wrap the output in ```toml ... ```
    const text = response.text.trim();
    if (text.startsWith('```toml') && text.endsWith('```')) {
        return text.slice(7, -3).trim();
    }
    if (text.startsWith('```') && text.endsWith('```')) {
        return text.slice(3, -3).trim();
    }
    return text;
  } catch (error) {
    console.error("Error refining TOML:", error);
    return `# Error: Could not refine TOML file.\n${currentToml}\n# ${error instanceof Error ? error.message : String(error)}`;
  }
};