// frontend/src/routes/_layout-mui/admin.tsx
import { createFileRoute } from "@tanstack/react-router"
import { Admin, usersSearchSchema } from "../_layout/admin"

// MUI-based admin page route, reusing the existing Admin component logic
export const Route = createFileRoute("/_layout-mui/admin")({
  component: Admin,
  validateSearch: (search) => usersSearchSchema.parse(search),
})