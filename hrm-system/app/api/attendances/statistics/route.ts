import { NextRequest, NextResponse } from "next/server";
import { AttendanceService } from "@/lib/services/attendance-service";
import { handlePgError } from "@/lib/utils/pg-error-handler";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employee_id");
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    if (!employeeId || !year || !month) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameters: employee_id, year, month",
        },
        { status: 400 }
      );
    }

    const statistics = await AttendanceService.getStatistics(
      employeeId,
      parseInt(year),
      parseInt(month)
    );

    return NextResponse.json({
      success: true,
      data: statistics,
    });
  } catch (error: unknown) {
    return handlePgError(error, "get attendance statistics");
  }
}
