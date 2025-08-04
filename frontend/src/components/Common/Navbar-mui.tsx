// frontend/src/components/Common/Navbar-mui.tsx
import React from "react";
import {
  AppBar,
  Toolbar,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Link } from "@tanstack/react-router";

import Logo from "/assets/images/fastapi-logo.svg";
import UserMenu from "./UserMenu"; // Keep original for now

function NavbarMUI() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AppBar 
      position="sticky" 
      elevation={1}
      sx={{
        backgroundColor: 'background.paper',
        color: 'text.primary',
        borderBottom: 1,
        borderColor: 'divider',
        // Hide on mobile to give more space
        display: isMobile ? 'none' : 'flex',
      }}
    >
      <Toolbar 
        sx={{ 
          justifyContent: 'space-between',
          minHeight: { xs: 56, sm: 64 },
        }}
      >
        {/* Logo */}
        <Box
          component={Link}
          to="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
          }}
        >
          <Box
            component="img"
            src={Logo}
            alt="FastAPI logo"
            sx={{
              height: 40,
              width: 'auto',
              maxWidth: 120,
            }}
          />
        </Box>

        {/* User Menu */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <UserMenu />
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default NavbarMUI;