// frontend/src/components/Common/Sidebar-mui.tsx (Mini Variant Version)
import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
  useTheme,
  styled,
} from "@mui/material";
import {
  Home as HomeIcon,
  Inventory as InventoryIcon,
  Settings as SettingsIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { useQueryClient } from "@tanstack/react-query";
import { Link as RouterLink, useRouterState } from "@tanstack/react-router";

import type { UserPublic } from "@/client";
import useAuth from "@/hooks/useAuth";

const drawerWidth = 240;
const miniDrawerWidth = 64;

const menuItems = [
  { icon: HomeIcon, title: "Dashboard", path: "/" },
  { icon: InventoryIcon, title: "Items", path: "/items" },
  { icon: SettingsIcon, title: "User Settings", path: "/settings" },
];

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const openedMixin = (theme: any) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: any) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: miniDrawerWidth,
  },
});

const StyledDrawer = styled(Drawer)(({ theme, open }: any) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': {
      ...openedMixin(theme),
      background: '#3182ce',
      boxShadow: '4px 0 20px rgba(33, 150, 243, 0.3)',
      border: 'none',
    },
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': {
      ...closedMixin(theme),
      background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 50%, #1565C0 100%)',
      color: '#ffffff',
      boxShadow: '4px 0 20px rgba(33, 150, 243, 0.3)',
      border: 'none',
    },
  }),
}));

interface MiniVariantDrawerProps {
  open: boolean;
  handleDrawerToggle: () => void;
}

const MiniVariantDrawer = ({ open, handleDrawerToggle }: MiniVariantDrawerProps) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"]);
  const { logout } = useAuth();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  // Add admin item for superusers
  const finalItems = currentUser?.is_superuser
    ? [...menuItems, { icon: AdminIcon, title: "Admin", path: "/admin" }]
    : menuItems;

  const handleLogout = () => {
    logout();
  };

  return (
    <StyledDrawer variant="permanent" open={open}>
      <DrawerHeader sx={{ 
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        '& .MuiIconButton-root': {
          color: '#ffffff',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }
        }
      }}>
        <IconButton onClick={handleDrawerToggle}>
          {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </DrawerHeader>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
      
      <List>
        {finalItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          
          return (
            <ListItem key={item.title} disablePadding sx={{ display: 'block' }}>
              <Tooltip 
                title={!open ? item.title : ""} 
                placement="right"
                componentsProps={{
                  tooltip: {
                    sx: {
                      bgcolor: 'rgba(0, 0, 0, 0.9)',
                      fontSize: '0.75rem',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    }
                  }
                }}
              >
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  selected={isActive}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    margin: '4px 8px',
                    borderRadius: '12px',
                    color: '#ffffff',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      transform: 'translateX(4px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                        transform: 'translateX(4px)',
                      },
                      '& .MuiListItemIcon-root': {
                        color: '#ffffff',
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                      color: '#ffffff',
                    }}
                  >
                    <Icon />
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.title}
                    sx={{ 
                      opacity: open ? 1 : 0,
                      '& .MuiListItemText-primary': {
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 600 : 400,
                        color: '#ffffff',
                      }
                    }}
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>
      
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
      
      {/* Logout at bottom */}
      <Box sx={{ mt: 'auto' }}>
        <List>
          <ListItem disablePadding sx={{ display: 'block' }}>
            <Tooltip 
              title={!open ? "Logout" : ""} 
              placement="right"
              componentsProps={{
                tooltip: {
                  sx: {
                    bgcolor: 'rgba(0, 0, 0, 0.9)',
                    fontSize: '0.75rem',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  }
                }
              }}
            >
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  margin: '4px 8px',
                  borderRadius: '12px',
                  color: '#ffffff',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 82, 82, 0.2)',
                    transform: 'translateX(4px)',
                    boxShadow: '0 4px 12px rgba(255, 82, 82, 0.3)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                    color: '#ffffff',
                  }}
                >
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Logout"
                  sx={{ 
                    opacity: open ? 1 : 0,
                    '& .MuiListItemText-primary': {
                      fontSize: '0.875rem',
                      color: '#ffffff',
                    }
                  }}
                />
              </ListItemButton>
            </Tooltip>
          </ListItem>
        </List>
      </Box>
    </StyledDrawer>
  );
};

export default MiniVariantDrawer;