import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { SalaryService } from "@/lib/services/salary-service";
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

    const result = await SalaryService.getSalariesByEmployeeId(user.id);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    return handlePgError(error, "fetch salaries");
  }
}
