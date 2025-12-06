import { NextRequest, NextResponse } from "next/server";
import { FileService } from "@/lib/services/file-service";
import { EmployeeService } from "@/lib/services/employee-service";
import { handlePgError } from "@/lib/utils/pg-error-handler";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: employeeId } = await params;

    const formData = await request.formData();
    const file = formData.get("picture") as File | null;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "No file provided",
        },
        { status: 400 }
      );
    }

    if (!FileService.validateFileType(file)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Allowed types: jpg, jpeg, png, gif, webp",
        },
        { status: 400 }
      );
    }

    if (!FileService.validateFileSize(file, 5)) {
      return NextResponse.json(
        {
          success: false,
          error: "File size exceeds 5MB limit",
        },
        { status: 400 }
      );
    }

    const pictureUrl = await FileService.saveEmployeePicture(file);
    console.log("Picture saved at:", pictureUrl);
    console.log("Updating employee ID:", employeeId);

    await EmployeeService.updatePicture(employeeId, pictureUrl);
    console.log("Picture updated in database");

    return NextResponse.json({
      success: true,
      data: {
        pictureUrl,
      },
      message: "Picture updated successfully",
    });
  } catch (error: unknown) {
    return handlePgError(error, "upload picture");
  }
}
