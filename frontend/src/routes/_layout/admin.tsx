// frontend/src/routes/_layout-mui/admin.tsx
import {
  Container,
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TableContainer,
  Chip,
  Alert,
  CircularProgress,
  Pagination,
} from "@mui/material"
import { MoreVert as MoreVertIcon, Person as PersonIcon } from "@mui/icons-material"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { z } from "zod"

import { type UserPublic, UsersService } from "@/client"
import AddUser from "@/components/Admin/AddUser-mui"
import { UserActionsMenu } from "@/components/Common/UserActionsMenu-mui"

const usersSearchSchema = z.object({
  page: z.number().catch(1),
})

const PER_PAGE = 5

function getUsersQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      UsersService.readUsers({ skip: (page - 1) * PER_PAGE, limit: PER_PAGE }),
    queryKey: ["users", { page }],
  }
}

export const Route = createFileRoute("/_layout/admin")({
  component: Admin,
  validateSearch: (search) => usersSearchSchema.parse(search),
})

function UsersTable() {
  const queryClient = useQueryClient()
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"])
  const navigate = useNavigate({ from: Route.fullPath })
  const { page } = Route.useSearch()

  const { data, isLoading, isPlaceholderData, error } = useQuery({
    ...getUsersQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  })

  const setPage = (page: number) =>
    navigate({
      search: (prev: { [key: string]: string }) => ({ ...prev, page }),
    })

  const users = data?.data.slice(0, PER_PAGE) ?? []
  const count = data?.count ?? 0

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Failed to load users. Please try again.
      </Alert>
    )
  }

  if (users.length === 0) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="300px"
        textAlign="center"
      >
        <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No users found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add a new user to get started
        </Typography>
      </Box>
    )
  }

  return (
    <>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Full Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users?.map((user) => (
              <TableRow 
                key={user.id} 
                sx={{ 
                  opacity: isPlaceholderData ? 0.5 : 1,
                  '&:last-child td, &:last-child th': { border: 0 }
                }}
              >
                <TableCell component="th" scope="row">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography 
                      variant="body2" 
                      color={!user.full_name ? "text.secondary" : "text.primary"}
                    >
                      {user.full_name || "N/A"}
                    </Typography>
                    {currentUser?.id === user.id && (
                      <Chip 
                        label="You" 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell 
                  sx={{ 
                    maxWidth: 250, 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {user.email}
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.is_superuser ? "Superuser" : "User"}
                    size="small"
                    color={user.is_superuser ? "secondary" : "default"}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.is_active ? "Active" : "Inactive"}
                    size="small"
                    color={user.is_active ? "success" : "error"}
                    variant={user.is_active ? "filled" : "outlined"}
                  />
                </TableCell>
                <TableCell align="center">
                  <UserActionsMenu
                    user={user}
                    disabled={currentUser?.id === user.id}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box display="flex" justifyContent="flex-end" mt={4}>
        <Pagination
          count={Math.ceil(count / PER_PAGE)}
          page={page}
          onChange={(event, value) => setPage(value)}
          color="primary"
          showFirstButton
          showLastButton
          siblingCount={1}
          boundaryCount={1}
        />
      </Box>
    </>
  )
}

function Admin() {
  return (
    <Container maxWidth="lg">
      <Box pt={8} mb={4}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{
            fontWeight: 700,
            color: '#1976D2',
            position: 'relative',
            display: 'inline-block',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -4,
              left: 0,
              width: '100%',
              height: 3,
              background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
              borderRadius: '2px',
              transform: 'scaleX(0)',
              transformOrigin: 'left',
              animation: 'slideIn 0.8s ease-out 0.2s forwards',
            },
            '@keyframes slideIn': {
              '0%': {
                transform: 'scaleX(0)',
              },
              '100%': {
                transform: 'scaleX(1)',
              },
            },
          }}
        >
          Users Management
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ 
            mt: 1,
            fontSize: '1.1rem',
            opacity: 0,
            animation: 'fadeIn 0.6s ease-out 0.5s forwards',
            '@keyframes fadeIn': {
              '0%': {
                opacity: 0,
                transform: 'translateY(10px)',
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)',
              },
            },
          }}
        >
          Customize profiles
        </Typography>
      </Box>
      
      {/* Add User Button */}
      <AddUser />
      
      {/* Users Table */}
      <UsersTable />
    </Container>
  )
}

export default Admin