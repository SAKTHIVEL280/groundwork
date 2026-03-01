// ============================================
// Groundwork - Settings Page
// ============================================

import { useState } from 'react';
import {
  Alert,
  alpha,
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import PaletteIcon from '@mui/icons-material/Palette';
import CheckIcon from '@mui/icons-material/Check';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import GitHubIcon from '@mui/icons-material/GitHub';
import GoogleIcon from '@mui/icons-material/Google';
import LogoutIcon from '@mui/icons-material/Logout';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ScienceIcon from '@mui/icons-material/Science';
import { validateApiKey, GroqAPIError } from '@groundwork/logic';
import type { Project } from '@groundwork/types';
import { useAppStore } from '../store';
import { useAuthStore } from '../stores/authStore';
import {
  COLOR_SCHEME_LABELS,
  COLOR_SCHEME_PREVIEW,
  type ColorScheme,
} from '../theme';

const COLOR_SCHEMES: ColorScheme[] = ['purple', 'blue', 'green', 'orange', 'pink', 'teal'];

export function SettingsPage() {
  const theme = useTheme();
  const preferences = useAppStore((s) => s.preferences);
  const setPreferences = useAppStore((s) => s.setPreferences);
  const importProject = useAppStore((s) => s.importProject);
  const syncStatus = useAppStore((s) => s.syncStatus);
  const syncWithCloud = useAppStore((s) => s.syncWithCloud);
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const signInWithGitHub = useAuthStore((s) => s.signInWithGitHub);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const signOut = useAuthStore((s) => s.signOut);

  const [apiKey, setApiKey] = useState(preferences.groqApiKey || '');
  const [apiStatus, setApiStatus] = useState<'idle' | 'validating' | 'valid' | 'error'>('idle');
  const [apiError, setApiError] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMsg, setImportMsg] = useState('');

  const handleThemeChange = (_: unknown, value: string | null) => {
    if (value) {
      setPreferences({ theme: value as 'light' | 'dark' | 'system' });
    }
  };

  const handleColorSchemeChange = (scheme: ColorScheme) => {
    setPreferences({ colorScheme: scheme });
  };

  const handleAIToggle = (enabled: boolean) => {
    setPreferences({ aiEnabled: enabled });
  };

  const handleValidateKey = async () => {
    if (!apiKey.trim()) {
      setApiError('Please enter an API key.');
      setApiStatus('error');
      return;
    }

    setApiStatus('validating');
    setApiError('');

    try {
      await validateApiKey(apiKey.trim());
      setApiStatus('valid');
      setPreferences({ groqApiKey: apiKey.trim() });
    } catch (error) {
      setApiStatus('error');
      if (error instanceof GroqAPIError) {
        setApiError(error.message);
      } else {
        setApiError('Failed to validate API key.');
      }
    }
  };

  const handleRemoveKey = () => {
    setApiKey('');
    setApiStatus('idle');
    setApiError('');
    setPreferences({ groqApiKey: undefined, aiEnabled: false });
  };

  const handleImportJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.groundwork.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text) as Project;
        if (!data.id || !data.sections) {
          setImportStatus('error');
          setImportMsg('Invalid project file. Missing required fields.');
          return;
        }
        // Validate section shape
        if (typeof data.sections !== 'object' || Array.isArray(data.sections)) {
          setImportStatus('error');
          setImportMsg('Invalid project file. Sections must be an object.');
          return;
        }
        if (!data.name || typeof data.name !== 'string') {
          data.name = 'Imported Project';
        }
        importProject(data);
        setImportStatus('success');
        setImportMsg(`Imported "${data.name || 'Untitled'}" successfully.`);
      } catch {
        setImportStatus('error');
        setImportMsg('Failed to parse file. Make sure it is a valid Groundwork JSON export.');
      }
    };
    input.click();
  };

  const handleSync = async () => {
    if (!user) return;
    await syncWithCloud(user.id);
  };

  return (
    <Box sx={{ maxWidth: 680, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, letterSpacing: '-0.01em' }}>
        Settings
      </Typography>

      <Stack spacing={3}>
        {/* Appearance */}
        <Card sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <PaletteIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={600}>
              Appearance
            </Typography>
          </Box>

          {/* Mode Toggle */}
          <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary' }}>
            Mode
          </Typography>
          <ToggleButtonGroup
            value={preferences.theme}
            exclusive
            onChange={handleThemeChange}
            sx={{
              mb: 3,
              flexWrap: 'wrap',
              gap: 1,
              '& .MuiToggleButton-root': {
                px: 2.5,
                py: 1,
                borderRadius: '10px !important',
                mx: 0,
                border: '1.5px solid',
                borderColor: 'divider',
                '&.Mui-selected': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                  },
                },
              },
            }}
          >
            <ToggleButton value="light">
              <LightModeIcon sx={{ mr: 1, fontSize: 18 }} /> Light
            </ToggleButton>
            <ToggleButton value="dark">
              <DarkModeIcon sx={{ mr: 1, fontSize: 18 }} /> Dark
            </ToggleButton>
            <ToggleButton value="system">
              <SettingsBrightnessIcon sx={{ mr: 1, fontSize: 18 }} /> System
            </ToggleButton>
          </ToggleButtonGroup>

          <Divider sx={{ my: 2.5 }} />

          {/* Color Scheme */}
          <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary' }}>
            Color Theme
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }} role="radiogroup" aria-label="Color theme">
            {COLOR_SCHEMES.map((scheme) => {
              const isActive = preferences.colorScheme === scheme;
              const previewColor = COLOR_SCHEME_PREVIEW[scheme];
              return (
                <Tooltip key={scheme} title={COLOR_SCHEME_LABELS[scheme]}>
                  <Box
                    component="button"
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    aria-label={COLOR_SCHEME_LABELS[scheme]}
                    onClick={() => handleColorSchemeChange(scheme)}
                    onKeyDown={(e: React.KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleColorSchemeChange(scheme);
                      }
                    }}
                    tabIndex={0}
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      bgcolor: previewColor,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: isActive ? '3px solid' : '2px solid transparent',
                      borderColor: isActive ? 'text.primary' : 'transparent',
                      outline: isActive ? `2px solid ${previewColor}` : 'none',
                      outlineOffset: 2,
                      transition: 'all 0.15s ease',
                      p: 0,
                      '&:hover': {
                        transform: 'scale(1.1)',
                        boxShadow: `0 4px 12px ${alpha(previewColor, 0.4)}`,
                      },
                      '&:focus-visible': {
                        outline: `2px solid ${theme.palette.primary.main}`,
                        outlineOffset: 3,
                      },
                    }}
                  >
                    {isActive && <CheckIcon sx={{ color: '#fff', fontSize: 22, fontWeight: 'bold' }} />}
                  </Box>
                </Tooltip>
              );
            })}
          </Box>
        </Card>

        {/* AI Settings */}
        <Card sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <SmartToyIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={600}>
              AI Assistant (Optional)
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Enable AI features by adding your Groq API key. This is completely optional — the app
            works perfectly without it.
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={preferences.aiEnabled}
                onChange={(e) => handleAIToggle(e.target.checked)}
              />
            }
            label="Enable AI features"
            sx={{ mb: 2, display: 'block' }}
          />

          {preferences.aiEnabled && (
            <Stack spacing={2}>
              <TextField
                label="Groq API Key"
                placeholder="gsk_..."
                type="password"
                fullWidth
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setApiStatus('idle');
                }}
              />

              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="contained"
                  onClick={handleValidateKey}
                  disabled={apiStatus === 'validating'}
                >
                  {apiStatus === 'validating' ? 'Validating...' : 'Save & Validate'}
                </Button>
                {preferences.groqApiKey && (
                  <Button variant="outlined" color="error" onClick={handleRemoveKey}>
                    Remove Key
                  </Button>
                )}
              </Stack>

              <TextField
                select
                label="AI Model"
                value={preferences.aiModel || 'llama-3.3-70b-versatile'}
                onChange={(e) => setPreferences({ aiModel: e.target.value })}
                fullWidth
                size="small"
              >
                <MenuItem value="llama-3.3-70b-versatile">Llama 3.3 70B (Recommended)</MenuItem>
                <MenuItem value="llama-3.1-8b-instant">Llama 3.1 8B (Faster)</MenuItem>
                <MenuItem value="mixtral-8x7b-32768">Mixtral 8x7B</MenuItem>
                <MenuItem value="gemma2-9b-it">Gemma 2 9B</MenuItem>
              </TextField>

              {apiStatus === 'valid' && (
                <Alert severity="success" sx={{ borderRadius: 2 }}>
                  API key is valid! AI features are ready.
                </Alert>
              )}
              {apiStatus === 'error' && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {apiError}
                </Alert>
              )}

              <Typography variant="caption" color="text.secondary">
                Your API key is stored locally and never sent anywhere except Groq's servers.
                Get a free key at{' '}
                <a
                  href="https://console.groq.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: theme.palette.primary.main }}
                >
                  console.groq.com
                </a>
              </Typography>
            </Stack>
          )}
        </Card>

        {/* Account & Sync */}
        <Card sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <CloudSyncIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={600}>
              Account & Sync
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Sign in to sync your projects across devices. Your data is stored locally by
            default — cloud sync is optional.
          </Typography>

          {authLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : user ? (
            <Stack spacing={2}>
              <Alert severity="success" sx={{ borderRadius: 2 }}>
                Signed in as <strong>{user.email}</strong>
              </Alert>
              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="contained"
                  startIcon={syncStatus.isSyncing ? <CircularProgress size={16} color="inherit" /> : <CloudSyncIcon />}
                  onClick={handleSync}
                  disabled={syncStatus.isSyncing}
                >
                  {syncStatus.isSyncing ? 'Syncing...' : 'Sync Now'}
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<LogoutIcon />}
                  onClick={signOut}
                >
                  Sign Out
                </Button>
              </Stack>
              {syncStatus.lastSynced && (
                <Typography variant="caption" color="text.secondary">
                  Last synced: {new Date(syncStatus.lastSynced).toLocaleString()}
                </Typography>
              )}
              {syncStatus.error && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {syncStatus.error}
                </Alert>
              )}
            </Stack>
          ) : (
            <Stack spacing={1.5}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<GitHubIcon />}
                onClick={signInWithGitHub}
                sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
              >
                Continue with GitHub
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<GoogleIcon />}
                onClick={signInWithGoogle}
                sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
              >
                Continue with Google
              </Button>
            </Stack>
          )}
        </Card>

        {/* Import */}
        <Card sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <UploadFileIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={600}>
              Import Project
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Import a previously exported Groundwork JSON file.
          </Typography>
          <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={handleImportJSON}>
            Import JSON
          </Button>
          {importStatus === 'success' && (
            <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }}>{importMsg}</Alert>
          )}
          {importStatus === 'error' && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>{importMsg}</Alert>
          )}
        </Card>

        {/* Sample Projects (#30) */}
        <Card sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <ScienceIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={600}>
              Sample Projects
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Load fully filled-out example projects to explore what a complete project plan looks like.
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {[
              { file: 'studybuddy.groundwork.json', label: 'StudyBuddy', desc: 'AI study companion app' },
              { file: 'fooddash.groundwork.json', label: 'FoodDash', desc: 'Hyperlocal food delivery' },
              { file: 'devmetrics.groundwork.json', label: 'DevMetrics', desc: 'GitHub analytics dashboard' },
            ].map((sample) => (
              <Button
                key={sample.file}
                variant="outlined"
                size="small"
                onClick={async () => {
                  try {
                    const res = await fetch(`/samples/${sample.file}`);
                    const data = await res.json();
                    // Give a unique ID so it doesn't replace existing
                    data.id = `sample-${Date.now()}`;
                    importProject(data);
                    setImportStatus('success');
                    setImportMsg(`Loaded "${sample.label}" sample project.`);
                  } catch {
                    setImportStatus('error');
                    setImportMsg(`Failed to load ${sample.label} sample.`);
                  }
                }}
              >
                {sample.label}
              </Button>
            ))}
          </Box>
          {importStatus === 'success' && importMsg.includes('sample') && (
            <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }}>{importMsg}</Alert>
          )}
        </Card>

        {/* About */}
        <Card sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <InfoOutlinedIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={600}>
              About Groundwork
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Free, open-source pre-code planning tool for developers. Plan before you build.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Version {__APP_VERSION__}
          </Typography>
        </Card>
      </Stack>
    </Box>
  );
}
