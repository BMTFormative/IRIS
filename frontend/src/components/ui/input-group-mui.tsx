// frontend/src/components/ui/input-group-mui.tsx
import React from "react";
import {
  TextField,
  InputAdornment,
  type TextFieldProps,
} from "@mui/material";

export interface InputGroupProps extends Omit<TextFieldProps, 'children'> {
  startElement?: React.ReactNode;
  endElement?: React.ReactNode;
  children?: React.ReactElement; // For compatibility with Chakra pattern
  // Chakra-style props
  w?: string;
  width?: string;
}

export const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  function InputGroup(props, ref) {
    const { 
      startElement, 
      endElement, 
      children,
      w,
      width,
      sx,
      InputProps,
      ...rest 
    } = props;

    // Handle width prop (Chakra style)
    const finalWidth = w || width;

    // If children is provided (Chakra pattern), extract its props
    const childProps = children ? children.props : {};
    
    // Merge props from children if they exist
    const finalProps = {
      ...childProps,
      ...rest,
    };

    return (
      <TextField
        ref={ref}
        variant="outlined"
        fullWidth
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
          ...(endElement && {
            endAdornment: (
              <InputAdornment position="end">
                {endElement}
              </InputAdornment>
            ),
          }),
          ...InputProps,
        }}
        {...finalProps}
      />
    );
  }
);