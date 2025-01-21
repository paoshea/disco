// Inspired by shadcn-ui toast implementation
import * as React from "react";
import { toast } from 'sonner';

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning';
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const createToast = {
  success: (props: ToastProps) => {
    return toast.success(props.title, {
      description: props.description,
      action: props.action && {
        label: props.action.label,
        onClick: props.action.onClick,
      },
    });
  },

  error: (props: ToastProps) => {
    return toast.error(props.title, {
      description: props.description,
      action: props.action && {
        label: props.action.label,
        onClick: props.action.onClick,
      },
    });
  },

  warning: (props: ToastProps) => {
    return toast.warning(props.title, {
      description: props.description,
      action: props.action && {
        label: props.action.label,
        onClick: props.action.onClick,
      },
    });
  },

  info: (props: ToastProps) => {
    return toast(props.title, {
      description: props.description,
      action: props.action && {
        label: props.action.label,
        onClick: props.action.onClick,
      },
    });
  },
};

export function useToast() {
  return {
    toast: createToast.info,
    success: createToast.success,
    error: createToast.error,
    warning: createToast.warning,
  };
}
