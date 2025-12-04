"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/lib/components/Input";
import Button from "@/lib/components/Button";
import EmployeeSelector from "@/lib/components/EmployeeSelector";
import { PartialEmployee } from "@/app/types/partial-employee";

export default function NewDepartmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [selectedHead, setSelectedHead] = useState<PartialEmployee | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    head_id: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleHeadSelect = (employee: PartialEmployee) => {
    setSelectedHead(employee);
    setFormData((prev) => ({ ...prev, head_id: employee.id }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to create department");
      }

      router.push("/departments");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create department"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Create new Department</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Department Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter department name"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter department description (optional)"
                  className="w-full px-3 py-2 border border-gray bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-gray/50 min-h-24"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Department Head
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={selectedHead?.name || ""}
                    readOnly
                    placeholder="Select department head (optional)"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="primaryOutline"
                    onClick={() => setIsEmployeeModalOpen(true)}
                  >
                    Select
                  </Button>
                  {selectedHead && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSelectedHead(null);
                        setFormData((prev) => ({ ...prev, head_id: "" }));
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Creating..." : "Create Department"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>

      <EmployeeSelector
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        onSelect={handleHeadSelect}
        selectedEmployeeId={selectedHead?.id}
      />
    </div>
  );
}
