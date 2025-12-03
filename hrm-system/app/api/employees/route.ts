import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query("SELECT * FROM employees ORDER BY email ASC");

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rowCount,
    });
  } catch (error: unknown) {
    console.error("Error fetching employees:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch employees";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      phone,
      password_hash,
      department_id,
      user_role_id,
      position_id,
      status,
    } = body;

    if (
      !email ||
      !password_hash ||
      !department_id ||
      !user_role_id ||
      !position_id
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Email, password_hash, department_id, user_role_id, and position_id are required",
        },
        { status: 400 }
      );
    }

    const result = await query(
      "INSERT INTO employees (email, phone, password_hash, department_id, user_role_id, position_id, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *",
      [
        email,
        phone || null,
        password_hash,
        department_id,
        user_role_id,
        position_id,
        status || "working",
      ]
    );

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating employee:", error);

    const pgError = error as { code?: string; message?: string };
    if (pgError.code === "23505") {
      return NextResponse.json(
        {
          success: false,
          error: "Employee with this email already exists",
        },
        { status: 409 }
      );
    }

    const errorMessage = pgError.message || "Failed to create employee";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
