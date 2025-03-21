import { NextResponse } from "next/server";

export class ApiResponse {
  static success(message: string, status = 200) {
    return NextResponse.json(
      {
        success: true,
        data: { message },
      },
      { status }
    );
  }

  static error(message: string, errors?: any, status = 400) {
    return NextResponse.json(
      {
        success: false,
        data: { message, errors },
      },
      { status }
    );
  }
}
