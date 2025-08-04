// frontend/src/routes/_layout.tsx
import React, { useState } from "react";
import {
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import NavbarMUI from "@/components/Common/Navbar-mui";
import SidebarMUI from "@/components/Common/Sidebar-mui";
import { isLoggedIn } from "@/hooks/useAuth";

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDrawerClose = () => {
    setMobileOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Navbar */}
      <NavbarMUI />
      
      {/* Main content area */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <SidebarMUI
          mobileOpen={mobileOpen}
          onMobileClose={handleDrawerClose}
          onMobileToggle={handleDrawerToggle}
        />
        
        {/* Main content */}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: 3,
            overflow: 'auto',
            backgroundColor: 'background.default',
            // Add margin for mobile menu button
            ...(isMobile && {
              pt: 8, // Add top padding to avoid overlap with mobile menu button
            }),
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default Layout;