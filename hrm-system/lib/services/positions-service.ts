import { PartialPosition } from "@/app/types/partial-position";
import { sql } from "../sql/sql-runner";

export class PositionService {
  static async getAllPositions(
    page: number,
    limit: number,
    search?: string
  ): Promise<PartialPosition[]> {
    const result = await sql("positions/get-partial-positions", [
      limit,
      (page - 1) * limit,
      search || null,
    ]);
    return result.rows as PartialPosition[];
  }

  static async getPositionsCount(search?: string): Promise<number> {
    const result = await sql("positions/get-positions-count", [search || null]);
    return result.rows[0]?.total || 0;
  }
}
