// ============================================
// Groundwork - Milestones Section Component
// ============================================

import { useState } from 'react';
import {
  alpha,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  Divider,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FlagIcon from '@mui/icons-material/Flag';
import { createMilestone, createTask } from '@groundwork/logic';
import type { Milestone, MilestoneStatus, Project } from '@groundwork/types';

interface Props {
  project: Project;
  onUpdate: (id: string, updates: Partial<Project>) => void;
}

const STATUS_COLORS: Record<MilestoneStatus, 'default' | 'warning' | 'success'> = {
  'not-started': 'default',
  'in-progress': 'warning',
  completed: 'success',
};

export function MilestonesSection({ project, onUpdate }: Props) {
  const theme = useTheme();
  const { milestones } = project.sections;
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [newTaskInputs, setNewTaskInputs] = useState<Record<string, string>>({});

  const updateMilestones = (updated: Milestone[]) => {
    onUpdate(project.id, {
      sections: { ...project.sections, milestones: updated },
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
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, pl: 0.5, maxWidth: 600 }}>
        Break your project into week-sized milestones. Milestone 1 should be something deployable
        and usable, even if ugly.
      </Typography>

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
                <TextField
                  variant="standard"
                  value={milestone.name}
                  onChange={(e) =>
                    updateMilestones(
                      milestones.map((m) =>
                        m.id === milestone.id ? { ...m, name: e.target.value } : m,
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
                  onClick={() => removeMilestone(milestone.id)}
                  sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>

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
        <Card sx={{ p: 5, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No milestones yet. Break your project into phases.
          </Typography>
        </Card>
      )}
    </Box>
  );
}
