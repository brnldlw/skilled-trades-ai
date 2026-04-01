from __future__ import annotations

import shutil
from pathlib import Path

TARGET = Path("app/lib/supabase/work-orders.ts")


def insert_before_once(source: str, anchor: str, block: str, label: str) -> str:
    idx = source.find(anchor)
    if idx == -1:
        raise RuntimeError(f"Could not find expected anchor for: {label}")
    return source[:idx] + block + source[idx:]


def main() -> None:
    if not TARGET.exists():
        raise FileNotFoundError(f"Missing file: {TARGET}")

    source = TARGET.read_text(encoding="utf-8")

    if "listServiceEventsForCurrentUser()" in source:
        print("Failure dashboard work-orders patch already applied.")
        return

    block = """

export async function listServiceEventsForCurrentUser() {
  const supabase = createClient();
  await getCurrentUserId();

  const { data, error } = await supabase
    .from("service_events")
    .select("*")
    .order("service_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as ServiceEventRow[];
}
"""

    source = insert_before_once(
        source,
        "export async function createServiceEventForCurrentUser(",
        block,
        "listServiceEventsForCurrentUser insert",
    )

    backup = TARGET.with_name(TARGET.name + ".failure-dashboard.bak")
    shutil.copy2(TARGET, backup)
    TARGET.write_text(source, encoding="utf-8")

    print(f"Patched {TARGET}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
