from pathlib import Path
import shutil

PAGE = Path("app/hvac_units/page.tsx")

text = PAGE.read_text(encoding="utf-8")

title_options = [
    '<SectionCard title="Legacy Measurements / Observations">',
    '<SectionCard title="Measurements / Observations">',
]

title_idx = -1
title_used = None
for title in title_options:
    title_idx = text.find(title)
    if title_idx != -1:
        title_used = title
        break

if title_idx == -1:
    raise RuntimeError("Could not find Measurements / Observations section.")

wrapper_open = '<div style={{ marginTop: 16 }}>'
wrapper_start = text.rfind(wrapper_open, 0, title_idx)
if wrapper_start == -1:
    raise RuntimeError("Could not find wrapper start before Measurements / Observations.")

section_close = text.find("</SectionCard>", title_idx)
if section_close == -1:
    raise RuntimeError("Could not find </SectionCard> for Measurements / Observations.")
section_close_end = section_close + len("</SectionCard>")

wrapper_close = text.find("</div>", section_close_end)
if wrapper_close == -1:
    raise RuntimeError("Could not find wrapper closing </div> after Measurements / Observations.")
wrapper_close_end = wrapper_close + len("</div>")

block = text[wrapper_start:wrapper_close_end]
text_without = text[:wrapper_start] + text[wrapper_close_end:]

anchor = "{/* step-wrappers-page-reflow-v1-step-3 */}"
insert_at = text_without.find(anchor)
if insert_at == -1:
    raise RuntimeError("Could not find Step 3 anchor.")

updated = text_without[:insert_at] + block + "\n\n" + text_without[insert_at:]

backup = PAGE.with_name(PAGE.name + ".move-measurements-before-step3.bak")
shutil.copy2(PAGE, backup)
PAGE.write_text(updated, encoding="utf-8")

print(f"Moved {title_used} before {anchor}")
print(f"Backup written to {backup}")