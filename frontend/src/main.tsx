// frontend/src/main.tsx - Updated with Dynamic Theme Provider
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import React, { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { routeTree } from "./routeTree.gen"

import { ApiError, OpenAPI } from "./client"
import { CustomProvider } from "./components/ui/provider"
import DynamicMuiThemeProvider from "./components/ui/DynamicMuiThemeProvider"

// Dark mode is handled via MUI CssBaseline and GlobalStyles
// Removed manual dark-mode.css in favor of MUI theming

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
    {/* Chakra UI Provider with next-themes ColorModeProvider */}
    <CustomProvider>
      {/* Dynamic Material UI Theme Provider that responds to next-themes */}
      <DynamicMuiThemeProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </DynamicMuiThemeProvider>
    </CustomProvider>
  </StrictMode>,
)