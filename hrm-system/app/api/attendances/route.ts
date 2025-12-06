import { NextRequest, NextResponse } from "next/server";
import { AttendanceService } from "@/lib/services/attendance-service";
import { handlePgError } from "@/lib/utils/pg-error-handler";
import { CreateAttendanceDto } from "@/lib/services/dto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const dto: CreateAttendanceDto = {
      employee_id: body.employee_id,
      date: new Date(body.date),
      worked_hours: body.worked_hours,
    };

    await AttendanceService.createAttendance(dto);

    return NextResponse.json({
      success: true,
      message: "Attendance created successfully",
    });
  } catch (error: unknown) {
    return handlePgError(error, "create attendance");
  }
}
