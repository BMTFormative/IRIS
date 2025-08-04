// frontend/src/routes/_layout-mui/settings.tsx
import { createFileRoute } from "@tanstack/react-router"
import { UserSettings } from "../_layout/settings"

// MUI-based user settings page route, reusing the existing UserSettings component logic
export const Route = createFileRoute("/_layout-mui/settings")({
  component: UserSettings,
})