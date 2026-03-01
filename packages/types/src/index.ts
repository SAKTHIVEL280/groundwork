// ============================================
// Groundwork - Core Type Definitions
// ============================================
// Shared TypeScript type definitions for the Groundwork app.
// ============================================

// --- Unique ID type ---
export type ID = string;

// --- Timestamps ---
export interface Timestamps {
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// --- User Preferences ---
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  colorScheme: ColorScheme;
  groqApiKey?: string; // stored locally
  aiEnabled: boolean; // default: false
  aiModel?: string; // Groq model name override
}

// --- Priority & Effort ---
export type Priority = 'mvp' | 'later' | 'cut';
export type Effort = 'small' | 'medium' | 'large';
export type MilestoneStatus = 'not-started' | 'in-progress' | 'completed';

// --- Project ---
export interface Project extends Timestamps {
  id: ID;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  templateId?: ID;
  progress: number; // 0 - 100, auto-calculated
  archived?: boolean; // soft-archive flag
  favorite?: boolean; // pin to top of project list
  disabledSections?: (keyof ProjectSections)[]; // sections the user chose to hide
  sections: ProjectSections;
  canvas: CanvasState;
  versions: ProjectSnapshot[];
}

// --- Project Sections ---
export interface ProjectSections {
  problem: ProblemSection;
  personas: Persona[];
  competitors: Competitor[];
  features: Feature[];
  dataModel: Entity[];
  stack: TechStack;
  screens: Screen[];
  architecture: ArchitectureSection;
  milestones: Milestone[];
  decisions: Decision[];
}

// --- Problem ---
export interface ProblemSection {
  statement: string;
  impact: string;
  currentSolution: string;
}

// --- Personas ---
export interface Persona {
  id: ID;
  name: string;
  role: string;
  painPoints: string[];
  goals: string[];
}

// --- Competitors ---
export interface Competitor {
  id: ID;
  name: string;
  url?: string;
  strengths: string[];
  gaps: string[];
}

// --- Features ---
export interface Feature {
  id: ID;
  name: string;
  description: string;
  priority: Priority;
  effort: Effort;
  notes?: string;
}

// --- Data Model ---
export interface EntityField {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface EntityRelationship {
  targetEntity: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  description?: string;
}

export interface Entity {
  id: ID;
  name: string;
  fields: EntityField[];
  relationships: EntityRelationship[];
}

// --- Tech Stack ---
export interface TechStack {
  frontend?: string;
  backend?: string;
  database?: string;
  hosting?: string;
  auth?: string;
  payments?: string;
  other: string[];
}

// --- Screens ---
export interface Screen {
  id: ID;
  name: string;
  description: string;
  section?: string; // which part of the app this belongs to
  wireframeData?: string; // serialized wireframe/sketch data
}

// --- Architecture ---
export interface ArchitectureComponent {
  id: ID;
  name: string;
  type: 'frontend' | 'backend' | 'database' | 'service' | 'external';
  description?: string;
}

export interface ArchitectureConnection {
  id: ID;
  from: ID;
  to: ID;
  label?: string;
  protocol?: string; // e.g., "REST", "GraphQL", "WebSocket"
}

export interface ArchitectureSection {
  components: ArchitectureComponent[];
  connections: ArchitectureConnection[];
}

// --- Milestones ---
export interface Task {
  id: ID;
  title: string;
  completed: boolean;
}

export interface Milestone {
  id: ID;
  name: string;
  description?: string;
  tasks: Task[];
  targetDate?: string; // ISO 8601
  status: MilestoneStatus;
}

// --- Decisions ---
export interface Decision {
  id: ID;
  title: string;
  options: string[];
  chosen?: string;
  reasoning?: string;
  date: string; // ISO 8601
}

// --- Canvas ---
// Note: CanvasState uses the Excalidraw library 'snapshot' for visual canvas data.
// The nodes/edges/viewport fields are reserved for future structured canvas features.
export interface CanvasState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  snapshot?: any; // Excalidraw scene snapshot (opaque JSON)
}

// --- Project Snapshots (Versioning) ---
export interface ProjectSnapshot {
  id: ID;
  name: string;
  date: string; // ISO 8601
  data: Omit<Project, 'versions'>; // snapshot without recursive versions
}

// --- Templates ---
export type TemplateCategory =
  | 'saas'
  | 'mobile-app'
  | 'cli-tool'
  | 'api'
  | 'portfolio'
  | 'library'
  | 'blank';

export interface Template {
  id: ID;
  name: string;
  description: string;
  icon: string;
  category: TemplateCategory;
  prefilledProject: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'versions'>>;
}

// --- AI ---
export interface AIConfig {
  apiKey: string;
  model: string;
  enabled: boolean;
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  content: string;
  error?: string;
  rateLimited?: boolean;
}

// --- Export Formats ---
export type ExportFormat = 'markdown' | 'json' | 'ai-context' | 'prd';

// --- Color Schemes ---
export type ColorScheme = 'purple' | 'blue' | 'green' | 'orange' | 'pink' | 'teal';

