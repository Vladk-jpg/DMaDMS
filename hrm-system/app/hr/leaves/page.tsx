"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Button from "@/lib/components/Button";
import { LeaveWithProfile } from "@/app/types/leave-with-profile";

interface ApiResponse {
  success: boolean;
  data?: LeaveWithProfile[];
  error?: string;
  message?: string;
}

export default function HRLeavesPage() {
  const [leaves, setLeaves] = useState<LeaveWithProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaves();
  }, []);

  async function fetchLeaves() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/leaves/pending");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }

      const data: ApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch pending leaves");
      }

      setLeaves(data.data || []);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch pending leaves";
      setError(errorMessage);
      console.error("Error fetching pending leaves:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(leaveId: string, status: "approved" | "rejected") {
    try {
      setProcessingId(leaveId);
      setError(null);

      const response = await fetch(`/api/leaves/${leaveId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Failed to ${status} leave`);
      }

      await fetchLeaves();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : `Failed to ${status} leave`;
      setError(errorMessage);
      console.error(`Error ${status} leave:`, err);
    } finally {
      setProcessingId(null);
    }
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Pending Leave Requests</h1>
        {!loading && !error && (
          <span className="text-sm text-gray-600">
            Total: {leaves.length} pending requests
          </span>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Error: {error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading...</div>
        </div>
      ) : (
        <>
          {leaves.length === 0 ? (
            <p className="text-gray-600">No pending leave requests found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-xl">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Leave Type
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End Date
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaves.map((leave) => (
                    <tr key={leave.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <Link
                          href={`/employees/${leave.employee_id}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {leave.fullname}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {leave.leave_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(leave.start_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(leave.end_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            onClick={() => handleStatusChange(leave.id, "approved")}
                            disabled={processingId === leave.id}
                            className="px-3 py-1 text-sm"
                          >
                            {processingId === leave.id ? "Processing..." : "Approve"}
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => handleStatusChange(leave.id, "rejected")}
                            disabled={processingId === leave.id}
                            className="px-3 py-1 text-sm"
                          >
                            {processingId === leave.id ? "Processing..." : "Reject"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}