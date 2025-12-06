import { NextResponse } from "next/server";
import { ProjectService } from "@/lib/services/project-service";
import { handlePgError } from "@/lib/utils/pg-error-handler";

export async function GET() {
  try {
    const roles = await ProjectService.getProjectRoles();

    return NextResponse.json({
      success: true,
      data: roles,
      count: roles.length,
    });
  } catch (error: unknown) {
    return handlePgError(error, "fetch project roles");
  }
}
