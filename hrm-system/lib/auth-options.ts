import { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyPassword } from "./auth";
import pool from "./db";
import { Employee } from "@/models/employee";
import { Role } from "@/models/role";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const employeeResult = await pool.query(
            "SELECT * FROM employees WHERE email = $1",
            [credentials.email]
          );

          if (employeeResult.rows.length === 0) {
            return null;
          }

          const employee = employeeResult.rows[0] as Employee;

          const isValid = await verifyPassword(
            credentials.password,
            employee.password_hash
          );

          if (!isValid) {
            return null;
          }

          const roleResult = await pool.query(
            "SELECT * FROM roles WHERE id = $1",
            [employee.user_role_id]
          );

          if (roleResult.rows.length === 0) {
            return null;
          }

          const role = roleResult.rows[0] as Role;

          const profileResult = await pool.query(
            "SELECT first_name, second_name, middle_name FROM employee_profiles WHERE employee_id = $1",
            [employee.id]
          );

          let name = employee.email;
          if (profileResult.rows.length > 0) {
            const profile = profileResult.rows[0];
            const parts = [
              profile.first_name,
              profile.second_name,
              profile.middle_name,
            ].filter(Boolean);
            if (parts.length > 0) {
              name = parts.join(" ");
            }
          }

          return {
            id: employee.id.toString(),
            email: employee.email,
            name: name,
            role: role.name,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
