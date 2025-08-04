// frontend/src/routes/_layout-mui/items.tsx
import { createFileRoute } from "@tanstack/react-router"
import { Items, itemsSearchSchema } from "../_layout/items"

// MUI-based items page route, reusing the existing Items component logic
export const Route = createFileRoute("/_layout-mui/items")({
  component: Items,
  validateSearch: (search) => itemsSearchSchema.parse(search),
})