import { 
  Container, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  Paper, 
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  Stack
} from "@mui/material"
import { useState } from "react"
import {
  Security as SecurityIcon,
  ManageAccounts as ManageAccountsIcon,
  VpnKey as VpnKeyIcon,
  Dashboard as DashboardIcon,
} from "@mui/icons-material"
import { createFileRoute } from '@tanstack/react-router'

import { ProtectedRoute } from "@/components/Common/ProtectedRoute"
import AddRole from "@/components/ATS/RoleManagement/AddRole"
import RolesTable from "@/components/ATS/RoleManagement/RolesTable"
import PermissionsTable from "@/components/ATS/Permissions/PermissionsTable"
import UserRoleManagement from "@/components/ATS/UserRoles/UserRoleManagement"

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

const ATS = () => {
  const [tabValue, setTabValue] = useState(0)

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  return (
    <ProtectedRoute permissions={["manage_users", "system_admin"]}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Header Section */}
        <Card
          elevation={0}
          sx={{
            mb: 4,
            background: "linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)",
            color: "white",
            position: "relative",
            overflow: "hidden",
            border: "none",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              right: 0,
              width: "100px",
              height: "100px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
              transform: "translate(30px, -30px)",
            },
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "60px",
              height: "60px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
              transform: "translate(-20px, 20px)",
            },
          }}
        >
          <CardContent sx={{ p: 4, position: "relative", zIndex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <DashboardIcon sx={{ fontSize: 40 }} />
              <Box>
                <Typography
                  variant="h3"
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
            
            {/* Quick Stats */}
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid size={4}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <SecurityIcon />
                  <Typography variant="body2">Role-Based Access Control</Typography>
                </Stack>
              </Grid>
              <Grid size={4}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <VpnKeyIcon />
                  <Typography variant="body2">Granular Permissions</Typography>
                </Stack>
              </Grid>
              <Grid size={4}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <ManageAccountsIcon />
                  <Typography variant="body2">User Management</Typography>
                </Stack>
              </Grid>
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
                background: "linear-gradient(45deg, #1976D2 30%, #42A5F5 90%)",
              },
            }}
          >
            <Tab
              icon={<SecurityIcon />}
              iconPosition="start"
              label="Role Management"
              sx={{ gap: 1 }}
            />
            <Tab
              icon={<VpnKeyIcon />}
              iconPosition="start"
              label="Permissions"
              sx={{ gap: 1 }}
            />
            <Tab
              icon={<ManageAccountsIcon />}
              iconPosition="start"
              label="User Roles"
              sx={{ gap: 1 }}
            />
          </Tabs>

          {/* Tab Content */}
          <TabPanel value={tabValue} index={0}>
            <Box>
              <Stack 
                direction="row" 
                justifyContent="space-between" 
                alignItems="center" 
                sx={{ mb: 3 }}
              >
                <Box>
                  <Typography variant="h6" gutterBottom color="text.primary">
                    Manage System Roles
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create, edit, and assign permissions to system roles
                  </Typography>
                </Box>
                <Chip 
                  label="Active" 
                  color="success" 
                  variant="outlined" 
                  size="small" 
                />
              </Stack>
              
              <Divider sx={{ mb: 3 }} />
              
              {/* Using new Grid syntax */}
              <Grid container spacing={3}>
                <Grid size={8}>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider"
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      Roles Overview
                    </Typography>
                    <RolesTable />
                  </Paper>
                </Grid>
                <Grid size={4}>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      background: "linear-gradient(135deg, #f8f9ff 0%, #e3f2fd 100%)"
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      Add New Role
                    </Typography>
                    <AddRole />
                  </Paper>
                </Grid>
              </Grid>
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
                    View and manage all available system permissions
                  </Typography>
                </Box>
                <Chip 
                  label="Read Only" 
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
      </Container>
    </ProtectedRoute>
  )
}

// Export route configuration
export const Route = createFileRoute('/_layout/ats')({
  component: ATS
})

export default ATS