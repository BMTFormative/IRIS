// frontend/src/components/Common/UserActionsMenu-mui.tsx
import { useState } from "react"
import { 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText 
} from "@mui/material"
import { 
  MoreVert as MoreVertIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon 
} from "@mui/icons-material"

import type { UserPublic } from "@/client"
import EditUser from "../Admin/EditUser"
import DeleteUser from "../Admin/DeleteUser"

interface UserActionsMenuProps {
  user: UserPublic
  disabled?: boolean
}

export const UserActionsMenu = ({ user, disabled = false }: UserActionsMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (disabled) return
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleEdit = () => {
    // EditUser component manages its own dialog state
    handleClose()
  }

  const handleDelete = () => {
    setDeleteOpen(true)
    handleClose()
  }

  return (
    <>
      <IconButton
        aria-label="more"
        id="user-actions-button"
        aria-controls={open ? 'user-actions-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        size="small"
        disabled={disabled}
        sx={{ 
          opacity: disabled ? 0.3 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
      >
        <MoreVertIcon />
      </IconButton>
      
      <Menu
        id="user-actions-menu"
        MenuListProps={{
          'aria-labelledby': 'user-actions-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            minWidth: '120px',
          },
        }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Edit Dialog - Uses existing MUI component API */}
      {/* <EditUser user={user} /> */}
      
      {/* Delete Dialog */}
      <DeleteUser 
        id={user.id} 
        open={deleteOpen} 
        onOpenChange={setDeleteOpen} 
      />
    </>
  )
}