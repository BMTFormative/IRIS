// frontend/src/components/Items/AddItem-mui.tsx
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
import { Add as AddIcon } from "@mui/icons-material";

import { type ItemCreate, ItemsService } from "../../client";
import type { ApiError } from "../../client/core/ApiError";
import useCustomToast from "../../hooks/useCustomToast";
import { handleError } from "../../utils";
import Button from "@mui/material/Button";
import { Field } from "../ui/field-mui";

const AddItem = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showSuccessToast } = useCustomToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ItemCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ItemCreate) =>
      ItemsService.createItem({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Item created successfully.");
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

  const onSubmit: SubmitHandler<ItemCreate> = (data) => {
    mutation.mutate(data);
  };

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        sx={{ my: 2 }}
        onClick={() => setIsOpen(true)}
      >
        Add Item
      </Button>

      {/* Dialog */}
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>Add Item</DialogTitle>

          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Fill in the details to add a new item.
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
                    required: "Title is required.",
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

            <Button
              type="submit"
              variant="contained"
              disabled={!isValid}
              loading={isSubmitting}
            >
              Save
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
};

export default AddItem;
