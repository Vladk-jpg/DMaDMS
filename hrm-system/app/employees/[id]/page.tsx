"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import InfoField from "@/lib/components/InfoField";
import Button from "@/lib/components/Button";
import CircleImage from "@/lib/components/CircleImage";
import { EmployeeWithProfile } from "@/app/types/employee-with-profile";

interface ApiResponse {
  success: boolean;
  data?: EmployeeWithProfile;
  error?: string;
}

export default function EmployeeProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState<EmployeeWithProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEmployee() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/employees/${params.id}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server returned non-JSON response");
        }

        const data: ApiResponse = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch employee");
        }

        setEmployee(data.data || null);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch employee";
        setError(errorMessage);
        console.error("Error fetching employee:", err);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchEmployee();
    }
  }, [params.id]);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      working: "Working",
      fired: "Fired",
      probation: "Probation",
      vacation: "Vacation",
      idle: "Idle",
      bench: "Bench",
    };
    return statusLabels[status] || status;
  };

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Employee Profile</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading...</div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
          <p className="text-sm mt-2">
            Make sure the employee exists and try again.
          </p>
        </div>
      ) : employee ? (
        <div className="bg-white rounded-lg p-8 max-w-4xl">
          <div className="flex flex-col items-center mb-8 pb-8 border-b border-gray">
            <CircleImage
              src={employee.picture || "/noimage.jpg"}
              alt="Profile"
              size={128}
              className="mb-4"
            />
            <h2 className="text-xl font-semibold">{employee.fullname}</h2>
            <p className="text-gray-600">{employee.position}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoField label="Full Name" value={employee.fullname} />
            <InfoField label="Email" value={employee.email} />
            <InfoField label="Phone Number" value={employee.phone} />
            <InfoField label="Status" value={getStatusLabel(employee.status)} />
            <InfoField label="Hire Date" value={formatDate(employee.hiredate)} />
            <InfoField label="Birth Date" value={formatDate(employee.birthdate)} />
            <InfoField label="Department" value={employee.department} />
            <InfoField label="Position" value={employee.position} />
            <InfoField label="Role" value={employee.role} />
          </div>
        </div>
      ) : (
        <div className="text-gray-600">Employee not found.</div>
      )}
    </div>
  );
}
