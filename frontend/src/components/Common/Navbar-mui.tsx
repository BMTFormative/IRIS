// frontend/src/components/Common/Navbar-mui.tsx (With User Menu on Right)
import React from "react";
import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Typography,
  styled,
} from "@mui/material";
import {
  Menu as MenuIcon,
} from "@mui/icons-material";
import { Link } from "@tanstack/react-router";

import Logo from "/assets/images/logoT.png";
import UserMenuMUI from "./UserMenu-mui";

const drawerWidth = 260;
const miniDrawerWidth = 64;

const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ open?: boolean }>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
  ...(!open && {
    marginLeft: miniDrawerWidth,
    width: `calc(100% - ${miniDrawerWidth}px)`,
  }),
}));

interface ModernNavbarProps {
  open: boolean;
  handleDrawerToggle: () => void;
}

const ModernNavbar = ({ open, handleDrawerToggle }: ModernNavbarProps) => {
  return (
      <StyledAppBar
        position="fixed"
        open={open}
        sx={(theme) => ({
          bgcolor: 'rgba(25, 118, 210, 0.08)',
          color: theme.palette.text.primary,
          boxShadow: theme.shadows[4],
          borderBottom: `1px solid ${theme.palette.divider}`,
          backdropFilter: 'blur(8px)',
        })}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerToggle}
          edge="start"
          sx={{
            marginRight: 5,
            color: '#2196F3',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              color: '#1976D2',
              transform: 'scale(1.05)',
              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)',
            },
          }}
        >
          <MenuIcon />
        </IconButton>
        
        {/* Logo */}
        <Box
          component={Link}
          to="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            mr: 2,
            transition: 'all 0.2s ease-in-out',
            borderRadius: '8px',
            padding: '8px',
            '&:hover': {
              backgroundColor: 'rgba(33, 150, 243, 0.08)',
              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.15)',
              transform: 'translateY(-1px)',
            },
          }}
        >
          <Box
            component="img"
            src={Logo}
            sx={{
              height: 60,
              width: 'auto',
              filter: 'hue-rotate(200deg) saturate(1.2)',
            }}
          />
        </Box>

        {/* Page Title */}
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 600,
            color: '#1976D2',
            background: 'linear-gradient(135deg, #2196F3, #1976D2)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Dashboard
        </Typography>

        {/* User Menu on Right */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <UserMenuMUI />
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

export default ModernNavbar;