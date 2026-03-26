from pathlib import Path

path = Path("app/hvac_units/page.tsx")
text = path.read_text()

helper_name = "function findLikelyDuplicateWithoutSerial()"
if helper_name not in text:
    anchor = "async function saveCurrentUnit() {"
    if anchor not in text:
        raise SystemExit("Could not find saveCurrentUnit function anchor.")

    helper = """
function findLikelyDuplicateWithoutSerial() {
  const serialValue = serialNumber.trim();
  if (serialValue) return null;

  const customer = customerName.trim().toLowerCase();
  const site = siteName.trim().toLowerCase();
  const make = manufacturer.trim().toLowerCase();
  const modelValue = model.trim().toLowerCase();
  const tag = unitNickname.trim().toLowerCase();

  if (!customer || !site || !make || !modelValue) return null;

  return (
    savedUnits.find((u) => {
      const sameCustomer = (u.customerName || "").trim().toLowerCase() === customer;
      const sameSite = (u.siteName || "").trim().toLowerCase() === site;
      const sameMake = (u.manufacturer || "").trim().toLowerCase() === make;
      const sameModel = (u.model || "").trim().toLowerCase() === modelValue;
      const existingTag = (u.unitNickname || "").trim().toLowerCase();

      const needsReview =
        !tag || !existingTag || existingTag !== tag;

      return sameCustomer && sameSite && sameMake && sameModel && needsReview;
    }) || null
  );
}

"""
    text = text.replace(anchor, helper + anchor, 1)

check_block = """  const likelyDuplicateWithoutSerial = findLikelyDuplicateWithoutSerial();
  if (likelyDuplicateWithoutSerial) {
    alert(
      "Serial number is blank and this looks like an existing unit at this site.\\n\\n" +
      `Customer: ${likelyDuplicateWithoutSerial.customerName || "-"}\\n` +
      `Site: ${likelyDuplicateWithoutSerial.siteName || "-"}\\n` +
      `Unit Tag: ${likelyDuplicateWithoutSerial.unitNickname || "-"}\\n` +
      `Make/Model: ${likelyDuplicateWithoutSerial.manufacturer || "-"} ${likelyDuplicateWithoutSerial.model || "-"}\\n\\n` +
      "Load the existing unit if this is the same machine, or add a stronger identifier like serial number or a clear unit tag before saving."
    );
    return;
  }
"""

if check_block not in text:
    anchor = "async function saveCurrentUnit() {"
    idx = text.find(anchor)
    if idx == -1:
        raise SystemExit("Could not find saveCurrentUnit function for duplicate warning insert.")
    insert_at = idx + len(anchor)
    text = text[:insert_at] + "\n" + check_block + text[insert_at:]

path.write_text(text)
print("Added duplicate warning for blank-serial likely matches.")