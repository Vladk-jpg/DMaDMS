"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/lib/components/Button";
import Select from "@/lib/components/Select";

interface Employee {
  id: string;
  name: string;
  role: string;
  email: string;
}

interface ApiResponse {
  success: boolean;
  data?: Employee[];
  count?: number;
  total?: number;
  error?: string;
}

export default function OrganisationPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const itemsPerPage = 5;

  useEffect(() => {
    async function fetchEmployees() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/admin?page=${currentPage}&limit=${itemsPerPage}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server returned non-JSON response");
        }

        const data: ApiResponse = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch employees");
        }

        setEmployees(data.data || []);
        setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch employees";
        setError(errorMessage);
        console.error("Error fetching employees:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchEmployees();
  }, [currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push(-1);
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push(-1);
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push(-1);
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push(-2);
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handleEmployeeClick = (id: string) => {
    router.push(`/employees/${id}`);
  };

  const handleCreateRole = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const role = event.target.value;
    if (role === "admin") {
      router.push("/admin/new");
    } else if (role === "hr") {
      router.push("/hr/new");
    }
    event.target.value = "";
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Admin role assignments</h1>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading...</div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
          <p className="text-sm mt-2">
            Make sure your database is running and the connection settings are
            correct.
          </p>
        </div>
      ) : (
        <>
          {employees.length === 0 ? (
            <p className="text-gray-600">No employees found.</p>
          ) : (
            <>
              <div className="mb-4 flex justify-start">
                <Select onChange={handleCreateRole} defaultValue="">
                  <option value="" disabled>
                    Add new ...
                  </option>
                  <option value="admin">Admin</option>
                  <option value="hr">HR</option>
                </Select>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employees.map((employee) => (
                      <tr key={employee.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {employee.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {employee.role}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {employee.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex justify-center">
                          <button
                            onClick={() => handleEmployeeClick(employee.id)}
                            className="text-gray-500 hover:text-gray-700 text-xl cursor-pointer"
                          >
                            ⋯
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="px-3 py-2"
                >
                  &lt;
                </Button>
                {getPageNumbers().map((page, index) =>
                  page < 0 ? (
                    <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                      ...
                    </span>
                  ) : (
                    <Button
                      key={page}
                      variant={currentPage === page ? "primary" : "outline"}
                      onClick={() => handlePageClick(page)}
                      className="px-3 py-2 min-w-10"
                    >
                      {page}
                    </Button>
                  )
                )}
                <Button
                  variant="outline"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2"
                >
                  &gt;
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
