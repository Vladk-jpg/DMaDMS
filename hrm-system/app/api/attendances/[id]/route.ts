import { NextRequest, NextResponse } from "next/server";
import { AttendanceService } from "@/lib/services/attendance-service";
import { handlePgError } from "@/lib/utils/pg-error-handler";
import { UpdateAttendanceDto } from "@/lib/services/dto";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const dto: UpdateAttendanceDto = {
      worked_hours: body.worked_hours,
      date: body.date ? new Date(body.date) : undefined,
    };

    await AttendanceService.updateAttendance(id, dto);

    return NextResponse.json({
      success: true,
      message: "Attendance updated successfully",
    });
  } catch (error: unknown) {
    return handlePgError(error, "update attendance");
  }
}
