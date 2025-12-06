"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import InfoField from "@/lib/components/InfoField";
import Button from "@/lib/components/Button";
import CircleImage from "@/lib/components/CircleImage";
import Modal from "@/lib/components/Modal";
import { EmployeeWithProfile } from "@/app/types/employee-with-profile";
import { Salary } from "@/app/types/salary";
import { PerformanceReview } from "@/app/types/performance-review";
import { EmployeeStatus } from "@/models/enums";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface Department {
  id: string;
  name: string;
}

interface Position {
  id: string;
  name: string;
}

interface Role {
  id: string;
  name: string;
}

interface Currency {
  id: string;
  code: string;
  name: string;
}

export default function HREmployeePage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [employee, setEmployee] = useState<EmployeeWithProfile | null>(null);
  const [previousMonthSalary, setPreviousMonthSalary] =
    useState<Salary | null>(null);
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isEditingSalary, setIsEditingSalary] = useState<boolean>(false);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  const [employeeForm, setEmployeeForm] = useState({
    email: "",
    phone: "",
    address: "",
    iban: "",
    passportnumber: "",
    department_id: "",
    position_id: "",
    user_role_id: "",
    first_name: "",
    second_name: "",
    middle_name: "",
    birth_date: "",
    hire_date: "",
    status: "",
  });

  const [salaryForm, setSalaryForm] = useState({
    base_salary: "",
    bonus: "",
    currency_id: "",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [
          employeeRes,
          salaryRes,
          reviewsRes,
          departmentsRes,
          positionsRes,
          rolesRes,
          currenciesRes,
        ] = await Promise.all([
          fetch(`/api/employees/${employeeId}`),
          fetch(`/api/salaries/previous-month/${employeeId}`),
          fetch(`/api/performance-reviews/employee/${employeeId}`),
          fetch("/api/departments"),
          fetch("/api/positions"),
          fetch("/api/roles"),
          fetch("/api/currencies"),
        ]);

        if (!employeeRes.ok) {
          throw new Error("Failed to fetch employee data");
        }

        const employeeData: ApiResponse<EmployeeWithProfile> =
          await employeeRes.json();
        if (!employeeData.success) {
          throw new Error(employeeData.error || "Failed to fetch employee");
        }

        const emp = employeeData.data!;
        setEmployee(emp);
        setEmployeeForm({
          email: emp.email || "",
          phone: emp.phone || "",
          address: emp.address || "",
          iban: emp.iban || "",
          passportnumber: emp.passportnumber || "",
          department_id: emp.department_id || "",
          position_id: emp.position_id || "",
          user_role_id: emp.user_role_id || "",
          first_name: emp.first_name || "",
          second_name: emp.second_name || "",
          middle_name: emp.middle_name || "",
          birth_date: emp.birthdate
            ? new Date(emp.birthdate).toISOString().split("T")[0]
            : "",
          hire_date: emp.hiredate
            ? new Date(emp.hiredate).toISOString().split("T")[0]
            : "",
          status: emp.status || "",
        });

        if (salaryRes.ok) {
          const salaryData: ApiResponse<Salary> = await salaryRes.json();
          if (salaryData.success && salaryData.data) {
            setPreviousMonthSalary(salaryData.data as Salary);
          }
        }

        if (reviewsRes.ok) {
          const reviewsData: ApiResponse<PerformanceReview[]> =
            await reviewsRes.json();
          if (reviewsData.success) {
            setReviews((reviewsData.data as PerformanceReview[]) || []);
          }
        }

        if (departmentsRes.ok) {
          const deptData: ApiResponse<Department[]> =
            await departmentsRes.json();
          if (deptData.success) {
            setDepartments((deptData.data as Department[]) || []);
          }
        }

        if (positionsRes.ok) {
          const posData: ApiResponse<Position[]> = await positionsRes.json();
          if (posData.success) {
            setPositions((posData.data as Position[]) || []);
          }
        }

        if (rolesRes.ok) {
          const roleData: ApiResponse<Role[]> = await rolesRes.json();
          if (roleData.success) {
            setRoles((roleData.data as Role[]) || []);
          }
        }

        if (currenciesRes.ok) {
          const currData: ApiResponse<Currency[]> = await currenciesRes.json();
          if (currData.success) {
            setCurrencies((currData.data as Currency[]) || []);
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

    fetchData();
  }, [employeeId]);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: string, currency: string) => {
    const numericAmount = parseFloat(amount.replace(/[^0-9.-]+/g, ""));
    return `${numericAmount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${currency}`;
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

  const getPreviousMonthLabel = () => {
    const now = new Date();
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return previousMonth.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit");
      return;
    }

    try {
      setUploadLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("picture", file);

      const response = await fetch(`/api/employees/${employeeId}/picture`, {
        method: "POST",
        body: formData,
      });

      const data: ApiResponse<{ pictureUrl: string }> = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to upload picture");
      }

      if (employee && data.data) {
        setEmployee({
          ...employee,
          picture: data.data.pictureUrl,
        });
      }

      setSuccess("Picture updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upload picture";
      setError(errorMessage);
    } finally {
      setUploadLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleEditEmployee = () => {
    setIsEditing(true);
  };

  const handleSaveEmployee = async () => {
    try {
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/employees/${employeeId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: employeeForm.email,
          phone: employeeForm.phone,
          address: employeeForm.address,
          iban: employeeForm.iban,
          passportNumber: employeeForm.passportnumber,
          departmentId: employeeForm.department_id,
          positionId: employeeForm.position_id,
          userRoleId: employeeForm.user_role_id,
          firstName: employeeForm.first_name,
          secondName: employeeForm.second_name,
          middleName: employeeForm.middle_name,
          birthDate: new Date(employeeForm.birth_date),
          hireDate: new Date(employeeForm.hire_date),
          status: employeeForm.status,
        }),
      });

      const data: ApiResponse<unknown> = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to update employee");
      }

      const updatedEmployeeRes = await fetch(`/api/employees/${employeeId}`);
      const updatedEmployeeData: ApiResponse<EmployeeWithProfile> =
        await updatedEmployeeRes.json();
      if (updatedEmployeeData.success && updatedEmployeeData.data) {
        setEmployee(updatedEmployeeData.data);
      }

      setIsEditing(false);
      setSuccess("Employee updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update employee";
      setError(errorMessage);
    }
  };

  const handleEditSalary = () => {
    if (previousMonthSalary) {
      setSalaryForm({
        base_salary: previousMonthSalary.base_salary.replace(/[^0-9.-]+/g, ""),
        bonus: previousMonthSalary.bonus.replace(/[^0-9.-]+/g, ""),
        currency_id: previousMonthSalary.currency_id || "",
      });
    } else {
      setSalaryForm({
        base_salary: "",
        bonus: "0",
        currency_id: "",
      });
    }
    setIsEditingSalary(true);
  };

  const handleSaveSalary = async () => {
    try {
      setError(null);
      setSuccess(null);

      if (!salaryForm.base_salary || !salaryForm.currency_id) {
        setError("Base salary and currency are required");
        return;
      }

      const now = new Date();
      const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      if (previousMonthSalary) {
        const response = await fetch(
          `/api/salaries/${previousMonthSalary.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              base_salary: parseFloat(salaryForm.base_salary),
              bonus: parseFloat(salaryForm.bonus || "0"),
              currency_id: salaryForm.currency_id,
            }),
          }
        );

        const data: ApiResponse<unknown> = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to update salary");
        }
      } else {
        const response = await fetch("/api/salaries", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employee_id: employeeId,
            base_salary: parseFloat(salaryForm.base_salary),
            bonus: parseFloat(salaryForm.bonus || "0"),
            salary_date: previousMonth,
            currency_id: salaryForm.currency_id,
          }),
        });

        const data: ApiResponse<unknown> = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to create salary");
        }
      }

      const newSalaryRes = await fetch(
        `/api/salaries/previous-month/${employeeId}`
      );
      const newSalaryData: ApiResponse<Salary> = await newSalaryRes.json();
      if (newSalaryData.success && newSalaryData.data) {
        setPreviousMonthSalary(newSalaryData.data as Salary);
      }

      setIsEditingSalary(false);
      setSuccess("Salary saved successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save salary";
      setError(errorMessage);
    }
  };

  const handleDeleteEmployee = async () => {
    try {
      setIsDeleting(true);
      setError(null);

      const response = await fetch(`/api/employees/${employeeId}`, {
        method: "DELETE",
      });

      const data: ApiResponse<unknown> = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to delete employee");
      }

      router.push("/employees");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete employee";
      setError(errorMessage);
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Employee Details</h1>
        <div className="flex gap-2">
          <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
            Delete Employee
          </Button>
          <Button variant="outline" onClick={() => router.push("/employees")}>
            Back to Employees
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading...</div>
        </div>
      ) : error && !employee ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Error: {error}</p>
        </div>
      ) : null}

      {error && employee && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Error: {error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>{success}</p>
        </div>
      )}

      {employee && (
        <>
          <div className="bg-white rounded-lg p-8 mb-8">
            <div className="flex flex-col items-center mb-8 pb-8 border-b border-gray">
              <CircleImage
                src={employee.picture || "/noimage.jpg"}
                alt="Profile"
                size={128}
                className="mb-4"
              />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {employee.fullname}
              </h2>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                variant="primaryOutline"
                onClick={handleFileSelect}
                disabled={uploadLoading}
              >
                {uploadLoading ? "Uploading..." : "Update Picture"}
              </Button>
            </div>

            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Employee Information</h3>
              {!isEditing ? (
                <Button onClick={handleEditEmployee}>Edit Employee</Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSaveEmployee}>Save</Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            {!isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoField label="First Name" value={employee.first_name} />
                <InfoField label="Second Name" value={employee.second_name} />
                <InfoField label="Middle Name" value={employee.middle_name} />
                <InfoField label="Email" value={employee.email} />
                <InfoField label="Phone Number" value={employee.phone} />
                <InfoField label="Address" value={employee.address} />
                <InfoField
                  label="Status"
                  value={getStatusLabel(employee.status)}
                />
                <InfoField
                  label="Passport Number"
                  value={employee.passportnumber}
                />
                <InfoField
                  label="Hire Date"
                  value={formatDate(employee.hiredate)}
                />
                <InfoField
                  label="Birth Date"
                  value={formatDate(employee.birthdate)}
                />
                <InfoField label="IBAN" value={employee.iban} />
                <InfoField label="Department" value={employee.department} />
                <InfoField label="Position" value={employee.position} />
                <InfoField label="Role" value={employee.role} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={employeeForm.first_name}
                    onChange={(e) =>
                      setEmployeeForm({
                        ...employeeForm,
                        first_name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Second Name
                  </label>
                  <input
                    type="text"
                    value={employeeForm.second_name}
                    onChange={(e) =>
                      setEmployeeForm({
                        ...employeeForm,
                        second_name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    value={employeeForm.middle_name}
                    onChange={(e) =>
                      setEmployeeForm({
                        ...employeeForm,
                        middle_name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={employeeForm.email}
                    onChange={(e) =>
                      setEmployeeForm({ ...employeeForm, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={employeeForm.phone}
                    onChange={(e) =>
                      setEmployeeForm({ ...employeeForm, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={employeeForm.address}
                    onChange={(e) =>
                      setEmployeeForm({
                        ...employeeForm,
                        address: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={employeeForm.status}
                    onChange={(e) =>
                      setEmployeeForm({
                        ...employeeForm,
                        status: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Status</option>
                    {Object.values(EmployeeStatus).map((status) => (
                      <option key={status} value={status}>
                        {getStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passport Number
                  </label>
                  <input
                    type="text"
                    value={employeeForm.passportnumber}
                    onChange={(e) =>
                      setEmployeeForm({
                        ...employeeForm,
                        passportnumber: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IBAN
                  </label>
                  <input
                    type="text"
                    value={employeeForm.iban}
                    onChange={(e) =>
                      setEmployeeForm({ ...employeeForm, iban: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Birth Date
                  </label>
                  <input
                    type="date"
                    value={employeeForm.birth_date}
                    onChange={(e) =>
                      setEmployeeForm({
                        ...employeeForm,
                        birth_date: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hire Date
                  </label>
                  <input
                    type="date"
                    value={employeeForm.hire_date}
                    onChange={(e) =>
                      setEmployeeForm({
                        ...employeeForm,
                        hire_date: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <select
                    value={employeeForm.department_id}
                    onChange={(e) =>
                      setEmployeeForm({
                        ...employeeForm,
                        department_id: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position
                  </label>
                  <select
                    value={employeeForm.position_id}
                    onChange={(e) =>
                      setEmployeeForm({
                        ...employeeForm,
                        position_id: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Position</option>
                    {positions.map((pos) => (
                      <option key={pos.id} value={pos.id}>
                        {pos.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={employeeForm.user_role_id}
                    onChange={(e) =>
                      setEmployeeForm({
                        ...employeeForm,
                        user_role_id: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                Salary for {getPreviousMonthLabel()}
              </h2>
              <Button onClick={handleEditSalary}>
                {previousMonthSalary ? "Edit Salary" : "Create Salary"}
              </Button>
            </div>

            {previousMonthSalary ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InfoField
                  label="Base Salary"
                  value={formatCurrency(
                    previousMonthSalary.base_salary,
                    previousMonthSalary.currency
                  )}
                />
                <InfoField
                  label="Bonus"
                  value={formatCurrency(
                    previousMonthSalary.bonus,
                    previousMonthSalary.currency
                  )}
                />
                <InfoField
                  label="Total"
                  value={formatCurrency(
                    (
                      parseFloat(
                        previousMonthSalary.base_salary.replace(/[^0-9.-]+/g, "")
                      ) +
                      parseFloat(
                        previousMonthSalary.bonus.replace(/[^0-9.-]+/g, "")
                      )
                    ).toString(),
                    previousMonthSalary.currency
                  )}
                />
              </div>
            ) : (
              <p className="text-gray-600">
                No salary information available for {getPreviousMonthLabel()}.
              </p>
            )}
          </div>

          <div className="bg-white rounded-lg p-8">
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
                      <p className="text-gray-700 mt-2">{review.comments}</p>
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

      <Modal
        isOpen={isEditingSalary}
        onClose={() => setIsEditingSalary(false)}
        title={
          previousMonthSalary
            ? `Edit Salary for ${getPreviousMonthLabel()}`
            : `Create Salary for ${getPreviousMonthLabel()}`
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Base Salary
            </label>
            <input
              type="number"
              step="0.01"
              value={salaryForm.base_salary}
              onChange={(e) =>
                setSalaryForm({ ...salaryForm, base_salary: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter base salary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bonus
            </label>
            <input
              type="number"
              step="0.01"
              value={salaryForm.bonus}
              onChange={(e) =>
                setSalaryForm({ ...salaryForm, bonus: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter bonus amount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              value={salaryForm.currency_id}
              onChange={(e) =>
                setSalaryForm({ ...salaryForm, currency_id: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select Currency</option>
              {currencies.map((curr) => (
                <option key={curr.id} value={curr.id}>
                  {curr.code} - {curr.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSaveSalary} className="flex-1">
              Save
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEditingSalary(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Employee"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete this employee? This action cannot be undone.
          </p>
          {employee && (
            <p className="text-gray-900 font-semibold">
              Employee: {employee.fullname}
            </p>
          )}
          <div className="flex gap-2 pt-4">
            <Button
              variant="danger"
              onClick={handleDeleteEmployee}
              disabled={isDeleting}
              className="flex-1"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
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
