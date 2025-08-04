import React from "react"
import {
  Checkbox as MuiCheckbox,
  FormControlLabel,
  CheckboxProps as MuiCheckboxProps,
} from "@mui/material"

export interface CheckboxProps extends Omit<MuiCheckboxProps, "onChange"> {
  children?: React.ReactNode
  checked?: boolean
  onCheckedChange?: (params: { checked: boolean }) => void
  colorPalette?: "primary" | "secondary" | "success" | "error" | "warning" | "info" | "teal"
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
  rootRef?: React.Ref<HTMLLabelElement>
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(props, ref) {
    const {
      children,
      checked = false,
      onCheckedChange,
      colorPalette = "primary",
      inputProps,
      rootRef,
      disabled,
      sx,
      ...rest
    } = props

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const isChecked = event.target.checked
      onCheckedChange?.({ checked: isChecked })
    }

    // Map colorPalette to MUI color prop
    const getMuiColor = (palette: string): MuiCheckboxProps["color"] => {
      switch (palette) {
        case "teal":
          return "success" // Map teal to success for now
        case "primary":
        case "secondary":
        case "success":
        case "error":
        case "warning":
        case "info":
          return palette as MuiCheckboxProps["color"]
        default:
          return "primary"
      }
    }

    const muiColor = getMuiColor(colorPalette)

    // If there are children (label), wrap with FormControlLabel
    if (children) {
      return (
        <FormControlLabel
          ref={rootRef}
          control={
            <MuiCheckbox
              ref={ref}
              checked={checked}
              onChange={handleChange}
              color={muiColor}
              disabled={disabled}
              inputProps={inputProps}
              sx={{
                // Custom styling for teal color if needed
                ...(colorPalette === "teal" && {
                  color: "#319795", // Teal.500 from Chakra
                  "&.Mui-checked": {
                    color: "#319795",
                  },
                }),
                ...sx,
              }}
              {...rest}
            />
          }
          label={children}
          disabled={disabled}
          sx={{
            margin: 0, // Remove default margin
            alignItems: "flex-start", // Align to top if label wraps
            "& .MuiFormControlLabel-label": {
              fontSize: "0.875rem",
              lineHeight: 1.5,
              marginLeft: 1,
            },
          }}
        />
      )
    }

    // If no children, return just the checkbox
    return (
      <MuiCheckbox
        ref={ref}
        checked={checked}
        onChange={handleChange}
        color={muiColor}
        disabled={disabled}
        inputProps={inputProps}
        sx={{
          // Custom styling for teal color if needed
          ...(colorPalette === "teal" && {
            color: "#319795", // Teal.500 from Chakra
            "&.Mui-checked": {
              color: "#319795",
            },
          }),
          ...sx,
        }}
        {...rest}
      />
    )
  }
)