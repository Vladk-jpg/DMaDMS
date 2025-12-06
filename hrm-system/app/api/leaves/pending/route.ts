import { NextResponse } from "next/server";
import { LeaveService } from "@/lib/services/leave-service";
import { handlePgError } from "@/lib/utils/pg-error-handler";

export async function GET() {
  try {
    const leaves = await LeaveService.getPendingLeavesWithProfile();

    return NextResponse.json({
      success: true,
      data: leaves,
    });
  } catch (error: unknown) {
    return handlePgError(error, "fetch pending leaves");
  }
}