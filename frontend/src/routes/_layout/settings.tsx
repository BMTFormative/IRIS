// frontend/src/routes/_layout/settings.tsx
import React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Container, Box, Typography } from "@mui/material"
import useAuth from "@/hooks/useAuth"

// User Settings page under MUI layout
export const Route = createFileRoute("/_layout/settings")({
  component: UserSettings,
})

export function UserSettings() {
  const { user } = useAuth()
  return (
    <Container maxWidth="lg">
      <Box pt={8} mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Settings
        </Typography>
        <Typography variant="body1" paragraph>
          Manage your account details here.
        </Typography>
        <Typography variant="body2">
          Email: {user?.email}
        </Typography>
        <Typography variant="body2">
          Full Name: {user?.full_name}
        </Typography>
      </Box>
    </Container>
  )
}

export default UserSettings