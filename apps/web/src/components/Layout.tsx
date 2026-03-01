// ============================================
// Groundwork - Layout Component
// ============================================

import { useEffect, useState, memo, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  alpha,
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import FolderIcon from '@mui/icons-material/Folder';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import { useAppStore } from '../store';
import { useAuthStore } from '../stores/authStore';

export const DRAWER_WIDTH = 272;

export function Layout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  // Auto-sync every 5 minutes when signed in (#24)
  const syncWithCloud = useAppStore((s) => s.syncWithCloud);
  const user = useAuthStore((s) => s.user);
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      syncWithCloud(user.id);
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user, syncWithCloud]);

  // Offline indicator (#23)
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const closeMobileDrawer = useCallback(() => {
    if (isMobile) setMobileOpen(false);
  }, [isMobile]);

  const navItems = [
    { label: 'Home', icon: <HomeIcon />, path: '/' },
    { label: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const isSelected = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      {/* Logo */}
      <Box sx={{ px: 2.5, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          component="img"
          src="/favicon.svg"
          alt=""
          sx={{ width: 28, height: 28, borderRadius: '6px' }}
        />
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
          Groundwork
        </Typography>
      </Box>

      <Divider sx={{ mx: 2 }} />

      {/* Navigation */}
      <List sx={{ px: 1.5, pt: 1.5 }}>
        {navItems.map((item) => {
          const selected = isSelected(item.path);
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={selected}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: '10px',
                  px: 1.5,
                  py: 1,
                  '&.Mui-selected': {
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                    color: 'primary.main',
                    '& .MuiListItemIcon-root': { color: 'primary.main' },
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.18),
                    },
                  },
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: selected ? 'primary.main' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: selected ? 600 : 500, fontSize: '0.9rem' }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Projects List — isolated subscription via SidebarProjectList */}
      <SidebarProjectList onCloseMobile={closeMobileDrawer} />

      {/* Bottom branding */}
      <Box sx={{ px: 2.5, py: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">
          v{__APP_VERSION__} — Plan before you build.
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Skip-to-main-content link (#50) */}
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: 'absolute',
          left: '-999px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          '&:focus': {
            position: 'fixed',
            top: 8,
            left: 8,
            width: 'auto',
            height: 'auto',
            zIndex: 9999,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            px: 2,
            py: 1,
            borderRadius: 1,
            fontWeight: 600,
          },
        }}
      >
        Skip to main content
      </Box>

      {/* Offline Indicator (#23) */}
      <Snackbar
        open={isOffline}
        message={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WifiOffIcon fontSize="small" />
            You are offline. Changes are saved locally.
          </Box>
        }
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      {/* App Bar (mobile only) */}
      {isMobile && (
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            bgcolor: alpha(theme.palette.background.paper, 0.85),
            backdropFilter: 'blur(12px)',
            color: 'text.primary',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Toolbar sx={{ gap: 1.5 }}>
            <IconButton edge="start" onClick={handleDrawerToggle} aria-label="Open navigation menu">
              <MenuIcon />
            </IconButton>
            <Box
              component="img"
              src="/favicon.svg"
              alt=""
              sx={{ width: 28, height: 28, borderRadius: '6px' }}
            />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Groundwork
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: 1,
              borderColor: 'divider',
              borderRadius: 0,
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        id="main-content"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: { xs: 8, md: 0 },
          minHeight: '100vh',
          overflow: 'auto',
        }}
      >
        <Box sx={{ px: { xs: 2.5, sm: 4, md: 5 }, py: { xs: 3, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

// --- Sidebar project list (isolated subscription prevents Layout re-renders on project changes) ---
const SidebarProjectList = memo(function SidebarProjectList({
  onCloseMobile,
}: {
  onCloseMobile: () => void;
}) {
  const projects = useAppStore((s) => s.projects);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  if (projects.length === 0) return null;

  return (
    <>
      <Typography
        variant="overline"
        sx={{
          px: 3,
          pt: 2.5,
          pb: 1,
          color: 'text.secondary',
          display: 'block',
        }}
      >
        Projects
      </Typography>
      <List sx={{ px: 1.5, flex: 1, overflow: 'auto', pb: 2 }}>
        {projects.map((project) => {
          const selected = location.pathname.startsWith(`/project/${project.id}`);
          return (
            <ListItem key={project.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={selected}
                onClick={() => {
                  navigate(`/project/${project.id}`);
                  onCloseMobile();
                }}
                sx={{
                  borderRadius: '10px',
                  px: 1.5,
                  py: 1,
                  '&.Mui-selected': {
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                    color: 'primary.main',
                    '& .MuiListItemIcon-root': { color: 'primary.main' },
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.18),
                    },
                  },
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: selected ? 'primary.main' : 'text.secondary' }}>
                  <FolderIcon fontSize="small" />
                </ListItemIcon>
                <Tooltip title={project.name || 'Untitled'} placement="right" enterDelay={600}>
                  <ListItemText
                    primary={project.name || 'Untitled'}
                    secondary={`${project.progress}%`}
                    primaryTypographyProps={{
                      fontWeight: selected ? 600 : 500,
                      fontSize: '0.875rem',
                      noWrap: true,
                    }}
                    secondaryTypographyProps={{
                      fontSize: '0.7rem',
                      color: selected ? 'primary.main' : 'text.secondary',
                    }}
                  />
                </Tooltip>
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </>
  );
});
