// components/ui/CheckboxGroup.tsx
"use client";

interface CheckboxGroupProps {
  label: string;
  name: string;
  options: Array<{ value: string; label: string }>;
  values: string[];
  onChange: (value: string, checked: boolean) => void;
  className?: string;
}

export function CheckboxGroup({
  label,
  name,
  options,
  values = [],
  onChange,
  className = "",
}: CheckboxGroupProps) {
  return (
    <div className={className}>
      <span className="block text-sm font-medium mb-2">{label}</span>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {options.map(({ value, label }) => (
          <label key={value} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name={name}
              value={value}
              checked={values.includes(value)}
              onChange={(e) => onChange(value, e.target.checked)}
              className="rounded"
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}
