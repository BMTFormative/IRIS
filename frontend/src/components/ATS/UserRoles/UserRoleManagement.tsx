// frontend/src/components/ATS/UserRoles/UserRoleManagement.tsx
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
  TablePagination,
  Skeleton,
  Alert,
  Avatar,
} from "@mui/material"
import { ManageAccounts as ManageAccountsIcon } from "@mui/icons-material"

import { ATSService } from "@/client/ats"

const UserRoleManagement = () => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const {
    data: usersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users-with-roles", page, rowsPerPage],
    queryFn: () =>
      ATSService.getUsersWithRoles({
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
        Failed to load users. Please try again.
      </Alert>
    )
  }

  return (
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
                  <ManageAccountsIcon fontSize="small" />
                  User
                </Box>
              </TableCell>
              <TableCell>Primary Role</TableCell>
              <TableCell>All Roles</TableCell>
              <TableCell>Permissions Count</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? Array.from({ length: rowsPerPage }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Skeleton variant="circular" width={40} height={40} />
                        <Box>
                          <Skeleton variant="text" width={120} />
                          <Skeleton variant="text" width={180} />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="rectangular" height={24} width="70%" />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="rectangular" height={24} width="90%" />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width="50%" />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="rectangular" height={24} width="60%" />
                    </TableCell>
                  </TableRow>
                ))
              : usersData?.data.map((user, index) => (
                  <TableRow
                    key={user.id}
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
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                          sx={{
                            bgcolor: "#1976D2",
                            width: 40,
                            height: 40,
                            fontSize: "0.875rem",
                          }}
                        >
                          {user.full_name
                            ? user.full_name
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase()
                            : user.email[0].toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {user.full_name || "No name"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {user.primary_role ? (
                        <Chip
                          label={user.primary_role}
                          size="small"
                          sx={{
                            backgroundColor: "rgba(25, 118, 210, 0.1)",
                            color: "#1976D2",
                            fontWeight: "medium",
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No primary role
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {user.roles.slice(0, 2).map((role) => (
                          <Chip
                            key={role.id}
                            label={role.name}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: "0.75rem" }}
                          />
                        ))}
                        {user.roles.length > 2 && (
                          <Chip
                            label={`+${user.roles.length - 2} more`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: "0.75rem", color: "text.secondary" }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.permissions.length} permissions
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.is_active ? "Active" : "Inactive"}
                        size="small"
                        color={user.is_active ? "success" : "default"}
                        variant={user.is_active ? "filled" : "outlined"}
                      />
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={usersData?.count || 0}
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
  )
}

export default UserRoleManagement