import React from "react";
import { cn } from "./utils";

export function Card({ className = "", children, ...props }) {
  return (
    <div
      className={cn(
        "bg-white text-gray-900 flex flex-col gap-6 rounded-xl border border-gray-200 shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children, ...props }) {
  return (
    <div
      className={cn(
        "grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className = "", children, ...props }) {
  return (
    <h4
      className={cn("leading-none font-semibold text-sm", className)}
      {...props}
    >
      {children}
    </h4>
  );
}

export function CardDescription({ className = "", children, ...props }) {
  return (
    <p
      className={cn("text-gray-500 text-sm", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardAction({ className = "", children, ...props }) {
  return (
    <div
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardContent({ className = "", children, ...props }) {
  return (
    <div
      className={cn("px-6 pb-6", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardFooter({ className = "", children, ...props }) {
  return (
    <div
      className={cn("flex items-center px-6 pb-6 pt-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}