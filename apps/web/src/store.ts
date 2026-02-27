// ============================================
// Groundwork - Zustand Store
// ============================================
// Global state management for the web app.
// ============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project, UserPreferences, Template } from '@groundwork/types';
import {
  createProject,
  calculateProgress,
  createEmptySections,
} from '@groundwork/logic';
import type { ColorScheme } from './theme';
import { pushProjects, pullProjects, mergeProjects, deleteRemoteProject } from './lib/sync';
import { useAuthStore } from './stores/authStore';

/**
 * Ensures a project has all section fields with sensible defaults.
 * Guards against missing properties from old schemas or incomplete imports.
 */
function ensureProjectSections(project: Project): Project {
  const defaults = createEmptySections();
  return {
    ...project,
    sections: {
      ...defaults,
      ...project.sections,
    },
    disabledSections: project.disabledSections ?? [],
  };
}

// --- App State ---
interface AppState {
  // User preferences
  preferences: UserPreferences & { colorScheme: ColorScheme };
  setPreferences: (prefs: Partial<UserPreferences & { colorScheme: ColorScheme }>) => void;

  // Projects
  projects: Project[];
  activeProjectId: string | null;

  // Project actions
  createNewProject: (name: string, description?: string) => string;
  createFromTemplate: (template: Template) => string;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setActiveProject: (id: string | null) => void;
  getActiveProject: () => Project | undefined;
  importProject: (project: Project) => void;

  // Sync
  syncStatus: { lastSynced: string | null; isSyncing: boolean; error: string | null };
  syncWithCloud: (userId: string) => Promise<void>;

  // UI State
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // --- Preferences ---
      preferences: {
        theme: 'system',
        colorScheme: 'purple' as ColorScheme,
        aiEnabled: false,
      },
      setPreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),

      // --- Projects ---
      projects: [],
      activeProjectId: null,

      createNewProject: (name, description) => {
        const project = createProject(name, description);
        set((state) => ({
          projects: [...state.projects, project],
          activeProjectId: project.id,
        }));
        return project.id;
      },

      createFromTemplate: (template) => {
        const project = createProject(
          template.prefilledProject.name || template.name,
          template.prefilledProject.description || template.description,
        );

        // Merge template data
        const merged: Project = {
          ...project,
          templateId: template.id,
          disabledSections: template.prefilledProject.disabledSections || [],
          sections: {
            ...project.sections,
            ...(template.prefilledProject.sections || {}),
          },
          canvas: template.prefilledProject.canvas || project.canvas,
        };

        // Calculate initial progress
        merged.progress = calculateProgress(merged.sections);

        set((state) => ({
          projects: [...state.projects, merged],
          activeProjectId: merged.id,
        }));
        return merged.id;
      },

      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== id) return p;
            const updated = {
              ...p,
              ...updates,
              updatedAt: new Date().toISOString(),
            };
            // Recalculate progress if sections changed
            if (updates.sections) {
              updated.progress = calculateProgress(updated.sections);
            }
            return updated;
          }),
        })),

      deleteProject: (id) => {
        // Delete from Supabase in the background if user is signed in
        const user = useAuthStore.getState().user;
        if (user) {
          deleteRemoteProject(id, user.id).catch(() => {});
        }
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          activeProjectId:
            state.activeProjectId === id ? null : state.activeProjectId,
        }));
      },

      setActiveProject: (id) => set({ activeProjectId: id }),

      getActiveProject: () => {
        const state = get();
        return state.projects.find((p) => p.id === state.activeProjectId);
      },

      importProject: (project) =>
        set((state) => {
          const safe = ensureProjectSections(project);
          // Avoid duplicates — if same id exists, replace it
          const exists = state.projects.some((p) => p.id === safe.id);
          return {
            projects: exists
              ? state.projects.map((p) => (p.id === safe.id ? safe : p))
              : [...state.projects, safe],
          };
        }),

      // --- Sync ---
      syncStatus: { lastSynced: null, isSyncing: false, error: null },

      syncWithCloud: async (userId: string) => {
        set({ syncStatus: { lastSynced: get().syncStatus.lastSynced, isSyncing: true, error: null } });
        try {
          // Pull remote projects
          const pullResult = await pullProjects(userId);
          if (pullResult.error) {
            set({ syncStatus: { lastSynced: get().syncStatus.lastSynced, isSyncing: false, error: pullResult.error } });
            return;
          }

          // Merge local + remote
          const local = get().projects;
          const merged = mergeProjects(local, pullResult.projects || []).map(ensureProjectSections);
          set({ projects: merged });

          // Push merged result back
          const pushResult = await pushProjects(merged, userId);
          if (pushResult.error) {
            set({ syncStatus: { lastSynced: get().syncStatus.lastSynced, isSyncing: false, error: pushResult.error } });
            return;
          }

          const now = new Date().toISOString();
          set({ syncStatus: { lastSynced: now, isSyncing: false, error: null } });
        } catch (e) {
          set({ syncStatus: { lastSynced: get().syncStatus.lastSynced, isSyncing: false, error: String(e) } });
        }
      },

      // --- UI ---
      sidebarOpen: true,
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    {
      name: 'groundwork-storage',
      partialize: (state) => ({
        preferences: state.preferences,
        projects: state.projects,
        activeProjectId: state.activeProjectId,
      }),
    },
  ),
);
