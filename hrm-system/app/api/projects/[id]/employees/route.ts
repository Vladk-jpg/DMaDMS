import { NextRequest, NextResponse } from "next/server";
import { ProjectService } from "@/lib/services/project-service";
import { handlePgError } from "@/lib/utils/pg-error-handler";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const employees = await ProjectService.getProjectEmployees(id);

    return NextResponse.json({
      success: true,
      data: employees,
      count: employees.length,
    });
  } catch (error: unknown) {
    return handlePgError(error, "fetch project employees");
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { employeeId, roleId } = body;

    if (!employeeId || !roleId) {
      return NextResponse.json(
        {
          success: false,
          error: "employeeId and roleId are required",
        },
        { status: 400 }
      );
    }

    await ProjectService.addEmployeeToProject(id, employeeId, roleId);

    return NextResponse.json(
      {
        success: true,
        message: "Employee added to project successfully",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    return handlePgError(error, "add employee to project");
  }
}
