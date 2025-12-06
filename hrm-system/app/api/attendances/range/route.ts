import { NextRequest, NextResponse } from "next/server";
import { AttendanceService } from "@/lib/services/attendance-service";
import { handlePgError } from "@/lib/utils/pg-error-handler";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employee_id");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    if (!employeeId || !startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameters: employee_id, start_date, end_date",
        },
        { status: 400 }
      );
    }

    const attendances = await AttendanceService.getAttendancesByRange(
      employeeId,
      new Date(startDate),
      new Date(endDate)
    );

    return NextResponse.json({
      success: true,
      data: attendances,
    });
  } catch (error: unknown) {
    return handlePgError(error, "get attendances by range");
  }
}
