// frontend/src/routes/_layout-mui/test.tsx
import { Box, Typography } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout-mui/test")({
  component: Test,
});

function Test() {
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
