import { PerformanceReview } from "@/app/types/performance-review";
import { sql } from "../sql/sql-runner";
import { CreatePerformanceReviewDto } from "./dto";

export class PerformanceReviewService {
  static async getReviewsByEmployeeId(
    employeeId: string
  ): Promise<PerformanceReview[]> {
    const result = await sql("performance-reviews/get-reviews-by-employee-id", [
      employeeId,
    ]);
    return result.rows as PerformanceReview[];
  }

  static async createReview(dto: CreatePerformanceReviewDto): Promise<void> {
    await sql("performance-reviews/create-review", [
      dto.employee_id,
      dto.reviewer_id,
      dto.score,
      dto.comments,
      dto.review_date.toLocaleDateString("en-CA"),
    ]);
  }
}
