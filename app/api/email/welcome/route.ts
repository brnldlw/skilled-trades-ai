import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "../../../lib/emailService";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, firstName } = body;

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const sent = await sendWelcomeEmail({ to: email, firstName: firstName || "" });

    return NextResponse.json({ sent });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed" },
      { status: 500 }
    );
  }
}