import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export default function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`px-3 py-2 border border-gray bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-gray/50 ${className}`}
      {...props}
    />
  );
}
