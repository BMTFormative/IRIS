// frontend/src/components/Items/EditItem-mui.tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useState } from "react";
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

import { type ApiError, type ItemPublic, ItemsService } from "../../client";
import useCustomToast from "../../hooks/useCustomToast";
import { handleError } from "../../utils";
import Button from "@mui/material/Button";
import { Field } from "../ui/field-mui";

interface EditItemProps {
  item: ItemPublic;
}

interface ItemUpdateForm {
  title: string;
  description?: string;
}

const EditItem = ({ item }: EditItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showSuccessToast } = useCustomToast();
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

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="text"
        startIcon={<EditIcon />}
        color="inherit"
        size="small"
        onClick={() => setIsOpen(true)}
      >
        Edit Item
      </Button>

      {/* Dialog */}
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>Edit Item</DialogTitle>

          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
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
                />
              </Field>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button type="submit" variant="contained" loading={isSubmitting}>
              Save
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
};

export default EditItem;
