// ============================================
// Groundwork - Zustand Store
// ============================================
// Global state management for the web app.
// ============================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Project, UserPreferences, Template, ColorScheme } from '@groundwork/types';
import {
  createProject,
  calculateProgress,
  createEmptySections,
} from '@groundwork/logic';
import { pushProjects, pullProjects, mergeProjects, deleteRemoteProject } from './lib/sync';
import { useAuthStore } from './stores/authStore';

// --- Debounced localStorage storage to avoid excessive writes (#55) ---
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_MS = 300;
const debouncedStorage = createJSONStorage(() => ({
  getItem: (name: string) => localStorage.getItem(name),
  setItem: (name: string, value: string) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      localStorage.setItem(name, value);
    }, DEBOUNCE_MS);
  },
  removeItem: (name: string) => localStorage.removeItem(name),
}));

/**
 * Ensures a project has all section fields with sensible defaults.
 * Guards against missing properties from old schemas or incomplete imports.
 */
function ensureProjectSections(project: Project): Project {
  const defaults = createEmptySections();
  const sections = {
    ...defaults,
    ...project.sections,
  };
  // Ensure nested objects have all required fields
  sections.stack = { ...defaults.stack, ...sections.stack, other: sections.stack?.other ?? [] };
  sections.architecture = {
    components: sections.architecture?.components ?? [],
    connections: sections.architecture?.connections ?? [],
  };
  return {
    ...project,
    sections,
    canvas: project.canvas ?? {},
    disabledSections: project.disabledSections ?? [],
  };
}

// --- App State ---
interface AppState {
  // User preferences
  preferences: UserPreferences;
  setPreferences: (prefs: Partial<UserPreferences>) => void;

  // Projects
  projects: Project[];
  activeProjectId: string | null;
  deletedProjectIds: string[]; // tombstone tracking for sync (#3)

  // Project actions
  createNewProject: (name: string, description?: string) => string;
  createFromTemplate: (template: Template) => string;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setActiveProject: (id: string | null) => void;
  importProject: (project: Project) => void;
  duplicateProject: (id: string) => string | null;
  toggleFavorite: (id: string) => void;
  toggleArchive: (id: string) => void;

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
      deletedProjectIds: [],

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

        // Deep clone template data to avoid shared references between projects
        const merged: Project = {
          ...project,
          templateId: template.id,
          disabledSections: template.prefilledProject.disabledSections || [],
          sections: structuredClone({
            ...project.sections,
            ...(template.prefilledProject.sections || {}),
          }),
          canvas: template.prefilledProject.canvas
            ? structuredClone(template.prefilledProject.canvas)
            : project.canvas,
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
        // Track tombstone so sync doesn't resurrect it (#3)
        set((state) => ({
          deletedProjectIds: [...state.deletedProjectIds, id],
        }));
        // Delete from Supabase in the background if user is signed in
        const user = useAuthStore.getState().user;
        if (user) {
          deleteRemoteProject(id, user.id).catch((e) => {
            console.error('Failed to delete project from remote:', e);
          });
        }
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          activeProjectId:
            state.activeProjectId === id ? null : state.activeProjectId,
        }));
      },

      setActiveProject: (id) => set({ activeProjectId: id }),

      importProject: (project) =>
        set((state) => {
          const safe = ensureProjectSections(project);
          // Recalculate progress on import
          safe.progress = calculateProgress(safe.sections);
          // Avoid duplicates — if same id exists, replace it
          const exists = state.projects.some((p) => p.id === safe.id);
          return {
            projects: exists
              ? state.projects.map((p) => (p.id === safe.id ? safe : p))
              : [...state.projects, safe],
          };
        }),

      duplicateProject: (id) => {
        const state = get();
        const source = state.projects.find((p) => p.id === id);
        if (!source) return null;
        const cloned = createProject(`${source.name} (copy)`, source.description);
        const merged: Project = {
          ...cloned,
          sections: structuredClone(source.sections),
          canvas: structuredClone(source.canvas),
          disabledSections: source.disabledSections ? [...source.disabledSections] : [],
        };
        merged.progress = calculateProgress(merged.sections);
        set({ projects: [...state.projects, merged], activeProjectId: merged.id });
        return merged.id;
      },

      toggleFavorite: (id) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, favorite: !p.favorite, updatedAt: new Date().toISOString() } : p,
          ),
        })),

      toggleArchive: (id) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, archived: !p.archived, updatedAt: new Date().toISOString() } : p,
          ),
        })),

      // --- Sync ---
      syncStatus: { lastSynced: null, isSyncing: false, error: null },

      syncWithCloud: async (userId: string) => {
        // Prevent concurrent syncs
        if (get().syncStatus.isSyncing) return;
        set({ syncStatus: { lastSynced: get().syncStatus.lastSynced, isSyncing: true, error: null } });
        try {
          // Pull remote projects
          const pullResult = await pullProjects(userId);
          if (pullResult.error) {
            set({ syncStatus: { lastSynced: get().syncStatus.lastSynced, isSyncing: false, error: pullResult.error } });
            return;
          }

          // Merge local + remote (passing tombstones to filter deleted)
          const local = get().projects;
          const deletedIds = get().deletedProjectIds;
          const merged = mergeProjects(local, pullResult.projects || [], deletedIds).map(ensureProjectSections);
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
      storage: debouncedStorage,
      partialize: (state) => ({
        preferences: state.preferences,
        projects: state.projects,
        activeProjectId: state.activeProjectId,
        deletedProjectIds: state.deletedProjectIds,
      }) as unknown as AppState,
    },
  ),
);
