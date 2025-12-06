"use client";

import { useState, useEffect } from "react";
import SalaryCard from "@/lib/components/SalaryCard";
import { Salary } from "../types/salary";

interface ApiResponse<T> {
  success: boolean;
  data?: T | T[];
  error?: string;
}

export default function SalariesPage() {
  const [currentSalary, setCurrentSalary] = useState<Salary | null>(null);
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [loadingCurrent, setLoadingCurrent] = useState<boolean>(true);
  const [loadingSalaries, setLoadingSalaries] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCurrentSalary() {
      try {
        setLoadingCurrent(true);
        setError(null);

        const response = await fetch("/api/salaries/current");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse<Salary> = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch current salary");
        }

        setCurrentSalary(data.data as Salary);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch current salary";
        setError(errorMessage);
        console.error("Error fetching current salary:", err);
      } finally {
        setLoadingCurrent(false);
      }
    }

    fetchCurrentSalary();
  }, []);

  useEffect(() => {
    async function fetchSalaries() {
      try {
        setLoadingSalaries(true);
        setError(null);

        const response = await fetch("/api/salaries/my");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse<Salary> = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch salaries");
        }

        setSalaries(data.data as Salary[]);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch salaries";
        setError(errorMessage);
        console.error("Error fetching salaries:", err);
      } finally {
        setLoadingSalaries(false);
      }
    }

    fetchSalaries();
  }, []);

  const formatCurrency = (amount: string, currency: string) => {
    const numericAmount = parseFloat(amount.replace(/[^0-9.-]+/g, ""));
    return `${numericAmount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${currency}`;
  };

  const getCurrentTotal = () => {
    if (!currentSalary) return "0.00";
    const base = parseFloat(
      currentSalary.base_salary.replace(/[^0-9.-]+/g, "")
    );
    const bonus = parseFloat(currentSalary.bonus.replace(/[^0-9.-]+/g, ""));
    return (base + bonus).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">My Salaries</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>Error: {error}</p>
        </div>
      )}

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Current Salary
        </h2>
        {loadingCurrent ? (
          <div className="flex items-center justify-center py-12 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
            <div className="text-gray-600">Loading...</div>
          </div>
        ) : currentSalary ? (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-8 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Total Salary</p>
                <p className="text-5xl font-bold text-blue-900">
                  {getCurrentTotal()}
                </p>
                <p className="text-xl text-blue-700 mt-1">
                  {currentSalary.currency}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-2">Breakdown</p>
                <p className="text-lg text-gray-800">
                  Base:{" "}
                  {formatCurrency(
                    currentSalary.base_salary,
                    currentSalary.currency
                  )}
                </p>
                {parseFloat(currentSalary.bonus.replace(/[^0-9.-]+/g, "")) >
                  0 && (
                  <p className="text-lg text-green-700">
                    Bonus:{" "}
                    {formatCurrency(currentSalary.bonus, currentSalary.currency)}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
            <p className="text-gray-600">No salary information available.</p>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Salary History
        </h2>
        {loadingSalaries ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-600">Loading...</div>
          </div>
        ) : salaries.length === 0 ? (
          <p className="text-gray-600">No salary history found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {salaries.map((salary, index) => (
              <SalaryCard key={index} salary={salary} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
