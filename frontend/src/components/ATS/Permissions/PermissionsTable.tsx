// frontend/src/components/ATS/Permissions/PermissionsTable.tsx
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
} from "@mui/material"
import { VpnKey as VpnKeyIcon } from "@mui/icons-material"

import { ATSService } from "@/client/ats"

const PermissionsTable = () => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const {
    data: permissionsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["permissions", page, rowsPerPage],
    queryFn: () =>
      ATSService.getPermissions({
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
        Failed to load permissions. Please try again.
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
                  <VpnKeyIcon fontSize="small" />
                  Permission Name
                </Box>
              </TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
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
                      <Skeleton variant="rectangular" height={24} width="70%" />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="rectangular" height={24} width="60%" />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width="50%" />
                    </TableCell>
                  </TableRow>
                ))
              : permissionsData?.data.map((permission, index) => (
                  <TableRow
                    key={permission.id}
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
                        {permission.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {permission.description || "No description"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={permission.permission_type}
                        size="small"
                        sx={{
                          backgroundColor: "rgba(25, 118, 210, 0.1)",
                          color: "#1976D2",
                          fontSize: "0.75rem",
                          fontFamily: "monospace",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={permission.is_active ? "Active" : "Inactive"}
                        size="small"
                        color={permission.is_active ? "success" : "default"}
                        variant={permission.is_active ? "filled" : "outlined"}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(permission.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={permissionsData?.count || 0}
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

export default PermissionsTable