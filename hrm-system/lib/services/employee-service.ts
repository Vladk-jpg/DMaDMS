import { PartialEmployee } from "@/app/types/partial-employee";
import { EmployeeWithProfile } from "@/app/types/employee-with-profile";
import { sql } from "../sql/sql-runner";
import { CreateEmployeeDto } from "./dto";
import { query } from "../db";
import { hashPassword } from "../auth";
import { EmployeeMicroProfile } from "@/app/types/employee-micro-profile";
import { Teammate } from "@/app/types/teammate";

export class EmployeeService {
  static async getPartialEmployees(
    page: number,
    limit: number,
    search?: string
  ): Promise<PartialEmployee[]> {
    const result = await sql("employees/get-partial-employees", [
      limit,
      (page - 1) * limit,
      search || null,
    ]);
    return result.rows as PartialEmployee[];
  }

  static async getPartialAdministration(
    page: number,
    limit: number
  ): Promise<PartialEmployee[]> {
    const result = await sql("employees/get-partial-administration", [
      limit,
      (page - 1) * limit,
    ]);
    return result.rows as PartialEmployee[];
  }

  static async getEmployeesCount(search?: string): Promise<number> {
    const result = await sql("employees/get-employees-count", [search || null]);
    return result.rows[0]?.total || 0;
  }

  static async getAdministrationCount(): Promise<number> {
    const result = await sql("employees/get-admin-count", []);
    return result.rows[0]?.total || 0;
  }

  static async getEmployeeWithProfileById(
    id: string
  ): Promise<Partial<EmployeeWithProfile> | null> {
    const result = await sql("employees/get-employee-with-profile-by-id", [id]);
    return result.rows.length > 0
      ? (result.rows[0] as Partial<EmployeeWithProfile>)
      : null;
  }

  static async createEmployeeWithProfile(
    dto: CreateEmployeeDto
  ): Promise<void> {
    const hashedPassword = await hashPassword(dto.password);

    await query(
      /* sql */ `
      CALL create_full_employee($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14);
      `,
      [
        dto.email,
        dto.phone,
        hashedPassword,
        dto.departmentId,
        dto.userRoleId,
        dto.positionId,
        dto.passportNumber,
        dto.firstName,
        dto.secondName,
        dto.middleName,
        dto.birthDate.toLocaleDateString("en-CA"),
        dto.hireDate.toLocaleDateString("en-CA"),
        dto.address,
        dto.iban,
      ]
    );
  }

  static async updateEmployeeWithProfile(
    id: string,
    dto: Partial<CreateEmployeeDto>
  ): Promise<void> {
    const hashedPassword = dto.password
      ? await hashPassword(dto.password)
      : undefined;

    const birthDate = dto.birthDate
      ? dto.birthDate.toLocaleDateString("en-CA")
      : undefined;

    const hireDate = dto.hireDate
      ? dto.hireDate.toLocaleDateString("en-CA")
      : undefined;

    await query(
      /* sql */ `
      CALL update_full_employee($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16);`,
      [
        id,
        dto.email,
        dto.phone,
        hashedPassword,
        dto.departmentId,
        dto.userRoleId,
        dto.status,
        dto.positionId,
        dto.passportNumber,
        dto.firstName,
        dto.secondName,
        dto.middleName,
        birthDate,
        hireDate,
        dto.address,
        dto.iban,
      ]
    );
  }

  static async deleteEmployee(id: string): Promise<void> {
    await query(
      /* sql */ `
      DELETE FROM employees 
      WHERE id = $1`,
      [id]
    );
  }

  static async updatePicture(id: string, pictureURL: string): Promise<void> {
    await sql("employees/update-picture", [id, pictureURL]);
  }

  static async getEmployeeMicroProfile(id: string): Promise<EmployeeMicroProfile> {
    const result = await sql("employees/get-employee-micro-profile", [id]);
    return result.rows[0] as EmployeeMicroProfile;
  }

  static async getTeammates(employeeId: string): Promise<Teammate[]> {
    const result = await sql("employees/get-teammates", [employeeId]);
    return result.rows as Teammate[];
  }
}
