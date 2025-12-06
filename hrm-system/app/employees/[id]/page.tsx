"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import InfoField from "@/lib/components/InfoField";
import Button from "@/lib/components/Button";
import CircleImage from "@/lib/components/CircleImage";
import { EmployeeWithProfile } from "@/app/types/employee-with-profile";
import { Leave } from "@/app/types/leave";
import { PerformanceReview } from "@/app/types/performance-review";
import { AttendanceStatistics } from "@/app/types/attendance-statistics";

interface ApiResponse {
  success: boolean;
  data?: EmployeeWithProfile;
  error?: string;
}

interface LeavesApiResponse {
  success: boolean;
  data?: Leave[];
  error?: string;
}

interface ReviewsApiResponse {
  success: boolean;
  data?: PerformanceReview[];
  error?: string;
}

interface StatisticsApiResponse {
  success: boolean;
  data?: AttendanceStatistics;
  error?: string;
}

export default function EmployeeProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState<EmployeeWithProfile | null>(null);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [statistics, setStatistics] = useState<AttendanceStatistics | null>(
    null
  );
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [employeeResponse, leavesResponse, profileResponse] =
          await Promise.all([
            fetch(`/api/employees/${params.id}`),
            fetch(`/api/leaves/employee/${params.id}?status=approved`),
            fetch("/api/profile"),
          ]);

        if (!employeeResponse.ok) {
          throw new Error(`HTTP error! status: ${employeeResponse.status}`);
        }

        const employeeContentType =
          employeeResponse.headers.get("content-type");
        if (
          !employeeContentType ||
          !employeeContentType.includes("application/json")
        ) {
          throw new Error("Server returned non-JSON response");
        }

        const employeeData: ApiResponse = await employeeResponse.json();

        if (!employeeData.success) {
          throw new Error(employeeData.error || "Failed to fetch employee");
        }

        setEmployee(employeeData.data || null);

        if (leavesResponse.ok) {
          const leavesData: LeavesApiResponse = await leavesResponse.json();
          if (leavesData.success && leavesData.data) {
            setLeaves(leavesData.data);
          }
        }

        if (profileResponse.ok) {
          const profileData: ApiResponse = await profileResponse.json();
          if (profileData.success && profileData.data) {
            setCurrentUserRole(profileData.data.role || null);

            // Fetch reviews and statistics only if user role is not Employee
            if (profileData.data.role !== "Employee") {
              const reviewsResponse = await fetch(
                `/api/performance-reviews/employee/${params.id}`
              );

              if (reviewsResponse.ok) {
                const reviewsData: ReviewsApiResponse =
                  await reviewsResponse.json();
                if (reviewsData.success && reviewsData.data) {
                  setReviews(reviewsData.data);
                }
              }
            }
          }
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch data";
        setError(errorMessage);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  useEffect(() => {
    async function fetchStatistics() {
      if (!currentUserRole || currentUserRole === "Employee" || !params.id) {
        return;
      }

      try {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        const statisticsResponse = await fetch(
          `/api/attendances/statistics?employee_id=${params.id}&year=${currentYear}&month=${currentMonth}`
        );

        if (statisticsResponse.ok) {
          const statisticsData: StatisticsApiResponse =
            await statisticsResponse.json();
          if (statisticsData.success && statisticsData.data) {
            setStatistics(statisticsData.data);
          }
        }
      } catch (err: unknown) {
        console.error("Error fetching statistics:", err);
      }
    }

    fetchStatistics();
  }, [currentUserRole, params.id]);

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
        <>
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
              <InfoField
                label="Status"
                value={getStatusLabel(employee.status)}
              />
              <InfoField
                label="Hire Date"
                value={formatDate(employee.hiredate)}
              />
              <InfoField
                label="Birth Date"
                value={formatDate(employee.birthdate)}
              />
              <InfoField label="Department" value={employee.department} />
              <InfoField label="Position" value={employee.position} />
              <InfoField label="Role" value={employee.role} />
            </div>
          </div>

          <div className="bg-white rounded-lg p-8 mt-8 max-w-4xl">
            <h2 className="text-2xl font-bold mb-6">Approved Leaves</h2>
            {leaves.length > 0 ? (
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
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leaves.map((leave, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {leave.leave_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(leave.start_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(leave.end_date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600">No approved leaves found.</p>
            )}
          </div>

          {currentUserRole && currentUserRole !== "Employee" && (
            <>
              <div className="bg-white rounded-lg p-8 mt-8 max-w-4xl">
                <h2 className="text-2xl font-bold mb-6">
                  Attendance Statistics (Current Month)
                </h2>
                {statistics &&
                statistics.average_per_day != null &&
                statistics.sum_of_month != null &&
                !isNaN(Number(statistics.average_per_day)) &&
                !isNaN(Number(statistics.sum_of_month)) ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-gray-200 rounded-lg p-6 bg-blue-50">
                      <div className="text-sm text-gray-600 mb-2">
                        Average Hours Per Day
                      </div>
                      <div className="text-3xl font-bold text-blue-600">
                        {Number(statistics.average_per_day).toFixed(2)}h
                      </div>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-6 bg-green-50">
                      <div className="text-sm text-gray-600 mb-2">
                        Total Hours This Month
                      </div>
                      <div className="text-3xl font-bold text-green-600">
                        {Number(statistics.sum_of_month).toFixed(2)}h
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">
                    No attendance statistics available for the current month.
                  </p>
                )}
              </div>

              <div className="bg-white rounded-lg p-8 mt-8 max-w-4xl">
                <h2 className="text-2xl font-bold mb-6">Performance Reviews</h2>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-4">
                            <span className="text-2xl font-bold text-blue-600">
                              {review.score}/10
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatDate(review.review_date)}
                            </span>
                          </div>
                          {review.reviewer_name && (
                            <span className="text-sm text-gray-600">
                              by {review.reviewer_name}
                            </span>
                          )}
                        </div>
                        {review.comments && (
                          <p className="text-gray-700 mt-2">
                            {review.comments}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No performance reviews found.</p>
                )}
              </div>
            </>
          )}
        </>
      ) : (
        <div className="text-gray-600">Employee not found.</div>
      )}
    </div>
  );
}
