import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"
import { useState } from "react"
import {
  Box,
  Typography,
  TextField,
  Stack,
} from "@mui/material"
import { Edit as EditIcon } from "@mui/icons-material"

import { type ApiError, type ItemPublic, ItemsService } from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"
import { Button } from "../ui/button-mui"
import { Field } from "../ui/field-mui"
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
} from "../ui/dialog-mui"

interface EditItemProps {
  item: ItemPublic
}

interface ItemUpdateForm {
  title: string
  description?: string
}

const EditItem = ({ item }: EditItemProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
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
  })

  const mutation = useMutation({
    mutationFn: (data: ItemUpdateForm) =>
      ItemsService.updateItem({ id: item.id, requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Item updated successfully.")
      reset()
      setIsOpen(false)
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] })
    },
  })

  const onSubmit: SubmitHandler<ItemUpdateForm> = async (data) => {
    mutation.mutate(data)
  }

  return (
    <DialogRoot
      size={{ base: "xs", md: "md" }}
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <Button
          variant="text"
          startIcon={<EditIcon />}
          color="inherit"
          size="small"
        >
          Edit Item
        </Button>
      </DialogTrigger>
      
      <DialogContent>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ width: "100%" }}
        >
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          
          <DialogBody>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ mb: 3 }}
            >
              Update the item details below.
            </Typography>
            
            <Stack spacing={3}>
              {/* Title Field */}
              <Field
                invalid={!!errors.title}
                errorText={errors.title?.message}
              >
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
              loading={isSubmitting}
            >
              Save
            </Button>
          </DialogFooter>
          
          <DialogCloseTrigger />
        </Box>
      </DialogContent>
    </DialogRoot>
  )
}

export default EditItem