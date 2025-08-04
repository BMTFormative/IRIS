// frontend/src/components/ui/field-mui.tsx
import React from "react";
import {
  FormControl,
  FormLabel,
  FormHelperText,
  Box,
  Typography,
  type FormControlProps,
} from "@mui/material";

export interface FieldProps extends Omit<FormControlProps, 'label'> {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  errorText?: React.ReactNode;
  optionalText?: React.ReactNode;
  invalid?: boolean;
  required?: boolean;
  children: React.ReactNode;
}

export const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  function Field(props, ref) {
    const { 
      label, 
      children, 
      helperText, 
      errorText, 
      optionalText, 
      invalid = false,
      required = false,
      sx,
      ...rest 
    } = props;

    return (
      <FormControl 
        ref={ref} 
        error={invalid}
        required={required}
        fullWidth
        sx={{
          mb: 1,
          ...sx,
        }}
        {...rest}
      >
        {label && (
          <FormLabel
            sx={{
              mb: 0.5,
              color: invalid ? 'error.main' : 'text.primary',
              fontSize: '0.875rem',
              fontWeight: 500,
              '&.Mui-focused': {
                color: invalid ? 'error.main' : 'primary.main',
              },
            }}
          >
            {label}
            {required && !optionalText && (
              <Typography
                component="span"
                color="error.main"
                sx={{ ml: 0.5 }}
              >
                *
              </Typography>
            )}
            {!required && optionalText && (
              <Typography
                component="span"
                color="text.secondary"
                sx={{ ml: 0.5, fontSize: '0.75rem' }}
              >
                {optionalText}
              </Typography>
            )}
          </FormLabel>
        )}
        
        <Box sx={{ position: 'relative' }}>
          {children}
        </Box>
        
        {helperText && !invalid && (
          <FormHelperText
            sx={{
              mt: 0.5,
              fontSize: '0.75rem',
              color: 'text.secondary',
            }}
          >
            {helperText}
          </FormHelperText>
        )}
        
        {errorText && invalid && (
          <FormHelperText
            error
            sx={{
              mt: 0.5,
              fontSize: '0.75rem',
            }}
          >
            {errorText}
          </FormHelperText>
        )}
      </FormControl>
    );
  }
);