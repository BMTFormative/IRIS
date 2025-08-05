// frontend/src/routes/_layout/settings.tsx
import { useState } from "react"
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
} from "@mui/material"
import { createFileRoute } from "@tanstack/react-router"

import Appearance from "@/components/UserSettings/Appearance"
import ChangePassword from "@/components/UserSettings/ChangePassword"
import DeleteAccount from "@/components/UserSettings/DeleteAccount"
import UserInformation from "@/components/UserSettings/UserInformation"
import useAuth from "@/hooks/useAuth"

// Tab configuration
const tabsConfig = [
  { value: 0, label: "My profile", component: UserInformation },
  { value: 1, label: "Password", component: ChangePassword },
  { value: 2, label: "Appearance", component: Appearance },
  { value: 3, label: "Danger zone", component: DeleteAccount },
]

export const Route = createFileRoute("/_layout/settings")({
  component: UserSettings,
})

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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  }
}

function UserSettings() {
  const { user: currentUser } = useAuth()
  const [tabValue, setTabValue] = useState(0)

  // Filter tabs based on user permissions
  const finalTabs = currentUser?.is_superuser
    ? tabsConfig.slice(0, 3) // Remove danger zone for superusers
    : tabsConfig

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  if (!currentUser) {
    return null
  }

  return (
    <Container maxWidth="lg">
      <Box 
        pt={8} 
        mb={4}
        sx={{
          textAlign: { xs: 'center', md: 'left' },
          position: 'relative',
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{
            fontWeight: 700,
            color: '#1976D2',
            position: 'relative',
            display: 'inline-block',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -4,
              left: 0,
              width: '100%',
              height: 3,
              background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
              borderRadius: '2px',
              transform: 'scaleX(0)',
              transformOrigin: 'left',
              animation: 'slideIn 0.8s ease-out 0.2s forwards',
            },
            '@keyframes slideIn': {
              '0%': {
                transform: 'scaleX(0)',
              },
              '100%': {
                transform: 'scaleX(1)',
              },
            },
          }}
        >
          User Settings
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ 
            mt: 1,
            fontSize: '1.1rem',
            opacity: 0,
            animation: 'fadeIn 0.6s ease-out 0.5s forwards',
            '@keyframes fadeIn': {
              '0%': {
                opacity: 0,
                transform: 'translateY(10px)',
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)',
              },
            },
          }}
        >
          Customize your profile and preferences
        </Typography>
        
        {/* Decorative element */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(25, 118, 210, 0.05) 100%)',
            display: { xs: 'none', md: 'block' },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
              opacity: 0.8,
            },
          }}
        />
      </Box>

      <Paper 
        elevation={0} 
        sx={{ 
          overflow: 'hidden',
          borderRadius: '16px',
          backgroundColor: '#ffffff',
          border: '1px solid rgba(33, 150, 243, 0.12)',
          boxShadow: '0 4px 20px rgba(33, 150, 243, 0.08)',
        }}
      >
        <Box 
          sx={{ 
            borderBottom: '1px solid rgba(33, 150, 243, 0.12)',
            backgroundColor: 'rgba(33, 150, 243, 0.02)',
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="user settings tabs"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 56,
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '2px 2px 0 0',
                backgroundColor: '#2196F3',
                boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)',
              },
              '& .MuiTabs-scrollButtons': {
                color: '#2196F3',
                '&.Mui-disabled': {
                  opacity: 0.3,
                },
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '0.95rem',
                fontWeight: 500,
                minHeight: 56,
                minWidth: 120,
                px: 3,
                color: '#546E7A',
                transition: 'all 0.2s ease-in-out',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 2,
                  backgroundColor: '#2196F3',
                  transition: 'width 0.2s ease-in-out',
                },
                '&:hover': {
                  color: '#2196F3',
                  backgroundColor: 'rgba(33, 150, 243, 0.04)',
                  '&::after': {
                    width: '60%',
                  },
                },
                '&.Mui-selected': {
                  color: '#1976D2',
                  fontWeight: 600,
                  backgroundColor: 'rgba(33, 150, 243, 0.08)',
                  '&::after': {
                    width: '80%',
                  },
                },
              },
            }}
          >
            {finalTabs.map((tab) => (
              <Tab
                key={tab.value}
                label={tab.label}
                {...a11yProps(tab.value)}
              />
            ))}
          </Tabs>
        </Box>

        {/* Enhanced Tab Panels */}
        {finalTabs.map((tab) => (
          <TabPanel key={tab.value} value={tabValue} index={tab.value}>
            <Box
              sx={{
                p: 4,
                backgroundColor: '#ffffff',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent 0%, rgba(33, 150, 243, 0.2) 50%, transparent 100%)',
                },
                '& .MuiButton-root': {
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                  boxShadow: 'none',
                  '&.MuiButton-contained': {
                    background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                    color: '#ffffff',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
                      boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                      transform: 'translateY(-1px)',
                    },
                  },
                  '&.MuiButton-outlined': {
                    borderColor: '#2196F3',
                    color: '#2196F3',
                    '&:hover': {
                      backgroundColor: 'rgba(33, 150, 243, 0.08)',
                      borderColor: '#1976D2',
                      color: '#1976D2',
                      transform: 'translateY(-1px)',
                    },
                  },
                  '&.MuiButton-text': {
                    color: '#2196F3',
                    '&:hover': {
                      backgroundColor: 'rgba(33, 150, 243, 0.08)',
                      color: '#1976D2',
                    },
                  },
                },
                '& .MuiTextField-root': {
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#2196F3',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976D2',
                      borderWidth: '2px',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#1976D2',
                  },
                },
                '& .MuiFormControlLabel-root': {
                  '& .MuiCheckbox-root': {
                    color: '#2196F3',
                    '&.Mui-checked': {
                      color: '#1976D2',
                    },
                  },
                  '& .MuiRadio-root': {
                    color: '#2196F3',
                    '&.Mui-checked': {
                      color: '#1976D2',
                    },
                  },
                },
              }}
            >
              <tab.component />
            </Box>
          </TabPanel>
        ))}
      </Paper>
    </Container>
  )
}

export default UserSettings