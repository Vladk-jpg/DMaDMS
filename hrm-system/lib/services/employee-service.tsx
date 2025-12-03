import { PartialEmployee } from "@/app/types/partial-employee";
import { Employee } from "@/models/employee";
import { sql } from "../sql/sql-runner";

export class EmployeeService {
  static async getPartialEmployees(
    limit: number,
    offset: number
  ): Promise<PartialEmployee[]> {
    const result = await sql("employees/get-partial-employees", [
      limit,
      offset,
    ]);
    return result.rows as PartialEmployee[];
  }

  static async getEmployeeWithProfileById(
    id: string
  ): Promise<Partial<Employee> | null> {
    const result = await sql("employees/get-employee-with-profile-by-id", [id]);
    return result.rows.length > 0
      ? (result.rows[0] as Partial<Employee>)
      : null;
  }
}
