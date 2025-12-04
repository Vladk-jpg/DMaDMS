import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export default function Select({ children, className = "", ...props }: SelectProps) {
  return (
    <select
      className={`px-3 py-2 border border-primary text-primary bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
