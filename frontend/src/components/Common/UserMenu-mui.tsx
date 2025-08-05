// frontend/src/components/Common/UserMenu-mui.tsx (For Navbar Right Side)
import React, { useState } from "react";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
  Chip,
} from "@mui/material";
import {
  Person as PersonIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  AdminPanelSettings as AdminIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

import type { UserPublic } from "@/client";
import useAuth from "@/hooks/useAuth";

const UserMenuMUI = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    logout();
  };

  const handleProfileClick = () => {
    handleClose();
    navigate({ to: "/settings" });
  };

  const handleAdminClick = () => {
    handleClose();
    navigate({ to: "/admin" });
  };

  // Get user initials for avatar
  const getUserInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Box>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{ 
          p: 0,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            transform: 'scale(1.05)',
            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)',
          }
        }}
        aria-controls={open ? 'account-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
            fontSize: '0.875rem',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
          }}
        >
          {getUserInitials(currentUser?.full_name||'')}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            boxShadow: '0 8px 32px rgba(33, 150, 243, 0.2), 0 4px 16px rgba(0, 0, 0, 0.1)',
            mt: 1.5,
            minWidth: 280,
            borderRadius: '16px',
            border: '1px solid rgba(33, 150, 243, 0.1)',
            backdropFilter: 'blur(8px)',
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
              border: '1px solid rgba(33, 150, 243, 0.1)',
              borderBottom: 'none',
              borderRight: 'none',
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* User Info Header */}
        <Box sx={{ 
          px: 2, 
          py: 1.5, 
          borderBottom: '1px solid rgba(33, 150, 243, 0.1)',
          background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(25, 118, 210, 0.05) 100%)',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                fontSize: '1rem',
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
              }}
            >
              {getUserInitials(currentUser?.full_name||'')}
            </Avatar>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography variant="subtitle2" fontWeight={600} noWrap color="#1976D2">
                {currentUser?.full_name || "User"}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {currentUser?.email || ""}
              </Typography>
              {currentUser?.is_superuser && (
                <Chip
                  label="Admin"
                  size="small"
                  sx={{ 
                    height: 16, 
                    fontSize: '0.625rem',
                    mt: 0.5,
                    background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                    color: '#ffffff',
                    boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)',
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>

        {/* Profile Settings */}
        <MenuItem 
          onClick={handleProfileClick} 
          sx={{ 
            py: 1.5,
            mx: 1,
            my: 0.5,
            borderRadius: '8px',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: 'rgba(33, 150, 243, 0.08)',
              boxShadow: '0 2px 8px rgba(33, 150, 243, 0.15)',
              transform: 'translateX(4px)',
            }
          }}
        >
          <ListItemIcon>
            <SettingsIcon fontSize="small" sx={{ color: '#2196F3' }} />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2" fontWeight={500}>Profile Settings</Typography>
          </ListItemText>
        </MenuItem>

        {/* Admin Panel (only for superusers) */}
        {currentUser?.is_superuser && (
          <MenuItem 
            onClick={handleAdminClick} 
            sx={{ 
              py: 1.5,
              mx: 1,
              my: 0.5,
              borderRadius: '8px',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: 'rgba(33, 150, 243, 0.08)',
                boxShadow: '0 2px 8px rgba(33, 150, 243, 0.15)',
                transform: 'translateX(4px)',
              }
            }}
          >
            <ListItemIcon>
              <AdminIcon fontSize="small" sx={{ color: '#2196F3' }} />
            </ListItemIcon>
            <ListItemText>
              <Typography variant="body2" fontWeight={500}>Admin Panel</Typography>
            </ListItemText>
          </MenuItem>
        )}

        <Divider sx={{ borderColor: 'rgba(33, 150, 243, 0.1)' }} />

        {/* Logout */}
        <MenuItem 
          onClick={handleLogout} 
          sx={{ 
            py: 1.5,
            mx: 1,
            my: 0.5,
            borderRadius: '8px',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: 'rgba(244, 67, 54, 0.08)',
              boxShadow: '0 2px 8px rgba(244, 67, 54, 0.15)',
              transform: 'translateX(4px)',
            }
          }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" sx={{ color: '#f44336' }} />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2" fontWeight={500}>Sign Out</Typography>
          </ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UserMenuMUI;