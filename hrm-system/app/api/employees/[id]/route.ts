import { NextRequest, NextResponse } from "next/server";
import { EmployeeService } from "@/lib/services/employee-service";
import { handlePgError } from "@/lib/utils/pg-error-handler";
import { CreateEmployeeDto } from "@/lib/services/dto";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await EmployeeService.getEmployeeWithProfileById(id);

    if (result === null) {
      return NextResponse.json(
        {
          success: false,
          error: "Employee not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    return handlePgError(error, "fetch employee");
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dto: CreateEmployeeDto = await request.json();

    EmployeeService.updateEmployeeWithProfile(id, dto);

    return NextResponse.json({
      success: true,
      message: "Employee updated successfully",
    });
  } catch (error: unknown) {
    return handlePgError(error, "update employee");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    EmployeeService.deleteEmployee(id);

    return NextResponse.json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error: unknown) {
    return handlePgError(error, "delete employee");
  }
}
