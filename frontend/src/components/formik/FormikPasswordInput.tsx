import { useState, type ComponentProps } from "react";
import { useField } from "formik";
import { Eye, EyeOff } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FormikPasswordInputProps
  extends Omit<ComponentProps<typeof Input>, "name" | "type"> {
  name: string;
  label?: string;
  description?: string;
}

export function FormikPasswordInput({
  name,
  label,
  description,
  className,
  ...props
}: FormikPasswordInputProps) {
  const [field, meta] = useField(name);
  const [visible, setVisible] = useState(false);
  const hasError = Boolean(meta.touched && meta.error);

  return (
    <div className="tw:grid tw:gap-1.5">
      {label && <Label htmlFor={name}>{label}</Label>}
      <div className="tw:relative">
        <Input
          id={name}
          type={visible ? "text" : "password"}
          aria-invalid={hasError}
          className={`tw:pr-9 ${className ?? ""}`}
          {...field}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="tw:text-muted-foreground tw:hover:text-foreground tw:absolute tw:top-1/2 tw:right-2 tw:-translate-y-1/2"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="tw:size-4" /> : <Eye className="tw:size-4" />}
        </button>
      </div>
      {description && !hasError && (
        <p className="tw:text-muted-foreground tw:text-xs">{description}</p>
      )}
      {hasError && <p className="tw:text-destructive tw:text-xs">{meta.error}</p>}
    </div>
  );
}
