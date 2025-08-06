// frontend/src/components/Admin/DeleteUser-mui.tsx
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";

import { UsersService } from "@/client";
import type { ApiError } from "@/client/core/ApiError";
import useCustomToast from "@/hooks/useCustomToast";
import { handleError } from "@/utils";
import Button from "@mui/material/Button";

interface DeleteUserProps {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeleteUser = ({ id, open, onOpenChange }: DeleteUserProps) => {
  const queryClient = useQueryClient();
  const { showSuccessToast } = useCustomToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => UsersService.deleteUser({ userId: id }),
    onSuccess: () => {
      showSuccessToast("User deleted successfully");
      onOpenChange(false);
    },
    onError: (err: ApiError) => {
      handleError(err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsDeleting(false);
    },
  });

  const handleDelete = () => {
    setIsDeleting(true);
    deleteUserMutation.mutate(id);
  };

  return (
    <Dialog
      open={open}
      onClose={() => onOpenChange(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Delete User</DialogTitle>

      <DialogContent>
        <Typography variant="body1" gutterBottom>
          All items associated with this user will also be{" "}
          <strong>permanently deleted.</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Are you sure? You will not be able to undo this action.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => onOpenChange(false)}
          disabled={isDeleting}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          color="error"
          onClick={handleDelete}
          loading={isDeleting}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteUser;
