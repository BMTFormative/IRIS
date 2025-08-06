import { Box, Container, Paper, Typography } from "@mui/material";
import { EmailOutlined } from "@mui/icons-material";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { type SubmitHandler, useForm } from "react-hook-form";

import { type ApiError, LoginService } from "@/client";
import Button from "@mui/material/Button";
import { Field } from "@/components/ui/field-mui";
import { InputGroup } from "@/components/ui/input-group-mui";
import { isLoggedIn } from "@/hooks/useAuth";
import useCustomToast from "@/hooks/useCustomToast";
import { emailPattern, handleError } from "@/utils";

interface FormData {
  email: string;
}

export const Route = createFileRoute("/recover-password")({
  component: RecoverPassword,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      });
    }
  },
});

function RecoverPassword() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();
  const { showSuccessToast } = useCustomToast();

  const recoverPassword = async (data: FormData) => {
    await LoginService.recoverPassword({
      email: data.email,
    });
  };

  const mutation = useMutation({
    mutationFn: recoverPassword,
    onSuccess: () => {
      showSuccessToast("Password recovery email sent successfully.");
      reset();
    },
    onError: (err: ApiError) => {
      handleError(err);
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    mutation.mutate(data);
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: "100%",
          borderRadius: 2,
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {/* Title */}
          <Typography
            variant="h4"
            component="h1"
            sx={{
              textAlign: "center",
              mb: 2,
              color: "primary.main",
              fontWeight: "bold",
            }}
          >
            Password Recovery
          </Typography>

          {/* Description */}
          <Typography
            variant="body1"
            sx={{
              textAlign: "center",
              color: "text.secondary",
              mb: 2,
            }}
          >
            A password recovery email will be sent to the registered account.
          </Typography>

          {/* Email Field */}
          <Field invalid={!!errors.email} errorText={errors.email?.message}>
            <InputGroup
              id="email"
              placeholder="Email"
              type="email"
              startElement={<EmailOutlined />}
              {...register("email", {
                required: "Email is required",
                pattern: emailPattern,
              })}
            />
          </Field>

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            loading={isSubmitting}
            sx={{
              mt: 2,
              py: 1.5,
            }}
          >
            Continue
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
