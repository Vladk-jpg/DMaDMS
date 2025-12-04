import { NextRequest, NextResponse } from "next/server";
import { DepartmentService } from "@/lib/services/department-service";
import { handlePgError } from "@/lib/utils/pg-error-handler";
import { CreateDepartmentDto } from "@/lib/services/dto";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const [result, total] = await Promise.all([
      DepartmentService.getPartialDepartments(page, limit),
      DepartmentService.getDepartmentsCount(),
    ]);

    return NextResponse.json({
      success: true,
      data: result,
      count: result.length,
      total,
    });
  } catch (error: unknown) {
    return handlePgError(error, "fetch departments");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const dto: CreateDepartmentDto = body;

    await DepartmentService.createDepartment(dto);

    return NextResponse.json(
      {
        success: true,
        message: "Department created successfully",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    return handlePgError(error, "create department");
  }
}
