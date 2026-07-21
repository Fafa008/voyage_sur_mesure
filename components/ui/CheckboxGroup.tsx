interface CheckboxGroupProps {
  label: string;
  name: string;
  options: string[];
  selected?: string[];
  className?: string;
}

export function CheckboxGroup({
  label,
  name,
  options,
  selected = [],
  className = "",
}: CheckboxGroupProps) {
  return (
    <div className={className}>
      <span className="block text-sm font-medium mb-2">{label}</span>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name={name}
              value={opt}
              defaultChecked={selected.includes(opt)}
              className="rounded"
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}
