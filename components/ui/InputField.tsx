import { InputHTMLAttributes, ReactNode } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
  icon?: ReactNode;
  sublabel?: string;
}

export function InputField({
  label,
  id,
  error,
  icon,
  sublabel,
  className = "",
  readOnly,
  ...props
}: InputFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-sm font-semibold text-foreground">
          {label}
        </label>
        {sublabel && (
          <span className="text-xs text-muted-foreground">{sublabel}</span>
        )}
      </div>

      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-muted-foreground pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={id}
          name={id}
          readOnly={readOnly}
          className={`w-full py-2.5 px-3.5 ${
            icon ? "pl-10" : ""
          } text-sm text-foreground bg-card border rounded-xl shadow-xs transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder:text-muted-foreground/60 ${
            readOnly ? "bg-muted/60 text-muted-foreground cursor-not-allowed border-border/60" : "border-border hover:border-primary/40"
          } ${error ? "border-destructive focus:ring-destructive/30" : ""} ${className}`}
          {...props}
        />
      </div>

      {error && <p className="text-destructive text-xs font-medium mt-1">{error}</p>}
    </div>
  );
}
