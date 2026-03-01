// ============================================
// Groundwork - Markdown Content Renderer
// ============================================
// Renders AI-generated markdown as formatted MUI Typography.
// ============================================

import ReactMarkdown from 'react-markdown';
import { Typography, Box, Link } from '@mui/material';

interface Props {
  content: string;
}

export function MarkdownContent({ content }: Props) {
  return (
    <Box sx={{ '& > *:first-of-type': { mt: 0 }, '& > *:last-child': { mb: 0 } }}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 1.5, mb: 0.5 }}>
              {children}
            </Typography>
          ),
          h2: ({ children }) => (
            <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1.5, mb: 0.5 }}>
              {children}
            </Typography>
          ),
          h3: ({ children }) => (
            <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 1, mb: 0.5 }}>
              {children}
            </Typography>
          ),
          p: ({ children }) => (
            <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.6 }}>
              {children}
            </Typography>
          ),
          ul: ({ children }) => (
            <Box component="ul" sx={{ pl: 2.5, mb: 1, '& li': { mb: 0.25 } }}>
              {children}
            </Box>
          ),
          ol: ({ children }) => (
            <Box component="ol" sx={{ pl: 2.5, mb: 1, '& li': { mb: 0.25 } }}>
              {children}
            </Box>
          ),
          li: ({ children }) => (
            <Typography component="li" variant="body2" sx={{ lineHeight: 1.6 }}>
              {children}
            </Typography>
          ),
          strong: ({ children }) => (
            <Typography component="span" variant="body2" fontWeight={700}>
              {children}
            </Typography>
          ),
          em: ({ children }) => (
            <Typography component="span" variant="body2" sx={{ fontStyle: 'italic' }}>
              {children}
            </Typography>
          ),
          a: ({ href, children }) => (
            <Link href={href} target="_blank" rel="noopener noreferrer" sx={{ fontSize: 'inherit' }}>
              {children}
            </Link>
          ),
          code: ({ children }) => (
            <Typography
              component="code"
              sx={{
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                bgcolor: 'action.hover',
                px: 0.5,
                py: 0.25,
                borderRadius: 0.5,
              }}
            >
              {children}
            </Typography>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
}
