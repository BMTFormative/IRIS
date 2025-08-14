import { Container, Typography, Box, Tabs, Tab, Paper } from "@mui/material"
import { useState } from "react"
import {
  Security as SecurityIcon,
  ManageAccounts as ManageAccountsIcon,
  VpnKey as VpnKeyIcon,
} from "@mui/icons-material"

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
        {/* Header */}
        <Box
          sx={{
            mb: 4,
            p: 4,
            background: "linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)",
            borderRadius: 3,
            color: "white",
            position: "relative",
            overflow: "hidden",
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
          <Typography
            variant="h3"
            component="h1"
            fontWeight="bold"
            sx={{
              mb: 1,
              background: "linear-gradient(45deg, #ffffff 30%, #e3f2fd 90%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              position: "relative",
              zIndex: 1,
            }}
          >
            ATS Management
          </Typography>
          <Typography
            variant="h6"
            sx={{
              opacity: 0.9,
              position: "relative",
              zIndex: 1,
            }}
          >
            Manage roles, permissions, and user access for the ATS system
          </Typography>
        </Box>

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
                  color: "#1976D2",
                  background: "linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(66, 165, 245, 0.05) 100%)",
                },
              },
              "& .MuiTabs-indicator": {
                height: 3,
                background: "linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)",
                borderRadius: "3px 3px 0 0",
              },
            }}
          >
            <Tab
              icon={<SecurityIcon />}
              iconPosition="start"
              label="Role Management"
              sx={{
                gap: 1,
                "&:hover": {
                  background: "rgba(25, 118, 210, 0.04)",
                  transform: "translateY(-1px)",
                  transition: "all 0.2s ease",
                },
              }}
            />
            <Tab
              icon={<VpnKeyIcon />}
              iconPosition="start"
              label="Permissions"
              sx={{
                gap: 1,
                "&:hover": {
                  background: "rgba(25, 118, 210, 0.04)",
                  transform: "translateY(-1px)",
                  transition: "all 0.2s ease",
                },
              }}
            />
            <Tab
              icon={<ManageAccountsIcon />}
              iconPosition="start"
              label="User Roles"
              sx={{
                gap: 1,
                "&:hover": {
                  background: "rgba(25, 118, 210, 0.04)",
                  transform: "translateY(-1px)",
                  transition: "all 0.2s ease",
                },
              }}
            />
          </Tabs>

          {/* Tab Content */}
          <TabPanel value={tabValue} index={0}>
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, color: "text.primary" }}>
                Manage System Roles
              </Typography>
              <RolesTable />
              <AddRole />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, color: "text.primary" }}>
                System Permissions
              </Typography>
              <PermissionsTable />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, color: "text.primary" }}>
                User Role Assignments
              </Typography>
              <UserRoleManagement />
            </Box>
          </TabPanel>
        </Paper>
      </Container>
    </ProtectedRoute>
  )
}

export default ATS