// ============================================
// Groundwork - Architecture Section Component
// ============================================

import { useState, memo, useMemo } from 'react';
import {
  alpha,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { v4 as uuid } from 'uuid';
import type { ArchitectureComponent, ArchitectureConnection, Project } from '@groundwork/types';
import { useAppStore } from '../../store';
import { MermaidDiagram } from '../MermaidDiagram';
import { DebouncedTextField } from '../DebouncedTextField';

interface Props {
  project: Project;
  onUpdate: (id: string, updates: Partial<Project>) => void;
}

const COMPONENT_TYPES: ArchitectureComponent['type'][] = ['frontend', 'backend', 'database', 'service', 'external'];

const TYPE_COLORS: Record<ArchitectureComponent['type'], 'primary' | 'secondary' | 'success' | 'warning' | 'info'> = {
  frontend: 'primary',
  backend: 'secondary',
  database: 'success',
  service: 'warning',
  external: 'info',
};

export const ArchitectureSection = memo(function ArchitectureSection({ project, onUpdate }: Props) {
  const theme = useTheme();
  const { architecture } = project.sections;
  const { components, connections } = architecture;

  const [newCompName, setNewCompName] = useState('');
  const [newCompType, setNewCompType] = useState<ArchitectureComponent['type']>('frontend');
  const [connFrom, setConnFrom] = useState('');
  const [connTo, setConnTo] = useState('');
  const [connLabel, setConnLabel] = useState('');
  const [connProtocol, setConnProtocol] = useState('');

  const updateArch = (updates: Partial<typeof architecture>) => {
    // Read latest sections from store to prevent stale closure overwrites
    const latestProject = useAppStore.getState().projects.find(p => p.id === project.id);
    const currentSections = latestProject?.sections ?? project.sections;
    onUpdate(project.id, {
      sections: {
        ...currentSections,
        architecture: { ...currentSections.architecture, ...updates },
      },
    });
  };

  const addComponent = () => {
    if (!newCompName.trim()) return;
    const comp: ArchitectureComponent = {
      id: uuid(),
      name: newCompName.trim(),
      type: newCompType,
    };
    updateArch({ components: [...components, comp] });
    setNewCompName('');
  };

  const updateComponent = (id: string, updates: Partial<ArchitectureComponent>) => {
    updateArch({
      components: components.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    });
  };

  const removeComponent = (id: string) => {
    updateArch({
      components: components.filter((c) => c.id !== id),
      connections: connections.filter((conn) => conn.from !== id && conn.to !== id),
    });
    // Reset dropdowns if the deleted component was selected
    if (connFrom === id) setConnFrom('');
    if (connTo === id) setConnTo('');
  };

  const addConnection = () => {
    if (!connFrom || !connTo || connFrom === connTo) return;
    // Validate that both IDs still reference existing components
    if (!components.some((c) => c.id === connFrom) || !components.some((c) => c.id === connTo)) return;
    const conn: ArchitectureConnection = {
      id: uuid(),
      from: connFrom,
      to: connTo,
      label: connLabel.trim() || undefined,
      protocol: connProtocol.trim() || undefined,
    };
    updateArch({ connections: [...connections, conn] });
    setConnLabel('');
    setConnProtocol('');
  };

  const removeConnection = (id: string) => {
    updateArch({ connections: connections.filter((c) => c.id !== id) });
  };

  const getCompName = (id: string) => components.find((c) => c.id === id)?.name || '?';

  const archDiagram = useMemo(() => {
    if (components.length === 0) return '';
    const lines = ['graph LR'];
    for (const c of components) {
      const shape = c.type === 'database' ? `[(${c.name})]` : c.type === 'external' ? `{{${c.name}}}` : `[${c.name}]`;
      lines.push(`  ${c.id}${shape}`);
    }
    for (const conn of connections) {
      const label = [conn.label, conn.protocol].filter(Boolean).join(' / ');
      lines.push(label ? `  ${conn.from} -->|${label}| ${conn.to}` : `  ${conn.from} --> ${conn.to}`);
    }
    return lines.join('\n');
  }, [components, connections]);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AccountTreeIcon sx={{ color: 'primary.main', fontSize: 20 }} />
        </Box>
        <Typography variant="h5" fontWeight={600}>
          Architecture
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, pl: 0.5, maxWidth: 600 }}>
        Define the high-level components of your system and how they connect.
      </Typography>

      {/* Add Component */}
      <Card sx={{ p: 2.5, mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
          Add Component
        </Typography>
        <Stack direction="row" spacing={1.5}>
          <TextField
            size="small"
            placeholder="Component name (e.g. Web App, API Server)"
            value={newCompName}
            onChange={(e) => setNewCompName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addComponent()}
            sx={{ flex: 1 }}
          />
          <TextField
            size="small"
            select
            value={newCompType}
            onChange={(e) => setNewCompType(e.target.value as ArchitectureComponent['type'])}
            sx={{ width: 140 }}
          >
            {COMPONENT_TYPES.map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </TextField>
          <Button variant="contained" startIcon={<AddIcon />} onClick={addComponent} sx={{ whiteSpace: 'nowrap' }}>
            Add
          </Button>
        </Stack>
      </Card>

      {/* Components Grid */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
        {components.map((comp) => (
          <Card key={comp.id} sx={{ p: 2, minWidth: 180, flex: '1 1 auto', maxWidth: 280 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {comp.name}
              </Typography>
              <IconButton size="small" onClick={() => removeComponent(comp.id)} aria-label={`Delete component ${comp.name}`} sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
                <DeleteIcon fontSize="inherit" />
              </IconButton>
            </Box>
            <Chip label={comp.type} size="small" color={TYPE_COLORS[comp.type]} variant="outlined" />
            <DebouncedTextField
              value={comp.description || ''}
              onChange={(value) => updateComponent(comp.id, { description: value })}
              label="Description"
              placeholder="What does this component do?"
              variant="standard"
              size="small"
              fullWidth
              InputProps={{ disableUnderline: true, sx: { fontSize: '0.8rem', color: 'text.secondary' } }}
              sx={{ mt: 1 }}
            />
          </Card>
        ))}
        {components.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4, width: '100%' }}>
            No components yet. Add the building blocks of your system.
          </Typography>
        )}
      </Box>

      {/* Connections */}
      {components.length >= 2 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Card sx={{ p: 2.5, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
              Add Connection
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
              <TextField
                size="small"
                select
                label="From"
                value={connFrom}
                onChange={(e) => setConnFrom(e.target.value)}
                sx={{ flex: 1 }}
              >
                {components.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </TextField>
              <ArrowForwardIcon color="action" />
              <TextField
                size="small"
                select
                label="To"
                value={connTo}
                onChange={(e) => setConnTo(e.target.value)}
                sx={{ flex: 1 }}
              >
                {components.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </TextField>
              <TextField
                size="small"
                placeholder="Label (e.g. REST)"
                value={connLabel}
                onChange={(e) => setConnLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addConnection()}
                sx={{ flex: 1 }}
              />
              <TextField
                size="small"
                placeholder="Protocol"
                value={connProtocol}
                onChange={(e) => setConnProtocol(e.target.value)}
                sx={{ width: 120 }}
              />
              <Button variant="outlined" onClick={addConnection} sx={{ whiteSpace: 'nowrap' }}>
                Connect
              </Button>
            </Box>
          </Card>

          {/* Connection List */}
          {connections.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {connections.map((conn) => (
                <Chip
                  key={conn.id}
                  label={`${getCompName(conn.from)} → ${getCompName(conn.to)}${conn.label ? ` (${conn.label})` : ''}${conn.protocol ? ` [${conn.protocol}]` : ''}`}
                  size="small"
                  onDelete={() => removeConnection(conn.id)}
                  variant="outlined"
                />
              ))}
            </Box>
          )}
        </>
      )}

      {archDiagram && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Architecture Diagram</Typography>
          <MermaidDiagram chart={archDiagram} />
        </Box>
      )}
    </Box>
  );
});
