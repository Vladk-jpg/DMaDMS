"use client";

import Image from "next/image";
import { FiExternalLink } from "react-icons/fi";
import { useRouter } from "next/navigation";

export default function MicroProfile() {
  const router = useRouter();
  return (
    <div className="bg-white rounded-xl p-4 mt-4 mx-1 overflow-visibl shadow-md">
      <div className="w-[100px] h-[100px] rounded-full overflow-hidden -mt-8 mx-auto border-2 border-white">
        <Image
          src="/noimage.jpg"
          alt="profile-picture"
          width={100}
          height={100}
          className="w-full h-full object-cover "
        />
      </div>
      <div className="text-center mt-3">
        <h3 className="text-lg font-bold">John Doe</h3>
        <p className="text-xs text-gray-500">john.doe@example.com</p>
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
