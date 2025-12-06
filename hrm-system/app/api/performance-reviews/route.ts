import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { PerformanceReviewService } from "@/lib/services/performance-review-service";
import { handlePgError } from "@/lib/utils/pg-error-handler";
import { CreatePerformanceReviewDto } from "@/lib/services/dto";

export async function POST(request: NextRequest) {
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

    const body = await request.json();

    const dto: CreatePerformanceReviewDto = {
      employee_id: body.employee_id,
      reviewer_id: user.id,
      score: body.score,
      comments: body.comments,
      review_date: new Date(body.review_date),
    };

    await PerformanceReviewService.createReview(dto);

    return NextResponse.json({
      success: true,
      message: "Performance review created successfully",
    });
  } catch (error: unknown) {
    return handlePgError(error, "create performance review");
  }
}
