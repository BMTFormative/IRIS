import React from 'react'
import { Box, Container, Typography } from '@mui/material'
import { createFileRoute } from '@tanstack/react-router'
import useAuth from '@/hooks/useAuth'

// Dashboard page using MUI
export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
})

function Dashboard() {
  const { user: currentUser } = useAuth()
  return (
    <Container maxWidth="lg">
      <Box pt={8} mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Hi, {currentUser?.full_name || currentUser?.email} 👋🏼
        </Typography>
        <Typography variant="body1">
          Welcome back, nice to see you again!
        </Typography>
      </Box>
    </Container>
  )
}

export default Dashboard