"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "@/lib/components/Input";
import Button from "@/lib/components/Button";
import Select from "@/lib/components/Select";
import PositionSelector from "@/lib/components/PositionSelector";
import { PartialPosition } from "@/app/types/partial-position";
import { PartialDepartment } from "@/app/types/partial-department";
import { Role } from "@/models";

export default function NewHRPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPositionModalOpen, setIsPositionModalOpen] = useState(false);

  const [departments, setDepartments] = useState<PartialDepartment[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<PartialPosition | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    departmentId: "",
    userRoleId: "",
    positionId: "",
    passportNumber: "",
    firstName: "",
    secondName: "",
    middleName: "",
    birthDate: "",
    hireDate: "",
    address: "",
    iban: "",
  });

  useEffect(() => {
    fetchDepartments();
    fetchRoles();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments?limit=100");
      const data = await response.json();
      if (data.success) {
        setDepartments(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch departments:", err);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/roles");
      const data = await response.json();
      if (data.success) {
        setRoles(data.data);
        const hrRole = data.data.find((role: Role) => role.name.toLowerCase() === "hr");
        if (hrRole) {
          setFormData((prev) => ({ ...prev, userRoleId: hrRole.id }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch roles:", err);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePositionSelect = (position: PartialPosition) => {
    setSelectedPosition(position);
    setFormData((prev) => ({ ...prev, positionId: position.id }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to create HR");
      }

      router.push("/employees");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create HR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Create new HR</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">General</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">First name</label>
                <Input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last name</label>
                <Input
                  type="text"
                  name="secondName"
                  value={formData.secondName}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Middle name</label>
                <Input
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Passport</label>
                <Input
                  type="text"
                  name="passportNumber"
                  value={formData.passportNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Birthday</label>
                <Input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <Input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">IBAN</label>
                <Input
                  type="text"
                  name="iban"
                  value={formData.iban}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Work info</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Department</label>
                <Select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <Select
                  name="userRoleId"
                  value={formData.userRoleId}
                  onChange={handleInputChange}
                  required
                  disabled
                  className="w-full opacity-60 cursor-not-allowed"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Position</label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={selectedPosition?.name || ""}
                    readOnly
                    placeholder="Select position"
                    required
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="primaryOutline"
                    onClick={() => setIsPositionModalOpen(true)}
                  >
                    Select
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Hire date</label>
                <Input
                  type="date"
                  name="hireDate"
                  value={formData.hireDate}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Creating..." : "Create HR"}
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

      <PositionSelector
        isOpen={isPositionModalOpen}
        onClose={() => setIsPositionModalOpen(false)}
        onSelect={handlePositionSelect}
        selectedPositionId={selectedPosition?.id}
      />
    </div>
  );
}
