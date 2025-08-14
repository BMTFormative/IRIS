// frontend/src/components/Common/Sidebar.tsx
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
import { alpha } from "@mui/material/styles";
import {
  Home as HomeIcon,
  Inventory as InventoryIcon,
  Settings as SettingsIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Work as WorkIcon,
  // ATS Icons
  Security as SecurityIcon,        // ATS Management
  Assignment as AssignmentIcon,    // Applications
  People as PeopleIcon,           // Candidates  
  Analytics as AnalyticsIcon,     // Analytics
  BusinessCenter as JobsIcon,     // Jobs
} from "@mui/icons-material";
import { useQueryClient } from "@tanstack/react-query";
import { Link as RouterLink, useRouterState } from "@tanstack/react-router";

import type { UserPublic } from "@/client";
import useAuth from "@/hooks/useAuth";

const drawerWidth = 240;
const miniDrawerWidth = 64;

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const openedMixin = (theme: any) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: any) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: miniDrawerWidth,
  },
});

const StyledDrawer = styled(Drawer)(({ theme, open }: any) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": {
      ...openedMixin(theme),
      background:
        theme.palette.mode === "light"
          ? "rgba(255, 255, 255, 1)"
          : theme.palette.background.paper,
      bgcolor: theme.palette.background.paper,
      boxShadow: theme.shadows[4],
      border: "none",
      color: theme.palette.getContrastText(
        theme.palette.mode === "light"
          ? theme.palette.primary.light
          : theme.palette.background.paper
      ),
    },
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": {
      ...closedMixin(theme),
      background:
        theme.palette.mode === "light"
          ? "rgba(255, 255, 255, 1)"
          : theme.palette.background.paper,
      color:
        theme.palette.mode === "light"
          ? theme.palette.text.primary
          : theme.palette.text.primary,
      boxShadow: theme.shadows[4],
      border: "none",
    },
  }),
}));

interface SidebarProps {
  open: boolean;
  handleDrawerToggle: () => void;
}

interface MenuItem {
  icon: React.ComponentType;
  title: string;
  path: string;
  adminOnly?: boolean;
  permissions?: string[];
  dividerAfter?: boolean;
}

