import React from "react"
import {
  Container,
  Box,
  Typography,
  Paper,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Stack,
} from "@mui/material"
import { 
  Palette as PaletteIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  SettingsSuggest as SystemIcon
} from "@mui/icons-material"
import { useTheme } from "next-themes"

const Appearance = () => {
  const { theme, setTheme } = useTheme()

  const themeOptions = [
    {
      value: "system",
      label: "System",
      description: "Automatically match your device settings",
      icon: <SystemIcon sx={{ fontSize: '1.5rem' }} />
    },
    {
      value: "light",
      label: "Light Mode",
      description: "Clean, bright interface for day use",
      icon: <LightModeIcon sx={{ fontSize: '1.5rem' }} />
    },
    {
      value: "dark",
      label: "Dark Mode",
      description: "Easy on the eyes for low-light environments",
      icon: <DarkModeIcon sx={{ fontSize: '1.5rem' }} />
    }
  ]

  const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTheme(event.target.value)
  }

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.02) 0%, rgba(25, 118, 210, 0.08) 100%)',
          border: '1px solid rgba(25, 118, 210, 0.12)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <PaletteIcon sx={{ color: '#1976D2', fontSize: '1.5rem' }} />
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#1976D2',
              fontWeight: 600,
            }}
          >
            Appearance
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Customize how the application looks and feels. Your preference will be saved automatically.
        </Typography>

        <FormControl component="fieldset" fullWidth>
          <RadioGroup
            value={theme || "system"}
            onChange={handleThemeChange}
            sx={{ gap: 1.5 }}
          >
            {themeOptions.map((option) => (
              <Paper
                key={option.value}
                elevation={0}
                sx={{
                  p: 2,
                  border: theme === option.value 
                    ? '2px solid #1976D2' 
                    : '1px solid rgba(0, 0, 0, 0.12)',
                  borderRadius: '12px',
                  backgroundColor: theme === option.value 
                    ? 'rgba(25, 118, 210, 0.08)' 
                    : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(25, 118, 210, 0.04)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(33, 150, 243, 0.15)',
                  }
                }}
                onClick={() => setTheme(option.value)}
              >
                <FormControlLabel
                  value={option.value}
                  control={
                    <Radio
                      sx={{
                        color: '#90A4AE',
                        '&.Mui-checked': {
                          color: '#1976D2',
                        },
                        '& .MuiSvgIcon-root': {
                          fontSize: '1.2rem',
                        }
                      }}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                      <Box sx={{ color: theme === option.value ? '#1976D2' : '#90A4AE' }}>
                        {option.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: 600,
                            color: theme === option.value ? '#1976D2' : 'text.primary'
                          }}
                        >
                          {option.label}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'text.secondary',
                            mt: 0.5
                          }}
                        >
                          {option.description}
                        </Typography>
                      </Box>
                    </Box>
                  }
                  sx={{
                    m: 0,
                    width: '100%',
                    '& .MuiFormControlLabel-label': {
                      flex: 1,
                    }
                  }}
                />
              </Paper>
            ))}
          </RadioGroup>
        </FormControl>

        {/* Preview Section */}
        <Box sx={{ mt: 4, p: 3, backgroundColor: 'rgba(25, 118, 210, 0.05)', borderRadius: '12px' }}>
          <Typography variant="subtitle2" sx={{ color: '#1976D2', fontWeight: 600, mb: 2 }}>
            Current Theme: {themeOptions.find(opt => opt.value === theme)?.label || 'System'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Changes take effect immediately. The theme preference is saved to your browser 
            and will persist across sessions.
          </Typography>
        </Box>
      </Paper>
    </Container>
  )
}

export default Appearance