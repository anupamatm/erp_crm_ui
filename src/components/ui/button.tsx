import React from 'react';
import { Button as MuiButton } from '@mui/material';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'inherit' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  onClick?: () => void;
  disabled?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  sx?: any;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'contained',
  color = 'primary',
  onClick,
  disabled = false,
  startIcon,
  endIcon,
  size = 'medium',
  fullWidth = false,
  sx,
  ...props
}) => {
  return (
    <MuiButton
      variant={variant}
      color={color}
      onClick={onClick}
      disabled={disabled}
      startIcon={startIcon}
      endIcon={endIcon}
      size={size}
      fullWidth={fullWidth}
      sx={sx}
      {...props}
    >
      {children}
    </MuiButton>
  );
};
