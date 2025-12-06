import { NextResponse } from "next/server";
import { sql } from "@/lib/sql/sql-runner";
import { handlePgError } from "@/lib/utils/pg-error-handler";

export async function GET() {
  try {
    const result = await sql("currencies/get-currencies", []);

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error: unknown) {
    return handlePgError(error, "fetch currencies");
  }
}
