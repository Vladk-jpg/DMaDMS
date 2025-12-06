import { Leave } from "@/app/types/leave";
import { LeaveWithProfile } from "@/app/types/leave-with-profile";
import { sql } from "../sql/sql-runner";

export class LeaveService {
  static async getPendingLeavesWithProfile(): Promise<LeaveWithProfile[]> {
    const result = await sql("leaves/get-pending-leaves-with-profile", []);
    return result.rows as LeaveWithProfile[];
  }
  static async getLeavesByEmployeeId(
    employeeId: string,
    status?: string
  ): Promise<Leave[]> {
    const result = await sql("leaves/get-leaves-by-employee-id", [
      employeeId,
      status || null,
    ]);
    return result.rows as Leave[];
  }

  static async createLeave(
    employeeId: string,
    leaveType: string,
    startDate: Date,
    endDate: Date
  ): Promise<void> {
    await sql("leaves/create-leave", [
      employeeId,
      leaveType,
      startDate,
      endDate,
    ]);
  }

  static async approveLeave(leaveId: string): Promise<void> {
    await sql("leaves/approve-leave", [leaveId]);
  }

  static async rejectLeave(leaveId: string): Promise<void> {
    await sql("leaves/reject-leave", [leaveId]);
  }
}
