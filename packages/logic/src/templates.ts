// ============================================
// Groundwork - Project Templates
// ============================================
// Pre-filled templates for common project types.
// Helps first-time users understand the app.
// ============================================

import type { Template } from '@groundwork/types';

export const TEMPLATES: readonly Template[] = [
  {
    id: 'template-saas',
    name: 'SaaS Web App',
    description: 'A subscription-based web application (B2B or B2C)',
    icon: 'Language',
    category: 'saas',
    prefilledProject: {
      name: 'My SaaS App',
      description: 'A subscription-based web application',
      disabledSections: [],
      sections: {
        problem: {
          statement: '',
          impact: '',
          currentSolution: '',
        },
        personas: [
          {
            id: 'tpl-saas-p1',
            name: 'Power User',
            role: 'Daily active user who needs the core feature',
            painPoints: ['Current tools are too complex', 'Too expensive for small teams'],
            goals: ['Save time on repetitive tasks', 'Simple and affordable solution'],
          },
        ],
        competitors: [],
        features: [
          {
            id: 'tpl-saas-f1',
            name: 'User Authentication',
            description: 'Sign up, sign in, password reset, OAuth',
            priority: 'mvp',
            effort: 'medium',
          },
          {
            id: 'tpl-saas-f2',
            name: 'Dashboard',
            description: 'Main view after login showing key data',
            priority: 'mvp',
            effort: 'large',
          },
          {
            id: 'tpl-saas-f3',
            name: 'Settings Page',
            description: 'User profile and app preferences',
            priority: 'mvp',
            effort: 'small',
          },
          {
            id: 'tpl-saas-f4',
            name: 'Billing & Subscriptions',
            description: 'Stripe integration for payments',
            priority: 'later',
            effort: 'large',
          },
          {
            id: 'tpl-saas-f5',
            name: 'Team Collaboration',
            description: 'Invite team members, shared workspace',
            priority: 'later',
            effort: 'large',
          },
        ],
        dataModel: [
          {
            id: 'tpl-saas-e1',
            name: 'User',
            fields: [
              { name: 'id', type: 'uuid', required: true },
              { name: 'email', type: 'string', required: true },
              { name: 'name', type: 'string', required: true },
              { name: 'avatarUrl', type: 'string', required: false },
              { name: 'createdAt', type: 'timestamp', required: true },
            ],
            relationships: [],
          },
        ],
        stack: {
          frontend: 'React + TypeScript',
          backend: 'Node.js + Express',
          database: 'PostgreSQL',
          hosting: 'Vercel + Railway',
          auth: 'Supabase Auth',
          payments: 'Stripe',
          other: [],
        },
        screens: [
          { id: 'tpl-saas-s1', name: 'Landing Page', description: 'Marketing page with sign up CTA' },
          { id: 'tpl-saas-s2', name: 'Dashboard', description: 'Main app view after login' },
          { id: 'tpl-saas-s3', name: 'Settings', description: 'User preferences and account' },
        ],
        architecture: { components: [], connections: [] },
        milestones: [
          {
            id: 'tpl-saas-m1',
            name: 'MVP Launch',
            description: 'Core features, auth, basic dashboard',
            tasks: [
              { id: 'tpl-saas-t1', title: 'Set up project & deploy pipeline', completed: false },
              { id: 'tpl-saas-t2', title: 'Implement authentication', completed: false },
              { id: 'tpl-saas-t3', title: 'Build main dashboard', completed: false },
              { id: 'tpl-saas-t4', title: 'Launch to first users', completed: false },
            ],
            status: 'not-started',
          },
        ],
        decisions: [],
      },
    },
  },
  {
    id: 'template-mobile',
    name: 'Mobile App',
    description: 'An iOS & Android consumer mobile application',
    icon: 'PhoneIphone',
    category: 'mobile-app',
    prefilledProject: {
      name: 'My Mobile App',
      description: 'A consumer mobile application for iOS and Android',
      disabledSections: [],
      sections: {
        problem: { statement: '', impact: '', currentSolution: '' },
        personas: [],
        competitors: [],
        features: [
          {
            id: 'tpl-mob-f1',
            name: 'Onboarding Flow',
            description: 'First-time user experience with app intro',
            priority: 'mvp',
            effort: 'medium',
          },
          {
            id: 'tpl-mob-f2',
            name: 'Home Screen',
            description: 'Main screen with core content',
            priority: 'mvp',
            effort: 'large',
          },
          {
            id: 'tpl-mob-f3',
            name: 'Push Notifications',
            description: 'Engage users with timely notifications',
            priority: 'later',
            effort: 'medium',
          },
        ],
        dataModel: [],
        stack: {
          frontend: 'React Native + Expo',
          backend: 'Supabase',
          database: 'PostgreSQL (Supabase)',
          hosting: 'EAS (Expo Application Services)',
          auth: 'Supabase Auth',
          other: [],
        },
        screens: [
          { id: 'tpl-mob-s1', name: 'Onboarding', description: 'Welcome screens for new users' },
          { id: 'tpl-mob-s2', name: 'Home', description: 'Main content feed' },
          { id: 'tpl-mob-s3', name: 'Profile', description: 'User profile and settings' },
        ],
        architecture: { components: [], connections: [] },
        milestones: [],
        decisions: [],
      },
    },
  },
  {
    id: 'template-cli',
    name: 'CLI Tool',
    description: 'A command-line tool for developers',
    icon: 'Terminal',
    category: 'cli-tool',
    prefilledProject: {
      name: 'My CLI Tool',
      description: 'A developer command-line tool',
      disabledSections: ['personas', 'competitors', 'screens'],
      sections: {
        problem: { statement: '', impact: '', currentSolution: '' },
        personas: [],
        competitors: [],
        features: [
          {
            id: 'tpl-cli-f1',
            name: 'Core Command',
            description: 'The main command that does the thing',
            priority: 'mvp',
            effort: 'large',
          },
          {
            id: 'tpl-cli-f2',
            name: 'Config File',
            description: 'Support .config file for project settings',
            priority: 'mvp',
            effort: 'medium',
          },
          {
            id: 'tpl-cli-f3',
            name: 'Interactive Mode',
            description: 'Guided prompts for beginners',
            priority: 'later',
            effort: 'medium',
          },
        ],
        dataModel: [],
        stack: {
          frontend: 'N/A',
          backend: 'Node.js + TypeScript',
          database: 'None (file-based)',
          hosting: 'npm registry',
          other: ['commander.js', 'chalk', 'ora'],
        },
        screens: [],
        architecture: { components: [], connections: [] },
        milestones: [],
        decisions: [],
      },
    },
  },
  {
    id: 'template-api',
    name: 'API / Backend',
    description: 'A REST or GraphQL backend service',
    icon: 'Api',
    category: 'api',
    prefilledProject: {
      name: 'My API',
      description: 'A backend API service',
      disabledSections: ['personas', 'screens'],
      sections: {
        problem: { statement: '', impact: '', currentSolution: '' },
        personas: [],
        competitors: [],
        features: [
          {
            id: 'tpl-api-f1',
            name: 'CRUD Endpoints',
            description: 'Create, read, update, delete for core resources',
            priority: 'mvp',
            effort: 'large',
          },
          {
            id: 'tpl-api-f2',
            name: 'Authentication',
            description: 'JWT-based auth with refresh tokens',
            priority: 'mvp',
            effort: 'medium',
          },
          {
            id: 'tpl-api-f3',
            name: 'Rate Limiting',
            description: 'Protect API from abuse',
            priority: 'later',
            effort: 'small',
          },
        ],
        dataModel: [],
        stack: {
          backend: 'Node.js + Express',
          database: 'PostgreSQL',
          hosting: 'Railway',
          auth: 'JWT',
          other: ['Prisma ORM', 'Zod validation'],
        },
        screens: [],
        architecture: { components: [], connections: [] },
        milestones: [],
        decisions: [],
      },
    },
  },
  {
    id: 'template-portfolio',
    name: 'Portfolio / Landing',
    description: 'A personal portfolio or product landing page',
    icon: 'Palette',
    category: 'portfolio',
    prefilledProject: {
      name: 'My Portfolio',
      description: 'A personal portfolio website',
      disabledSections: ['problem', 'personas', 'competitors', 'dataModel'],
      sections: {
        problem: { statement: '', impact: '', currentSolution: '' },
        personas: [],
        competitors: [],
        features: [
          {
            id: 'tpl-port-f1',
            name: 'Hero Section',
            description: 'Eye-catching intro with name and tagline',
            priority: 'mvp',
            effort: 'small',
          },
          {
            id: 'tpl-port-f2',
            name: 'Projects Showcase',
            description: 'Grid of projects with descriptions and links',
            priority: 'mvp',
            effort: 'medium',
          },
          {
            id: 'tpl-port-f3',
            name: 'Contact Form',
            description: 'Simple form to get in touch',
            priority: 'mvp',
            effort: 'small',
          },
          {
            id: 'tpl-port-f4',
            name: 'Blog',
            description: 'Markdown-based blog posts',
            priority: 'later',
            effort: 'large',
          },
        ],
        dataModel: [],
        stack: {
          frontend: 'Next.js + Tailwind CSS',
          hosting: 'Vercel',
          other: ['MDX for blog'],
        },
        screens: [
          { id: 'tpl-port-s1', name: 'Home', description: 'Hero + about + featured projects' },
          { id: 'tpl-port-s2', name: 'Projects', description: 'Full project grid' },
          { id: 'tpl-port-s3', name: 'Contact', description: 'Contact form' },
        ],
        architecture: { components: [], connections: [] },
        milestones: [],
        decisions: [],
      },
    },
  },
  {
    id: 'template-library',
    name: 'Open Source Library',
    description: 'An npm/PyPI package or reusable library',
    icon: 'Inventory2',
    category: 'library',
    prefilledProject: {
      name: 'My Library',
      description: 'A reusable open source library',
      disabledSections: ['personas', 'screens'],
      sections: {
        problem: { statement: '', impact: '', currentSolution: '' },
        personas: [],
        competitors: [],
        features: [
          {
            id: 'tpl-lib-f1',
            name: 'Core API',
            description: 'The main functions/classes the library exposes',
            priority: 'mvp',
            effort: 'large',
          },
          {
            id: 'tpl-lib-f2',
            name: 'Documentation',
            description: 'README, API docs, examples',
            priority: 'mvp',
            effort: 'medium',
          },
          {
            id: 'tpl-lib-f3',
            name: 'TypeScript Support',
            description: 'Full type definitions',
            priority: 'mvp',
            effort: 'small',
          },
        ],
        dataModel: [],
        stack: {
          backend: 'TypeScript',
          hosting: 'npm registry',
          other: ['tsup (bundler)', 'vitest (testing)', 'typedoc'],
        },
        screens: [],
        architecture: { components: [], connections: [] },
        milestones: [],
        decisions: [],
      },
    },
  },
  {
    id: 'template-blank',
    name: 'Blank Canvas',
    description: 'Start from scratch with an empty project',
    icon: 'AutoAwesome',
    category: 'blank',
    prefilledProject: {
      name: '',
      description: '',
    },
  },
];

/**
 * Get a template by ID.
 */
export function getTemplate(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

/**
 * Get all templates.
 */
export function getAllTemplates(): readonly Template[] {
  return TEMPLATES;
}
