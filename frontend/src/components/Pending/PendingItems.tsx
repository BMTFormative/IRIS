// frontend/src/components/Pending/PendingItems.tsx
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TableContainer,
  Skeleton,
  Box,
} from "@mui/material"

const PendingItems = () => (
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
        {[...Array(5)].map((_, index) => (
          <TableRow 
            key={index}
            sx={{
              backgroundColor: index % 2 === 0 ? 'rgba(33, 150, 243, 0.02)' : '#ffffff',
              '&:hover': {
                backgroundColor: 'rgba(33, 150, 243, 0.08)',
              },
            }}
          >
            <TableCell sx={{ py: 2.5 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
                }}
              >
                <Skeleton 
                  variant="text" 
                  width={20} 
                  height={16}
                  sx={{ bgcolor: 'rgba(25, 118, 210, 0.2)' }}
                />
              </Box>
            </TableCell>
            <TableCell sx={{ py: 2.5 }}>
              <Skeleton 
                variant="text" 
                width={120} 
                height={20}
                sx={{ 
                  bgcolor: 'rgba(33, 150, 243, 0.1)',
                  borderRadius: '4px',
                }}
              />
            </TableCell>
            <TableCell sx={{ py: 2.5 }}>
              <Skeleton 
                variant="text" 
                width={200} 
                height={20}
                sx={{ 
                  bgcolor: 'rgba(33, 150, 243, 0.06)',
                  borderRadius: '6px',
                }}
              />
            </TableCell>
            <TableCell align="center" sx={{ py: 2.5 }}>
              <Box display="flex" justifyContent="center">
                <Skeleton 
                  variant="circular" 
                  width={32} 
                  height={32}
                  sx={{ bgcolor: 'rgba(33, 150, 243, 0.1)' }}
                />
              </Box>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
)

export default PendingItems