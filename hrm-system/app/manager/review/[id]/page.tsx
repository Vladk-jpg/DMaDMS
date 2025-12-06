"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/lib/components/Button";
import CircleImage from "@/lib/components/CircleImage";
import { EmployeeWithProfile } from "@/app/types/employee-with-profile";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export default function ReviewEmployeePage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.id as string;

  const [employee, setEmployee] = useState<EmployeeWithProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState({
    score: "",
    comments: "",
  });

  useEffect(() => {
    async function fetchEmployee() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/employees/${employeeId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch employee data");
        }

        const data: ApiResponse<EmployeeWithProfile> = await response.json();
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

    fetchEmployee();
  }, [employeeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reviewForm.score || !reviewForm.comments) {
      setError("Please fill in all fields");
      return;
    }

    const score = parseInt(reviewForm.score);
    if (score < 1 || score > 10) {
      setError("Score must be between 1 and 10");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const response = await fetch("/api/performance-reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employee_id: employeeId,
          score: score,
          comments: reviewForm.comments,
          review_date: new Date(),
        }),
      });

      const data: ApiResponse<unknown> = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to submit review");
      }

      setSuccess("Review submitted successfully!");
      setReviewForm({
        score: "",
        comments: "",
      });

      setTimeout(() => {
        router.push("/employees");
      }, 2000);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to submit review";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Performance Review</h1>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading...</div>
        </div>
      ) : error && !employee ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Error: {error}</p>
        </div>
      ) : employee ? (
        <>
          <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200">
            <div className="flex items-center gap-4">
              <CircleImage
                src={employee.picture || "/noimage.jpg"}
                alt="Profile"
                size={80}
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {employee.fullname}
                </h2>
                <p className="text-gray-600">{employee.position}</p>
                <p className="text-sm text-gray-500">{employee.department}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <p>{success}</p>
            </div>
          )}

          <div className="bg-white rounded-lg p-8 border border-gray-200">
            <h3 className="text-xl font-semibold mb-6">Submit Review</h3>

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={reviewForm.score}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, score: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter score between 1 and 10"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    1 = Poor, 10 = Excellent
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comments
                  </label>
                  <textarea
                    value={reviewForm.comments}
                    onChange={(e) =>
                      setReviewForm({
                        ...reviewForm,
                        comments: e.target.value,
                      })
                    }
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Enter your detailed review comments here..."
                    required
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? "Submitting..." : "Submit Review"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/employees")}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </>
      ) : (
        <div className="text-gray-600">Employee not found.</div>
      )}
    </div>
  );
}
