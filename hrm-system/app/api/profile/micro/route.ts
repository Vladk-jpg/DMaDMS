import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { EmployeeService } from "@/lib/services/employee-service";
import { handlePgError } from "@/lib/utils/pg-error-handler";
import { EmployeeMicroProfile } from "@/app/types/employee-micro-profile";

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

    const microProfile: EmployeeMicroProfile =
      await EmployeeService.getEmployeeMicroProfile(user.id);

    return NextResponse.json({
      success: true,
      data: microProfile,
    });
  } catch (error: unknown) {
    return handlePgError(error, "get micro profile");
  }
}
