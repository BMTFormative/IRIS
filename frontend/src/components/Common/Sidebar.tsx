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
  { icon: WorkIcon, title: "Job Matching", path: "/job-matching" },
];

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
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
          ? theme.palette.getContrastText(theme.palette.primary.main)
          : theme.palette.text.primary,
      boxShadow: theme.shadows[4],
      border: "none",
    },
  }),
}));

interface MiniVariantDrawerProps {
  open: boolean;
  handleDrawerToggle: () => void;
}

const MiniVariantDrawer = ({
  open,
  handleDrawerToggle,
}: MiniVariantDrawerProps) => {
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
      <DrawerHeader
        sx={(theme) => ({
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          "& .MuiIconButton-root": {
            color: theme.palette.text.primary,
            "&:hover": {
              backgroundColor: theme.palette.action.hover,
            },
          },
        })}
      >
        <IconButton onClick={handleDrawerToggle}>
          {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </DrawerHeader>
      <Divider
        sx={(theme) => ({
          borderColor: alpha(theme.palette.divider, 0.12),
          marginTop: "10px",
        })}
      />

      <List>
        {finalItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;

          return (
            <ListItem key={item.title} disablePadding sx={{ display: "block" }}>
              <Tooltip
                title={!open ? item.title : ""}
                placement="right"
                componentsProps={{
                  tooltip: {
                    sx: {
                      bgcolor: "rgba(0, 0, 0, 0.9)",
                      fontSize: "0.75rem",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
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
                    margin: "16px 8px",
                    borderRadius: "12px",
                    color: theme.palette.text.primary,
                    transition: theme.transitions.create(
                      ["background-color", "transform", "box-shadow"],
                      { duration: theme.transitions.duration.short }
                    ),
                    "&:hover": {
                      backgroundColor: "rgba(33, 150, 243, 0.08)",
                      boxShadow: "0 2px 8px rgba(33, 150, 243, 0.15)",
                      transform: "translateX(4px)",
                    },
                    "&.Mui-selected": {
                      backgroundColor: theme.palette.action.selected,
                      boxShadow: theme.shadows[2],
                      "&:hover": {
                        backgroundColor: "rgba(33, 150, 243, 0.08)",
                      boxShadow: "0 2px 8px rgba(33, 150, 243, 0.15)",
                        transform: "translateX(4px)",
                      },
                      "& .MuiListItemIcon-root": {
                        color: theme.palette.text.primary,
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
                    })}
                  >
                    <Icon />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    sx={(theme) => ({
                      opacity: open ? 1 : 0,
                      "& .MuiListItemText-primary": {
                        fontSize: "0.875rem",
                        fontWeight: isActive
                          ? theme.typography.fontWeightBold
                          : theme.typography.fontWeightRegular,
                        color: theme.palette.text.primary,
                      },
                    })}
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      <Divider
        sx={(theme) => ({ borderColor: alpha(theme.palette.divider, 0.12) })}
      />

      {/* Logout at bottom */}
      <Box sx={{ mt: "auto" }}>
        <List>
          <ListItem disablePadding sx={{ display: "block" }}>
            <Tooltip
              title={!open ? "Logout" : ""}
              placement="right"
              componentsProps={{
                tooltip: {
                  sx: {
                    bgcolor: alpha(theme.palette.background.paper, 0.9),
                    fontSize: "0.75rem",
                    boxShadow: theme.shadows[2],
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
                  margin: "4px 8px",
                  borderRadius: "12px",
                  color: theme.palette.text.primary,
                  transition: theme.transitions.create(
                    ["background-color", "transform", "box-shadow"],
                    { duration: theme.transitions.duration.short }
                  ),
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.error.main, 0.2),
                    boxShadow: theme.shadows[2],
                    transform: "translateX(4px)",
                  },
                })}
              >
                <ListItemIcon
                  sx={(theme) => ({
                    minWidth: 0,
                    mr: open ? theme.spacing(3) : "auto",
                    justifyContent: "center",
                    color: theme.palette.text.primary,
                  })}
                >
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Logout"
                  sx={(theme) => ({
                    opacity: open ? 1 : 0,
                    "& .MuiListItemText-primary": {
                      fontSize: "0.875rem",
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
