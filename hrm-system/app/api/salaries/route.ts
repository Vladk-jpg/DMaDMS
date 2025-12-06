import { NextRequest, NextResponse } from "next/server";
import { SalaryService } from "@/lib/services/salary-service";
import { handlePgError } from "@/lib/utils/pg-error-handler";
import { CreateSalaryDto } from "@/lib/services/dto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const dto: CreateSalaryDto = {
      employee_id: body.employee_id,
      base_salary: body.base_salary,
      bonus: body.bonus,
      salary_date: new Date(body.salary_date),
      currency_id: body.currency_id,
    };

    await SalaryService.createSalary(dto);

    return NextResponse.json({
      success: true,
      message: "Salary created successfully",
    });
  } catch (error: unknown) {
    return handlePgError(error, "create salary");
  }
}
