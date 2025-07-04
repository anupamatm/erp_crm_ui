import React from 'react';
import { Card as MuiCard, CardContent as MuiCardContent, CardHeader as MuiCardHeader } from '@mui/material';
import { Typography } from '@mui/material';

interface CardProps {
  children?: React.ReactNode;
  sx?: any;
}

interface CardContentProps {
  children?: React.ReactNode;
  sx?: any;
}

interface CardHeaderProps {
  children?: React.ReactNode;
  title?: React.ReactNode;
  sx?: any;
}

interface CardTitleProps {
  children?: React.ReactNode;
  sx?: any;
}

export const Card: React.FC<CardProps> = ({ children, sx, ...props }) => {
  return <MuiCard sx={sx} {...props}>{children}</MuiCard>;
};

export const CardContent: React.FC<CardContentProps> = ({ children, sx, ...props }) => {
  return <MuiCardContent sx={sx} {...props}>{children}</MuiCardContent>;
};

export const CardHeader: React.FC<CardHeaderProps> = ({ children, title, sx, ...props }) => {
  return (
    <MuiCardHeader title={title} sx={sx} {...props}>
      {children}
    </MuiCardHeader>
  );
};

export const CardTitle: React.FC<CardTitleProps> = ({ children, sx, ...props }) => {
  return <Typography variant="h5" sx={sx} {...props}>{children}</Typography>;
};
