import { NextRequest, NextResponse } from "next/server";
import { AuditLogService } from "@/lib/services/audit-log-service";
import { handlePgError } from "@/lib/utils/pg-error-handler";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const [logs, total] = await Promise.all([
      AuditLogService.getAuditLogs(page, limit),
      AuditLogService.getAuditLogsCount(),
    ]);

    return NextResponse.json({
      success: true,
      data: logs,
      count: logs.length,
      total,
    });
  } catch (error: unknown) {
    return handlePgError(error, "fetch audit logs");
  }
}
