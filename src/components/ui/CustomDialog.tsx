import React from 'react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const Dialog = ({ open, onOpenChange, children }: DialogProps) => (
  open ? (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  ) : null
);

export const DialogHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
    {children}
  </div>
);

export const DialogTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-lg font-semibold leading-none tracking-tight">{children}</h2>
);

export const DialogDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-muted-foreground">{children}</p>
);

export const DialogFooter = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6">
    {children}
  </div>
);

export const DialogContent = ({ children }: { children: React.ReactNode }) => (
  <div className="grid gap-4 py-4">{children}</div>
);
