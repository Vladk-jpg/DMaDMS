"use client";

import { useState, useEffect, useRef } from "react";
import InfoField from "@/lib/components/InfoField";
import Button from "@/lib/components/Button";
import CircleImage from "@/lib/components/CircleImage";
import { EmployeeWithProfile } from "@/app/types/employee-with-profile";

interface ApiResponse {
  success: boolean;
  data?: EmployeeWithProfile;
  error?: string;
  message?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<EmployeeWithProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/profile");
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("You need to be logged in to view your profile");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server returned non-JSON response");
        }

        const data: ApiResponse = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch profile");
        }

        setProfile(data.data || null);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch profile";
        setError(errorMessage);
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

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
      setUploadSuccess(null);

      const formData = new FormData();
      formData.append("picture", file);

      const response = await fetch("/api/profile/picture", {
        method: "POST",
        body: formData,
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to upload picture");
      }
      if (profile) {
        const responseData = data.data as unknown as { pictureUrl: string };
        setProfile({
          ...profile,
          picture: responseData.pictureUrl,
        });
      }

      setUploadSuccess("Picture updated successfully!");

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

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading...</div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Error: {error}</p>
          <p className="text-sm mt-2">
            Please make sure you are logged in and try again.
          </p>
        </div>
      ) : null}

      {uploadSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {uploadSuccess}
        </div>
      )}

      {profile ? (
        <div className="bg-white rounded-lg p-8 max-w-4xl">
          <div className="flex flex-col items-center mb-8 pb-8 border-b border-gray">
            <CircleImage
              src={profile.picture || "/noimage.jpg"}
              alt="Profile"
              size={128}
              className="mb-4"
            />
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoField label="Full Name" value={profile.fullname} />
            <InfoField label="Email" value={profile.email} />
            <InfoField label="Phone Number" value={profile.phone} />
            <InfoField label="Address" value={profile.address} />
            <InfoField label="Status" value={getStatusLabel(profile.status)} />
            <InfoField label="Passport Number" value={profile.passportnumber} />
            <InfoField label="Hire Date" value={formatDate(profile.hiredate)} />
            <InfoField
              label="Birth Date"
              value={formatDate(profile.birthdate)}
            />
            <InfoField label="IBAN" value={profile.iban} />
            <InfoField label="Department" value={profile.department} />
            <InfoField label="Position" value={profile.position} />
            <InfoField label="Role" value={profile.role} />
          </div>
        </div>
      ) : !loading && !error ? (
        <div className="text-gray-600">Profile not found.</div>
      ) : null}
    </div>
  );
}
