import { NextRequest, NextResponse } from "next/server";
import { ProjectService } from "@/lib/services/project-service";
import { handlePgError } from "@/lib/utils/pg-error-handler";
import { CreateProjectDto } from "@/lib/services/dto";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || undefined;

    const [result, total] = await Promise.all([
      ProjectService.getProjects(page, limit, search),
      ProjectService.getProjectsCount(search),
    ]);

    return NextResponse.json({
      success: true,
      data: result,
      count: result.length,
      total,
    });
  } catch (error: unknown) {
    return handlePgError(error, "fetch projects");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const dto: CreateProjectDto = {
      ...body,
      start_date: new Date(body.start_date),
      end_date: body.end_date ? new Date(body.end_date) : undefined,
    };

    await ProjectService.createProject(dto);

    return NextResponse.json(
      {
        success: true,
        message: "Project created successfully",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    return handlePgError(error, "create project");
  }
}
