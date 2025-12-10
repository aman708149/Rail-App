export function formatAvailabilityStatus(status: string) {
  const hasHash = status.includes("#");
  const cleaned = status.replace("#", "");

  // AVAILABLE
  if (cleaned.startsWith("AVAILABLE-")) {
    const num = cleaned.split("-")[1];
    const formatted = Number(num).toString();
    return `AV - ${formatted}${hasHash ? "#" : ""}`;
  }

  // Direct Return Categories
  const directMatch = [
    "REGRET",
    "RAC",
    "WL",
    "GNWL",
    "RLWL",
  ];

  for (const key of directMatch) {
    if (cleaned.startsWith(key)) return cleaned;
  }

  // Special Formats
  if (cleaned.startsWith("TRAIN CANCELLED")) return "CANCELLED";
  if (cleaned.startsWith("TRAIN DEPARTED")) return "DEPARTED";
  if (cleaned.startsWith("NOT AVAILABLE")) return "NOT AVL";

  // Default Result
  return cleaned;
}
