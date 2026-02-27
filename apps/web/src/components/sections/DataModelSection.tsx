// ============================================
// Groundwork - Data Model Section Component
// ============================================

import { useState } from 'react';
import {
  alpha,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import StorageIcon from '@mui/icons-material/Storage';
import { createEntity } from '@groundwork/logic';
import type { Entity, EntityField, EntityRelationship, Project } from '@groundwork/types';
import { useAI } from '../../hooks/useAI';
import { AIAssistButton } from '../AIAssistButton';
import { useAppStore } from '../../store';

interface Props {
  project: Project;
  onUpdate: (id: string, updates: Partial<Project>) => void;
}

const FIELD_TYPES = ['string', 'number', 'boolean', 'date', 'uuid', 'text', 'json', 'enum', 'file'];
const REL_TYPES: EntityRelationship['type'][] = ['one-to-one', 'one-to-many', 'many-to-many'];

export function DataModelSection({ project, onUpdate }: Props) {
  const theme = useTheme();
  const { dataModel } = project.sections;
  const [newName, setNewName] = useState('');
  const ai = useAI();

  const updateEntities = (updated: Entity[]) => {
    onUpdate(project.id, {
      sections: { ...project.sections, dataModel: updated },
    });
  };

  const addEntity = () => {
    if (!newName.trim()) return;
    updateEntities([...dataModel, createEntity(newName.trim())]);
    setNewName('');
  };

  const handleAISuggest = async () => {
    const featureNames = project.sections.features.map((f) => f.name);
    if (featureNames.length === 0) {
      ai.clearError();
      // Show a helpful message — the error state is used for display
      return;
    }
    const result = await ai.suggestDataModel(featureNames);
    if (!result) return;
    try {
      const parsed = JSON.parse(result);
      if (Array.isArray(parsed)) {
        const newEntities: Entity[] = parsed.map((e: { name: string; fields?: EntityField[]; relationships?: EntityRelationship[] }) => ({
          ...createEntity(e.name),
          fields: (e.fields || []).map((f) => ({ name: f.name, type: f.type || 'string', required: f.required ?? true })),
          relationships: (e.relationships || []).map((r) => ({ targetEntity: r.targetEntity, type: r.type || 'one-to-many' })),
        }));
        // Read latest data model from store to avoid stale closure
        const currentProject = useAppStore.getState().projects.find((p) => p.id === project.id);
        const currentDataModel = currentProject?.sections.dataModel ?? dataModel;
        updateEntities([...currentDataModel, ...newEntities]);
      }
    } catch {
      // Ignore parse failures
    }
  };

  const removeEntity = (id: string) => {
    updateEntities(dataModel.filter((e) => e.id !== id));
  };

  const updateEntity = (id: string, updates: Partial<Entity>) => {
    updateEntities(dataModel.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            bgcolor: alpha(theme.palette.secondary.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <StorageIcon sx={{ color: 'secondary.main', fontSize: 20 }} />
        </Box>
        <Typography variant="h5" fontWeight={600}>
          Data Model
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, pl: 0.5, maxWidth: 600 }}>
        Define your entities, their fields, and relationships. This becomes your database schema.
      </Typography>

      <Card sx={{ p: 2.5, mb: 2 }}>
        <Stack direction="row" spacing={1.5}>
          <TextField
            size="small"
            placeholder="Entity name (e.g. User, Product, Order)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addEntity()}
            fullWidth
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={addEntity} sx={{ whiteSpace: 'nowrap' }}>
            Add
          </Button>
        </Stack>
      </Card>

      <AIAssistButton
        label="AI Generate Data Model"
        loading={ai.loading}
        error={ai.error}
        isAvailable={ai.isAvailable}
        onGenerate={handleAISuggest}
        onClearError={ai.clearError}
      />

      <Stack spacing={2}>
        {dataModel.map((entity) => (
          <EntityCard
            key={entity.id}
            entity={entity}
            allEntities={dataModel}
            onUpdate={(updates) => updateEntity(entity.id, updates)}
            onRemove={() => removeEntity(entity.id)}
          />
        ))}
        {dataModel.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No entities yet. Start by adding your core data models.
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

function EntityCard({
  entity,
  allEntities,
  onUpdate,
  onRemove,
}: {
  entity: Entity;
  allEntities: Entity[];
  onUpdate: (updates: Partial<Entity>) => void;
  onRemove: () => void;
}) {
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('string');
  const [newFieldRequired, setNewFieldRequired] = useState(true);

  const addField = () => {
    if (!newFieldName.trim()) return;
    const field: EntityField = { name: newFieldName.trim(), type: newFieldType, required: newFieldRequired };
    onUpdate({ fields: [...entity.fields, field] });
    setNewFieldName('');
  };

  const removeField = (index: number) => {
    onUpdate({ fields: entity.fields.filter((_, i) => i !== index) });
  };

  const addRelationship = (targetEntity: string, type: EntityRelationship['type']) => {
    const rel: EntityRelationship = { targetEntity, type };
    onUpdate({ relationships: [...entity.relationships, rel] });
  };

  const removeRelationship = (index: number) => {
    onUpdate({ relationships: entity.relationships.filter((_, i) => i !== index) });
  };

  const otherEntities = allEntities.filter((e) => e.id !== entity.id);

  return (
    <Card sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <TextField
          size="small"
          label="Entity Name"
          value={entity.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          sx={{ flex: 1, mr: 2 }}
        />
        <Tooltip title="Remove entity">
          <IconButton size="small" onClick={onRemove} color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Fields */}
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Fields
      </Typography>
      {entity.fields.length > 0 && (
        <Box sx={{ mb: 1.5 }}>
          {entity.fields.map((field, i) => (
            <Box
              key={`${i}-${field.name}`}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                py: 0.75,
                borderBottom: i < entity.fields.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
              }}
            >
              <Typography variant="body2" fontWeight={600} sx={{ minWidth: 120 }}>
                {field.name}
              </Typography>
              <Chip label={field.type} size="small" variant="outlined" />
              {field.required && <Chip label="required" size="small" color="primary" variant="outlined" />}
              <Box sx={{ flex: 1 }} />
              <IconButton size="small" onClick={() => removeField(i)}>
                <DeleteIcon fontSize="inherit" />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Field name"
          value={newFieldName}
          onChange={(e) => setNewFieldName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addField()}
          sx={{ flex: 1 }}
        />
        <TextField
          size="small"
          select
          value={newFieldType}
          onChange={(e) => setNewFieldType(e.target.value)}
          sx={{ width: 120 }}
        >
          {FIELD_TYPES.map((t) => (
            <MenuItem key={t} value={t}>{t}</MenuItem>
          ))}
        </TextField>
        <FormControlLabel
          control={<Switch size="small" checked={newFieldRequired} onChange={(e) => setNewFieldRequired(e.target.checked)} />}
          label="Req"
          sx={{ mx: 0 }}
        />
        <Button size="small" variant="outlined" onClick={addField}>
          Add
        </Button>
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Relationships */}
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Relationships
      </Typography>
      {entity.relationships.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
          {entity.relationships.map((rel, i) => (
            <Chip
              key={`${i}-${rel.type}-${rel.targetEntity}`}
              label={`${rel.type} → ${rel.targetEntity}`}
              size="small"
              onDelete={() => removeRelationship(i)}
              variant="outlined"
            />
          ))}
        </Box>
      )}
      {otherEntities.length > 0 && (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {otherEntities.map((other) => (
            <Box key={other.id} sx={{ display: 'flex', gap: 0.5 }}>
              {REL_TYPES.map((relType) => (
                <Tooltip key={relType} title={`${entity.name} ${relType} ${other.name}`}>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => addRelationship(other.name, relType)}
                    sx={{ fontSize: '0.7rem', textTransform: 'none', minWidth: 0, px: 1 }}
                  >
                    {relType.replace('-to-', '→')} {other.name}
                  </Button>
                </Tooltip>
              ))}
            </Box>
          ))}
        </Stack>
      )}
      {otherEntities.length === 0 && entity.relationships.length === 0 && (
        <Typography variant="caption" color="text.secondary">
          Add more entities to define relationships.
        </Typography>
      )}
    </Card>
  );
}
