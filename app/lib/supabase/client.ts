import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.https://ikoegjektbhpqcxhpgce.supabase.co;
  const anon = process.env.ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlrb2VnamVrdGJocHFjeGhwZ2NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTY4NzMsImV4cCI6MjA4ODQ5Mjg3M30.xH4ICUtM3_zLbJe7k95bGWcJTCzk-3i8PVg5Ov8K5Ds;

  if (!url || !anon) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createBrowserClient(url, anon);
}