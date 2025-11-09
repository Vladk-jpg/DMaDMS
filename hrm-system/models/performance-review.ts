export interface PerformanceReview {
  id: string;
  employee_id: string;
  reviewer_id?: string | null;
  score: number;
  comments?: string | null;
  review_date: Date;
}

