import React from 'react';
import { Badge as MuiBadge } from '@mui/material';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  sx?: any;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', sx, ...props }) => {
  return (
    <MuiBadge
      color={variant}
      sx={{
        ...sx,
        backgroundColor: variant === 'default' ? 'rgba(0, 0, 0, 0.12)' : undefined,
        color: variant === 'default' ? 'rgba(0, 0, 0, 0.87)' : undefined,
      }}
      {...props}
    >
      {children}
    </MuiBadge>
  );
};
