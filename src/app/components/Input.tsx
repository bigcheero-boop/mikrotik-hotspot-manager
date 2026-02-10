import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-input-background border border-border rounded-lg px-4 py-2 text-foreground 
          placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary 
          focus:border-transparent transition-all ${error ? 'border-destructive' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({ label, error, className = '', children, ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}
      <select
        className={`w-full bg-input-background border border-border rounded-lg px-4 py-2 text-foreground 
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all 
          ${error ? 'border-destructive' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-sm text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}
