import { forwardRef, type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, isLoading, disabled, className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex w-full items-center justify-center rounded-[10px] bg-ink px-5 py-3 font-sans text-sm font-semibold text-white transition-colors hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      >
        {isLoading ? "Đang xử lý..." : children}
      </button>
    );
  }
);

Button.displayName = "Button";
