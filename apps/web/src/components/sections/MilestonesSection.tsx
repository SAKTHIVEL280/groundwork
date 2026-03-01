// ============================================
// Groundwork - Milestones Section Component
// ============================================

import { memo, useState } from 'react';
import {
  Alert,
  alpha,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DeleteIcon from '@mui/icons-material/Delete';
import FlagIcon from '@mui/icons-material/Flag';
import { createMilestone, createTask } from '@groundwork/logic';
import type { Milestone, MilestoneStatus, Project } from '@groundwork/types';
import { useAI } from '../../hooks/useAI';
import { MarkdownContent } from '../MarkdownContent';
import { useAppStore } from '../../store';
import { DebouncedTextField } from '../DebouncedTextField';

interface Props {
  project: Project;
  onUpdate: (id: string, updates: Partial<Project>) => void;
}

const STATUS_COLORS: Record<MilestoneStatus, 'default' | 'warning' | 'success'> = {
  'not-started': 'default',
  'in-progress': 'warning',
  completed: 'success',
};

export const MilestonesSection = memo(function MilestonesSection({ project, onUpdate }: Props) {
  const theme = useTheme();
  const ai = useAI();
  const { milestones } = project.sections;
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [newTaskInputs, setNewTaskInputs] = useState<Record<string, string>>({});

  const updateMilestones = (updated: Milestone[]) => {
    // Read latest sections from store to prevent stale closure overwrites
    const latestProject = useAppStore.getState().projects.find(p => p.id === project.id);
    const currentSections = latestProject?.sections ?? project.sections;
    onUpdate(project.id, {
      sections: { ...currentSections, milestones: updated },
    });
  };

  const addMilestone = () => {
    if (!newMilestoneName.trim()) return;
    const milestone = createMilestone(newMilestoneName.trim());
    updateMilestones([...milestones, milestone]);
    setNewMilestoneName('');
  };

  const removeMilestone = (id: string) => {
    updateMilestones(milestones.filter((m) => m.id !== id));
  };

  const cycleStatus = (current: MilestoneStatus): MilestoneStatus => {
    const order: MilestoneStatus[] = ['not-started', 'in-progress', 'completed'];
    return order[(order.indexOf(current) + 1) % order.length];
  };

  const addTask = (milestoneId: string) => {
    const taskTitle = newTaskInputs[milestoneId]?.trim();
    if (!taskTitle) return;
    const task = createTask(taskTitle);
    updateMilestones(
      milestones.map((m) =>
        m.id === milestoneId ? { ...m, tasks: [...m.tasks, task] } : m,
      ),
    );
    setNewTaskInputs({ ...newTaskInputs, [milestoneId]: '' });
  };

  const toggleTask = (milestoneId: string, taskId: string) => {
    updateMilestones(
      milestones.map((m) =>
        m.id === milestoneId
          ? {
              ...m,
              tasks: m.tasks.map((t) =>
                t.id === taskId ? { ...t, completed: !t.completed } : t,
              ),
            }
          : m,
      ),
    );
  };

  const removeTask = (milestoneId: string, taskId: string) => {
    updateMilestones(
      milestones.map((m) =>
        m.id === milestoneId
          ? { ...m, tasks: m.tasks.filter((t) => t.id !== taskId) }
          : m,
      ),
    );
  };

  const handleSuggestMilestones = async () => {
    const featureNames = project.sections.features.map(f => f.name);
    if (featureNames.length === 0) {
      setAiSuggestion('Add some features first so AI can suggest milestones.');
      return;
    }
    const result = await ai.suggestMilestones(featureNames);
    if (!result) return;
    try {
      const cleaned = result.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        const newMilestones = parsed.map((m: { name: string; tasks?: string[] }) => {
          const milestone = createMilestone(m.name);
          if (Array.isArray(m.tasks)) {
            milestone.tasks = m.tasks.map((t: string) => createTask(t));
          }
          return milestone;
        });
        const currentProject = useAppStore.getState().projects.find((p) => p.id === project.id);
        const currentMilestones = currentProject?.sections.milestones ?? milestones;
        updateMilestones([...currentMilestones, ...newMilestones]);
        return;
      }
    } catch {
      // JSON parse failed — show raw text
    }
    setAiSuggestion(result);
  };

  return (
    <Box>
      {/* Section Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            bgcolor: alpha(theme.palette.success.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FlagIcon sx={{ color: 'success.main', fontSize: 20 }} />
        </Box>
        <Typography variant="h5" fontWeight={600}>
          Milestones
        </Typography>
        <Button
          size="small"
          variant="outlined"
          startIcon={ai.loading ? <CircularProgress size={14} /> : <AutoAwesomeIcon />}
          onClick={handleSuggestMilestones}
          disabled={ai.loading}
          sx={{ ml: 'auto' }}
        >
          Suggest with AI
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, pl: 0.5, maxWidth: 600 }}>
        Break your project into week-sized milestones. Milestone 1 should be something deployable
        and usable, even if ugly.
      </Typography>

      <Collapse in={!!aiSuggestion || !!ai.error}>
        {ai.error && (
          <Alert severity="error" onClose={ai.clearError} sx={{ mb: 2, borderRadius: 2 }}>
            {ai.error}
          </Alert>
        )}
        {aiSuggestion && (
          <Alert
            severity="info"
            onClose={() => setAiSuggestion(null)}
            sx={{ mb: 2, borderRadius: 2 }}
          >
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>AI Suggestion</Typography>
            <MarkdownContent content={aiSuggestion} />
          </Alert>
        )}
      </Collapse>

      {/* Add Milestone */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
        <TextField
          value={newMilestoneName}
          onChange={(e) => setNewMilestoneName(e.target.value)}
          placeholder="Add a milestone..."
          size="small"
          fullWidth
          onKeyDown={(e) => e.key === 'Enter' && addMilestone()}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={addMilestone}
          disabled={!newMilestoneName.trim()}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Add
        </Button>
      </Stack>

      {/* Milestones List */}
      <Stack spacing={2.5}>
        {milestones.map((milestone, idx) => {
          const completedTasks = milestone.tasks.filter((t) => t.completed).length;
          const totalTasks = milestone.tasks.length;

          return (
            <Card key={milestone.id} sx={{ p: 2.5 }}>
              {/* Milestone Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '8px',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'primary.main',
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </Box>
                <DebouncedTextField
                  variant="standard"
                  value={milestone.name}
                  onChange={(value) =>
                    updateMilestones(
                      milestones.map((m) =>
                        m.id === milestone.id ? { ...m, name: value } : m,
                      ),
                    )
                  }
                  InputProps={{ disableUnderline: true, sx: { fontWeight: 600, fontSize: '1rem' } }}
                  sx={{ flex: 1 }}
                />
                {totalTasks > 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
                    {completedTasks}/{totalTasks}
                  </Typography>
                )}
                <Tooltip title="Click to cycle status">
                  <Chip
                    label={milestone.status.replace('-', ' ')}
                    color={STATUS_COLORS[milestone.status]}
                    size="small"
                    onClick={() =>
                      updateMilestones(
                        milestones.map((m) =>
                          m.id === milestone.id
                            ? { ...m, status: cycleStatus(m.status) }
                            : m,
                        ),
                      )
                    }
                    sx={{ cursor: 'pointer', textTransform: 'capitalize', fontWeight: 600 }}
                  />
                </Tooltip>
                <IconButton
                  size="small"
                  aria-label={`Delete milestone ${milestone.name}`}
                  onClick={() => removeMilestone(milestone.id)}
                  sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>

              {/* Description & Target Date */}
              <Stack direction="row" spacing={2} sx={{ mb: 1.5, ml: 0.5 }}>
                <DebouncedTextField
                  value={milestone.description || ''}
                  onChange={(value) =>
                    updateMilestones(
                      milestones.map((m) =>
                        m.id === milestone.id ? { ...m, description: value } : m,
                      ),
                    )
                  }
                  placeholder="Milestone description..."
                  variant="standard"
                  size="small"
                  multiline
                  rows={1}
                  fullWidth
                  InputProps={{ disableUnderline: true, sx: { fontSize: '0.85rem', color: 'text.secondary' } }}
                />
                <TextField
                  type="date"
                  value={milestone.targetDate || ''}
                  onChange={(e) =>
                    updateMilestones(
                      milestones.map((m) =>
                        m.id === milestone.id ? { ...m, targetDate: e.target.value } : m,
                      ),
                    )
                  }
                  label="Target Date"
                  variant="standard"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 150, flexShrink: 0 }}
                />
              </Stack>

              {milestone.tasks.length > 0 && <Divider sx={{ mb: 1.5 }} />}

              {/* Tasks */}
              <Stack spacing={0.5} sx={{ ml: 0.5 }}>
                {milestone.tasks.map((task) => (
                  <Box
                    key={task.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      py: 0.25,
                      borderRadius: 1,
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                    }}
                  >
                    <Checkbox
                      checked={task.completed}
                      onChange={() => toggleTask(milestone.id, task.id)}
                      size="small"
                      sx={{ p: 0.5 }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        flex: 1,
                        textDecoration: task.completed ? 'line-through' : 'none',
                        color: task.completed ? 'text.secondary' : 'text.primary',
                      }}
                    >
                      {task.title}
                    </Typography>
                    <IconButton
                      size="small"
                      aria-label={`Delete task ${task.title}`}
                      onClick={() => removeTask(milestone.id, task.id)}
                      sx={{ opacity: 0.4, '&:hover': { opacity: 1, color: 'error.main' } }}
                    >
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                ))}
              </Stack>

              {/* Add Task */}
              <Stack direction="row" spacing={1} sx={{ mt: 1.5, ml: 0.5 }}>
                <TextField
                  value={newTaskInputs[milestone.id] || ''}
                  onChange={(e) =>
                    setNewTaskInputs({ ...newTaskInputs, [milestone.id]: e.target.value })
                  }
                  placeholder="Add a task..."
                  size="small"
                  fullWidth
                  variant="standard"
                  onKeyDown={(e) => e.key === 'Enter' && addTask(milestone.id)}
                />
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => addTask(milestone.id)}
                  disabled={!newTaskInputs[milestone.id]?.trim()}
                >
                  Add
                </Button>
              </Stack>
            </Card>
          );
        })}
      </Stack>

      {milestones.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No milestones yet. Break your project into phases.
        </Typography>
      )}
    </Box>
  );
});
