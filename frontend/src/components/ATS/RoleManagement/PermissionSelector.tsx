// frontend/src/components/ATS/RoleManagement/PermissionSelector.tsx
import { useState, useMemo } from "react"
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Chip,
  Typography,
  Checkbox,
  FormControlLabel,
  Paper,
  Pagination,
  Grid,
  InputAdornment,
  Divider,
} from "@mui/material"
import { Search as SearchIcon } from "@mui/icons-material"
import type { PermissionPublic } from "@/client/ats"

interface PermissionSelectorProps {
  permissions: PermissionPublic[]
  selectedPermissions: string[]
  onChange: (selectedIds: string[]) => void
  label?: string
  error?: boolean
  helperText?: string
}

const ITEMS_PER_PAGE = 5

const PermissionSelector = ({
  permissions,
  selectedPermissions,
  onChange,
  label = "Permissions",
  error = false,
  helperText,
}: PermissionSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // Filter permissions based on search term
  const filteredPermissions = useMemo(() => {
    if (!searchTerm.trim()) return permissions
    
    const lowercaseSearch = searchTerm.toLowerCase()
    return permissions.filter(
      (permission) =>
        permission.name.toLowerCase().includes(lowercaseSearch) ||
        permission.description?.toLowerCase().includes(lowercaseSearch) ||
        permission.permission_type.toLowerCase().includes(lowercaseSearch)
    )
  }, [permissions, searchTerm])

  // Paginate filtered permissions
  const paginatedPermissions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return filteredPermissions.slice(startIndex, endIndex)
  }, [filteredPermissions, currentPage])

  const totalPages = Math.ceil(filteredPermissions.length / ITEMS_PER_PAGE)

  // Reset to first page when search changes
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
    setCurrentPage(1)
  }

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page)
  }

  const handlePermissionToggle = (permissionId: string) => {
    const isSelected = selectedPermissions.includes(permissionId)
    
    if (isSelected) {
      onChange(selectedPermissions.filter(id => id !== permissionId))
    } else {
      onChange([...selectedPermissions, permissionId])
    }
  }

  const handleSelectAll = () => {
    const currentPageIds = paginatedPermissions.map(p => p.id)
    const allSelected = currentPageIds.every(id => selectedPermissions.includes(id))
    
    if (allSelected) {
      // Deselect all current page items
      onChange(selectedPermissions.filter(id => !currentPageIds.includes(id)))
    } else {
      // Select all current page items
      const newSelection = [...new Set([...selectedPermissions, ...currentPageIds])]
      onChange(newSelection)
    }
  }

  const isAllCurrentPageSelected = paginatedPermissions.length > 0 && 
    paginatedPermissions.every(p => selectedPermissions.includes(p.id))

  const isSomeCurrentPageSelected = paginatedPermissions.some(p => selectedPermissions.includes(p.id))

  return (
    <FormControl fullWidth error={error}>
      <InputLabel shrink>{label}</InputLabel>
      
      <Paper
        variant="outlined"
        sx={{
          mt: 2,
          border: error ? "1px solid #d32f2f" : "1px solid rgba(0, 0, 0, 0.23)",
          borderRadius: 1,
          "&:hover": {
            borderColor: error ? "#d32f2f" : "rgba(0, 0, 0, 0.87)",
          },
        }}
      >
        {/* Search Bar */}
        <Box sx={{ p: 2, pb: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search permissions..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "rgba(0, 0, 0, 0.02)",
              },
            }}
          />
        </Box>

        {/* Selected Permissions Display */}
        {selectedPermissions.length > 0 && (
          <Box sx={{ px: 2, pb: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
              Selected ({selectedPermissions.length}):
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, maxHeight: "60px", overflow: "auto" }}>
              {selectedPermissions.map((permissionId) => {
                const permission = permissions.find(p => p.id === permissionId)
                return (
                  <Chip
                    key={permissionId}
                    label={permission?.name || permissionId}
                    size="small"
                    onDelete={() => handlePermissionToggle(permissionId)}
                    sx={{
                      backgroundColor: "rgba(25, 118, 210, 0.1)",
                      color: "#1976D2",
                      fontSize: "0.75rem",
                    }}
                  />
                )
              })}
            </Box>
          </Box>
        )}

        <Divider />

        {/* Select All Option */}
        {paginatedPermissions.length > 0 && (
          <Box sx={{ px: 2, py: 1, backgroundColor: "rgba(0, 0, 0, 0.02)" }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isAllCurrentPageSelected}
                  indeterminate={!isAllCurrentPageSelected && isSomeCurrentPageSelected}
                  onChange={handleSelectAll}
                  size="small"
                />
              }
              label={
                <Typography variant="body2" fontWeight="medium">
                  Select All on Page ({paginatedPermissions.length})
                </Typography>
              }
            />
          </Box>
        )}

        <Divider />

        {/* Permissions List */}
        <Box sx={{ p: 2 }}>
          {paginatedPermissions.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
              {searchTerm ? "No permissions found matching your search." : "No permissions available."}
            </Typography>
          ) : (
            <Grid container spacing={1}>
              {paginatedPermissions.map((permission) => (
                <Grid size={12} key={permission.id}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedPermissions.includes(permission.id)}
                        onChange={() => handlePermissionToggle(permission.id)}
                        size="small"
                      />
                    }
                    label={
                      <Box sx={{ ml: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {permission.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {permission.description || "No description available"}
                        </Typography>
                        <Typography variant="caption" color="primary.main" sx={{ ml: 1 }}>
                          ({permission.permission_type})
                        </Typography>
                      </Box>
                    }
                    sx={{
                      width: "100%",
                      margin: 0,
                      padding: "8px 12px",
                      borderRadius: 1,
                      "&:hover": {
                        backgroundColor: "rgba(25, 118, 210, 0.04)",
                      },
                      "& .MuiFormControlLabel-label": {
                        width: "100%",
                      },
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Pagination */}
        {totalPages > 1 && (
          <>
            <Divider />
            <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                size="small"
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          </>
        )}

        {/* Info Footer */}
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Showing {paginatedPermissions.length} of {filteredPermissions.length} permissions
            {searchTerm && ` (filtered from ${permissions.length} total)`}
          </Typography>
        </Box>
      </Paper>

      {helperText && (
        <Typography
          variant="caption"
          color={error ? "error.main" : "text.secondary"}
          sx={{ mt: 0.5, ml: 1.75 }}
        >
          {helperText}
        </Typography>
      )}
    </FormControl>
  )
}

export default PermissionSelector