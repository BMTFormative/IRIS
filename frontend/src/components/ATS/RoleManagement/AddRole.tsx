// frontend/src/components/ATS/RoleManagement/AddRole.tsx
import { useState } from "react"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Typography,
  Fab,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Autocomplete,
  Chip,
  Paper,
} from "@mui/material"
import { 
  Add as AddIcon, 
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
} from "@mui/icons-material"
import { type SubmitHandler, useForm, Controller } from "react-hook-form"

import { ATSService } from "@/client/ats"
import type { ApiError, PermissionPublic } from "@/client/core/ApiError"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import Button from "@mui/material/Button"

interface RoleCreateForm {
  name: string
  description?: string
  permission_ids: string[]
}

const AddRole = () => {
  const [open, setOpen] = useState(false)
  const [expandedPanels, setExpandedPanels] = useState<string[]>(['basic-info', 'permissions'])
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RoleCreateForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      name: "",
      description: "",
      permission_ids: [],
    },
  })

  // Fetch available permissions
  const { data: permissionsData } = useQuery({
    queryKey: ["permissions"],
    queryFn: () => ATSService.getPermissions(),
  })

  const mutation = useMutation({
    mutationFn: (data: RoleCreateForm) =>
      ATSService.createRole({
        ...data,
        permission_ids: data.permission_ids,
      }),
    onSuccess: () => {
      showSuccessToast("Role created successfully")
      reset()
      setOpen(false)
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] })
    },
  })

  const onSubmit: SubmitHandler<RoleCreateForm> = (data) => {
    mutation.mutate(data)
  }

  const handlePanelChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPanels(prev => 
      isExpanded 
        ? [...prev, panel]
        : prev.filter(p => p !== panel)
    )
  }

  const groupPermissionsByType = (permissions: PermissionPublic[]) => {
    const grouped = permissions.reduce((acc, permission) => {
      const type = permission.permission_type || 'Other'
      if (!acc[type]) acc[type] = []
      acc[type].push(permission)
      return acc
    }, {} as Record<string, PermissionPublic[]>)
    
    return grouped
  }

  const permissionGroups = permissionsData?.data ? groupPermissionsByType(permissionsData.data) : {}

  return (
    <>
      <Tooltip title="Add Role" placement="top">
        <Fab
          color="primary"
          aria-label="add role"
          onClick={() => setOpen(true)}
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            background: "linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)",
            boxShadow: "0 8px 32px rgba(25, 118, 210, 0.3)",
            "&:hover": {
              background: "linear-gradient(135deg, #1565C0 0%, #1976D2 100%)",
              transform: "scale(1.1)",
              boxShadow: "0 12px 40px rgba(25, 118, 210, 0.4)",
            },
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <AddIcon />
        </Fab>
      </Tooltip>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)",
            color: "white",
            p: 3,
            borderRadius: '8px 8px 0 0',
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <AddIcon />
            <Typography variant="h6" component="span" fontWeight={600}>
              Add New Role
            </Typography>
          </Box>
        </DialogTitle>

        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ p: 0, backgroundColor: '#fafafa' }}>
            
            {/* Basic Information Accordion */}
            <Accordion 
              expanded={expandedPanels.includes('basic-info')}
              onChange={handlePanelChange('basic-info')}
              elevation={0}
              sx={{ 
                '&:before': { display: 'none' },
                borderBottom: '1px solid #e0e0e0',
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  backgroundColor: 'white',
                  minHeight: '64px',
                  '& .MuiAccordionSummary-content': {
                    alignItems: 'center',
                  },
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <PersonIcon sx={{ color: '#1976D2' }} />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Basic Information
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Role name and description
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3, backgroundColor: 'white' }}>
                <Box display="flex" flexDirection="column" gap={3}>
                  <TextField
                    {...register("name", {
                      required: "Role name is required",
                      minLength: {
                        value: 2,
                        message: "Role name must be at least 2 characters",
                      },
                    })}
                    label="Role Name"
                    placeholder="Enter a descriptive role name"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    fullWidth
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />

                  <TextField
                    {...register("description")}
                    label="Description"
                    placeholder="Describe the role's purpose and responsibilities"
                    multiline
                    rows={3}
                    fullWidth
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Permissions Accordion */}
            <Accordion 
              expanded={expandedPanels.includes('permissions')}
              onChange={handlePanelChange('permissions')}
              elevation={0}
              sx={{ 
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  backgroundColor: 'white',
                  minHeight: '64px',
                  '& .MuiAccordionSummary-content': {
                    alignItems: 'center',
                  },
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <SecurityIcon sx={{ color: '#1976D2' }} />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Permissions
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Select permissions for this role
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3, backgroundColor: 'white' }}>
                <Controller
                  name="permission_ids"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      multiple
                      value={field.value.map(id => 
                        permissionsData?.data.find(p => p.id === id)
                      ).filter(Boolean) as PermissionPublic[]}
                      onChange={(_event, newValue) => {
                        field.onChange(newValue.map(permission => permission.id))
                      }}
                      options={permissionsData?.data || []}
                      groupBy={(option) => option.permission_type || 'Other'}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Search and select permissions"
                          placeholder="Type to search permissions..."
                          variant="outlined"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            }
                          }}
                        />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            {...getTagProps({ index })}
                            key={option.id}
                            label={option.name}
                            size="medium"
                            sx={{
                              backgroundColor: 'rgba(25, 118, 210, 0.1)',
                              color: '#1976D2',
                              fontWeight: 500,
                              '& .MuiChip-deleteIcon': {
                                color: '#1976D2',
                              },
                            }}
                          />
                        ))
                      }
                      renderOption={(props, option, { selected }) => (
                        <Box
                          component="li"
                          {...props}
                          sx={{
                            borderRadius: 1,
                            margin: '2px 8px',
                            backgroundColor: selected ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                            '&:hover': {
                              backgroundColor: 'rgba(25, 118, 210, 0.04)',
                            },
                          }}
                        >
                          <Box sx={{ width: '100%' }}>
                            <Typography variant="body2" fontWeight={selected ? 600 : 500}>
                              {option.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {option.description || "No description available"}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                      renderGroup={(params) => (
                        <Box key={params.key}>
                          <Typography
                            variant="overline"
                            sx={{
                              px: 2,
                              py: 1,
                              backgroundColor: '#f5f5f5',
                              fontWeight: 600,
                              color: '#1976D2',
                              borderBottom: '1px solid #e0e0e0',
                              display: 'block',
                            }}
                          >
                            {params.group}
                          </Typography>
                          {params.children}
                        </Box>
                      )}
                      PaperComponent={({ children, ...props }) => (
                        <Paper
                          {...props}
                          sx={{
                            borderRadius: 2,
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #e0e0e0',
                            maxHeight: '400px',
                          }}
                        >
                          {children}
                        </Paper>
                      )}
                      ChipProps={{
                        deleteIcon: <Box>×</Box>,
                      }}
                      sx={{
                        '& .MuiAutocomplete-inputRoot': {
                          minHeight: '56px',
                        },
                      }}
                    />
                  )}
                />
                
                {/* Permission Summary */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {Object.entries(permissionGroups).map(([type, permissions]) => (
                      <span key={type}>
                        <strong>{type}:</strong> {permissions.length} permissions{' '}
                      </span>
                    ))}
                  </Typography>
                </Box>
              </AccordionDetails>
            </Accordion>

          </DialogContent>

          <DialogActions 
            sx={{ 
              p: 3, 
              gap: 2, 
              backgroundColor: 'white',
              borderTop: '1px solid #e0e0e0',
            }}
          >
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 600,
              }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                background: "linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #1565C0 0%, #1976D2 100%)",
                },
                "&:disabled": {
                  background: "rgba(0, 0, 0, 0.12)",
                },
              }}
            >
              {isSubmitting ? 'Creating...' : 'Create Role'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}

export default AddRole