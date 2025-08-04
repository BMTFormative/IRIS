// frontend/src/routes/_layout/items.tsx
import React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Container, Box, Typography } from "@mui/material"

// Simple Items Management page under MUI layout
export const Route = createFileRoute("/_layout/items")({
  component: Items,
})

export function Items() {
  return (
    <Container maxWidth="lg">
      <Box pt={8} mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Items Management
        </Typography>
      </Box>
      <Typography variant="body1">
        Items list coming soon!
      </Typography>
    </Container>
  )
}

export default Items