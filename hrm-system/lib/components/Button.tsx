import React from "react";

type ButtonVariant = "ghost" | "outline" | "primaryOutline" | "primary" | "danger";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

export default function Button({
  variant = "ghost",
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles = "px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantStyles = {
    ghost: "bg-transparent text-foreground hover:bg-gray cursor-pointer",
    outline: "border border-gray text-foreground bg-white hover:bg-gray cursor-pointer",
    primaryOutline: "border border-primary text-primary bg-white hover:bg-primary/5 cursor-pointer",
    primary: "bg-primary text-white border border-primary hover:bg-primary/90 cursor-pointer",
    danger: "border border-red text-red bg-white hover:bg-red/5 cursor-pointer",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
