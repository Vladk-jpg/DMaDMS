"use client";

import { usePathname } from "next/navigation";
import MicroProfile from "@/lib/components/MicroProfile";
import Sidebar from "@/lib/components/Sidebar";
import Header from "@/lib/components/Header";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");

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
          <Header />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-12 h-full md:h-screen md:flex md:flex-col md:pt-8 md:pb-16">
        <div className="grid grid-cols-12 md:flex-1 md:min-h-0">
          <div className="col-span-12 md:col-span-3 md:overflow-y-auto mr-8">
            <aside className="flex flex-col gap-8">
              <MicroProfile />
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
