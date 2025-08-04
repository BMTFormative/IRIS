// frontend/src/components/ui/button-mui.tsx
import React from "react";
import {
  Button as MuiButton,
  type ButtonProps as MuiButtonProps,
  CircularProgress,
  Box,
} from "@mui/material";

interface ButtonLoadingProps {
  loading?: boolean;
  loadingText?: React.ReactNode;
}

export interface ButtonProps extends Omit<MuiButtonProps, 'size'>, ButtonLoadingProps {
  // Custom size prop that maps to MUI sizes
  size?: 'sm' | 'md' | 'lg' | MuiButtonProps['size'];
  // Custom variant prop that maps Chakra variants to MUI variants
  variant?: 'solid' | 'subtle' | 'ghost' | 'outline' | MuiButtonProps['variant'];
  // Custom colorPalette prop (Chakra style)
  colorPalette?: 'gray' | 'blue' | 'green' | 'red' | 'purple';
}

// Map Chakra variants to MUI variants
const variantMap = {
  solid: 'contained',
  subtle: 'outlined',
  ghost: 'text',
  outline: 'outlined',
} as const;

// Map Chakra sizes to MUI sizes
const sizeMap = {
  sm: 'small',
  md: 'medium', 
  lg: 'large',
} as const;

// Map colorPalette to MUI color prop
const colorMap = {
  gray: 'inherit',
  blue: 'primary',
  green: 'success',
  red: 'error',
  purple: 'secondary',
} as const;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(props, ref) {
    const { 
      loading, 
      disabled, 
      loadingText, 
      children, 
      variant = 'solid',
      size = 'md',
      colorPalette = 'blue',
      sx,
      ...rest 
    } = props;

    // Map custom props to MUI props
    const muiVariant = variantMap[variant as keyof typeof variantMap] || variant;
    const muiSize = sizeMap[size as keyof typeof sizeMap] || size;
    const muiColor = colorMap[colorPalette as keyof typeof colorMap] || 'primary';

    return (
      <MuiButton
        ref={ref}
        variant={muiVariant as MuiButtonProps['variant']}
        size={muiSize as MuiButtonProps['size']}
        color={muiColor as MuiButtonProps['color']}
        disabled={loading || disabled}
        sx={{
          position: 'relative',
          // Custom styles for ghost variant
          ...(variant === 'ghost' && {
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }),
          // Custom styles for subtle variant with gray color
          ...(variant === 'subtle' && colorPalette === 'gray' && {
            borderColor: 'divider',
            color: 'text.primary',
            '&:hover': {
              backgroundColor: 'action.hover',
              borderColor: 'divider',
            },
          }),
          ...sx,
        }}
        {...rest}
      >
        {loading && !loadingText ? (
          <>
            <Box
              sx={{
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CircularProgress 
                size={16} 
                color="inherit"
                sx={{ 
                  color: variant === 'contained' ? 'white' : 'inherit' 
                }}
              />
            </Box>
            <Box sx={{ visibility: 'hidden' }}>
              {children}
            </Box>
          </>
        ) : loading && loadingText ? (
          <>
            <CircularProgress 
              size={16} 
              color="inherit" 
              sx={{ mr: 1 }}
            />
            {loadingText}
          </>
        ) : (
          children
        )}
      </MuiButton>
    );
  }
);