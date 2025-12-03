import { hash, compare } from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth-options";
import { SessionUser } from "@/app/types/auth";

export async function hashPassword(password: string): Promise<string> {
  const hashedPassword = await hash(password, 12);
  return hashedPassword;
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await compare(password, hashedPassword);
}

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession();
  return session?.user as SessionUser | null;
}
