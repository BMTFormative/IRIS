// frontend/src/main.tsx - Update your main.tsx file
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import React, { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { routeTree } from "./routeTree.gen"

import { ApiError, OpenAPI } from "./client"
import { CustomProvider } from "./components/ui/provider"
import { muiTheme } from './theme/muiTheme'

// CRITICAL: Keep your OpenAPI configuration!
OpenAPI.BASE = import.meta.env.VITE_API_URL
OpenAPI.TOKEN = async () => {
  return localStorage.getItem("access_token") || ""
}

const handleApiError = (error: Error) => {
  if (error instanceof ApiError && [401, 403].includes(error.status)) {
    localStorage.removeItem("access_token")
    window.location.href = "/login"
  }
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleApiError,
  }),
  mutationCache: new MutationCache({
    onError: handleApiError,
  }),
})

const router = createRouter({ routeTree })

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Material UI Theme Provider */}
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline /> {/* Provides consistent CSS baseline */}
      
      {/* Keep Chakra UI Provider for existing components */}
      <CustomProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </CustomProvider>
    </MuiThemeProvider>
  </StrictMode>,
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