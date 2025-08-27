
export interface TomlValidationResult {
  isValid: boolean;
  message: string | null;
}

export const validateToml = (toml: string): TomlValidationResult => {
  const trimmedToml = toml.trim();

  // Check for markdown code fences
  if (trimmedToml.startsWith('```') || trimmedToml.endsWith('```')) {
    return {
      isValid: false,
      message: 'The generated output appears to be wrapped in markdown backticks (```). This extra formatting should be removed.'
    };
  }

  // Check for balanced multi-line string quotes
  const quoteCount = (trimmedToml.match(/"""/g) || []).length;
  if (quoteCount % 2 !== 0) {
    return {
      isValid: false,
      message: 'The `prompt` section seems to have an unclosed multi-line string. Check for a missing `"""`.'
    };
  }

  // Check for essential keys
  if (!/^\s*description\s*=/m.test(trimmedToml)) {
     return {
      isValid: false,
      message: 'The required `description` field appears to be missing or malformed.'
    };
  }

   if (!/^\s*prompt\s*=/m.test(trimmedToml)) {
     return {
      isValid: false,
      message: 'The required `prompt` field appears to be missing or malformed.'
    };
  }

  return { isValid: true, message: null };
};
