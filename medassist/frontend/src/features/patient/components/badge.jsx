import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap gap-1 transition",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white border-transparent",
        secondary: "bg-gray-100 text-gray-900 border-transparent",
        destructive: "bg-red-600 text-white border-transparent",
        outline: "border-gray-200 text-gray-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export function Badge({ className, variant, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}