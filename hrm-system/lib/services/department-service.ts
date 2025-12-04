import { Department } from "@/models";
import { sql } from "../sql/sql-runner";
import { PartialDepartment } from "@/app/types/partial-department";
import { CreateDepartmentDto } from "./dto";

export class DepartmentService {
  static async getPartialDepartments(
    page: number,
    limit: number
  ): Promise<PartialDepartment[]> {
    const result = await sql("departments/get-partial-departments", [
      limit,
      (page - 1) * limit,
    ]);
    return result.rows as PartialDepartment[];
  }

  static async getDepartmentsCount(): Promise<number> {
    const result = await sql("departments/get-departments-count", []);
    return result.rows[0]?.total || 0;
  }

  static async getDepartmentById(
    id: string
  ): Promise<Partial<Department> | null> {
    const result = await sql("departments/get-department-by-id", [id]);
    return result.rows.length > 0
      ? (result.rows[0] as Partial<Department>)
      : null;
  }

  static async createDepartment(dto: CreateDepartmentDto): Promise<void> {
    await sql("departments/create-department", [
      dto.name,
      dto.description,
      dto.head_id || null,
    ]);
  }

  static async deleteDepartment(id: string): Promise<void> {
    await sql("departments/delete-department", [id]);
  }

  static async updateDepartment(
    id: string,
    dto: Partial<CreateDepartmentDto>
  ): Promise<void> {
    await sql("departments/update-department", [
      id,
      dto.name,
      dto.description,
      dto.head_id,
    ]);
  }
}
