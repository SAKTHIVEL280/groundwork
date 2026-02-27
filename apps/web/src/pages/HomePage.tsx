// ============================================
// Groundwork - Home Page
// ============================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  alpha,
  Box,
  Button,
  Card,
  CardActionArea,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid2,
  IconButton,
  LinearProgress,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import LanguageIcon from '@mui/icons-material/Language';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import TerminalIcon from '@mui/icons-material/Terminal';
import ApiIcon from '@mui/icons-material/Api';
import PaletteIcon from '@mui/icons-material/Palette';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import { getAllTemplates } from '@groundwork/logic';
import type { Template } from '@groundwork/types';
import { useAppStore } from '../store';

export function HomePage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const projects = useAppStore((s) => s.projects);
  const createNewProject = useAppStore((s) => s.createNewProject);
  const createFromTemplate = useAppStore((s) => s.createFromTemplate);
  const deleteProject = useAppStore((s) => s.deleteProject);

  const [newProjectDialog, setNewProjectDialog] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const templates = getAllTemplates();

  const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
    Language: <LanguageIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
    PhoneIphone: <PhoneIphoneIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
    Terminal: <TerminalIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
    Api: <ApiIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
    Palette: <PaletteIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
    Inventory2: <Inventory2Icon sx={{ fontSize: 32, color: 'primary.main' }} />,
  };

  const handleCreateBlank = () => {
    if (!projectName.trim()) return;
    const id = createNewProject(projectName.trim(), projectDesc.trim());
    setNewProjectDialog(false);
    setProjectName('');
    setProjectDesc('');
    navigate(`/project/${id}`);
  };

  const handleUseTemplate = (template: Template) => {
    const id = createFromTemplate(template);
    navigate(`/project/${id}`);
  };

  const handleDelete = (id: string) => {
    deleteProject(id);
    setDeleteConfirm(null);
  };

  return (
    <Box>
      {/* Hero Header */}
      <Box sx={{ mb: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <RocketLaunchIcon sx={{ color: 'primary.main', fontSize: 32 }} />
          <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
            Groundwork
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520 }}>
          Plan before you build. Choose a template to get started quickly,
          or start from scratch with a blank project.
        </Typography>
      </Box>

      {/* Templates Section */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h5" sx={{ mb: 2.5, fontWeight: 600 }}>
          Start a New Project
        </Typography>
        <Grid2 container spacing={3}>
          {/* Blank project card */}
          <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              sx={{
                height: '100%',
                borderStyle: 'dashed',
                borderColor: 'primary.main',
                borderWidth: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.03),
                '&:hover': {
                  borderColor: 'primary.dark',
                  bgcolor: alpha(theme.palette.primary.main, 0.07),
                },
              }}
            >
              <CardActionArea
                onClick={() => setNewProjectDialog(true)}
                sx={{
                  height: '100%',
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 180,
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AddIcon sx={{ fontSize: 28, color: 'primary.main' }} />
                </Box>
                <Typography variant="h6" color="primary" fontWeight={600}>
                  Blank Project
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Start from scratch
                </Typography>
              </CardActionArea>
            </Card>
          </Grid2>

          {/* Template cards */}
          {templates
            .filter((t) => t.category !== 'blank')
            .map((template) => (
              <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={template.id}>
                <Card
                  sx={{
                    height: '100%',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => handleUseTemplate(template)}
                    sx={{ height: '100%', p: 3, minHeight: 180 }}
                  >
                    <Box sx={{ mb: 1.5 }}>
                      {TEMPLATE_ICONS[template.icon] ?? (
                        <LanguageIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                      )}
                    </Box>
                    <Typography variant="h6" sx={{ mb: 0.75, fontWeight: 600 }}>
                      {template.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                      {template.description}
                    </Typography>
                  </CardActionArea>
                </Card>
              </Grid2>
            ))}
        </Grid2>
      </Box>

      {/* Existing Projects */}
      {projects.length > 0 && (
        <Box>
          <Typography variant="h5" sx={{ mb: 2.5, fontWeight: 600 }}>
            Your Projects
          </Typography>
          <Grid2 container spacing={3}>
            {projects.map((project) => (
              <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={project.id}>
                <Card
                  sx={{
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => navigate(`/project/${project.id}`)}
                    sx={{ p: 3 }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1, minWidth: 0, mr: 1 }}>
                        <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600 }} noWrap>
                          {project.name || 'Untitled'}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {project.description || 'No description'}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setDeleteConfirm(project.id);
                        }}
                        sx={{
                          color: 'text.secondary',
                          '&:hover': { color: 'error.main' },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Stack spacing={0.75}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                          Progress
                        </Typography>
                        <Typography variant="caption" color="primary.main" fontWeight={600}>
                          {project.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={project.progress}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                        }}
                      />
                    </Stack>
                  </CardActionArea>
                </Card>
              </Grid2>
            ))}
          </Grid2>
        </Box>
      )}

      {/* New Project Dialog */}
      <Dialog
        open={newProjectDialog}
        onClose={() => setNewProjectDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Create New Project</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <TextField
              autoFocus
              label="Project Name"
              placeholder="My Awesome App"
              fullWidth
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateBlank()}
            />
            <TextField
              label="Description (optional)"
              placeholder="What are you building?"
              fullWidth
              multiline
              rows={2}
              value={projectDesc}
              onChange={(e) => setProjectDesc(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setNewProjectDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateBlank}
            disabled={!projectName.trim()}
          >
            Create Project
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Delete Project?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            This cannot be undone. All planning data will be permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
