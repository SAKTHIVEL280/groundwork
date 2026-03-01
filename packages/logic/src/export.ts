// ============================================
// Groundwork - Export Engine
// ============================================
// Generates exportable documents from a project.
// ============================================

import type { Project, ExportFormat } from '@groundwork/types';

/**
 * Export a project as a Markdown document (project brief).
 */
export function exportToMarkdown(project: Project): string {
  const { sections } = project;
  const lines: string[] = [];

  lines.push(`# ${project.name}`);
  lines.push('');
  if (project.description) {
    lines.push(`> ${project.description}`);
    lines.push('');
  }

  // Problem
  lines.push('## Problem');
  lines.push('');
  if (sections.problem.statement) {
    lines.push(`**Statement:** ${sections.problem.statement}`);
  }
  if (sections.problem.impact) {
    lines.push(`**Impact:** ${sections.problem.impact}`);
  }
  if (sections.problem.currentSolution) {
    lines.push(`**Current Solution:** ${sections.problem.currentSolution}`);
  }
  lines.push('');

  // Target Users
  if (sections.personas.length > 0) {
    lines.push('## Target Users');
    lines.push('');
    for (const persona of sections.personas) {
      lines.push(`### ${persona.name} (${persona.role})`);
      if (persona.painPoints.length > 0) {
        lines.push('**Pain Points:**');
        persona.painPoints.forEach((p) => lines.push(`- ${p}`));
      }
      if (persona.goals.length > 0) {
        lines.push('**Goals:**');
        persona.goals.forEach((g) => lines.push(`- ${g}`));
      }
      lines.push('');
    }
  }

  // Competitors
  if (sections.competitors.length > 0) {
    lines.push('## Competitive Analysis');
    lines.push('');
    for (const comp of sections.competitors) {
      lines.push(`### ${comp.name}${comp.url ? ` (${comp.url})` : ''}`);
      if (comp.strengths.length > 0) {
        lines.push('**Strengths:**');
        comp.strengths.forEach((s) => lines.push(`- ${s}`));
      }
      if (comp.gaps.length > 0) {
        lines.push('**Gaps:**');
        comp.gaps.forEach((g) => lines.push(`- ${g}`));
      }
      lines.push('');
    }
  }

  // Features
  if (sections.features.length > 0) {
    lines.push('## Features');
    lines.push('');
    const mvp = sections.features.filter((f) => f.priority === 'mvp');
    const later = sections.features.filter((f) => f.priority === 'later');
    const cut = sections.features.filter((f) => f.priority === 'cut');

    if (mvp.length > 0) {
      lines.push('### MVP');
      mvp.forEach((f) => lines.push(`- **${f.name}** (${f.effort}): ${f.description}`));
      lines.push('');
    }
    if (later.length > 0) {
      lines.push('### Later');
      later.forEach((f) => lines.push(`- **${f.name}** (${f.effort}): ${f.description}`));
      lines.push('');
    }
    if (cut.length > 0) {
      lines.push('### Cut');
      cut.forEach((f) => lines.push(`- ~~${f.name}~~: ${f.description}`));
      lines.push('');
    }
  }

  // Data Model
  if (sections.dataModel.length > 0) {
    lines.push('## Data Model');
    lines.push('');
    for (const entity of sections.dataModel) {
      lines.push(`### ${entity.name}`);
      if (entity.fields.length > 0) {
        lines.push('| Field | Type | Required |');
        lines.push('|-------|------|----------|');
        entity.fields.forEach((f) =>
          lines.push(`| ${f.name} | ${f.type} | ${f.required ? 'Yes' : 'No'} |`),
        );
      }
      if (entity.relationships.length > 0) {
        lines.push('**Relationships:**');
        entity.relationships.forEach((r) =>
          lines.push(`- ${r.type} → ${r.targetEntity}${r.description ? `: ${r.description}` : ''}`),
        );
      }
      lines.push('');
    }
  }

  // Tech Stack
  lines.push('## Tech Stack');
  lines.push('');
  const stack = sections.stack;
  if (stack.frontend) lines.push(`- **Frontend:** ${stack.frontend}`);
  if (stack.backend) lines.push(`- **Backend:** ${stack.backend}`);
  if (stack.database) lines.push(`- **Database:** ${stack.database}`);
  if (stack.hosting) lines.push(`- **Hosting:** ${stack.hosting}`);
  if (stack.auth) lines.push(`- **Auth:** ${stack.auth}`);
  if (stack.payments) lines.push(`- **Payments:** ${stack.payments}`);
  if (stack.other?.length > 0) {
    stack.other.forEach((o) => lines.push(`- ${o}`));
  }
  lines.push('');

  // Screens
  if (sections.screens.length > 0) {
    lines.push('## Screens');
    lines.push('');
    sections.screens.forEach((s) => {
      lines.push(`- **${s.name}**: ${s.description}${s.section ? ` _(${s.section})_` : ''}`);
    });
    lines.push('');
  }

  // Architecture
  if (sections.architecture.components.length > 0) {
    lines.push('## Architecture');
    lines.push('');
    lines.push('### Components');
    for (const comp of sections.architecture.components) {
      lines.push(`- **${comp.name}** (${comp.type})${comp.description ? `: ${comp.description}` : ''}`);
    }
    lines.push('');
    if (sections.architecture.connections.length > 0) {
      lines.push('### Connections');
      for (const conn of sections.architecture.connections) {
        const from = sections.architecture.components.find((c) => c.id === conn.from)?.name || '?';
        const to = sections.architecture.components.find((c) => c.id === conn.to)?.name || '?';
        lines.push(`- ${from} → ${to}${conn.label ? ` (${conn.label})` : ''}`);
      }
      lines.push('');
    }
  }

  // Milestones
  if (sections.milestones.length > 0) {
    lines.push('## Milestones');
    lines.push('');
    for (const ms of sections.milestones) {
      const statusEmoji =
        ms.status === 'completed' ? '[done]' : ms.status === 'in-progress' ? '[wip]' : '[ ]';
      lines.push(
        `### ${statusEmoji} ${ms.name}${ms.targetDate ? ` (Target: ${ms.targetDate})` : ''}`,
      );
      if (ms.tasks.length > 0) {
        ms.tasks.forEach((t) => lines.push(`- [${t.completed ? 'x' : ' '}] ${t.title}`));
      }
      lines.push('');
    }
  }

  // Decisions
  if (sections.decisions.length > 0) {
    lines.push('## Decision Log');
    lines.push('');
    for (const d of sections.decisions) {
      lines.push(`### ${d.title}`);
      lines.push(`**Date:** ${d.date}`);
      if (d.options.length > 0) {
        lines.push('**Options:**');
        d.options.forEach((o) => lines.push(`- ${o}${o === d.chosen ? ' (chosen)' : ''}`));
      }
      if (d.reasoning) {
        lines.push(`**Reasoning:** ${d.reasoning}`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * Export a project as an AI context file (for Copilot, Claude, Cursor, etc.)
 */
export function exportToAIContext(project: Project): string {
  const { sections } = project;
  const lines: string[] = [];

  lines.push(`# Project: ${project.name}`);
  lines.push('');
  lines.push('## Context');
  lines.push(`This is ${project.name}. ${project.description}`);
  lines.push('');

  if (sections.problem.statement) {
    lines.push(`## Problem: ${sections.problem.statement}`);
    if (sections.problem.impact) {
      lines.push(`**Impact:** ${sections.problem.impact}`);
    }
    lines.push('');
  }

  // Stack as instructions
  const stack = sections.stack;
  lines.push('## Tech Stack & Conventions');
  if (stack.frontend) lines.push(`- Frontend: ${stack.frontend}`);
  if (stack.backend) lines.push(`- Backend: ${stack.backend}`);
  if (stack.database) lines.push(`- Database: ${stack.database}`);
  if (stack.hosting) lines.push(`- Hosting: ${stack.hosting}`);
  if (stack.auth) lines.push(`- Auth: ${stack.auth}`);
  if (stack.payments) lines.push(`- Payments: ${stack.payments}`);
  if (stack.other?.length > 0) {
    stack.other.forEach((o) => lines.push(`- ${o}`));
  }
  lines.push('');

  // Features as scope
  const mvpFeatures = sections.features.filter((f) => f.priority === 'mvp');
  if (mvpFeatures.length > 0) {
    lines.push('## MVP Features (in scope)');
    mvpFeatures.forEach((f) => lines.push(`- ${f.name}: ${f.description}`));
    lines.push('');
  }

  const laterFeatures = sections.features.filter((f) => f.priority === 'later');
  if (laterFeatures.length > 0) {
    lines.push('## Post-MVP Features (later)');
    laterFeatures.forEach((f) => lines.push(`- ${f.name}: ${f.description}`));
    lines.push('');
  }

  const cutFeatures = sections.features.filter((f) => f.priority === 'cut');
  if (cutFeatures.length > 0) {
    lines.push('## Out of Scope (do NOT implement)');
    cutFeatures.forEach((f) => lines.push(`- ${f.name}`));
    lines.push('');
  }

  // Data model as reference
  if (sections.dataModel.length > 0) {
    lines.push('## Data Model');
    for (const entity of sections.dataModel) {
      lines.push(`### ${entity.name}`);
      entity.fields.forEach(
        (f) => lines.push(`- ${f.name}: ${f.type}${f.required ? ' (required)' : ''}`),
      );
      if (entity.relationships.length > 0) {
        entity.relationships.forEach((r) =>
          lines.push(`- Relationship: ${r.type} → ${r.targetEntity}`),
        );
      }
      lines.push('');
    }
  }

  // Architecture
  if (sections.architecture.components.length > 0) {
    lines.push('## Architecture');
    for (const comp of sections.architecture.components) {
      lines.push(`- ${comp.name} (${comp.type})${comp.description ? `: ${comp.description}` : ''}`);
    }
    if (sections.architecture.connections.length > 0) {
      lines.push('**Connections:**');
      for (const conn of sections.architecture.connections) {
        const from = sections.architecture.components.find((c) => c.id === conn.from)?.name || conn.from;
        const to = sections.architecture.components.find((c) => c.id === conn.to)?.name || conn.to;
        lines.push(`- ${from} → ${to}${conn.label ? ` (${conn.label})` : ''}`);
      }
    }
    lines.push('');
  }

  // Screens
  if (sections.screens.length > 0) {
    lines.push('## Screens');
    sections.screens.forEach((s) => {
      lines.push(`- ${s.name}: ${s.description}`);
    });
    lines.push('');
  }

  // Decisions
  if (sections.decisions.length > 0) {
    lines.push('## Key Decisions');
    for (const d of sections.decisions) {
      lines.push(`- **${d.title}**: ${d.chosen || 'undecided'}${d.reasoning ? ` — ${d.reasoning}` : ''}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Export a project as JSON (for import on another device).
 */
export function exportToJSON(project: Project): string {
  return JSON.stringify(project, null, 2);
}

/**
 * Export a project as a Product Requirements Document (PRD).
 */
export function exportToPRD(project: Project): string {
  const { sections } = project;
  const lines: string[] = [];

  lines.push(`# Product Requirements Document: ${project.name}`);
  lines.push('');
  lines.push(`**Version:** 1.0`);
  lines.push(`**Date:** ${new Date().toISOString().split('T')[0]}`);
  lines.push('');

  // Executive Summary
  lines.push('## 1. Executive Summary');
  lines.push('');
  if (project.description) {
    lines.push(project.description);
    lines.push('');
  }

  // Problem Statement
  lines.push('## 2. Problem Statement');
  lines.push('');
  if (sections.problem.statement) lines.push(sections.problem.statement);
  if (sections.problem.impact) lines.push(`\n**Impact:** ${sections.problem.impact}`);
  if (sections.problem.currentSolution) lines.push(`\n**Current Solution:** ${sections.problem.currentSolution}`);
  lines.push('');

  // Target Users
  if (sections.personas.length > 0) {
    lines.push('## 3. Target Users');
    lines.push('');
    for (const persona of sections.personas) {
      lines.push(`### ${persona.name}`);
      lines.push(`**Role:** ${persona.role}`);
      if (persona.painPoints.length > 0) {
        lines.push('**Pain Points:**');
        persona.painPoints.forEach((p) => lines.push(`- ${p}`));
      }
      if (persona.goals.length > 0) {
        lines.push('**Goals:**');
        persona.goals.forEach((g) => lines.push(`- ${g}`));
      }
      lines.push('');
    }
  }

  // Competitive Landscape
  if (sections.competitors.length > 0) {
    lines.push('## 4. Competitive Landscape');
    lines.push('');
    for (const comp of sections.competitors) {
      lines.push(`### ${comp.name}${comp.url ? ` — ${comp.url}` : ''}`);
      if (comp.strengths.length > 0) {
        lines.push('**Strengths:**');
        comp.strengths.forEach((s) => lines.push(`- ${s}`));
      }
      if (comp.gaps.length > 0) {
        lines.push('**Gaps / Opportunities:**');
        comp.gaps.forEach((g) => lines.push(`- ${g}`));
      }
      lines.push('');
    }
  }

  // Functional Requirements
  if (sections.features.length > 0) {
    lines.push('## 5. Functional Requirements');
    lines.push('');
    const mvp = sections.features.filter((f) => f.priority === 'mvp');
    const later = sections.features.filter((f) => f.priority === 'later');

    if (mvp.length > 0) {
      lines.push('### 5.1 MVP (Must Have)');
      lines.push('');
      lines.push('| # | Feature | Description | Effort |');
      lines.push('|---|---------|-------------|--------|');
      mvp.forEach((f, i) => lines.push(`| ${i + 1} | ${f.name} | ${f.description} | ${f.effort} |`));
      lines.push('');
    }
    if (later.length > 0) {
      lines.push('### 5.2 Post-MVP (Nice to Have)');
      lines.push('');
      lines.push('| # | Feature | Description | Effort |');
      lines.push('|---|---------|-------------|--------|');
      later.forEach((f, i) => lines.push(`| ${i + 1} | ${f.name} | ${f.description} | ${f.effort} |`));
      lines.push('');
    }
  }

  // Data Model
  if (sections.dataModel.length > 0) {
    lines.push('## 6. Data Model');
    lines.push('');
    for (const entity of sections.dataModel) {
      lines.push(`### ${entity.name}`);
      if (entity.fields.length > 0) {
        lines.push('| Field | Type | Required |');
        lines.push('|-------|------|----------|');
        entity.fields.forEach((f) =>
          lines.push(`| ${f.name} | ${f.type} | ${f.required ? 'Yes' : 'No'} |`),
        );
      }
      if (entity.relationships.length > 0) {
        lines.push('**Relationships:**');
        entity.relationships.forEach((r) =>
          lines.push(`- ${r.type} → ${r.targetEntity}${r.description ? `: ${r.description}` : ''}`),
        );
      }
      lines.push('');
    }
  }

  // Technical Architecture
  lines.push('## 7. Technical Architecture');
  lines.push('');
  const stack = sections.stack;
  if (stack.frontend) lines.push(`- **Frontend:** ${stack.frontend}`);
  if (stack.backend) lines.push(`- **Backend:** ${stack.backend}`);
  if (stack.database) lines.push(`- **Database:** ${stack.database}`);
  if (stack.hosting) lines.push(`- **Hosting:** ${stack.hosting}`);
  if (stack.auth) lines.push(`- **Auth:** ${stack.auth}`);
  if (stack.payments) lines.push(`- **Payments:** ${stack.payments}`);
  lines.push('');

  if (sections.architecture.components.length > 0) {
    lines.push('### System Components');
    for (const comp of sections.architecture.components) {
      lines.push(`- **${comp.name}** (${comp.type})${comp.description ? `: ${comp.description}` : ''}`);
    }
    lines.push('');
  }

  // Screens
  if (sections.screens.length > 0) {
    lines.push('## 8. Screens & User Flows');
    lines.push('');
    const grouped = new Map<string, typeof sections.screens>();
    sections.screens.forEach((s) => {
      const section = s.section || 'General';
      if (!grouped.has(section)) grouped.set(section, []);
      grouped.get(section)!.push(s);
    });
    for (const [section, screens] of grouped) {
      lines.push(`### ${section}`);
      screens.forEach((s) => lines.push(`- **${s.name}**: ${s.description}`));
      lines.push('');
    }
  }

  // Milestones
  if (sections.milestones.length > 0) {
    lines.push('## 9. Release Plan');
    lines.push('');
    for (const ms of sections.milestones) {
      lines.push(`### ${ms.name}${ms.targetDate ? ` (Target: ${ms.targetDate})` : ''}`);
      if (ms.description) lines.push(ms.description);
      if (ms.tasks.length > 0) {
        ms.tasks.forEach((t) => lines.push(`- [${t.completed ? 'x' : ' '}] ${t.title}`));
      }
      lines.push('');
    }
  }

  // Decisions
  if (sections.decisions.length > 0) {
    lines.push('## 10. Key Decisions');
    lines.push('');
    lines.push('| Decision | Chosen | Reasoning |');
    lines.push('|----------|--------|-----------|');
    for (const d of sections.decisions) {
      lines.push(`| ${d.title} | ${d.chosen || 'TBD'} | ${d.reasoning || '—'} |`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Route to the correct export function based on format.
 */
export function exportProject(project: Project, format: ExportFormat): string {
  switch (format) {
    case 'markdown':
      return exportToMarkdown(project);
    case 'ai-context':
      return exportToAIContext(project);
    case 'json':
      return exportToJSON(project);
    case 'prd':
      return exportToPRD(project);
    default: {
      void (format satisfies never);
      return exportToMarkdown(project);
    }
  }
}
