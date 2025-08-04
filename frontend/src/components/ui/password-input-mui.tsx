// frontend/src/components/ui/password-input-mui.tsx
import React, { useState, forwardRef } from "react";
import {
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  FormHelperText,
  type TextFieldProps,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

export interface PasswordVisibilityProps {
  defaultVisible?: boolean;
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  visibilityIcon?: { on: React.ReactNode; off: React.ReactNode };
}

export interface PasswordInputProps
  extends Omit<TextFieldProps, 'type'>,
    PasswordVisibilityProps {
  startElement?: React.ReactNode;
  type: string; // For compatibility with react-hook-form
  errors: any; // Form errors object
  // Chakra-style props
  w?: string;
  width?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(props, ref) {
    const {
      defaultVisible = false,
      visible: visibleProp,
      onVisibleChange,
      visibilityIcon = { on: <Visibility />, off: <VisibilityOff /> },
      startElement,
      type, // This will be "password" from react-hook-form
      errors,
      w,
      width,
      sx,
      InputProps,
      ...rest
    } = props;

    // Internal visibility state
    const [internalVisible, setInternalVisible] = useState(defaultVisible);
    const visible = visibleProp !== undefined ? visibleProp : internalVisible;

    const handleToggleVisibility = () => {
      const newVisible = !visible;
      if (visibleProp === undefined) {
        setInternalVisible(newVisible);
      }
      onVisibleChange?.(newVisible);
    };

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
    };

    // Get error for this field
    const fieldError = errors[type];
    const hasError = !!fieldError;

    // Handle width prop (Chakra style)
    const finalWidth = w || width;

    return (
      <FormControl fullWidth error={hasError}>
        <TextField
          ref={ref}
          type={visible ? "text" : "password"}
          variant="outlined"
          fullWidth
          error={hasError}
          sx={{
            ...(finalWidth && { width: finalWidth }),
            '& .MuiOutlinedInput-root': {
              borderRadius: 1.5, // 8px border radius to match Chakra
            },
            ...sx,
          }}
          InputProps={{
            ...(startElement && {
              startAdornment: (
                <InputAdornment position="start">
                  {startElement}
                </InputAdornment>
              ),
            }),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleToggleVisibility}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                  size="small"
                >
                  {visible ? visibilityIcon.off : visibilityIcon.on}
                </IconButton>
              </InputAdornment>
            ),
            ...InputProps,
          }}
          {...rest}
        />
        {hasError && (
          <FormHelperText error>
            {fieldError?.message}
          </FormHelperText>
        )}
      </FormControl>
    );
  }
);