// frontend/src/components/ATS/RoleManagement/RolesTable.tsx
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  Typography,
  IconButton,
  Tooltip,
  TablePagination,
  Skeleton,
  Alert,
} from "@mui/material"
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
} from "@mui/icons-material"

import { ATSService } from "@/client/ats"
import type { RolePublic } from "@/client"
import EditRole from "./EditRole"
import DeleteRole from "./DeleteRole"

const RolesTable = () => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [editingRole, setEditingRole] = useState<RolePublic | null>(null)
  const [deletingRole, setDeletingRole] = useState<RolePublic | null>(null)

  const {
    data: rolesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["roles", page, rowsPerPage],
    queryFn: () =>
      ATSService.getRoles({
        skip: page * rowsPerPage,
        limit: rowsPerPage,
      }),
  })

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Failed to load roles. Please try again.
      </Alert>
    )
  }

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  background: "linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)",
                  "& .MuiTableCell-root": {
                    color: "white",
                    fontWeight: 600,
                    borderBottom: "none",
                  },
                }}
              >
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <SecurityIcon fontSize="small" />
                    Role Name
                  </Box>
                </TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Permissions</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading
                ? Array.from({ length: rowsPerPage }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton variant="text" width="60%" />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" width="80%" />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="rectangular" height={24} width="90%" />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" width="50%" />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="rectangular" height={32} width="100%" />
                      </TableCell>
                    </TableRow>
                  ))
                : rolesData?.data.map((role, index) => (
                    <TableRow
                      key={role.id}
                      sx={{
                        backgroundColor: index % 2 === 0 ? "rgba(25, 118, 210, 0.02)" : "white",
                        "&:hover": {
                          backgroundColor: "rgba(25, 118, 210, 0.08)",
                          transform: "scale(1.001)",
                        },
                        transition: "all 0.2s ease",
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {role.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {role.description || "No description"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" flexWrap="wrap" gap={0.5}>
                          {role.permissions?.slice(0, 3).map((permission) => (
                            <Chip
                              key={permission.id}
                              label={permission.name}
                              size="small"
                              sx={{
                                backgroundColor: "rgba(25, 118, 210, 0.1)",
                                color: "#1976D2",
                                fontSize: "0.75rem",
                              }}
                            />
                          ))}
                          {(role.permissions?.length || 0) > 3 && (
                            <Chip
                              label={`+${(role.permissions?.length || 0) - 3} more`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: "0.75rem" }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(role.created_at).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" gap={1} justifyContent="center">
                          <Tooltip title="Edit Role">
                            <IconButton
                              size="small"
                              onClick={() => setEditingRole(role)}
                              sx={{
                                color: "#1976D2",
                                "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.1)" },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Role">
                            <IconButton
                              size="small"
                              onClick={() => setDeletingRole(role)}
                              sx={{
                                color: "#d32f2f",
                                "&:hover": { backgroundColor: "rgba(211, 47, 47, 0.1)" },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={rolesData?.count || 0}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{
            borderTop: "1px solid",
            borderColor: "divider",
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
              color: "text.secondary",
            },
          }}
        />
      </Paper>

      {/* Edit Dialog */}
      {editingRole && (
        <EditRole
          role={editingRole}
          open={!!editingRole}
          onOpenChange={(open) => !open && setEditingRole(null)}
        />
      )}

      {/* Delete Dialog */}
      {deletingRole && (
        <DeleteRole
          role={deletingRole}
          open={!!deletingRole}
          onOpenChange={(open) => !open && setDeletingRole(null)}
        />
      )}
    </Box>
  )
}

export default RolesTable