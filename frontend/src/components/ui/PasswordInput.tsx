"use client";

import React, { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  labelIcon?: React.ReactNode;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  iconClassName?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      label,
      labelIcon,
      error,
      containerClassName = "",
      labelClassName = "text-xs sm:text-sm font-medium text-slate-300 block",
      inputClassName = "w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 transition-all font-normal",
      iconClassName = "text-slate-400 hover:text-amber-400",
      disabled,
      value,
      onChange,
      placeholder = "••••••••",
      required = false,
      autoComplete,
      id,
      name,
      ...rest
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className={`space-y-1.5 text-left ${containerClassName}`}>
        {label && (
          <label htmlFor={id} className={labelClassName}>
            {labelIcon}
            {label}
          </label>
        )}
        <div className="relative">
          <input
            {...rest}
            ref={ref}
            id={id}
            name={name}
            type={showPassword ? "text" : "password"}
            required={required}
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            autoComplete={autoComplete}
            className={`${inputClassName} pr-11`}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={disabled}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className={`absolute right-3.5 top-1/2 -translate-y-1/2 p-1 transition-colors cursor-pointer disabled:cursor-not-allowed ${iconClassName}`}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
