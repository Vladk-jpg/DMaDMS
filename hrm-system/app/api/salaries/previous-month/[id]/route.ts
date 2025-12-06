import { NextRequest, NextResponse } from "next/server";
import { SalaryService } from "@/lib/services/salary-service";
import { handlePgError } from "@/lib/utils/pg-error-handler";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await SalaryService.getPreviousMonthSalary(id);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    return handlePgError(error, "fetch previous month salary");
  }
}
