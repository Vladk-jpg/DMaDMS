"use client";

import CircleImage from "@/lib/components/CircleImage";
import { FiExternalLink } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { EmployeeMicroProfile } from "@/app/types/employee-micro-profile";

interface MicroProfileProps {
  profile: EmployeeMicroProfile | null;
}

export default function MicroProfile({ profile }: MicroProfileProps) {
  const router = useRouter();

  if (!profile) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl p-4 mt-4 mx-1 overflow-visibl shadow-md">
      <div className="-mt-8 mx-auto border-2 border-white w-fit rounded-full">
        <CircleImage
          src={profile.picture || "/noimage.jpg"}
          alt="profile-picture"
          size={100}
        />
      </div>
      <div className="text-center mt-3">
        <h3 className="text-lg font-bold">{profile.fullname}</h3>
        <p className="text-xs text-gray-500">{profile.position}</p>
      </div>
      <button
        onClick={() => router.push("/profile")}
        className="flex items-center gap-2 mx-auto mt-4 mb-2 bg-gray text-black px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
      >
        View Profile
        <FiExternalLink />
      </button>
    </div>
  );
}
