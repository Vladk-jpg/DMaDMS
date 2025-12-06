"use client";

import { useState, useEffect, useCallback } from "react";
import Modal from "@/lib/components/Modal";
import { Attendance } from "../types/attendance";

interface AttendanceMap {
  [key: string]: Attendance;
}

export default function TimesheetPage() {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [attendances, setAttendances] = useState<AttendanceMap>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [workedHours, setWorkedHours] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAttendanceId, setSelectedAttendanceId] = useState<
    string | null
  >(null);

  useEffect(() => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 6);

    setStartDate(formatDateForInput(weekAgo));
    setEndDate(formatDateForInput(today));
  }, []);

  const fetchAttendances = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const userResponse = await fetch("/api/profile");
      if (!userResponse.ok) {
        throw new Error("Failed to fetch user profile");
      }
      const userData = await userResponse.json();
      const employeeId = userData.data.id;

      const response = await fetch(
        `/api/attendances/range?employee_id=${employeeId}&start_date=${startDate}&end_date=${endDate}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch attendances");
      }
      console.log(data);

      const attendanceMap: AttendanceMap = {};
      (data.data || []).forEach((attendance: Attendance) => {
        attendanceMap[attendance.date] = attendance;
      });

      setAttendances(attendanceMap);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch attendances";
      setError(errorMessage);
      console.error("Error fetching attendances:", err);
    } finally {
      setLoading(false);
    }
  }, [endDate, startDate]);

  useEffect(() => {
    if (startDate && endDate) {
      fetchAttendances();
    }
  }, [startDate, endDate, fetchAttendances]);

  function formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function parseDateLocal(dateString: string): Date {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function formatDateDisplay(dateString: string): string {
    const date = parseDateLocal(dateString);
    return date.toLocaleDateString();
  }

  function getDatesInRange(): string[] {
    const dates: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(formatDateForInput(d));
    }

    return dates;
  }

  function handleCellClick(date: string) {
    const attendance = attendances[date];
    setSelectedDate(date);

    if (attendance) {
      setIsEditing(true);
      setWorkedHours(attendance.worked_hours);
      setSelectedAttendanceId(attendance.id);
    } else {
      setIsEditing(false);
      setWorkedHours(0);
      setSelectedAttendanceId(null);
    }

    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setSelectedDate("");
    setWorkedHours(0);
    setIsEditing(false);
    setSelectedAttendanceId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const userResponse = await fetch("/api/profile");
      if (!userResponse.ok) {
        throw new Error("Failed to fetch user profile");
      }
      const userData = await userResponse.json();
      const employeeId = userData.data.id;

      if (isEditing && selectedAttendanceId) {
        const response = await fetch(
          `/api/attendances/${selectedAttendanceId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              worked_hours: workedHours,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update attendance");
        }
      } else {
        const response = await fetch("/api/attendances", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employee_id: employeeId,
            date: selectedDate,
            worked_hours: workedHours,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create attendance");
        }
      }

      closeModal();
      fetchAttendances();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save attendance";
      alert(errorMessage);
      console.error("Error saving attendance:", err);
    }
  }

  const dates = getDatesInRange();

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Timesheet</h1>

      <div className="mb-6 flex gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading...</div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-xl overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Day
                </th>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours Worked
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dates.map((date) => {
                const attendance = attendances[date];
                const dateObj = parseDateLocal(date);
                const dayName = dateObj.toLocaleDateString("en-US", {
                  weekday: "long",
                });

                return (
                  <tr
                    key={date}
                    onClick={() => handleCellClick(date)}
                    className="hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateDisplay(date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {dayName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {attendance ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          {attendance.worked_hours} hours
                        </span>
                      ) : (
                        <span className="text-gray-400">No entry</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={isEditing ? "Edit Time Entry" : "Track Time"}
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="text"
              value={selectedDate ? formatDateDisplay(selectedDate) : ""}
              disabled
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-600"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hours Worked
            </label>
            <input
              type="number"
              min="0"
              max="24"
              step="1"
              value={workedHours}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                setWorkedHours(isNaN(value) ? 0 : value);
              }}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isEditing ? "Update" : "Save"}
            </button>
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
