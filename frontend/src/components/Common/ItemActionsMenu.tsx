// frontend/src/components/Common/ItemActionsMenu.tsx
import { useState } from "react"
import { 
  IconButton, 
  Stack,
  Tooltip,
} from "@mui/material"
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon 
} from "@mui/icons-material"

import type { ItemPublic } from "@/client"
import EditItem from "@/components/Items/EditItem"
import DeleteItem from "@/components/Items/DeleteItem"

interface ItemActionsMenuProps {
  item: ItemPublic
}

export const ItemActionsMenu = ({ item }: ItemActionsMenuProps) => {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const handleEdit = () => {
    setEditOpen(true)
  }

  const handleDelete = () => {
    setDeleteOpen(true)
  }

  return (
    <>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
        {/* Edit Button */}
        <Tooltip title="Edit Item" placement="top">
          <IconButton
            color="inherit"
            onClick={handleEdit}
            size="small"
            sx={{
              color: '#1976D2',
              backgroundColor: 'rgba(33, 150, 243, 0.08)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              borderRadius: '10px',
              width: 36,
              height: 36,
              border: '1px solid rgba(33, 150, 243, 0.2)',
              '&:hover': {
                backgroundColor: '#2196F3',
                color: '#ffffff',
                transform: 'translateY(-2px) scale(1.05)',
                boxShadow: '0 8px 20px rgba(33, 150, 243, 0.4)',
                borderColor: '#2196F3',
              },
              '&:active': {
                transform: 'translateY(0) scale(0.98)',
              },
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* Delete Button */}
        <Tooltip title="Delete Item" placement="top">
          <IconButton
            color="inherit"
            onClick={handleDelete}
            size="small"
            sx={{
              color: '#d32f2f',
              backgroundColor: 'rgba(244, 67, 54, 0.08)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              borderRadius: '10px',
              width: 36,
              height: 36,
              border: '1px solid rgba(244, 67, 54, 0.2)',
              '&:hover': {
                backgroundColor: '#f44336',
                color: '#ffffff',
                transform: 'translateY(-2px) scale(1.05)',
                boxShadow: '0 8px 20px rgba(244, 67, 54, 0.4)',
                borderColor: '#f44336',
              },
              '&:active': {
                transform: 'translateY(0) scale(0.98)',
              },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Edit Dialog - Controlled externally, no trigger button */}
      <EditItem 
        item={item} 
        open={editOpen}
        onOpenChange={setEditOpen}
        hideButton={true}
      />
      
      {/* Delete Dialog */}
      <DeleteItem 
        id={item.id} 
        open={deleteOpen} 
        onOpenChange={setDeleteOpen} 
      />
    </>
  )
}