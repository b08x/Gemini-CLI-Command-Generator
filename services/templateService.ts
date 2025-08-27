import { Template } from '../types';

const TEMPLATE_STORAGE_KEY = 'geminiCliCmdTemplates';

export const getTemplates = (): Template[] => {
  try {
    const templatesJson = localStorage.getItem(TEMPLATE_STORAGE_KEY);
    return templatesJson ? JSON.parse(templatesJson) : [];
  } catch (error) {
    console.error("Failed to load templates from localStorage:", error);
    return [];
  }
};

export const saveTemplates = (templates: Template[]): void => {
  try {
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
  } catch (error) {
    console.error("Failed to save templates to localStorage:", error);
  }
};
