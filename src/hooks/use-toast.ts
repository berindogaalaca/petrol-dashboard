"use client";

import { toast as sonnerToast } from "sonner";
import * as React from "react";

type ToastProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
  duration?: number;
};

function toast(props: ToastProps) {
  const { title, description, action, variant, duration } = props;

  const defaultToast =
    variant === "destructive" ? sonnerToast.error : sonnerToast;

  return defaultToast(title as string, {
    description,
    action,
    duration: duration || 5000,
  });
}

function useToast() {
  return {
    toast,
    dismiss: (toastId?: string) => sonnerToast.dismiss(toastId),
  };
}

export { useToast, toast };
