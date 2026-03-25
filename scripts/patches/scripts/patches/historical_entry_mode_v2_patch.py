from pathlib import Path

path = Path("app/hvac_units/page.tsx")
text = path.read_text()

def wrap_titled_block(source: str, title: str) -> str:
    marker = f'title="{title}"'
    title_idx = source.find(marker)
    if title_idx == -1:
        raise SystemExit(f'Could not find title="{title}".')

    start = source.rfind('      <div style={{ marginTop: 16 }}>', 0, title_idx)
    if start == -1:
        raise SystemExit(f'Could not find wrapper div for "{title}".')

    i = start
    depth = 0
    end = None

    while i < len(source):
        next_open = source.find("<div", i)
        next_close = source.find("</div>", i)

        if next_close == -1:
            break

        if next_open != -1 and next_open < next_close:
            depth += 1
            i = next_open + 4
        else:
            depth -= 1
            i = next_close + len("</div>")
            if depth == 0:
                end = i
                break

    if end is None:
        raise SystemExit(f'Could not find end of wrapper div for "{title}".')

    block = source[start:end]
    if "{!historicalEntryMode ? (" in block:
        return source

    wrapped = "{!historicalEntryMode ? (\n" + block + "\n      ) : null}"
    return source[:start] + wrapped + source[end:]

for title in [
    "Saved Unit History",
    "Unit Service Timeline",
    "Service Report Generator",
]:
    if f'title="{title}"' in text:
        text = wrap_titled_block(text, title)

path.write_text(text)
print("Historical Entry Mode v2 applied.")