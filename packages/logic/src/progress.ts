// ============================================
// Groundwork - Progress Calculator
// ============================================
// Calculates project completion percentage
// based on how many sections are filled in.
// ============================================

import type { ProjectSections } from '@groundwork/types';

interface SectionWeight {
  key: keyof ProjectSections;
  weight: number;
  isFilled: (sections: ProjectSections) => boolean;
}

const SECTION_WEIGHTS: SectionWeight[] = [
  {
    key: 'problem',
    weight: 15,
    isFilled: (s) => s.problem.statement.trim().length > 0,
  },
  {
    key: 'personas',
    weight: 10,
    isFilled: (s) => s.personas.length > 0,
  },
  {
    key: 'competitors',
    weight: 5,
    isFilled: (s) => s.competitors.length > 0,
  },
  {
    key: 'features',
    weight: 20,
    isFilled: (s) => s.features.length > 0,
  },
  {
    key: 'dataModel',
    weight: 15,
    isFilled: (s) => s.dataModel.length > 0,
  },
  {
    key: 'stack',
    weight: 10,
    isFilled: (s) => !!(s.stack.frontend || s.stack.backend || s.stack.database),
  },
  {
    key: 'screens',
    weight: 10,
    isFilled: (s) => s.screens.length > 0,
  },
  {
    key: 'architecture',
    weight: 5,
    isFilled: (s) => s.architecture.components.length > 0,
  },
  {
    key: 'milestones',
    weight: 10,
    isFilled: (s) => s.milestones.length > 0,
  },
  {
    key: 'decisions',
    weight: 5,
    isFilled: (s) => s.decisions.length > 0,
  },
];

/**
 * Calculate project progress as a percentage (0-100).
 * Each section has a weight — filled sections contribute their weight to the total.
 */
export function calculateProgress(sections: ProjectSections): number {
  let totalWeight = 0;
  let filledWeight = 0;

  for (const sw of SECTION_WEIGHTS) {
    totalWeight += sw.weight;
    if (sw.isFilled(sections)) {
      filledWeight += sw.weight;
    }
  }

  if (totalWeight === 0) return 0;
  return Math.round((filledWeight / totalWeight) * 100);
}

/**
 * Get a list of sections that are incomplete, for showing hints.
 */
export function getIncompleteSections(sections: ProjectSections): string[] {
  return SECTION_WEIGHTS.filter((sw) => !sw.isFilled(sections)).map((sw) => sw.key);
}

/**
 * Get a human-readable status label for the progress.
 */
export function getProgressLabel(progress: number): string {
  if (progress === 0) return 'Just started';
  if (progress < 25) return 'Getting started';
  if (progress < 50) return 'Taking shape';
  if (progress < 75) return 'Mostly planned';
  if (progress < 100) return 'Almost ready';
  return 'Ready to build!';
}
