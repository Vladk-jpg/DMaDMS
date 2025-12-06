import React, { ReactNode } from "react";

interface InfoFieldProps {
  label: string;
  value: string | ReactNode;
  className?: string;
}

export default function InfoField({ label, value, className = "" }: InfoFieldProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-foreground mb-2">
        {label}
      </label>
      <div className="px-3 py-2 border border-gray bg-white rounded-md text-foreground">
        {value}
      </div>
    </div>
  );
}
