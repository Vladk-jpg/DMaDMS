"use client";

import { Salary } from "@/app/types/salary";

interface SalaryCardProps {
  salary: Salary;
}

export default function SalaryCard({ salary }: SalaryCardProps) {
  const salaryDate = new Date(salary.salary_date);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: string, currency: string) => {
    const numericAmount = parseFloat(amount.replace(/[^0-9.-]+/g, ""));
    return `${numericAmount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${currency}`;
  };

  const totalSalary =
    parseFloat(salary.base_salary.replace(/[^0-9.-]+/g, "")) +
    parseFloat(salary.bonus.replace(/[^0-9.-]+/g, ""));

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500">
          {formatDate(salaryDate)}
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            Base Salary
          </p>
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(salary.base_salary, salary.currency)}
          </p>
        </div>

        {parseFloat(salary.bonus.replace(/[^0-9.-]+/g, "")) > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Bonus
            </p>
            <p className="text-lg font-semibold text-green-600">
              {formatCurrency(salary.bonus, salary.currency)}
            </p>
          </div>
        )}

        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            Total
          </p>
          <p className="text-2xl font-bold text-blue-600">
            {totalSalary.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            {salary.currency}
          </p>
        </div>
      </div>
    </div>
  );
}
