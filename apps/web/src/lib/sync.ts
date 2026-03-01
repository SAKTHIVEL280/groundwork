// ============================================
// Groundwork - Sync Engine (Supabase)
// ============================================
// Syncs local Zustand state with Supabase.
// Local-first: works offline, syncs when online.
// ============================================

import type { Project } from '@groundwork/types';
import { supabase } from '../lib/supabase';

export interface SyncStatus {
  lastSynced: string | null;
  isSyncing: boolean;
  error: string | null;
}

/**
 * Push all local projects to Supabase (upsert).
 * Uses the user's ID from the session.
 */
export async function pushProjects(
  projects: Project[],
  userId: string,
): Promise<{ error?: string }> {
  try {
    const rows = projects.map((p) => ({
      id: p.id,
      user_id: userId,
      name: p.name,
      data: JSON.parse(JSON.stringify(p)), // full project as JSONB
      updated_at: p.updatedAt,
    }));

    const { error } = await supabase
      .from('projects')
      .upsert(rows, { onConflict: 'id' });

    if (error) return { error: error.message };
    return {};
  } catch (e) {
    return { error: String(e) };
  }
}

/**
 * Pull all projects for the current user from Supabase.
 */
export async function pullProjects(
  userId: string,
): Promise<{ projects?: Project[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('data')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) return { error: error.message };

    const projects: Project[] = (data || []).map((row: { data: Project }) => row.data);
    return { projects };
  } catch (e) {
    return { error: String(e) };
  }
}

/**
 * Delete a project from Supabase.
 */
export async function deleteRemoteProject(
  projectId: string,
  userId: string,
): Promise<{ error?: string }> {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', userId);

    if (error) return { error: error.message };
    return {};
  } catch (e) {
    return { error: String(e) };
  }
}

/**
 * Merge remote projects with local projects.
 * Strategy: last-write-wins based on updatedAt.
 * Filters out any projects whose IDs appear in deletedIds (tombstones).
 */
export function mergeProjects(
  local: Project[],
  remote: Project[],
  deletedIds: string[] = [],
): Project[] {
  const deletedSet = new Set(deletedIds);
  const merged = new Map<string, Project>();

  // Add all local projects
  for (const p of local) {
    if (!deletedSet.has(p.id)) {
      merged.set(p.id, p);
    }
  }

  // Merge remote: keep whichever is newer, skip tombstoned
  for (const rp of remote) {
    if (deletedSet.has(rp.id)) continue;
    const existing = merged.get(rp.id);
    if (!existing || new Date(rp.updatedAt) > new Date(existing.updatedAt)) {
      merged.set(rp.id, rp);
    }
  }

  return Array.from(merged.values());
}
