// frontend/src/routes/test-mui-components.tsx
import React from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Divider,
  Stack,
} from "@mui/material";
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { createFileRoute } from "@tanstack/react-router";
import { useForm, type SubmitHandler } from "react-hook-form";

// Import your new MUI components
import { Button } from "@/components/ui/button-mui";
import { Field } from "@/components/ui/field-mui";
import { InputGroup } from "@/components/ui/input-group-mui";
import { PasswordInput } from "@/components/ui/password-input-mui";

// Test form interface
interface TestFormData {
  email: string;
  fullName: string;
  password: string;
  confirmPassword: string;
}

export const Route = createFileRoute("/test-mui-components")({
  component: TestMUIComponents,
});

function TestMUIComponents() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<TestFormData>({
    mode: "onBlur",
    defaultValues: {
      email: "",
      fullName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit: SubmitHandler<TestFormData> = async (data) => {
    console.log("Form submitted:", data);
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 2000));
    alert("Form submitted successfully!");
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Material UI Components Test
        </Typography>
        
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Testing the migrated Material UI form components
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            {/* Button Variants Test */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Button Variants
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap" gap={2}>
                <Button variant="solid" size="sm">Solid Small</Button>
                <Button variant="solid" size="md">Solid Medium</Button>
                <Button variant="outline" colorPalette="gray">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="subtle" colorPalette="gray">Subtle</Button>
                <Button variant="solid" loading loadingText="Loading...">
                  Loading Button
                </Button>
              </Stack>
            </Box>

            <Divider />

            {/* Form Fields Test */}
            <Typography variant="h6">
              Form Fields
            </Typography>

            {/* Email Field with InputGroup */}
            <Field
              label="Email Address"
              required
              invalid={!!errors.email}
              errorText={errors.email?.message}
            >
              <InputGroup
                startElement={<EmailIcon />}
                placeholder="Enter your email"
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Please enter a valid email address",
                  },
                })}
              />
            </Field>

            {/* Full Name Field */}
            <Field
              label="Full Name"
              required
              invalid={!!errors.fullName}
              errorText={errors.fullName?.message}
              helperText="Enter your first and last name"
            >
              <InputGroup
                startElement={<PersonIcon />}
                placeholder="Enter your full name"
                {...register("fullName", {
                  required: "Full name is required",
                  minLength: {
                    value: 2,
                    message: "Full name must be at least 2 characters",
                  },
                })}
              />
            </Field>

            {/* Password Field */}
            <PasswordInput
              type="password"
              startElement={<LockIcon />}
              placeholder="Enter your password"
              label="Password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
              errors={errors}
            />

            {/* Confirm Password Field */}
            <PasswordInput
              type="confirmPassword"
              startElement={<LockIcon />}
              placeholder="Confirm your password"
              label="Confirm Password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === getValues("password") || "Passwords do not match",
              })}
              errors={errors}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="solid"
              size="lg"
              loading={isSubmitting}
              sx={{ mt: 3 }}
            >
              Submit Form
            </Button>

            {/* Additional Test Buttons */}
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button variant="subtle" colorPalette="gray">
                Cancel
              </Button>
              <Button variant="outline" colorPalette="blue">
                Save as Draft
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}

export default TestMUIComponents;