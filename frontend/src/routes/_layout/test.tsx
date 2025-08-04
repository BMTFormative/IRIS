// frontend/src/routes/_layout/test.tsx
import { Box, Typography } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/test")({
  component: Test,
});

export function Test() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Material UI Layout Test
      </Typography>
      <Typography>
        This page uses the new Material UI layout components!
      </Typography>
    </Box>
  );
}
