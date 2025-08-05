import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/old_item')({
  component: () => <div>Hello /_layout/old_item!</div>
})