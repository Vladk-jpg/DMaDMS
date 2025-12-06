import { sql } from "../sql/sql-runner";
import { Attendance } from "@/app/types/attendance";
import { AttendanceStatistics } from "@/app/types/attendance-statistics";
import { CreateAttendanceDto, UpdateAttendanceDto } from "./dto";

export class AttendanceService {
  static async getAttendancesByRange(
    employeeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Attendance[]> {
    const result = await sql("attendances/get-range-attendances", [
      employeeId,
      startDate,
      endDate,
    ]);

    return result.rows.map((row: Omit<Attendance, 'date'> & { date: Date | string }) => ({
      ...row,
      date: row.date instanceof Date
        ? row.date.toLocaleDateString("en-CA")
        : row.date.split('T')[0]
    })) as Attendance[];
  }

  static async createAttendance(
    dto: CreateAttendanceDto
  ): Promise<Attendance> {
    const result = await sql("attendances/add-attendance", [
      dto.employee_id,
      dto.date.toLocaleDateString("en-CA"),
      Math.round(dto.worked_hours),
    ]);

    const row = result.rows[0] as Omit<Attendance, 'date'> & { date: Date | string };
    return {
      ...row,
      date: row.date instanceof Date
        ? row.date.toLocaleDateString("en-CA")
        : row.date.split('T')[0]
    };
  }

  static async updateAttendance(
    id: string,
    dto: UpdateAttendanceDto
  ): Promise<Attendance> {
    const workedHours = dto.worked_hours !== undefined
      ? Math.round(dto.worked_hours)
      : undefined;
    const dateStr = dto.date
      ? dto.date.toLocaleDateString("en-CA")
      : undefined;

    const result = await sql("attendances/update-attendance", [
      id,
      workedHours,
      dateStr,
    ]);

    const row = result.rows[0] as Omit<Attendance, 'date'> & { date: Date | string };
    return {
      ...row,
      date: row.date instanceof Date
        ? row.date.toLocaleDateString("en-CA")
        : row.date.split('T')[0]
    };
  }

  static async getStatistics(
    employeeId: string,
    year: number,
    month: number
  ): Promise<AttendanceStatistics | null> {
    const result = await sql("attendances/get-statistics", [
      employeeId,
      year,
      month,
    ]);
    return result.rows.length > 0
      ? (result.rows[0] as AttendanceStatistics)
      : null;
  }
}
