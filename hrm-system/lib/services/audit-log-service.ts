import { AuditLog } from "@/app/types/audit-log";
import { sql } from "../sql/sql-runner";

export class AuditLogService {
  static async getAuditLogs(
    page: number,
    limit: number
  ): Promise<AuditLog[]> {
    const result = await sql("audit_logs/get-audit-logs", [
      limit,
      (page - 1) * limit,
    ]);
    return result.rows as AuditLog[];
  }

  static async getAuditLogsCount(): Promise<number> {
    const result = await sql("audit_logs/get-audit-logs-count", []);
    return result.rows[0]?.total || 0;
  }
}
