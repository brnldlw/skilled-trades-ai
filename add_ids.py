with open('app/hvac_units/page.tsx', 'r') as f:
    content = f.read()

replacements = [
    ('SectionCard title="Customer / Site / Unit">', 'SectionCard title="Customer / Site / Unit" id="new-job">'),
    ('SectionCard title="Measurements / Observations">', 'SectionCard title="Measurements / Observations" id="measurements">'),
    ('SectionCard title="Parts & Manuals Assist">', 'SectionCard title="Parts & Manuals Assist" id="parts-manuals">'),
    ('SectionCard title="Saved Unit History"', 'SectionCard title="Saved Unit History" id="unit-library"'),
    ('SectionCard title="Repair Decision Panel">', 'SectionCard title="Repair Decision Panel" id="repair">'),
]

for old, new in replacements:
    if old in content:
        content = content.replace(old, new, 1)
        print("OK: " + old[:50])
    else:
        print("MISSING: " + old[:50])

with open('app/hvac_units/page.tsx', 'w') as f:
    f.write(content)

print("Done")