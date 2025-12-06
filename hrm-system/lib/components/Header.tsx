"use client";

import CircleImage from "@/lib/components/CircleImage";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Button from "./Button";

interface HeaderProps {
  picture?: string;
}

export default function Header({ picture }: HeaderProps) {
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
        <Button onClick={handleLogout}>Logout</Button>
        <CircleImage
          src={picture || "/noimage.jpg"}
          alt="profile-picture"
          size={32}
        />
      </div>
    </header>
  );
}
