import { NextRequest, NextResponse } from "next/server";
import { DepartmentService } from "@/lib/services/department-service";
import { handlePgError } from "@/lib/utils/pg-error-handler";
import { CreateDepartmentDto } from "@/lib/services/dto";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const department = await DepartmentService.getDepartmentById(params.id);

    if (!department) {
      return NextResponse.json(
        {
          success: false,
          error: "Department not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: department,
    });
  } catch (error: unknown) {
    return handlePgError(error, "fetch department");
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const dto: Partial<CreateDepartmentDto> = body;

    await DepartmentService.updateDepartment(params.id, dto);

    return NextResponse.json({
      success: true,
      message: "Department updated successfully",
    });
  } catch (error: unknown) {
    return handlePgError(error, "update department");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await DepartmentService.deleteDepartment(params.id);

    return NextResponse.json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error: unknown) {
    return handlePgError(error, "delete department");
  }
}
