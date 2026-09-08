"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

export function Toaster() {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={resolvedTheme === "light" ? "light" : "dark"}
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "!rounded-xl !border !border-border !bg-surface !text-text !shadow-lg",
          description: "!text-text-muted",
        },
      }}
    />
  );
}
