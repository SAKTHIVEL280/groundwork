// ============================================
// Groundwork - Personas Section Component
// ============================================

import { useState } from 'react';
import {
  alpha,
  Box,
  Button,
  Card,
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
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { createPersona } from '@groundwork/logic';
import type { Persona, Project } from '@groundwork/types';
import { useAI } from '../../hooks/useAI';
import { AIAssistButton } from '../AIAssistButton';
import { useAppStore } from '../../store';

interface Props {
  project: Project;
  onUpdate: (id: string, updates: Partial<Project>) => void;
}

export function PersonasSection({ project, onUpdate }: Props) {
  const theme = useTheme();
  const { personas } = project.sections;
  const [newName, setNewName] = useState('');
  const ai = useAI();

  const updatePersonas = (updated: Persona[]) => {
    onUpdate(project.id, {
      sections: { ...project.sections, personas: updated },
    });
  };

  const addPersona = () => {
    if (!newName.trim()) return;
    updatePersonas([...personas, createPersona(newName.trim())]);
    setNewName('');
  };

  const handleAISuggest = async () => {
    const desc = `${project.name}. ${project.description}. ${project.sections.problem.statement}`;
    const result = await ai.suggestPersonas(desc);
    if (!result) return;
    try {
      const parsed = JSON.parse(result);
      if (Array.isArray(parsed)) {
        const newPersonas: Persona[] = parsed.map((p: { name: string; role?: string; painPoints?: string[]; goals?: string[] }) => ({
          ...createPersona(p.name, p.role || ''),
          painPoints: p.painPoints || [],
          goals: p.goals || [],
        }));
        // Read latest personas from store to avoid stale closure
        const currentProject = useAppStore.getState().projects.find((pr) => pr.id === project.id);
        const currentPersonas = currentProject?.sections.personas ?? personas;
        updatePersonas([...currentPersonas, ...newPersonas]);
      }
    } catch {
      // Ignore parse failures
    }
  };

  const removePersona = (id: string) => {
    updatePersonas(personas.filter((p) => p.id !== id));
  };

  const updatePersona = (id: string, updates: Partial<Persona>) => {
    updatePersonas(personas.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const addListItem = (personaId: string, field: 'painPoints' | 'goals', value: string) => {
    if (!value.trim()) return;
    const persona = personas.find((p) => p.id === personaId);
    if (!persona) return;
    updatePersona(personaId, { [field]: [...persona[field], value.trim()] });
  };

  const removeListItem = (personaId: string, field: 'painPoints' | 'goals', index: number) => {
    const persona = personas.find((p) => p.id === personaId);
    if (!persona) return;
    updatePersona(personaId, { [field]: persona[field].filter((_, i) => i !== index) });
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
            bgcolor: alpha(theme.palette.info.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <PeopleAltIcon sx={{ color: 'info.main', fontSize: 20 }} />
        </Box>
        <Typography variant="h5" fontWeight={600}>
          User Personas
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, pl: 0.5, maxWidth: 600 }}>
        Who are you building for? Define your target users, their pain points, and goals.
      </Typography>

      {/* Add Persona */}
      <Card sx={{ p: 2.5, mb: 2 }}>
        <Stack direction="row" spacing={1.5}>
          <TextField
            size="small"
            placeholder="New persona name (e.g. Freelance Designer)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addPersona()}
            fullWidth
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={addPersona} sx={{ whiteSpace: 'nowrap' }}>
            Add
          </Button>
        </Stack>
      </Card>

      <AIAssistButton
        label="AI Suggest Personas"
        loading={ai.loading}
        error={ai.error}
        isAvailable={ai.isAvailable}
        onGenerate={handleAISuggest}
        onClearError={ai.clearError}
      />

      {/* Persona Cards */}
      <Stack spacing={2}>
        {personas.map((persona) => (
          <PersonaCard
            key={persona.id}
            persona={persona}
            onUpdate={(updates) => updatePersona(persona.id, updates)}
            onRemove={() => removePersona(persona.id)}
            onAddListItem={(field, value) => addListItem(persona.id, field, value)}
            onRemoveListItem={(field, index) => removeListItem(persona.id, field, index)}
          />
        ))}
        {personas.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No personas yet. Add one above to get started.
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

// --- Persona Card Sub-component ---
function PersonaCard({
  persona,
  onUpdate,
  onRemove,
  onAddListItem,
  onRemoveListItem,
}: {
  persona: Persona;
  onUpdate: (updates: Partial<Persona>) => void;
  onRemove: () => void;
  onAddListItem: (field: 'painPoints' | 'goals', value: string) => void;
  onRemoveListItem: (field: 'painPoints' | 'goals', index: number) => void;
}) {
  const [painInput, setPainInput] = useState('');
  const [goalInput, setGoalInput] = useState('');

  return (
    <Card sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Stack spacing={1.5} sx={{ flex: 1, mr: 2 }}>
          <TextField
            size="small"
            label="Name"
            value={persona.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            fullWidth
          />
          <TextField
            size="small"
            label="Role / Description"
            placeholder="e.g. Junior developer building side projects"
            value={persona.role}
            onChange={(e) => onUpdate({ role: e.target.value })}
            fullWidth
          />
        </Stack>
        <Tooltip title="Remove persona">
          <IconButton size="small" onClick={onRemove} color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Pain Points */}
      <Typography variant="subtitle2" sx={{ mb: 1, color: 'error.main' }}>
        Pain Points
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
        {persona.painPoints.map((point, i) => (
          <Chip
            key={`${i}-${point}`}
            label={point}
            size="small"
            onDelete={() => onRemoveListItem('painPoints', i)}
            color="error"
            variant="outlined"
          />
        ))}
      </Box>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Add a pain point..."
          value={painInput}
          onChange={(e) => setPainInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onAddListItem('painPoints', painInput);
              setPainInput('');
            }
          }}
          fullWidth
        />
        <Button
          size="small"
          variant="outlined"
          onClick={() => {
            onAddListItem('painPoints', painInput);
            setPainInput('');
          }}
        >
          Add
        </Button>
      </Stack>

      {/* Goals */}
      <Typography variant="subtitle2" sx={{ mb: 1, color: 'success.main' }}>
        Goals
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
        {persona.goals.map((goal, i) => (
          <Chip
            key={`${i}-${goal}`}
            label={goal}
            size="small"
            onDelete={() => onRemoveListItem('goals', i)}
            color="success"
            variant="outlined"
          />
        ))}
      </Box>
      <Stack direction="row" spacing={1}>
        <TextField
          size="small"
          placeholder="Add a goal..."
          value={goalInput}
          onChange={(e) => setGoalInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onAddListItem('goals', goalInput);
              setGoalInput('');
            }
          }}
          fullWidth
        />
        <Button
          size="small"
          variant="outlined"
          onClick={() => {
            onAddListItem('goals', goalInput);
            setGoalInput('');
          }}
        >
          Add
        </Button>
      </Stack>
    </Card>
  );
}
