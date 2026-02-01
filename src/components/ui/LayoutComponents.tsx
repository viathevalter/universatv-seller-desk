import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const base = "px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-primary hover:bg-primaryHover text-white shadow-lg shadow-primary/20",
    secondary: "bg-surfaceHighlight hover:bg-secondary text-textMain border border-border",
    ghost: "bg-transparent hover:bg-surfaceHighlight text-textMuted hover:text-textMain",
    destructive: "bg-red-900/50 text-red-200 hover:bg-red-900 border border-red-900"
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

interface CardProps {
  children?: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-surface border border-border rounded-xl shadow-sm ${className}`}>
    {children}
  </div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    className="w-full bg-background border border-border rounded-md px-3 py-2 text-textMain placeholder-textMuted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
    {...props}
  />
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea
    className="w-full bg-background border border-border rounded-md px-3 py-2 text-textMain placeholder-textMuted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all min-h-[100px]"
    {...props}
  />
);

interface BadgeProps {
  children?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, className = '' }) => (
  <span className={`px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary border border-primary/20 ${className}`}>
    {children}
  </span>
);

interface ToastProps {
  message: string;
  visible: boolean;
}

export const Toast: React.FC<ToastProps> = ({ message, visible }) => (
  <div className={`fixed bottom-8 right-8 bg-surfaceHighlight border border-primary text-textMain px-4 py-3 rounded-lg shadow-xl transform transition-all duration-300 z-50 flex items-center gap-3 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
    {message}
  </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <div className="relative">
    <select
      className="w-full bg-background border border-border rounded-md px-3 py-2 text-textMain placeholder-textMuted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
      {...props}
    />
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-textMuted">
      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  </div>
);