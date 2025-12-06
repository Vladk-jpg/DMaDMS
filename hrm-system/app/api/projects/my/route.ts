import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { ProjectService } from "@/lib/services/project-service";
import { handlePgError } from "@/lib/utils/pg-error-handler";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const result = await ProjectService.getProjectsByEmployeeId(user.id);

    return NextResponse.json({
      success: true,
      data: result,
      count: result.length,
    });
  } catch (error: unknown) {
    return handlePgError(error, "fetch user projects");
  }
}
