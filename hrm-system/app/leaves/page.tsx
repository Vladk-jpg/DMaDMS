"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/lib/components/Button";
import Modal from "@/lib/components/Modal";
import Input from "@/lib/components/Input";
import Select from "@/lib/components/Select";
import { Leave } from "@/app/types/leave";
import { LeaveType } from "@/models/enums";

interface LeavesApiResponse {
  success: boolean;
  data?: Leave[];
  error?: string;
  message?: string;
}

interface ProfileApiResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
  };
  error?: string;
}

export default function LeavesPage() {
  const router = useRouter();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [newLeaveForm, setNewLeaveForm] = useState({
    leave_type: "",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    fetchCurrentUserAndLeaves();
  }, []);

  const fetchCurrentUserAndLeaves = async () => {
    try {
      setLoading(true);
      setError(null);

      const profileResponse = await fetch("/api/profile/micro");
      if (!profileResponse.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const profileData: ProfileApiResponse = await profileResponse.json();
      if (!profileData.success || !profileData.data) {
        throw new Error("Failed to get user profile");
      }

      const userId = profileData.data.id;
      setCurrentUserId(userId);

      const leavesResponse = await fetch(`/api/leaves/employee/${userId}`);
      if (!leavesResponse.ok) {
        throw new Error("Failed to fetch leaves");
      }

      const leavesData: LeavesApiResponse = await leavesResponse.json();
      if (leavesData.success && leavesData.data) {
        setLeaves(leavesData.data);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch data";
      setError(errorMessage);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };

    const statusLabels: Record<string, string> = {
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          statusColors[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {statusLabels[status] || status}
      </span>
    );
  };

  const getLeaveTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      vacation: "Vacation",
      sick_day: "Sick Day",
      unpaid: "Unpaid Leave",
    };
    return labels[type] || type;
  };

  const handleOpenModal = () => {
    setNewLeaveForm({
      leave_type: "",
      start_date: "",
      end_date: "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewLeaveForm({
      leave_type: "",
      start_date: "",
      end_date: "",
    });
  };

  const handleSubmitLeave = async () => {
    if (!currentUserId) {
      setError("User not identified");
      return;
    }

    if (!newLeaveForm.leave_type || !newLeaveForm.start_date || !newLeaveForm.end_date) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const response = await fetch("/api/leaves", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employee_id: currentUserId,
          leave_type: newLeaveForm.leave_type,
          start_date: newLeaveForm.start_date,
          end_date: newLeaveForm.end_date,
        }),
      });

      const data: LeavesApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to create leave request");
      }

      setSuccess("Leave request created successfully!");
      setTimeout(() => setSuccess(null), 3000);
      handleCloseModal();
      fetchCurrentUserAndLeaves();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create leave request";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Leave Requests</h1>
        <div className="flex gap-2">
          <Button
            variant="primaryOutline"
            onClick={() => router.push("/hr/leaves")}
          >
            Manage Leaves
          </Button>
          <Button variant="primary" onClick={handleOpenModal}>
            Request Leave
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading...</div>
        </div>
      ) : leaves.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-gray-600">No leave requests found.</p>
          <p className="text-sm text-gray-500 mt-2">
            Click &quot;Request Leave&quot; to create your first request.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-xl">
            <thead className="bg-gray-50">
              <tr>
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
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaves.map((leave, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getLeaveTypeLabel(leave.leave_type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(leave.start_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(leave.end_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getStatusBadge(leave.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Request Leave"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Leave Type
            </label>
            <Select
              value={newLeaveForm.leave_type}
              onChange={(e) =>
                setNewLeaveForm({ ...newLeaveForm, leave_type: e.target.value })
              }
              required
              className="w-full"
            >
              <option value="">Select leave type</option>
              <option value={LeaveType.vacation}>Vacation</option>
              <option value={LeaveType.sick_day}>Sick Day</option>
              <option value={LeaveType.unpaid}>Unpaid Leave</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <Input
              type="date"
              value={newLeaveForm.start_date}
              onChange={(e) =>
                setNewLeaveForm({ ...newLeaveForm, start_date: e.target.value })
              }
              required
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <Input
              type="date"
              value={newLeaveForm.end_date}
              onChange={(e) =>
                setNewLeaveForm({ ...newLeaveForm, end_date: e.target.value })
              }
              required
              className="w-full"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSubmitLeave}
              variant="primary"
              disabled={submitting}
              className="flex-1"
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
            <Button
              variant="outline"
              onClick={handleCloseModal}
              disabled={submitting}
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
