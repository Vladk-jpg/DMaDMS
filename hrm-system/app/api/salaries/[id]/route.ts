import { NextRequest, NextResponse } from "next/server";
import { SalaryService } from "@/lib/services/salary-service";
import { handlePgError } from "@/lib/utils/pg-error-handler";
import { UpdateSalaryDto } from "@/lib/services/dto";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dto: UpdateSalaryDto = await request.json();

    await SalaryService.updateSalary(id, dto);

    return NextResponse.json({
      success: true,
      message: "Salary updated successfully",
    });
  } catch (error: unknown) {
    return handlePgError(error, "update salary");
  }
}
