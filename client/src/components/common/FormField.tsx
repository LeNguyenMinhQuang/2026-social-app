import { forwardRef, type InputHTMLAttributes } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="font-sans text-[13px] font-medium text-ink/70">
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          className={`border-0 border-b bg-transparent py-2 font-sans text-[15px] text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-coral ${
            error ? "border-coral" : "border-line"
          }`}
          {...props}
        />
        {error && <p className="font-sans text-xs text-coral">{error}</p>}
      </div>
    );
  }
);

FormField.displayName = "FormField";
