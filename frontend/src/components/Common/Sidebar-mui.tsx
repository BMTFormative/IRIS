// frontend/src/components/Common/Sidebar-mui.tsx
import React, { useState } from "react";
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Work as WorkIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useQueryClient } from "@tanstack/react-query";
import { Link as RouterLink, useRouterState } from "@tanstack/react-router";

import type { UserPublic } from "@/client";
import useAuth from "@/hooks/useAuth";

const DRAWER_WIDTH = 280;

const menuItems = [
  { icon: HomeIcon, title: "Dashboard", path: "/" },
  { icon: WorkIcon, title: "Items", path: "/items" },
  { icon: SettingsIcon, title: "User Settings", path: "/settings" },
];

interface SidebarMUIProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  onMobileToggle?: () => void;
}

const SidebarMUI = ({ 
  mobileOpen = false, 
  onMobileClose, 
  onMobileToggle 
}: SidebarMUIProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const queryClient = useQueryClient();
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"]);
  const { logout } = useAuth();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  // Add admin item for superusers
  const finalItems = currentUser?.is_superuser
    ? [...menuItems, { icon: PeopleIcon, title: "Admin", path: "/admin" }]
    : menuItems;

  const handleLogout = () => {
    logout();
    if (onMobileClose) onMobileClose();
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Menu Header */}
      <Box sx={{ p: 2 }}>
        <Typography 
          variant="overline" 
          sx={{ 
            fontSize: '0.75rem', 
            fontWeight: 'bold',
            letterSpacing: '0.5px',
            color: 'text.secondary'
          }}
        >
          Menu
        </Typography>
      </Box>

      {/* Menu Items */}
      <List sx={{ flexGrow: 1, px: 1 }}>
        {finalItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          
          return (
            <ListItem key={item.title} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                onClick={onMobileClose}
                sx={{
                  borderRadius: 1,
                  mx: 1,
                  backgroundColor: isActive ? 'action.selected' : 'transparent',
                  color: isActive ? 'primary.main' : 'text.primary',
                  '&:hover': {
                    backgroundColor: isActive ? 'action.selected' : 'action.hover',
                  },
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 40,
                  color: isActive ? 'primary.main' : 'text.secondary'
                }}>
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary={item.title}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 500 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* Logout Button */}
      <List sx={{ px: 1, py: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 1,
              mx: 1,
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <LogoutIcon fontSize="small" color="action" />
            </ListItemIcon>
            <ListItemText 
              primary="Log Out"
              primaryTypographyProps={{
                fontSize: '0.875rem',
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>

      {/* User Info */}
      {currentUser?.email && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ 
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            Logged in as: {currentUser.email}
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <IconButton
          onClick={onMobileToggle}
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: theme.zIndex.drawer + 1,
            backgroundColor: 'background.paper',
            boxShadow: 2,
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Mobile Drawer */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onMobileClose}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        /* Desktop Drawer */
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              position: 'relative',
              height: '100vh',
              borderRight: 1,
              borderColor: 'divider',
            },
          }}
        >
          {drawer}
        </Drawer>
      )}
    </>
  );
};

export default SidebarMUI;