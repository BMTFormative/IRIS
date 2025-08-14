// frontend/src/routes/_layout/ats.tsx
import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  Paper,
  Stack,
  Chip,
  Grid,
  Divider,
  useTheme,
  alpha,
  Button,
} from "@mui/material"
import {
  Security as SecurityIcon,
  VpnKey as VpnKeyIcon,
  ManageAccounts as ManageAccountsIcon,
  AdminPanelSettings as AdminIcon,
  Assignment as PermissionsIcon,
  People as UsersIcon,
  Add as AddIcon,
} from "@mui/icons-material"

// Import ATS components
import { ProtectedRoute } from "@/components/Common/ProtectedRoute"
import AddRole from "@/components/ATS/RoleManagement/AddRole"
import RolesTable from "@/components/ATS/RoleManagement/RolesTable"
import PermissionsTable from "@/components/ATS/Permissions/PermissionsTable"
import UserRoleManagement from "@/components/ATS/UserRoles/UserRoleManagement"

// TabPanel component for tab content
interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ats-tabpanel-${index}`}
      aria-labelledby={`ats-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

// Tab accessibility props
function a11yProps(index: number) {
  return {
    id: `ats-tab-${index}`,
    'aria-controls': `ats-tabpanel-${index}`,
  }
}

function ATS() {
  const [tabValue, setTabValue] = useState(0)
  const theme = useTheme()

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  // Function to trigger the AddRole dialog
  const triggerAddRole = () => {
    // Find and click the hidden AddRole FAB button
    const addRoleFab = document.querySelector('[aria-label="add role"]') as HTMLButtonElement
    if (addRoleFab) {
      addRoleFab.click()
    }
  }

  // Tab configuration - no hardcoded data
  const tabs = [
    { 
      label: "Role Management", 
      icon: <AdminIcon />, 
      description: "Create and manage user roles with permissions" 
    },
    { 
      label: "Permissions", 
      icon: <PermissionsIcon />, 
      description: "View system permissions and access controls" 
    },
    { 
      label: "User Management", 
      icon: <UsersIcon />, 
      description: "Assign roles to users and manage access" 
    }
  ]

  // Quick stats configuration - no hardcoded numbers
  const quickStats = [
    { icon: <SecurityIcon />, label: "Role-Based Access Control" },
    { icon: <VpnKeyIcon />, label: "Granular Permissions" },
    { icon: <ManageAccountsIcon />, label: "User Management" }
  ]

  return (
    <ProtectedRoute permissions={["manage_users", "system_admin"]}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header Card with Gradient */}
        <Card
          elevation={0}
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: "white",
            borderRadius: 4,
            mb: 4,
            overflow: "hidden",
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(135deg, ${alpha(theme.palette.common.white, 0.1)} 0%, transparent 50%)`,
              pointerEvents: "none",
            },
          }}
        >
          <CardContent sx={{ p: 4, position: "relative", zIndex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={3}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  backgroundColor: alpha(theme.palette.common.white, 0.15),
                  backdropFilter: "blur(10px)",
                }}
              >
                <SecurityIcon sx={{ fontSize: 40 }} />
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h4"
                  component="h1"
                  fontWeight="bold"
                  sx={{ mb: 1 }}
                >
                  ATS Management
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Manage roles, permissions, and user access for the ATS system
                </Typography>
              </Box>
            </Stack>
            
            {/* Quick Stats - Using new Grid syntax */}
            <Grid container spacing={2} sx={{ mt: 2 }}>
              {quickStats.map((stat, index) => (
                <Grid size={4} key={index}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {stat.icon}
                    <Typography variant="body2">{stat.label}</Typography>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
            mb: 3,
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              "& .MuiTab-root": {
                minHeight: 72,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 500,
                color: "text.secondary",
                "&.Mui-selected": {
                  color: "primary.main",
                  fontWeight: 600,
                },
              },
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: "3px 3px 0 0",
              },
            }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                icon={tab.icon}
                iconPosition="start"
                label={
                  <Box>
                    <Typography variant="subtitle1" fontWeight="inherit">
                      {tab.label}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: "block", 
                        opacity: 0.7,
                        textTransform: "none",
                        fontWeight: 400 
                      }}
                    >
                      {tab.description}
                    </Typography>
                  </Box>
                }
                {...a11yProps(index)}
                sx={{
                  "& .MuiTab-iconWrapper": {
                    mb: 0,
                    mr: 1,
                  },
                }}
              />
            ))}
          </Tabs>

          {/* Tab Panels */}
          <TabPanel value={tabValue} index={0}>
            <Box>
              {/* Header with centered Administration chip - reduced spacing */}
              <Box sx={{ textAlign: 'center', mb: 1 }}>
                <Chip 
                  label="Administration" 
                  color="primary" 
                  variant="outlined" 
                  size="small" 
                />
              </Box>
              
              <Stack 
                direction="row" 
                justifyContent="space-between" 
                alignItems="center" 
                sx={{ mb: 1 }}
              >
                <Box>
                  <Typography variant="h6" gutterBottom color="text.primary">
                    Role Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create, edit, and manage system roles with custom permissions
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={triggerAddRole}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    background: "linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)",
                    boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #1565C0 0%, #1976D2 100%)",
                      transform: "translateY(-1px)",
                      boxShadow: "0 6px 16px rgba(25, 118, 210, 0.4)",
                    },
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  Add Role
                </Button>
              </Stack>
              
              <Divider sx={{ mb: 3 }} />
              
              {/* Roles Table */}
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider"
                }}
              >
                <RolesTable />
              </Paper>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box>
              <Stack 
                direction="row" 
                justifyContent="space-between" 
                alignItems="center" 
                sx={{ mb: 3 }}
              >
                <Box>
                  <Typography variant="h6" gutterBottom color="text.primary">
                    System Permissions
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    View all available permissions and their descriptions
                  </Typography>
                </Box>
                <Chip 
                  label="Read-only" 
                  color="info" 
                  variant="outlined" 
                  size="small" 
                />
              </Stack>
              
              <Divider sx={{ mb: 3 }} />
              
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider"
                }}
              >
                <PermissionsTable />
              </Paper>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box>
              <Stack 
                direction="row" 
                justifyContent="space-between" 
                alignItems="center" 
                sx={{ mb: 3 }}
              >
                <Box>
                  <Typography variant="h6" gutterBottom color="text.primary">
                    User Role Assignments
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Assign and manage user roles and access levels
                  </Typography>
                </Box>
                <Chip 
                  label="Management" 
                  color="primary" 
                  variant="outlined" 
                  size="small" 
                />
              </Stack>
              
              <Divider sx={{ mb: 3 }} />
              
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider"
                }}
              >
                <UserRoleManagement />
              </Paper>
            </Box>
          </TabPanel>
        </Paper>

        {/* Hidden AddRole FAB for dialog functionality */}
        <Box sx={{ visibility: 'hidden', position: 'fixed', bottom: -100, right: -100 }}>
          <AddRole />
        </Box>
      </Container>
    </ProtectedRoute>
  )
}

// Export route configuration
export const Route = createFileRoute('/_layout/ats')({
  component: ATS
})

export default ATS