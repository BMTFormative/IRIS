// frontend/src/components/Items/EditItem.tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  Box,
  Typography,
  TextField,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";

import { type ApiError, type ItemPublic, ItemsService } from "@/client";
import useCustomToast from "@/hooks/useCustomToast";
import { handleError } from "@/utils";
import Button from "@mui/material/Button";
import { Field } from "../ui/field-mui";

interface EditItemProps {
  item: ItemPublic;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideButton?: boolean;
}

interface ItemUpdateForm {
  title: string;
  description?: string;
}

export interface EditItemRef {
  openDialog: () => void;
}

const EditItem = forwardRef<EditItemRef, EditItemProps>(({ 
  item, 
  open: externalOpen, 
  onOpenChange, 
  hideButton = false 
}, ref) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showSuccessToast } = useCustomToast();

  // Use external state if provided, otherwise use internal state
  const isControlled = externalOpen !== undefined && onOpenChange !== undefined;
  const isOpen = isControlled ? externalOpen : internalOpen;
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ItemUpdateForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      ...item,
      description: item.description ?? undefined,
    },
  });

  // Expose openDialog method via ref
  useImperativeHandle(ref, () => ({
    openDialog: () => setIsOpen(true),
  }));

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      reset({
        ...item,
        description: item.description ?? undefined,
      });
    }
  }, [isOpen, item, reset]);

  const mutation = useMutation({
    mutationFn: (data: ItemUpdateForm) =>
      ItemsService.updateItem({ id: item.id, requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Item updated successfully.");
      reset();
      setIsOpen(false);
    },
    onError: (err: ApiError) => {
      handleError(err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });

  const onSubmit: SubmitHandler<ItemUpdateForm> = async (data) => {
    mutation.mutate(data);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger Button - Only show if not hidden */}
      {!hideButton && (
        <Button
          variant="text"
          startIcon={<EditIcon />}
          color="inherit"
          size="small"
          onClick={() => setIsOpen(true)}
          sx={{
            textTransform: 'none',
            color: '#1976D2',
            '&:hover': {
              backgroundColor: 'rgba(33, 150, 243, 0.08)',
            },
          }}
        >
          Edit Item
        </Button>
      )}

      {/* Dialog */}
      <Dialog
        open={isOpen}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 24px 56px rgba(33, 150, 243, 0.15)',
          }
        }}
      >
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle
            sx={{
              background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.08) 0%, rgba(25, 118, 210, 0.08) 100%)',
              borderBottom: '1px solid rgba(33, 150, 243, 0.1)',
              color: '#1976D2',
              fontWeight: 600,
            }}
          >
            Edit Item
          </DialogTitle>

          <DialogContent sx={{ pt: 3 }}>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ mb: 3, fontStyle: 'italic' }}
            >
              Update the item details below.
            </Typography>

            <Stack spacing={3}>
              {/* Title Field */}
              <Field invalid={!!errors.title} errorText={errors.title?.message}>
                <TextField
                  id="title"
                  label="Title"
                  placeholder="Enter item title"
                  variant="outlined"
                  fullWidth
                  required
                  {...register("title", {
                    required: "Title is required",
                  })}
                  error={!!errors.title}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#2196F3',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976D2',
                        borderWidth: '2px',
                      },
                    },
                  }}
                />
              </Field>

              {/* Description Field */}
              <Field
                invalid={!!errors.description}
                errorText={errors.description?.message}
              >
                <TextField
                  id="description"
                  label="Description"
                  placeholder="Enter item description"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={3}
                  {...register("description")}
                  error={!!errors.description}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#2196F3',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976D2',
                        borderWidth: '2px',
                      },
                    },
                  }}
                />
              </Field>
            </Stack>
          </DialogContent>

          <DialogActions 
            sx={{ 
              p: 3, 
              gap: 2, 
              background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.02) 0%, rgba(25, 118, 210, 0.02) 100%)',
              borderTop: '1px solid rgba(33, 150, 243, 0.08)',
            }}
          >
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleClose}
              disabled={isSubmitting}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                borderColor: 'rgba(0, 0, 0, 0.23)',
                '&:hover': {
                  borderColor: '#1976D2',
                  backgroundColor: 'rgba(33, 150, 243, 0.04)',
                },
              }}
            >
              Cancel
            </Button>

            <Button 
              type="submit" 
              variant="contained" 
              disabled={isSubmitting}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
                  boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
                },
                '&:disabled': {
                  background: 'rgba(0, 0, 0, 0.12)',
                  boxShadow: 'none',
                },
              }}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
});

EditItem.displayName = 'EditItem';

export default EditItem;