
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  // Vercel commonly provides these env vars (some may be empty depending on setup)
  const sha =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.GIT_COMMIT_SHA ||
    process.env.COMMIT_SHA ||
    "";

  const ref =
    process.env.VERCEL_GIT_COMMIT_REF ||
    process.env.GIT_BRANCH ||
    "";

  const msg =
    process.env.VERCEL_GIT_COMMIT_MESSAGE ||
    "";

  const deploymentId = process.env.VERCEL_DEPLOYMENT_ID || "";
  const env = process.env.VERCEL_ENV || process.env.NODE_ENV || "";
  const now = new Date().toISOString();

  return NextResponse.json({
    ok: true,
    env,
    deploymentId,
    sha,
    ref,
    msg,
    serverTime: now,
  });
}