import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    vercel_git_commit_sha: process.env.VERCEL_GIT_COMMIT_SHA || null,
    vercel_git_commit_ref: process.env.VERCEL_GIT_COMMIT_REF || null,
    vercel_env: process.env.VERCEL_ENV || null,
    node_env: process.env.NODE_ENV || null,
    now: new Date().toISOString(),
  });
}