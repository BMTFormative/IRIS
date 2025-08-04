import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useState } from "react";
import { Box, Typography, TextField, Stack } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";

import { type ItemCreate, ItemsService } from "../../client";
import type { ApiError } from "../../client/core/ApiError";
import useCustomToast from "../../hooks/useCustomToast";
import { handleError } from "../../utils";
import { Button } from "../ui/button-mui";
import { Field } from "../ui/field-mui";
import {
  DialogRootMui as DialogRoot,
  DialogTriggerMui as DialogTrigger,
  DialogContentMui as DialogContent,
  DialogHeaderMui as DialogHeader,
  DialogTitleMui as DialogTitle,
  DialogBodyMui as DialogBody,
  DialogFooterMui as DialogFooter,
  DialogActionTriggerMui as DialogActionTrigger,
  DialogCloseTriggerMui as DialogCloseTrigger,
} from "../ui/dialog-mui";

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
    <DialogRoot
      size={{ base: "xs", md: "md" }}
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ my: 2 }}>
          Add Item
        </Button>
      </DialogTrigger>

      <DialogContent>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ width: "100%" }}
        >
          <DialogHeader>
            <DialogTitle>Add Item</DialogTitle>
          </DialogHeader>

          <DialogBody>
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
          </DialogBody>

          <DialogFooter gap={2}>
            <DialogActionTrigger asChild>
              <Button
                variant="outlined"
                color="inherit"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </DialogActionTrigger>

            <Button
              type="submit"
              variant="contained"
              disabled={!isValid}
              loading={isSubmitting}
            >
              Save
            </Button>
          </DialogFooter>

          <DialogCloseTrigger />
        </Box>
      </DialogContent>
    </DialogRoot>
  );
};

export default AddItem;
