"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import MicroProfile from "@/lib/components/MicroProfile";
import Sidebar from "@/lib/components/Sidebar";
import Header from "@/lib/components/Header";
import { EmployeeMicroProfile } from "@/app/types/employee-micro-profile";

interface ApiResponse {
  success: boolean;
  data?: EmployeeMicroProfile;
  error?: string;
}

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");
  const [profile, setProfile] = useState<EmployeeMicroProfile | null>(null);

  useEffect(() => {
    if (!isAuthPage) {
      async function fetchMicroProfile() {
        try {
          const response = await fetch("/api/profile/micro");
          if (response.ok) {
            const data: ApiResponse = await response.json();
            console.log(data);
            if (data.success && data.data) {
              setProfile(data.data);
            }
          }
        } catch (error) {
          console.error("Failed to fetch micro profile:", error);
        }
      }
      fetchMicroProfile();
    }
  }, [isAuthPage]);

  if (isAuthPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md">{children}</div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white md:shrink-0">
        <div className="max-w-7xl mx-auto px-12">
          <Header picture={profile?.picture} />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-12 h-full md:h-screen md:flex md:flex-col md:pt-8 md:pb-16">
        <div className="grid grid-cols-12 md:flex-1 md:min-h-0">
          <div className="col-span-12 md:col-span-3 md:overflow-y-auto mr-8">
            <aside className="flex flex-col gap-8">
              <MicroProfile profile={profile} />
              <Sidebar />
            </aside>
          </div>
          <div className="col-span-12 md:col-span-9 md:overflow-y-auto rounded-2xl bg-white p-4 mb-4 shadow-md">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
