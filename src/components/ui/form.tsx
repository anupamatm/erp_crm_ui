// src/components/ui/form.tsx
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { cn } from "../../lib/utils";

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  onSubmit: (data: any) => void;
}

export const Form: React.FC<FormProps> = ({ onSubmit, children, ...props }) => {
  const methods = useForm();
  
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} {...props}>
        {children}
      </form>
    </FormProvider>
  );
};

export const FormItem: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="space-y-2">{children}</div>;
};

export const FormLabel: React.FC<{
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
}> = ({ htmlFor, children, className }) => {
  return (
    <label htmlFor={htmlFor} className={cn("block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}>
      {children}
    </label>
  );
};

export const FormControl: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="mt-1">{children}</div>;
};

export const FormDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <p className="text-sm text-muted-foreground">{children}</p>;
};

export const FormMessage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <p className="text-sm text-destructive">{children}</p>;
};

export const FormField = ({
  name,
  render,
}: {
  name: string;
  render: (field: any) => React.ReactNode;
}) => {
  const { control } = useFormContext();
  return render({ name, control });
};
