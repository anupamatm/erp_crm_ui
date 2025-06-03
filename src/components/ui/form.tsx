// src/components/ui/form.tsx
import { useForm, FormProvider, useFormContext ,Controller} from "react-hook-form";
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

interface FormItemProps {
  children: React.ReactNode;
  className?: string;
}

export const FormItem: React.FC<FormItemProps> = ({ children, className }) => {
  return <div className={cn("space-y-2", className)}>{children}</div>;
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

interface FormControlProps {
  children: React.ReactNode;
  className?: string;
}

export const FormControl: React.FC<FormControlProps> = ({ children, className }) => {
  return <div className={cn("mt-1", className)}>{children}</div>;
};

interface FormDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const FormDescription: React.FC<FormDescriptionProps> = ({ children, className }) => {
  return <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>;
};

interface FormMessageProps {
  children: React.ReactNode;
  className?: string;
}

export const FormMessage: React.FC<FormMessageProps> = ({ children, className }) => {
  return <p className={cn("text-sm text-destructive", className)}>{children}</p>;
};

interface FormFieldProps {
  name: string;
  render: (props: { field: any; fieldState: any; formState: any }) => React.ReactNode;
}

export function FormField({ name, render }: FormFieldProps) {
  const { control, formState } = useFormContext();
  
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <>
          {render({ field, fieldState, formState })}
        </>
      )}
    />
  );
}