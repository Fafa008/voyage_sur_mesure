import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl font-semibold whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 active:scale-[0.98] cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-md hover:bg-[color-mix(in_srgb,var(--primary)_88%,black)] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-[color-mix(in_srgb,var(--secondary)_88%,black)] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
        outline:
          "border border-border bg-background shadow-xs hover:bg-muted hover:text-foreground hover:border-primary/50 hover:-translate-y-0.5 active:translate-y-0 dark:bg-card/50",
        ghost:
          "hover:bg-muted hover:text-foreground active:scale-[0.98] dark:hover:bg-muted/60",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md active:scale-[0.98]",
        link: "text-primary underline-offset-4 hover:underline font-semibold p-0 h-auto",
      },
      size: {
        default:
          "h-10 gap-2 px-4 text-sm font-semibold [&_svg:not([class*='size-'])]:size-4",
        xs: "h-7 gap-1 rounded-md px-2 text-xs font-medium [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-lg px-3 text-xs font-semibold [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2.5 rounded-xl px-6 text-base font-bold tracking-wide [&_svg:not([class*='size-'])]:size-5",
        xl: "h-14 gap-3 rounded-2xl px-8 text-lg font-extrabold tracking-wide [&_svg:not([class*='size-'])]:size-6 shadow-lg hover:shadow-xl",
        icon: "size-10 rounded-xl [&_svg:not([class*='size-'])]:size-4",
        "icon-xs": "size-7 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-lg [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-12 rounded-xl [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
