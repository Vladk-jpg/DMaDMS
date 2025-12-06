import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { EmployeeService } from "@/lib/services/employee-service";
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

    const result = await EmployeeService.getEmployeeWithProfileById(user.id);

    if (result === null) {
      return NextResponse.json(
        {
          success: false,
          error: "Profile not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    return handlePgError(error, "fetch profile");
  }
}
