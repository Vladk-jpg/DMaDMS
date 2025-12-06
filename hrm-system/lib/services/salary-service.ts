import { Salary } from "@/app/types/salary";
import { sql } from "../sql/sql-runner";
import { CreateSalaryDto, UpdateSalaryDto } from "./dto";

export class SalaryService {
  static async getSalariesByEmployeeId(employeeId: string): Promise<Salary[]> {
    const result = await sql("salaries/get-salaries-by-employee-id", [
      employeeId,
    ]);
    return result.rows as Salary[];
  }

  static async getCurrentSalary(
    employeeId: string
  ): Promise<Salary | null> {
    const result = await sql("salaries/get-current-salary", [employeeId]);
    return result.rows.length > 0 ? (result.rows[0] as Salary) : null;
  }

  static async getPreviousMonthSalary(
    employeeId: string
  ): Promise<Salary | null> {
    const result = await sql("salaries/get-previous-month-salary", [
      employeeId,
    ]);
    return result.rows.length > 0 ? (result.rows[0] as Salary) : null;
  }

  static async createSalary(dto: CreateSalaryDto): Promise<void> {
    await sql("salaries/create-salary", [
      dto.employee_id,
      dto.base_salary,
      dto.bonus,
      dto.salary_date.toLocaleDateString("en-CA"),
      dto.currency_id,
    ]);
  }

  static async updateSalary(
    id: string,
    dto: UpdateSalaryDto
  ): Promise<void> {
    await sql("salaries/update-salary", [
      id,
      dto.base_salary,
      dto.bonus,
      dto.currency_id,
    ]);
  }
}
