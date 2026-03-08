import { NextResponse } from "next/server";

export async function GET() {
  try {
    const openai = process.env.OPENAI_API_KEY;

    return NextResponse.json({
      ok: true,
      env: {
        OPENAI_API_KEY: openai ? "present" : "missing",
      },
    });
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      error: err?.message || "Unknown error",
    });
  }
}