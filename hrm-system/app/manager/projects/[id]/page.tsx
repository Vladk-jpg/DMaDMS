"use client";

import { useState, useEffect, useCallback } from "react";
import { use} from "react";
import { useRouter } from "next/navigation";
import Button from "@/lib/components/Button";
import CircleImage from "@/lib/components/CircleImage";
import Modal from "@/lib/components/Modal";
import EmployeeSelector from "@/lib/components/EmployeeSelector";
import Select from "@/lib/components/Select";
import InfoField from "@/lib/components/InfoField";
import { Project, ProjectRole } from "@/models";
import { ProjectEmployee } from "@/app/types/project-employee";
import { PartialEmployee } from "@/app/types/partial-employee";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [employees, setEmployees] = useState<ProjectEmployee[]>([]);
  const [roles, setRoles] = useState<ProjectRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmployeeSelectorOpen, setIsEmployeeSelectorOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<PartialEmployee | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [projectRes, employeesRes, rolesRes] = await Promise.all([
        fetch(`/api/projects/${resolvedParams.id}`),
        fetch(`/api/projects/${resolvedParams.id}/employees`),
        fetch(`/api/project-roles`),
      ]);

      if (!projectRes.ok) {
        throw new Error("Failed to fetch project");
      }

      const projectData = await projectRes.json();
      const employeesData = await employeesRes.json();
      const rolesData = await rolesRes.json();

      setProject(projectData.data);
      setEmployees(employeesData.data || []);
      setRoles(rolesData.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id]);

    useEffect(() => {
    fetchData();
  }, [fetchData, resolvedParams.id]);

  const handleEmployeeSelect = (employee: PartialEmployee) => {
    setSelectedEmployee(employee);
    setIsEmployeeSelectorOpen(false);
    setIsRoleModalOpen(true);
  };

  const handleAddEmployee = async () => {
    if (!selectedEmployee || !selectedRoleId) {
      alert("Please select both employee and role");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/projects/${resolvedParams.id}/employees`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employeeId: selectedEmployee.id,
            roleId: selectedRoleId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add employee");
      }

      setIsRoleModalOpen(false);
      setSelectedEmployee(null);
      setSelectedRoleId("");
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveEmployee = async (employeeId: string) => {
    if (!confirm("Are you sure you want to remove this employee from the project?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/projects/${resolvedParams.id}/employees/${employeeId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Failed to remove employee");
      }

      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove employee");
    }
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error || "Project not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/manager/projects/${resolvedParams.id}/edit`)}
          >
            Edit Project
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Project Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField label="Description" value={project.description || "N/A"} />
          <InfoField label="Start Date" value={formatDate(project.start_date)} />
          <InfoField
            label="End Date"
            value={project.end_date ? formatDate(project.end_date) : "In Progress"}
          />
          <InfoField
            label="Status"
            value={
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  !project.end_date
                    ? "bg-blue-100 text-blue-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {!project.end_date ? "Active" : "Completed"}
              </span>
            }
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Team Members ({employees.length})</h2>
          <Button onClick={() => setIsEmployeeSelectorOpen(true)}>Add Member</Button>
        </div>

        {employees.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            No team members assigned to this project yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Since
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <CircleImage
                          src={employee.picture || "/noimage.jpg"}
                          alt={employee.name}
                          size={40}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {employee.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {employee.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(employee.assigned_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Button
                        variant="outline"
                        onClick={() => handleRemoveEmployee(employee.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EmployeeSelector
        isOpen={isEmployeeSelectorOpen}
        onClose={() => setIsEmployeeSelectorOpen(false)}
        onSelect={handleEmployeeSelect}
        selectedEmployeeId={selectedEmployee?.id}
      />

      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => {
          setIsRoleModalOpen(false);
          setSelectedEmployee(null);
          setSelectedRoleId("");
        }}
        title="Select Project Role"
      >
        <div className="space-y-4">
          {selectedEmployee && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Adding employee:</p>
              <p className="font-medium text-gray-900">{selectedEmployee.name}</p>
              <p className="text-sm text-gray-500">{selectedEmployee.email}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Role <span className="text-red-500">*</span>
            </label>
            <Select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
            >
              <option value="">Select a role...</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsRoleModalOpen(false);
                setSelectedEmployee(null);
                setSelectedRoleId("");
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddEmployee}
              disabled={isSubmitting || !selectedRoleId}
            >
              {isSubmitting ? "Adding..." : "Add Member"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
