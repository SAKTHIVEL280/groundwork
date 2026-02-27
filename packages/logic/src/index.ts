// ============================================
// Groundwork - Shared Logic
// ============================================
// Re-exports everything for easy imports.
// ============================================

// Project creation & manipulation
export {
  createProject,
  createFeature,
  createPersona,
  createCompetitor,
  createEntity,
  createScreen,
  createMilestone,
  createTask,
  createDecision,
  createEmptySections,
  createEmptyCanvas,
} from './project-factory';

// Progress calculation
export { calculateProgress, getIncompleteSections, getProgressLabel } from './progress';

// Export engine
export {
  exportToMarkdown,
  exportToAIContext,
  exportToJSON,
  exportProject,
} from './export';

// AI client
export { validateApiKey, chat, GroqAPIError, AI_PROMPTS } from './ai';

// Templates
export { TEMPLATES, getTemplate, getAllTemplates } from './templates';
