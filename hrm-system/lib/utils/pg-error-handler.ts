import { NextResponse } from "next/server";

export const PG_ERROR_CODES = {
  UNIQUE_VIOLATION: "23505",
  FOREIGN_KEY_VIOLATION: "23503",
  NOT_NULL_VIOLATION: "23502",
  CHECK_VIOLATION: "23514",
  INVALID_TEXT_REPRESENTATION: "22P02",
  NUMERIC_VALUE_OUT_OF_RANGE: "22003",
  STRING_DATA_RIGHT_TRUNCATION: "22001",
  UNDEFINED_TABLE: "42P01",
  UNDEFINED_COLUMN: "42703",
} as const;

interface PostgresError {
  code?: string;
  message?: string;
  detail?: string;
  constraint?: string;
  table?: string;
  column?: string;
}

interface ErrorResponse {
  success: false;
  error: string;
  details?: string;
  code?: string;
}

function mapPgErrorToResponse(error: PostgresError): {
  status: number;
  message: string;
  details?: string;
} {
  const { code, message, detail, constraint, table, column } = error;

  switch (code) {
    case PG_ERROR_CODES.UNIQUE_VIOLATION: {
      const field = constraint?.replace(/_key$/, "").replace(/_/g, " ") || "field";
      return {
        status: 409,
        message: `A record with this ${field} already exists`,
        details: detail,
      };
    }

    case PG_ERROR_CODES.FOREIGN_KEY_VIOLATION: {
      const field = constraint?.replace(/^fk_/, "").replace(/_/g, " ") || "related record";
      return {
        status: 400,
        message: `Invalid reference: ${field} does not exist`,
        details: detail,
      };
    }

    case PG_ERROR_CODES.NOT_NULL_VIOLATION: {
      const field = column?.replace(/_/g, " ") || "required field";
      return {
        status: 400,
        message: `Missing required field: ${field}`,
        details: detail,
      };
    }

    case PG_ERROR_CODES.CHECK_VIOLATION: {
      const field = constraint?.replace(/^chk_/, "").replace(/_/g, " ") || "field";
      return {
        status: 400,
        message: `Invalid value for ${field}`,
        details: detail,
      };
    }

    case PG_ERROR_CODES.INVALID_TEXT_REPRESENTATION:
      return {
        status: 400,
        message: "Invalid data format",
        details: detail || message,
      };

    case PG_ERROR_CODES.NUMERIC_VALUE_OUT_OF_RANGE:
      return {
        status: 400,
        message: "Numeric value out of range",
        details: detail,
      };

    case PG_ERROR_CODES.STRING_DATA_RIGHT_TRUNCATION:
      return {
        status: 400,
        message: "Data is too long for the field",
        details: detail,
      };

    case PG_ERROR_CODES.UNDEFINED_TABLE:
      return {
        status: 500,
        message: "Database configuration error",
        details: process.env.NODE_ENV === "development" ? `Table not found: ${table}` : undefined,
      };

    case PG_ERROR_CODES.UNDEFINED_COLUMN:
      return {
        status: 500,
        message: "Database configuration error",
        details: process.env.NODE_ENV === "development" ? `Column not found: ${column}` : undefined,
      };

    default:
      return {
        status: 500,
        message: "An unexpected database error occurred",
        details: process.env.NODE_ENV === "development" ? message : undefined,
      };
  }
}

export function handlePgError(
  error: unknown,
  context?: string
): NextResponse<ErrorResponse> {
  console.error(`Database error${context ? ` while ${context}` : ""}:`, error);

  const pgError = error as PostgresError;

  if (!pgError.code) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json(
      {
        success: false,
        error: context ? `Failed to ${context}` : message,
        details: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 500 }
    );
  }

  const { status, message, details } = mapPgErrorToResponse(pgError);

  const response: ErrorResponse = {
    success: false,
    error: context ? `Failed to ${context}: ${message.toLowerCase()}` : message,
    code: pgError.code,
  };

  if (details) {
    response.details = details;
  }

  return NextResponse.json(response, { status });
}

export function isPgError(error: unknown): error is PostgresError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as PostgresError).code === "string"
  );
}
