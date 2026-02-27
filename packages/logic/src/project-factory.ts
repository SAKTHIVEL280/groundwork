// ============================================
// Groundwork - Project Factory
// ============================================
// Creates new projects, sections, and entities
// with sensible defaults.
// ============================================

import { v4 as uuid } from 'uuid';
import type {
  Project,
  ProjectSections,
  CanvasState,
  Feature,
  Persona,
  Competitor,
  Entity,
  Screen,
  Milestone,
  Decision,
  Task,
  Priority,
  Effort,
  MilestoneStatus,
} from '@groundwork/types';

const now = () => new Date().toISOString();

// --- Empty Defaults ---

export function createEmptySections(): ProjectSections {
  return {
    problem: { statement: '', impact: '', currentSolution: '' },
    personas: [],
    competitors: [],
    features: [],
    dataModel: [],
    stack: { other: [] },
    screens: [],
    architecture: { components: [], connections: [] },
    milestones: [],
    decisions: [],
  };
}

export function createEmptyCanvas(): CanvasState {
  return {
    nodes: [],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 },
  };
}

// --- Factory Functions ---

export function createProject(name: string, description = ''): Project {
  const timestamp = now();
  return {
    id: uuid(),
    name,
    description,
    progress: 0,
    sections: createEmptySections(),
    canvas: createEmptyCanvas(),
    versions: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function createFeature(
  name: string,
  description = '',
  priority: Priority = 'mvp',
  effort: Effort = 'medium',
): Feature {
  return { id: uuid(), name, description, priority, effort };
}

export function createPersona(name: string, role = ''): Persona {
  return { id: uuid(), name, role, painPoints: [], goals: [] };
}

export function createCompetitor(name: string, url = ''): Competitor {
  return { id: uuid(), name, url, strengths: [], gaps: [] };
}

export function createEntity(name: string): Entity {
  return { id: uuid(), name, fields: [], relationships: [] };
}

export function createScreen(name: string, description = ''): Screen {
  return { id: uuid(), name, description };
}

export function createMilestone(
  name: string,
  status: MilestoneStatus = 'not-started',
): Milestone {
  return { id: uuid(), name, tasks: [], status };
}

export function createTask(title: string): Task {
  return { id: uuid(), title, completed: false };
}

export function createDecision(title: string): Decision {
  return {
    id: uuid(),
    title,
    options: [],
    date: now(),
  };
}
