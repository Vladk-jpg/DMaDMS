"use client";

import { useRouter } from "next/navigation";
import Button from "@/lib/components/Button";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <div className="text-6xl font-bold text-red-500 mb-4">403</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-lg text-gray-600">
            You have no rights to use this page
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
          <Button onClick={() => router.push("/")}>
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
