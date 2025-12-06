import { NextRequest, NextResponse } from "next/server";
import { PerformanceReviewService } from "@/lib/services/performance-review-service";
import { handlePgError } from "@/lib/utils/pg-error-handler";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await PerformanceReviewService.getReviewsByEmployeeId(id);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    return handlePgError(error, "fetch performance reviews");
  }
}