const MiniVariantDrawer = ({ open, handleDrawerToggle }: SidebarProps) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"]);
  const { hasAnyPermission, canAccess, isAdmin } = useAuth();
  const router = useRouterState();

  // Base menu items
  const baseMenuItems: MenuItem[] = [
    { icon: HomeIcon, title: "Dashboard", path: "/" },
    { icon: InventoryIcon, title: "Items", path: "/items" },
    { icon: WorkIcon, title: "Job Matching", path: "/job-matching", dividerAfter: true },
  ];

  // ATS menu items with permission checks
  const atsMenuItems: MenuItem[] = [
    { 
      icon: JobsIcon, 
      title: "Jobs", 
      path: "/jobs",
      permissions: ["view_jobs"]
    },
    { 
      icon: PeopleIcon, 
      title: "Candidates", 
      path: "/candidates",
      permissions: ["view_candidates"]
    },
    { 
      icon: AssignmentIcon, 
      title: "Applications", 
      path: "/applications",
      permissions: ["view_applications"]
    },
    { 
      icon: AnalyticsIcon, 
      title: "Analytics", 
      path: "/analytics",
      permissions: ["view_analytics"]
    },
    { 
      icon: SecurityIcon, 
      title: "ATS Management", 
      path: "/ats",
      permissions: ["manage_users", "system_admin"],
      dividerAfter: true
    },
  ];

  // Settings and admin items
  const settingsMenuItems: MenuItem[] = [
    { icon: SettingsIcon, title: "User Settings", path: "/settings" },
    ...(currentUser?.is_superuser ? [
      { icon: AdminIcon, title: "Admin", path: "/admin", adminOnly: true }
    ] : []),
  ];

  // Filter ATS items based on permissions
  const visibleATSItems = atsMenuItems.filter(item => {
    if (!item.permissions) return true;
    return hasAnyPermission(item.permissions);
  });

  // Combine all menu items
  const allMenuItems = [
    ...baseMenuItems,
    ...visibleATSItems,
    ...settingsMenuItems,
  ];

  const handleLogout = () => {
    queryClient.clear();
    window.location.href = "/login";
  };

  const isItemActive = (path: string) => {
    return router.location.pathname === path;
  };

  return (
    <StyledDrawer variant="permanent" open={open}>
      <DrawerHeader>
        <IconButton 
          onClick={handleDrawerToggle}
          sx={(theme) => ({
            color: theme.palette.primary.main,
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              transform: "scale(1.1)",
            },
            transition: theme.transitions.create(["transform", "background-color"], {
              duration: theme.transitions.duration.short,
            }),
          })}
        >
          {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </DrawerHeader>

      <Divider
        sx={(theme) => ({ 
          borderColor: alpha(theme.palette.divider, 0.12),
          mx: 1 
        })}
      />

      {/* Main Navigation */}
      <List sx={{ px: 1, pt: 1 }}>
        {allMenuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = isItemActive(item.path);

          return (
            <React.Fragment key={`${item.title}-${index}`}>
              <ListItem disablePadding sx={{ display: "block" }}>
                <Tooltip
                  title={!open ? item.title : ""}
                  placement="right"
                  componentsProps={{
                    tooltip: {
                      sx: {
                        bgcolor: alpha(theme.palette.background.paper, 0.95),
                        color: theme.palette.text.primary,
                        fontSize: "0.75rem",
                        boxShadow: theme.shadows[8],
                        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                        borderRadius: 2,
                      },
                    },
                  }}
                >
                  <ListItemButton
                    component={RouterLink}
                    to={item.path}
                    selected={isActive}
                    sx={(theme) => ({
                      minHeight: 48,
                      justifyContent: open ? "initial" : "center",
                      px: 2.5,
                      margin: "4px 0",
                      borderRadius: "12px",
                      color: isActive 
                        ? theme.palette.primary.main 
                        : theme.palette.text.primary,
                      backgroundColor: isActive 
                        ? alpha(theme.palette.primary.main, 0.1)
                        : "transparent",
                      transition: theme.transitions.create(
                        ["background-color", "transform", "box-shadow", "color"],
                        { duration: theme.transitions.duration.short }
                      ),
                      "&:hover": {
                        backgroundColor: isActive
                          ? alpha(theme.palette.primary.main, 0.15)
                          : alpha(theme.palette.primary.main, 0.08),
                        boxShadow: "0 2px 8px rgba(33, 150, 243, 0.15)",
                        transform: "translateX(4px)",
                      },
                      "&.Mui-selected": {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
                        "&:hover": {
                          backgroundColor: alpha(theme.palette.primary.main, 0.15),
                          transform: "translateX(4px)",
                        },
                        "& .MuiListItemIcon-root": {
                          color: theme.palette.primary.main,
                        },
                      },
                    })}
                  >
                    <ListItemIcon
                      sx={(theme) => ({
                        minWidth: 0,
                        mr: open ? theme.spacing(3) : "auto",
                        justifyContent: "center",
                        color: isActive 
                          ? theme.palette.primary.main 
                          : theme.palette.text.primary,
                        transition: theme.transitions.create("color", {
                          duration: theme.transitions.duration.short,
                        }),
                      })}
                    >
                      <Icon />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.title}
                      sx={(theme) => ({
                        opacity: open ? 1 : 0,
                        transition: theme.transitions.create("opacity", {
                          duration: theme.transitions.duration.short,
                        }),
                        "& .MuiListItemText-primary": {
                          fontSize: "0.875rem",
                          fontWeight: isActive
                            ? theme.typography.fontWeightBold
                            : theme.typography.fontWeightMedium,
                          color: isActive 
                            ? theme.palette.primary.main 
                            : theme.palette.text.primary,
                        },
                      })}
                    />
                  </ListItemButton>
                </Tooltip>
              </ListItem>

              {/* Add divider after certain items */}
              {item.dividerAfter && (
                <Divider
                  sx={(theme) => ({ 
                    borderColor: alpha(theme.palette.divider, 0.12),
                    my: 1,
                    mx: 1
                  })}
                />
              )}
            </React.Fragment>
          );
        })}
      </List>

      {/* Logout at bottom */}
      <Box sx={{ mt: "auto", p: 1 }}>
        <Divider
          sx={(theme) => ({ 
            borderColor: alpha(theme.palette.divider, 0.12),
            mb: 1
          })}
        />
        <List>
          <ListItem disablePadding sx={{ display: "block" }}>
            <Tooltip
              title={!open ? "Logout" : ""}
              placement="right"
              componentsProps={{
                tooltip: {
                  sx: {
                    bgcolor: alpha(theme.palette.background.paper, 0.95),
                    color: theme.palette.text.primary,
                    fontSize: "0.75rem",
                    boxShadow: theme.shadows[8],
                    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    borderRadius: 2,
                  },
                },
              }}
            >
              <ListItemButton
                onClick={handleLogout}
                sx={(theme) => ({
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                  margin: "4px 0",
                  borderRadius: "12px",
                  color: theme.palette.text.primary,
                  transition: theme.transitions.create(
                    ["background-color", "transform", "box-shadow"],
                    { duration: theme.transitions.duration.short }
                  ),
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                    color: theme.palette.error.main,
                    boxShadow: `0 2px 8px ${alpha(theme.palette.error.main, 0.2)}`,
                    transform: "translateX(4px)",
                    "& .MuiListItemIcon-root": {
                      color: theme.palette.error.main,
                    },
                  },
                })}
              >
                <ListItemIcon
                  sx={(theme) => ({
                    minWidth: 0,
                    mr: open ? theme.spacing(3) : "auto",
                    justifyContent: "center",
                    color: theme.palette.text.primary,
                    transition: theme.transitions.create("color", {
                      duration: theme.transitions.duration.short,
                    }),
                  })}
                >
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Logout"
                  sx={(theme) => ({
                    opacity: open ? 1 : 0,
                    transition: theme.transitions.create("opacity", {
                      duration: theme.transitions.duration.short,
                    }),
                    "& .MuiListItemText-primary": {
                      fontSize: "0.875rem",
                      fontWeight: theme.typography.fontWeightMedium,
                      color: theme.palette.text.primary,
                    },
                  })}
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