import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { triggerHapticFeedback } from "@/lib/haptic";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-[13px] font-black uppercase tracking-wider ring-offset-background transition-all active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 max-w-full transform-gpu will-change-transform select-none",
  {
    variants: {
      variant: {
        default: "bg-beeyield-green text-white shadow-lg shadow-beeyield-green/20 hover:bg-beeyield-green-dark",
        destructive: "bg-beeyield-orange text-white hover:bg-beeyield-orange/90",
        outline: "border border-beeyield-green/10 bg-white text-beeyield-green hover:bg-beeyield-cream/50 hover:border-beeyield-green/20",
        secondary: "bg-beeyield-gold text-beeyield-green shadow-md shadow-beeyield-gold/10 hover:bg-beeyield-gold/90",
        ghost: "text-beeyield-green/60 hover:bg-beeyield-cream/50 hover:text-beeyield-green",
        link: "text-beeyield-green underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-5 sm:px-8 py-2 text-[12px] sm:text-[13px]",
        sm: "h-9 rounded-xl px-3 text-[11px]",
        lg: "min-h-12 sm:h-14 rounded-[20px] px-5 sm:px-10 py-3 text-[13px] sm:text-[15px] max-w-full",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      try {
        triggerHapticFeedback(10);
      } catch (_) {}

      if (!onClick) return;

      if (props.type === "submit") {
        onClick(e);
        return;
      }

      // Yield immediately to browser event loop to paint interaction without blocking UI updates
      if (typeof window !== "undefined" && "requestAnimationFrame" in window) {
        window.requestAnimationFrame(() => {
          React.startTransition(() => {
            onClick(e);
          });
        });
      } else {
        React.startTransition(() => {
          onClick(e);
        });
      }
    };

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
