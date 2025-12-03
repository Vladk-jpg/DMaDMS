"use client";

import Image from "next/image";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({
      redirect: false,
      callbackUrl: "/auth/login",
    });
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <header className="flex justify-between">
      <h1 className="text-2xl font-bold py-4">HRM System</h1>
      <div className="flex items-center gap-4">
        <button className="cursor-pointer" onClick={handleLogout}>
          Logout
        </button>
        <div className="w-[32px] h-[32px] rounded-full overflow-hidden">
          <Image
            src="/noimage.jpg"
            alt="profile-picture"
            width={32}
            height={32}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
