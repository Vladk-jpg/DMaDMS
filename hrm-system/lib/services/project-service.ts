import { Project } from "@/models";
import { sql } from "../sql/sql-runner";
import { CreateProjectDto } from "./dto";

export class ProjectService {
  static async getProjects(
    page: number,
    limit: number,
    search?: string
  ): Promise<Project[]> {
    const result = await sql("projects/get-projects", [
      limit,
      (page - 1) * limit,
      search || null,
    ]);
    return result.rows as Project[];
  }

  static async getProjectsCount(search?: string): Promise<number> {
    const result = await sql("projects/get-projects-count", [search || null]);
    return result.rows[0]?.total || 0;
  }

  static async getProjectById(id: string): Promise<Project | null> {
    const result = await sql("projects/get-project-by-id", [id]);
    return result.rows.length > 0 ? (result.rows[0] as Project) : null;
  }

  static async createProject(dto: CreateProjectDto): Promise<void> {
    await sql("projects/create-project", [
      dto.name,
      dto.description || null,
      dto.start_date,
      dto.end_date || null,
    ]);
  }

  static async deleteProject(id: string): Promise<void> {
    await sql("projects/delete-project", [id]);
  }

  static async updateProject(
    id: string,
    dto: Partial<CreateProjectDto>
  ): Promise<void> {
    await sql("projects/update-project", [
      id,
      dto.name,
      dto.description,
      dto.start_date,
      dto.end_date,
    ]);
  }
}
