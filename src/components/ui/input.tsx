import React from 'react';
import { TextField as MuiTextField } from '@mui/material';

interface InputProps {
  value?: string | number;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: 'text' | 'password' | 'email' | 'number' | 'date';
  fullWidth?: boolean;
  label?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  sx?: any;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChange,
  placeholder,
  type = 'text',
  fullWidth = true,
  label,
  error = false,
  helperText,
  disabled = false,
  sx,
  ...props
}) => {
  return (
    <MuiTextField
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      fullWidth={fullWidth}
      label={label}
      error={error}
      helperText={helperText}
      disabled={disabled}
      sx={sx}
      {...props}
    />
  );
};
