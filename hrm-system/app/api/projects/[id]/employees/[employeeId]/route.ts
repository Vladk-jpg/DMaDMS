import { NextRequest, NextResponse } from "next/server";
import { ProjectService } from "@/lib/services/project-service";
import { handlePgError } from "@/lib/utils/pg-error-handler";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; employeeId: string }> }
) {
  try {
    const { id, employeeId } = await params;
    await ProjectService.removeEmployeeFromProject(id, employeeId);

    return NextResponse.json({
      success: true,
      message: "Employee removed from project successfully",
    });
  } catch (error: unknown) {
    return handlePgError(error, "remove employee from project");
  }
}
