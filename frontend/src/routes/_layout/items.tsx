// frontend/src/routes/_layout/items.tsx
import { createFileRoute } from "@tanstack/react-router"
import { Container, Box, Typography } from "@mui/material"
import AddItem from "@/components/Items/AddItem"  // ← This import!

export const Route = createFileRoute("/_layout/items")({
  component: Items,
})

function Items() {
  return (
    <Container maxWidth="lg">
      <Box pt={8} mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Items Management
        </Typography>
      </Box>
      
      {/* 🎯 THIS IS THE KEY LINE - Add Item Button */}
      <AddItem />
      
    </Container>
  )
}

export default Items