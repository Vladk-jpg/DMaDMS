import { NextRequest, NextResponse } from "next/server";
import { handlePgError } from "@/lib/utils/pg-error-handler";
import { PositionService } from "@/lib/services/positions-service";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || undefined;

    const [result, total] = await Promise.all([
      PositionService.getAllPositions(page, limit, search),
      PositionService.getPositionsCount(search),
    ]);

    return NextResponse.json({
      success: true,
      data: result,
      count: result.length,
      total,
    });
  } catch (error: unknown) {
    return handlePgError(error, "fetch positions");
  }
}