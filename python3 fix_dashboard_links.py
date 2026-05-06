with open('app/page.tsx', 'r') as f:
    content = f.read()

# Fix quick action links on dashboard
fixes = [
    (
        'href="/hvac_units" color="#7c3aed"',
        'href="/hvac_units#ai-chat" color="#7c3aed"'
    ),
    (
        "href=\"/hvac_units\" color=\"#16a34a\"",
        "href=\"/hvac_units#calculators\" color=\"#16a34a\""
    ),
    (
        "href=\"/hvac_units\" color=\"#d97706\"",
        "href=\"/hvac_units#unit-library\" color=\"#d97706\""
    ),
]

for old, new in fixes:
    if old in content:
        content = content.replace(old, new, 1)
        print("OK: " + old[:50])
    else:
        print("MISSING: " + old[:50])

with open('app/page.tsx', 'w') as f:
    f.write(content)

print("page.tsx done")