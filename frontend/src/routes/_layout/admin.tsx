// frontend/src/routes/_layout/admin.tsx
import React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Container, Box, Typography } from "@mui/material"

// Simple Users Management page under MUI layout
export const Route = createFileRoute("/_layout/admin")({
  component: AdminPage,
})

export function AdminPage() {
  return (
    <Container maxWidth="lg">
      <Box pt={8} mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Users Management
        </Typography>
      </Box>
      <Typography variant="body1">
        User administration coming soon!
      </Typography>
    </Container>
  )
}

export default AdminPage