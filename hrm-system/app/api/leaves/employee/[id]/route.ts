import { NextRequest, NextResponse } from "next/server";
import { LeaveService } from "@/lib/services/leave-service";
import { handlePgError } from "@/lib/utils/pg-error-handler";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: employeeId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || undefined;

    const leaves = await LeaveService.getLeavesByEmployeeId(employeeId, status);

    return NextResponse.json({
      success: true,
      data: leaves,
    });
  } catch (error: unknown) {
    return handlePgError(error, "fetch leaves");
  }
}
