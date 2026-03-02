
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const k = process.env.OPENAI_API_KEY || "";
  return NextResponse.json({
    hasKey: !!k,
    prefix: k.slice(0, 12),
    length: k.length,
    startsWithSk: k.startsWith("sk-"),
    endsWith: k.slice(-6),
  });
}