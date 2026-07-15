// components/ui/Button.tsx
import { ReactNode } from "react";

export default function Button({
  children,
  variant = "primary",
  href,
  ...props
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
  href?: string;
  [key: string]: any;
}) {
  const base =
    "px-4 py-2 rounded font-semibold transition-colors inline-block text-center";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-green-600 text-white hover:bg-green-700",
    outline: "border border-blue-600 text-blue-600 hover:bg-blue-50",
  };
  const className = `${base} ${variants[variant]}`;

  if (href) {
    return (
      <a href={href} className={className} {...props}>
        {children}
      </a>
    );
  }
  return (
    <button className={className} {...props}>
      {children}
    </button>
  );
}
