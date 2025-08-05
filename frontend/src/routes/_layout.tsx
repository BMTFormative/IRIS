// frontend/src/routes/_layout.tsx (Mini Variant Layout)
import React, { useState } from "react";
import {
  Box,
  CssBaseline,
  styled,
} from "@mui/material";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import ModernNavbar from "@/components/Common/Navbar-mui";
import MiniVariantDrawer from "@/components/Common/Sidebar-mui";
import { isLoggedIn } from "@/hooks/useAuth";

// Width of the sidebar when expanded (matches Sidebar-mui drawerWidth)
const drawerWidth = 240;
const miniDrawerWidth = 64;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  background: 'transparent',
}));

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: miniDrawerWidth,
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
  backgroundImage: 'none',
  backgroundSize: '20px 20px',
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: drawerWidth,
  }),
}));

export const Route = createFileRoute("/_layout")({
  component: Layout,
  beforeLoad: async () => {
    if (!isLoggedIn()) {
      throw redirect({
        to: "/login",
      });
    }
  },
});

function Layout() {
  const [open, setOpen] = useState(false);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <ModernNavbar 
        open={open} 
        handleDrawerToggle={handleDrawerToggle} 
      />
      
      {/* Mini Variant Sidebar */}
      <MiniVariantDrawer
        open={open}
        handleDrawerToggle={handleDrawerToggle}
      />
      
      {/* Main content */}
      <Main open={open}>
        <DrawerHeader />
        <Box
          sx={(theme) => ({
            backgroundColor: theme.palette.background.paper,
            borderRadius: '16px',
            boxShadow: theme.shadows[1],
            border: `1px solid ${theme.palette.divider}`,
            p: 3,
            minHeight: 'calc(100vh - 120px)',
          })}
        >
          <Outlet />
        </Box>
      </Main>
    </Box>
  );
}

export default Layout;