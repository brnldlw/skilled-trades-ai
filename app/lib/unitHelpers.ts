export function convertToStandard(
  value: number,
  unit: string
): { value: number; unit: string } | null {
  const u = unit.trim();
  if (u === "kPa") return { value: value * 0.1450377377, unit: "psi" };
  if (u === "bar") return { value: value * 14.50377377, unit: "psi" };
  if (u === "°C") return { value: (value * 9) / 5 + 32, unit: "°F" };
  if (u === "Pa") return { value: value * 0.0040146308, unit: "inWC" };
  return null;
}

export function guessDefaultUnit(label: string) {
  const s = label.toLowerCase();
  if (
    s.includes("suction") ||
    s.includes("liquid") ||
    s.includes("discharge") ||
    s.includes("head") ||
    s.includes("pressure")
  ) {
    return "psi";
  }
  if (s.includes("static") || s.includes("esp") || s.includes("inwc")) {
    return "inWC";
  }
  if (
    s.includes("temp") ||
    s.includes("temperature") ||
    s.includes("superheat") ||
    s.includes("subcool") ||
    s.includes("delta") ||
    s.includes("heat rise") ||
    s.includes("saturation") ||
    s.includes("box temp") ||
    s.includes("coil temp")
  ) {
    return "°F";
  }
  if (s.includes("amps")) return "amps";
  if (s.includes("voltage")) return "volts";
  if (s.includes("flame")) return "µA";
  return "other";
}