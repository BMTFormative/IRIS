

// frontend/src/main.tsx - Update your main.tsx file
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { CustomProvider } from './components/ui/provider' // Keep your Chakra UI provider for now

import { muiTheme } from './theme/muiTheme'
import { routeTree } from './routeTree.gen'

const queryClient = new QueryClient()

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* Material UI Theme Provider */}
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline /> {/* Provides consistent CSS baseline */}
        
        {/* Keep Chakra UI Provider for existing components */}
        <CustomProvider>
          <RouterProvider router={router} />
        </CustomProvider>
      </MuiThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)

// Alternative: If you want to test MUI-only setup
// You can temporarily remove the Chakra Provider to test pure MUI components
/*
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </MuiThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
*/