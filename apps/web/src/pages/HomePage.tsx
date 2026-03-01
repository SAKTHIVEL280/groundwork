// ============================================
// Groundwork - Home Page
// ============================================

import { useState, useMemo, useEffect, useCallback } from 'react';
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
  InputAdornment,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
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
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { getAllTemplates } from '@groundwork/logic';
import type { Template } from '@groundwork/types';
import { useAppStore } from '../store';

const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
  Language: <LanguageIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
  PhoneIphone: <PhoneIphoneIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
  Terminal: <TerminalIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
  Api: <ApiIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
  Palette: <PaletteIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
  Inventory2: <Inventory2Icon sx={{ fontSize: 32, color: 'primary.main' }} />,
};

export function HomePage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const projects = useAppStore((s) => s.projects);
  const createNewProject = useAppStore((s) => s.createNewProject);
  const createFromTemplate = useAppStore((s) => s.createFromTemplate);
  const deleteProject = useAppStore((s) => s.deleteProject);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const toggleArchive = useAppStore((s) => s.toggleArchive);

  const [newProjectDialog, setNewProjectDialog] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'updated' | 'name' | 'progress'>('updated');
  const [showArchived, setShowArchived] = useState(false);

  // Template name prompt
  const [templateDialog, setTemplateDialog] = useState<Template | null>(null);
  const [templateName, setTemplateName] = useState('');

  const templates = useMemo(() => getAllTemplates(), []);

  // Keyboard shortcut: Ctrl+N to create new project (#25)
  const openNewDialog = useCallback(() => setNewProjectDialog(true), []);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        openNewDialog();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openNewDialog]);

  const handleCreateBlank = () => {
    if (!projectName.trim()) return;
    const id = createNewProject(projectName.trim(), projectDesc.trim());
    setNewProjectDialog(false);
    setProjectName('');
    setProjectDesc('');
    navigate(`/project/${id}`);
  };

  const handleUseTemplate = (template: Template) => {
    setTemplateDialog(template);
    setTemplateName(template.name);
  };

  const handleConfirmTemplate = () => {
    if (!templateDialog) return;
    const id = createFromTemplate(templateDialog);
    if (templateName.trim()) {
      useAppStore.getState().updateProject(id, { name: templateName.trim() });
    }
    setTemplateDialog(null);
    setTemplateName('');
    navigate(`/project/${id}`);
  };

  const handleDelete = (id: string) => {
    deleteProject(id);
    setDeleteConfirm(null);
  };

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let list = projects.filter((p) => showArchived ? p.archived : !p.archived);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
      );
    }
    // Favorites first, then sort
    list = [...list].sort((a, b) => {
      if (a.favorite && !b.favorite) return -1;
      if (!a.favorite && b.favorite) return 1;
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'progress': return b.progress - a.progress;
        case 'updated':
        default: return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });
    return list;
  }, [projects, searchQuery, sortBy, showArchived]);

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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5, flexWrap: 'wrap' }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Your Projects
            </Typography>
            <TextField
              size="small"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: '100%', sm: 220 } }}
            />
            <TextField
              size="small"
              select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'updated' | 'name' | 'progress')}
              sx={{ width: { xs: '100%', sm: 140 } }}
            >
              <MenuItem value="updated">Last Updated</MenuItem>
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="progress">Progress</MenuItem>
            </TextField>
            <Button
              variant={showArchived ? 'contained' : 'outlined'}
              size="small"
              startIcon={showArchived ? <VisibilityOffIcon /> : <VisibilityIcon />}
              onClick={() => setShowArchived(!showArchived)}
              aria-pressed={showArchived}
            >
              {showArchived ? 'Showing Archived' : 'Show Archived'}
            </Button>
          </Box>
          <Grid2 container spacing={3}>
            {filteredProjects.map((project) => (
              <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={project.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
                    },
                  }}
                  onClick={() => navigate(`/project/${project.id}`)}
                >
                  <Box sx={{ p: 3 }}>
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
                      <Stack direction="row" spacing={0} onClick={(e) => e.stopPropagation()}>
                        <Tooltip title={project.favorite ? 'Unfavorite' : 'Favorite'}>
                          <IconButton
                            size="small"
                            aria-label={project.favorite ? 'Unfavorite' : 'Favorite'}
                            onClick={() => toggleFavorite(project.id)}
                            sx={{ color: project.favorite ? 'warning.main' : 'text.secondary' }}
                          >
                            {project.favorite ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={project.archived ? 'Unarchive' : 'Archive'}>
                          <IconButton
                            size="small"
                            aria-label={project.archived ? 'Unarchive' : 'Archive'}
                            onClick={() => toggleArchive(project.id)}
                            sx={{ color: 'text.secondary' }}
                          >
                            {project.archived ? <UnarchiveIcon fontSize="small" /> : <ArchiveIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        <IconButton
                          size="small"
                          aria-label={`Delete project ${project.name}`}
                          onClick={() => setDeleteConfirm(project.id)}
                          sx={{
                            color: 'text.secondary',
                            '&:hover': { color: 'error.main' },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Box>
                    <Stack spacing={0.75}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                          Progress
                        </Typography>
                        <Typography variant="caption" color={project.progress >= 70 ? 'success.main' : project.progress >= 30 ? 'warning.main' : 'error.main'} fontWeight={600}>
                          {project.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={project.progress}
                        color={project.progress >= 70 ? 'success' : project.progress >= 30 ? 'warning' : 'error'}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                        }}
                      />
                    </Stack>
                  </Box>
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

      {/* Template Name Prompt */}
      <Dialog
        open={!!templateDialog}
        onClose={() => setTemplateDialog(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Name Your Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Project Name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConfirmTemplate()}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setTemplateDialog(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmTemplate}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
