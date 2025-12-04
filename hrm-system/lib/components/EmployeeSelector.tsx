"use client";

import { useState, useEffect, useCallback } from "react";
import { PartialEmployee } from "@/app/types/partial-employee";
import Input from "./Input";
import Button from "./Button";

interface EmployeeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (employee: PartialEmployee) => void;
  selectedEmployeeId?: string;
}

export default function EmployeeSelector({
  isOpen,
  onClose,
  onSelect,
  selectedEmployeeId,
}: EmployeeSelectorProps) {
  const [employees, setEmployees] = useState<PartialEmployee[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 10;

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) {
        params.append("search", search);
      }

      const response = await fetch(`/api/employees?${params}`);
      const data = await response.json();

      if (data.success) {
        setEmployees(data.data);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
    }
  }, [isOpen, search, page, fetchEmployees]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleSelect = (employee: PartialEmployee) => {
    onSelect(employee);
    onClose();
  };

  const totalPages = Math.ceil(total / limit);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-gray">
          <h2 className="text-2xl font-bold mb-4">Select Employee</h2>
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={handleSearchChange}
            className="w-full"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : employees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No employees found
            </div>
          ) : (
            <div className="space-y-2">
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  onClick={() => handleSelect(employee)}
                  className={`p-4 rounded-md border cursor-pointer transition-colors ${
                    employee.id === selectedEmployeeId
                      ? "border-primary bg-primary/5"
                      : "border-gray hover:bg-gray"
                  }`}
                >
                  <div className="font-medium">{employee.name}</div>
                  <div className="text-sm text-gray-500">{employee.email}</div>
                  <div className="text-sm text-gray-500">Role: {employee.role}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              &lt;
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              &gt;
            </Button>
          </div>
          <div className="text-sm text-gray-600">
            Page {page} of {totalPages || 1} (total: {total})
          </div>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
