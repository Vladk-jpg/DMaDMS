import { NextRequest, NextResponse } from "next/server";
import { CreateEmployeeDto } from "@/lib/services/dto";
import { handlePgError } from "@/lib/utils/pg-error-handler";
import { EmployeeService } from "@/lib/services/employee-service";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const [result, total] = await Promise.all([
      EmployeeService.getPartialAdministration(page, limit),
      EmployeeService.getAdministrationCount(),
    ]);

    return NextResponse.json({
      success: true,
      data: result,
      count: result.length,
      total,
    });
  } catch (error: unknown) {
    return handlePgError(error, "fetch administration");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const dto: CreateEmployeeDto = {
      ...body,
      birthDate: new Date(body.birthDate),
      hireDate: new Date(body.hireDate),
    };

    await EmployeeService.createEmployeeWithProfile(dto);

    return NextResponse.json(
      {
        success: true,
        message: "Admin created successfully",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    return handlePgError(error, "create admin");
  }
}
