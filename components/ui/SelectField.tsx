import { SelectHTMLAttributes, ReactNode } from "react";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  options: { value: string; label: string }[];
  error?: string;
  icon?: ReactNode;
  sublabel?: string;
}

export function SelectField({
  label,
  id,
  options,
  error,
  icon,
  sublabel,
  className = "",
  ...props
}: SelectFieldProps) {
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
          <div className="absolute left-3.5 text-muted-foreground pointer-events-none z-10">
            {icon}
          </div>
        )}
        <select
          id={id}
          name={id}
          className={`w-full py-2.5 px-3.5 ${
            icon ? "pl-10" : ""
          } text-sm text-foreground bg-card border border-border rounded-xl shadow-xs transition-all duration-200 hover:border-primary/40 focus:outline-hidden focus:ring-2 focus:ring-primary/40 focus:border-primary cursor-pointer appearance-none pr-10 ${
            error ? "border-destructive focus:ring-destructive/30" : ""
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-card text-foreground">
              {opt.label}
            </option>
          ))}
        </select>
        
        {/* Flèche déroulante personnalisée */}
        <div className="absolute right-3.5 pointer-events-none text-muted-foreground">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {error && <p className="text-destructive text-xs font-medium mt-1">{error}</p>}
    </div>
  );
}
