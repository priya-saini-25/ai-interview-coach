import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-medium text-gray-300 mb-1.5 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full bg-[#111827] text-gray-100 placeholder-gray-500 border ${
              error ? 'border-red-500 focus:ring-red-500' : 'border-gray-800 focus:border-indigo-500 focus:ring-indigo-500'
            } rounded-lg ${leftIcon ? 'pl-10' : 'px-4'} py-2.5 text-sm transition duration-150 ease-in-out focus:outline-none focus:ring-1 ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-400 font-medium">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
