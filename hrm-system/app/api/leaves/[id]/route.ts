import { NextRequest, NextResponse } from "next/server";
import { LeaveService } from "@/lib/services/leave-service";
import { handlePgError } from "@/lib/utils/pg-error-handler";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (status === "approved") {
      await LeaveService.approveLeave(id);
    } else if (status === "rejected") {
      await LeaveService.rejectLeave(id);
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid status. Must be 'approved' or 'rejected'",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Leave ${status} successfully`,
    });
  } catch (error: unknown) {
    return handlePgError(error, "update leave status");
  }
}