// frontend/src/routes/_layout/items.tsx
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
  IconButton,
  Stack,
  Alert,
  CircularProgress,
} from "@mui/material"
import { Search as SearchIcon } from "@mui/icons-material"
import { alpha } from "@mui/material/styles"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { z } from "zod"

import { ItemsService } from "@/client"
import { ItemActionsMenu } from "@/components/Common/ItemActionsMenu"
import AddItem from "@/components/Items/AddItem"

const itemsSearchSchema = z.object({
  page: z.number().catch(1),
})

const PER_PAGE = 5

function getItemsQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      ItemsService.readItems({ skip: (page - 1) * PER_PAGE, limit: PER_PAGE }),
    queryKey: ["items", { page }],
  }
}

export const Route = createFileRoute("/_layout/items")({
  component: Items,
  validateSearch: (search) => itemsSearchSchema.parse(search),
})

function ItemsTable() {
  const navigate = useNavigate({ from: Route.fullPath })
  const { page } = Route.useSearch()

  const { data, isLoading, isPlaceholderData, error } = useQuery({
    ...getItemsQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  })

  const setPage = (page: number) =>
    navigate({
      search: (prev: { [key: string]: string }) => ({ ...prev, page }),
    })

  const items = data?.data.slice(0, PER_PAGE) ?? []
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
        Failed to load items. Please try again.
      </Alert>
    )
  }

  if (items.length === 0) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="400px"
        textAlign="center"
        sx={(theme) => ({
          backgroundColor: theme.palette.background.paper,
          borderRadius: '20px',
          border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
          mt: 3,
          p: 4,
        })}
      >
        <Box
          sx={(theme) => ({
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: theme.palette.mode === 'light'
              ? 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)'
              : undefined,
            backgroundColor: theme.palette.mode === 'dark'
              ? alpha(theme.palette.primary.main, 0.2)
              : undefined,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
          })}
        >
          <SearchIcon sx={{ fontSize: 40, color: '#1976D2' }} />
        </Box>
        <Typography 
          variant="h5" 
          sx={{ 
            color: '#1976D2',
            fontWeight: 600,
            mb: 1,
          }}
        >
          No Items Found
        </Typography>
        <Typography
          variant="body1"
          sx={(theme) => ({
            color: theme.palette.text.secondary,
            mb: 3,
            maxWidth: '300px',
          })}
        >
          You don't have any items yet. Create your first item to get started!
        </Typography>
        <Box
          sx={{
            width: '100%',
            height: '2px',
            background: 'linear-gradient(90deg, transparent 0%, #2196F3 50%, transparent 100%)',
            opacity: 0.3,
          }}
        />
      </Box>
    )
  }

  return (
    <>
      <TableContainer 
        component={Paper} 
        sx={{ 
          mt: 3,
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(33, 150, 243, 0.12)',
          border: '1px solid rgba(33, 150, 243, 0.08)',
        }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow
              sx={{
                background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                '& .MuiTableCell-head': {
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  border: 'none',
                  py: 2.5,
                },
              }}
            >
              <TableCell>ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items?.map((item, index) => (
              <TableRow
                key={item.id}
                sx={(theme) => {
                  const isDark = theme.palette.mode === 'dark';
                  return {
                    opacity: isPlaceholderData ? 0.5 : 1,
                    backgroundColor: index % 2 === 0
                      ? alpha(theme.palette.primary.main, isDark ? 0.08 : 0.02)
                      : theme.palette.background.paper,
                    transition: theme.transitions.create(
                      ['background-color', 'transform', 'box-shadow'], {
                        duration: theme.transitions.duration.standard,
                      }
                    ),
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                      transform: 'translateY(-1px)',
                      boxShadow: `0 4px 12px ${alpha(
                        theme.palette.primary.main,
                        0.15
                      )}`,
                    },
                    '&:last-child td': { border: 0 },
                  };
                }}
              >
                <TableCell 
                  component="th" 
                  scope="row"
                  sx={{ 
                    borderLeft: '3px solid transparent',
                    '&:hover': {
                      borderLeft: '3px solid #2196F3',
                    }
                  }}
                >
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
                      color: '#1976D2',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    {item.id}
                  </Box>
                </TableCell>
                <TableCell 
                  sx={{ 
                    maxWidth: 200, 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    py: 2,
                  }}
                >
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 500,
                      color: '#1976D2',
                      '&:hover': {
                        color: '#2196F3',
                      }
                    }}
                  >
                    {item.title}
                  </Typography>
                </TableCell>
                <TableCell 
                  sx={{ 
                    maxWidth: 300, 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    py: 2,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={(theme) => ({
                      color: theme.palette.text.secondary,
                      fontStyle: !item.description ? 'italic' : 'normal',
                      backgroundColor: !item.description
                        ? 'transparent'
                        : theme.palette.action.selected,
                      padding: !item.description ? 0 : theme.spacing(0.5, 1),
                      borderRadius: '6px',
                      display: 'inline-block',
                    })}
                  >
                    {item.description || "No description"}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <ItemActionsMenu item={item} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modern Pagination */}
      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        mt={4}
        sx={(theme) => ({
          backgroundColor: theme.palette.background.paper,
          borderRadius: '12px',
          p: 2,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
        })}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            size="small"
            sx={{
              backgroundColor: 'rgba(33, 150, 243, 0.08)',
              color: '#1976D2',
              '&:hover': {
                backgroundColor: '#2196F3',
                color: '#ffffff',
                transform: 'scale(1.05)',
              },
              '&:disabled': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                color: 'rgba(0, 0, 0, 0.26)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            ←
          </IconButton>
          
          {/* Page numbers with modern styling */}
          {Array.from({ length: Math.ceil(count / PER_PAGE) }, (_, i) => i + 1)
            .filter(pageNum => 
              pageNum === 1 || 
              pageNum === Math.ceil(count / PER_PAGE) || 
              Math.abs(pageNum - page) <= 1
            )
            .map((pageNum, index, arr) => (
              <Box key={pageNum} display="flex" alignItems="center">
                {index > 0 && arr[index - 1] !== pageNum - 1 && (
                  <Typography variant="body2" sx={{ mx: 1, color: '#1976D2' }}>...</Typography>
                )}
                <Chip
                  label={pageNum}
                  variant={pageNum === page ? "filled" : "outlined"}
                  color={pageNum === page ? "primary" : "default"}
                  size="small"
                  onClick={() => setPage(pageNum)}
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: pageNum === page 
                        ? '0 6px 16px rgba(33, 150, 243, 0.4)'
                        : '0 4px 12px rgba(33, 150, 243, 0.2)',
                    },
                    ...(pageNum === page && {
                      background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                      boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                    }),
                  }}
                />
              </Box>
            ))}
          
          <IconButton
            onClick={() => setPage(page + 1)}
            disabled={page >= Math.ceil(count / PER_PAGE)}
            size="small"
            sx={{
              backgroundColor: 'rgba(33, 150, 243, 0.08)',
              color: '#1976D2',
              '&:hover': {
                backgroundColor: '#2196F3',
                color: '#ffffff',
                transform: 'scale(1.05)',
              },
              '&:disabled': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                color: 'rgba(0, 0, 0, 0.26)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            →
          </IconButton>
        </Stack>
      </Box>
    </>
  )
}

function Items() {
  return (
    <Container maxWidth="lg">
      <Box 
        pt={8} 
        mb={4}
        sx={{
          textAlign: { xs: 'center', md: 'left' },
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{
            background: 'linear-gradient(135deg, #1976D2 0%, #2196F3 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: { xs: '50%', md: 0 },
              transform: { xs: 'translateX(-50%)', md: 'none' },
              width: 60,
              height: 4,
              background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
              borderRadius: '2px',
            }
          }}
        >
          Items Management
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          Manage your items with powerful tools and modern interface
        </Typography>
      </Box>
      
      {/* Add Item Button */}
      <AddItem />
      
      {/* Items Table */}
      <ItemsTable />
    </Container>
  )
}

export default Items