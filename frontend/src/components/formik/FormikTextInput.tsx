import type { ComponentProps } from "react";
import { useField } from "formik";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Formik owns field state (value/touched/error) via useField; these bridge
// that to shadcn's plain Input/Label once so every Create screen's form
// can reuse it directly instead of re-wiring per field.
interface FormikTextInputProps extends Omit<ComponentProps<typeof Input>, "name"> {
  name: string;
  label?: string;
  description?: string;
}

export function FormikTextInput({
  name,
  label,
  description,
  ...props
}: FormikTextInputProps) {
  const [field, meta] = useField(name);
  const hasError = Boolean(meta.touched && meta.error);

  return (
    <div className="tw:grid tw:gap-1.5">
      {label && <Label htmlFor={name}>{label}</Label>}
      <Input id={name} aria-invalid={hasError} {...field} {...props} />
      {description && !hasError && (
        <p className="tw:text-muted-foreground tw:text-xs">{description}</p>
      )}
      {hasError && <p className="tw:text-destructive tw:text-xs">{meta.error}</p>}
    </div>
  );
}
