import { Role } from "@/models";
import { query } from "../db";

export class UserRolesService {
  static async getAllRoles(): Promise<Role[]> {
    const result = await query(/* sql */ `
      SELECT * FROM roles;
      `);
    return result.rows;
  }
}
