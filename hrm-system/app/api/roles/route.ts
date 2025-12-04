import { NextResponse } from "next/server";
import { handlePgError } from "@/lib/utils/pg-error-handler";
import { UserRolesService } from "@/lib/services/user-roles-service";

export async function GET() {
  try {
    const roles = await UserRolesService.getAllRoles();

    return NextResponse.json({
      success: true,
      data: roles,
    });
  } catch (error: unknown) {
    return handlePgError(error, "fetch roles");
  }
}