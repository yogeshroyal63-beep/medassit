import React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "./utils";

export function Sheet(props) {
  return <SheetPrimitive.Root {...props} />;
}

export function SheetTrigger(props) {
  return <SheetPrimitive.Trigger {...props} />;
}

export function SheetClose(props) {
  return <SheetPrimitive.Close {...props} />;
}

export function SheetPortal(props) {
  return <SheetPrimitive.Portal {...props} />;
}

export function SheetOverlay({ className, ...props }) {
  return (
    <SheetPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  );
}

export function SheetContent({
  className,
  children,
  side = "right",
  ...props
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        className={cn(
          "fixed z-50 flex flex-col gap-4 bg-white shadow-lg",
          side === "right" && "inset-y-0 right-0 h-full w-80 border-l",
          side === "left" && "inset-y-0 left-0 h-full w-80 border-r",
          side === "top" && "inset-x-0 top-0 border-b",
          side === "bottom" && "inset-x-0 bottom-0 border-t",
          className
        )}
        {...props}
      >
        {children}

        <SheetPrimitive.Close className="absolute top-4 right-4 opacity-70 hover:opacity-100">
          <X className="w-4 h-4" />
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

export function SheetHeader({ className, ...props }) {
  return (
    <div className={cn("flex flex-col gap-1.5 p-4", className)} {...props} />
  );
}

export function SheetFooter({ className, ...props }) {
  return (
    <div className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />
  );
}

export function SheetTitle({ className, ...props }) {
  return (
    <SheetPrimitive.Title
      className={cn("font-semibold", className)}
      {...props}
    />
  );
}

export function SheetDescription({ className, ...props }) {
  return (
    <SheetPrimitive.Description
      className={cn("text-sm text-gray-500", className)}
      {...props}
    />
  );
}