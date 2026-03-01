// ============================================
// Groundwork - Mermaid Diagram Renderer
// ============================================

import { useEffect, useState } from 'react';
import { alpha, Box, Typography, useTheme } from '@mui/material';

interface Props {
  chart: string;
  title?: string;
}

let mermaidId = 0;
// Dynamic import cache (#52)
let mermaidModule: typeof import('mermaid') | null = null;

export function MermaidDiagram({ chart, title }: Props) {
  const theme = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [svgHtml, setSvgHtml] = useState<string>('');

  useEffect(() => {
    // Dynamically import mermaid only when needed
    if (!mermaidModule) {
      import('mermaid').then((mod) => {
        mermaidModule = mod;
        mod.default.initialize({
          startOnLoad: false,
          theme: theme.palette.mode === 'dark' ? 'dark' : 'default',
          securityLevel: 'strict',
          fontFamily: '"Inter", sans-serif',
        });
      });
    } else {
      mermaidModule.default.initialize({
        startOnLoad: false,
        theme: theme.palette.mode === 'dark' ? 'dark' : 'default',
        securityLevel: 'strict',
        fontFamily: '"Inter", sans-serif',
      });
    }
  }, [theme.palette.mode]);

  useEffect(() => {
    if (!chart.trim()) {
      setSvgHtml('');
      setError(null);
      return;
    }

    const id = `mermaid-${++mermaidId}`;
    let cancelled = false;

    const renderChart = async () => {
      if (!mermaidModule) {
        mermaidModule = await import('mermaid');
        mermaidModule.default.initialize({
          startOnLoad: false,
          theme: theme.palette.mode === 'dark' ? 'dark' : 'default',
          securityLevel: 'strict',
          fontFamily: '"Inter", sans-serif',
        });
      }
      try {
        const { svg } = await mermaidModule.default.render(id, chart);
        if (!cancelled) {
          setSvgHtml(svg);
          setError(null);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to render diagram');
          setSvgHtml('');
        }
      }
    };

    renderChart();

    return () => {
      cancelled = true;
    };
  }, [chart, theme.palette.mode]);

  if (!chart.trim()) return null;

  return (
    <Box
      sx={{
        mt: 2,
        p: 2,
        borderRadius: 2,
        border: 1,
        borderColor: 'divider',
        bgcolor: alpha(theme.palette.background.paper, 0.6),
        overflow: 'auto',
      }}
    >
      {title && (
        <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary' }}>
          {title}
        </Typography>
      )}
      {error ? (
        <Typography variant="caption" color="error">
          Diagram error: {error}
        </Typography>
      ) : (
        <Box
          role="img"
          aria-label={title || 'Mermaid diagram'}
          dangerouslySetInnerHTML={{ __html: svgHtml }}
          sx={{
            '& svg': {
              maxWidth: '100%',
              height: 'auto',
            },
          }}
        />
      )}
    </Box>
  );
}
