import { NextRequest, NextResponse } from "next/server";
import { LeaveService } from "@/lib/services/leave-service";
import { handlePgError } from "@/lib/utils/pg-error-handler";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employee_id, leave_type, start_date, end_date } = body;

    if (!employee_id || !leave_type || !start_date || !end_date) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    await LeaveService.createLeave(
      employee_id,
      leave_type,
      new Date(start_date),
      new Date(end_date)
    );

    return NextResponse.json(
      {
        success: true,
        message: "Leave request created successfully",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    return handlePgError(error, "create leave");
  }
}
