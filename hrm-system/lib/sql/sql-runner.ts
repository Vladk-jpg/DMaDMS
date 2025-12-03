import { readFileSync } from "fs";
import { join } from "path";
import { query } from "../db";

class SqlCache {
  private cache: Map<string, string> = new Map();

  get(filePath: string): string | undefined {
    return this.cache.get(filePath);
  }

  set(filePath: string, content: string): void {
    this.cache.set(filePath, content);
  }

  has(filePath: string): boolean {
    return this.cache.has(filePath);
  }

  clear(): void {
    this.cache.clear();
  }

  getSize(): number {
    return this.cache.size;
  }
}

const sqlCache = new SqlCache();

export function readSqlFromFile(filePath: string): string {
  const fullPath =
    filePath.startsWith("/") || filePath.includes(":")
      ? filePath
      : join(process.cwd(), "lib", "sql", filePath + ".sql");

  if (sqlCache.has(fullPath)) {
    return sqlCache.get(fullPath)!;
  }

  const sqlContent = readFileSync(fullPath, "utf-8");
  sqlCache.set(fullPath, sqlContent);
  return sqlContent;
}

export async function sql(filePath: string, params?: unknown[]) {
  try {
    const sql = readSqlFromFile(filePath);
    return await query(sql, params);
  } catch (error) {
    console.error(`[SQL Error] File: ${filePath}`);
    console.error(`[SQL Error] Params:`, params);
    console.error(`[SQL Error] Error:`, error);
    throw error;
  }
}

export function clearSqlCache(): void {
  sqlCache.clear();
}

export function getSqlCacheStats() {
  return {
    size: sqlCache.getSize(),
  };
}
