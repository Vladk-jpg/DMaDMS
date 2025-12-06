"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Button from "@/lib/components/Button";
import Modal from "@/lib/components/Modal";

interface Department {
  id: string;
  name: string;
  description?: string | null;
  head_id?: string | null;
  head_name?: string | null;
}

interface ApiResponse {
  success: boolean;
  data?: Department[];
  count?: number;
  total?: number;
  error?: string;
  message?: string;
}

export default function DepartmentsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [departmentToDelete, setDepartmentToDelete] =
    useState<Department | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchDepartments() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/departments?page=${currentPage}&limit=${itemsPerPage}`
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
          throw new Error(data.error || "Failed to fetch departments");
        }

        setDepartments(data.data || []);
        setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch departments";
        setError(errorMessage);
        console.error("Error fetching departments:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDepartments();
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

  const canDeleteDepartment = () => {
    const role = session?.user?.role;
    return role === "HR" || role === "Admin";
  };

  const handleDeleteClick = (department: Department) => {
    setDepartmentToDelete(department);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!departmentToDelete) return;

    try {
      setDeleting(true);
      setError(null);

      const response = await fetch(`/api/departments/${departmentToDelete.id}`, {
        method: "DELETE",
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to delete department");
      }

      setSuccess("Department deleted successfully!");
      setTimeout(() => setSuccess(null), 3000);

      // Refresh departments list
      const newResponse = await fetch(
        `/api/departments?page=${currentPage}&limit=${itemsPerPage}`
      );
      const newData: ApiResponse = await newResponse.json();

      if (newData.success && newData.data) {
        setDepartments(newData.data);
        setTotalPages(Math.ceil((newData.total || 0) / itemsPerPage));

        // If current page is empty and not the first page, go to previous page
        if (newData.data.length === 0 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        }
      }

      setShowDeleteModal(false);
      setDepartmentToDelete(null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete department";
      setError(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDepartmentToDelete(null);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Departments</h1>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>{success}</p>
        </div>
      )}

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
          {departments.length === 0 ? (
            <p className="text-gray-600">No departments found.</p>
          ) : (
            <>
              <div className="mb-4 flex justify-start">
                <Button
                  variant="primary"
                  onClick={() => router.push("/hr/departments/new")}
                >
                  Create new
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department Head
                      </th>
                      {canDeleteDepartment() && (
                        <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {departments.map((department) => (
                      <tr key={department.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {department.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {department.description || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {department.head_id && department.head_name ? (
                            <a
                              href={`/employees/${department.head_id}`}
                              className="text-primary hover:underline cursor-pointer"
                            >
                              {department.head_name}
                            </a>
                          ) : (
                            <span className="text-gray-400">No head assigned</span>
                          )}
                        </td>
                        {canDeleteDepartment() && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Button
                              variant="danger"
                              onClick={() => handleDeleteClick(department)}
                              className="px-3 py-1 text-xs"
                            >
                              Delete
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
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
              )}
            </>
          )}
        </>
      )}

      <Modal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        title="Delete Department"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete this department? This action cannot
            be undone.
          </p>
          {departmentToDelete && (
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-gray-900 font-semibold">
                Department: {departmentToDelete.name}
              </p>
              {departmentToDelete.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {departmentToDelete.description}
                </p>
              )}
            </div>
          )}
          <div className="flex gap-2 pt-4">
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="flex-1"
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              disabled={deleting}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}