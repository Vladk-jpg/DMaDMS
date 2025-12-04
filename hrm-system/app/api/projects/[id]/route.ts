import { NextRequest, NextResponse } from "next/server";
import { ProjectService } from "@/lib/services/project-service";
import { handlePgError } from "@/lib/utils/pg-error-handler";
import { CreateProjectDto } from "@/lib/services/dto";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await ProjectService.getProjectById(params.id);

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: "Project not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: project,
    });
  } catch (error: unknown) {
    return handlePgError(error, "fetch project");
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const dto: Partial<CreateProjectDto> = {
      ...body,
      start_date: body.start_date ? new Date(body.start_date) : undefined,
      end_date: body.end_date ? new Date(body.end_date) : undefined,
    };

    await ProjectService.updateProject(params.id, dto);

    return NextResponse.json({
      success: true,
      message: "Project updated successfully",
    });
  } catch (error: unknown) {
    return handlePgError(error, "update project");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ProjectService.deleteProject(params.id);

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error: unknown) {
    return handlePgError(error, "delete project");
  }
}
