// frontend/src/modules/core-data/components/DataTable.tsx
import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Toolbar,
  Tooltip,
  Checkbox,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { visuallyHidden } from '@mui/utils';

export interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any, row: any) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
}

export interface Action {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: any) => void;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  show?: (row: any) => boolean;
}

interface DataTableProps {
  title: string;
  columns: Column[];
  data: any[];
  actions?: Action[];
  loading?: boolean;
  error?: string;
  page?: number;
  rowsPerPage?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onSearch?: (searchTerm: string) => void;
  selectable?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
  bulkActions?: Action[];
}

const DataTable: React.FC<DataTableProps> = ({
  title,
  columns,
  data,
  actions = [],
  loading = false,
  error,
  page = 0,
  rowsPerPage = 25,
  total,
  onPageChange,
  onRowsPerPageChange,
  onSort,
  onSearch,
  selectable = false,
  onSelectionChange,
  bulkActions = []
}) => {
  const [orderBy, setOrderBy] = useState<string>('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [actionMenuRow, setActionMenuRow] = useState<any>(null);

  const handleSort = (columnId: string) => {
    const isAsc = orderBy === columnId && order === 'asc';
    const newOrder = isAsc ? 'desc' : 'asc';
    setOrder(newOrder);
    setOrderBy(columnId);
    onSort?.(columnId, newOrder);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    onSearch?.(value);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = data.map(row => row.id);
      setSelected(newSelected);
      onSelectionChange?.(newSelected);
    } else {
      setSelected([]);
      onSelectionChange?.([]);
    }
  };

  const handleRowSelect = (id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
    onSelectionChange?.(newSelected);
  };

  const handleActionMenuOpen = (event: React.MouseEvent<HTMLElement>, row: any) => {
    setActionMenuAnchor(event.currentTarget);
    setActionMenuRow(row);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setActionMenuRow(null);
  };

  const numSelected = selected.length;
  const rowCount = data.length;

  const formatCellValue = (value: any, column: Column, row: any) => {
    if (column.format) {
      return column.format(value, row);
    }

    if (Array.isArray(value)) {
      return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {value.slice(0, 3).map((item, index) => (
            <Chip key={index} label={item} size="small" variant="outlined" />
          ))}
          {value.length > 3 && (
            <Chip label={`+${value.length - 3}`} size="small" variant="outlined" />
          )}
        </Box>
      );
    }

    if (typeof value === 'boolean') {
      return (
        <Chip
          label={value ? 'Yes' : 'No'}
          color={value ? 'success' : 'default'}
          size="small"
        />
      );
    }

    if (value === null || value === undefined) {
      return <Typography variant="body2" color="textSecondary">—</Typography>;
    }

    return value;
  };

  if (error) {
    return (
      <Paper sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Toolbar */}
      <Toolbar
        sx={{
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
          ...(numSelected > 0 && {
            bgcolor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.primary.main + '20'
                : theme.palette.primary.dark + '20',
          }),
        }}
      >
        {numSelected > 0 ? (
          <Typography
            sx={{ flex: '1 1 100%' }}
            color="inherit"
            variant="subtitle1"
            component="div"
          >
            {numSelected} selected
          </Typography>
        ) : (
          <Typography
            sx={{ flex: '1 1 100%' }}
            variant="h6"
            id="tableTitle"
            component="div"
          >
            {title}
          </Typography>
        )}

        {numSelected > 0 ? (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {bulkActions.map((action, index) => (
              <Tooltip key={index} title={action.label}>
                <IconButton
                  onClick={() => action.onClick(selected)}
                  color={action.color || 'primary'}
                >
                  {action.icon}
                </IconButton>
              </Tooltip>
            ))}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 200 }}
            />
            <Tooltip title="Filter list">
              <IconButton>
                <FilterIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Toolbar>

      {/* Table */}
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-labelledby="tableTitle">
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={numSelected > 0 && numSelected < rowCount}
                    checked={rowCount > 0 && numSelected === rowCount}
                    onChange={handleSelectAllClick}
                    inputProps={{
                      'aria-label': 'select all',
                    }}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                  sortDirection={orderBy === column.id ? order : false}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                      {orderBy === column.id ? (
                        <Box component="span" sx={visuallyHidden}>
                          {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                        </Box>
                      ) : null}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              {actions.length > 0 && (
                <TableCell align="right" style={{ minWidth: 100 }}>
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions.length > 0 ? 1 : 0) + (selectable ? 1 : 0)}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <Typography>Loading...</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions.length > 0 ? 1 : 0) + (selectable ? 1 : 0)}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <Typography color="textSecondary">No data available</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => {
                const isItemSelected = selected.indexOf(row.id) !== -1;
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                    sx={{ cursor: selectable ? 'pointer' : 'default' }}
                  >
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          onChange={() => handleRowSelect(row.id)}
                          inputProps={{
                            'aria-labelledby': labelId,
                          }}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {formatCellValue(value, column, row)}
                        </TableCell>
                      );
                    })}
                    {actions.length > 0 && (
                      <TableCell align="right">
                        {actions.length === 1 ? (
                          <Tooltip title={actions[0].label}>
                            <IconButton
                              size="small"
                              onClick={() => actions[0].onClick(row)}
                              color={actions[0].color || 'primary'}
                            >
                              {actions[0].icon || <EditIcon />}
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <IconButton
                            size="small"
                            onClick={(event) => handleActionMenuOpen(event, row)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {(total || data.length > 0) && (
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={total || data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => onPageChange?.(newPage)}
          onRowsPerPageChange={(event) => onRowsPerPageChange?.(parseInt(event.target.value, 10))}
        />
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
      >
        {actions
          .filter(action => !action.show || action.show(actionMenuRow))
          .map((action, index) => (
            <MenuItem
              key={index}
              onClick={() => {
                action.onClick(actionMenuRow);
                handleActionMenuClose();
              }}
            >
              {action.icon && (
                <Box sx={{ mr: 1, display: 'flex' }}>
                  {action.icon}
                </Box>
              )}
              {action.label}
            </MenuItem>
          ))}
      </Menu>
    </Paper>
  );
};

export default DataTable;