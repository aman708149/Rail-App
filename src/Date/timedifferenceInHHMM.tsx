export function timedifferenceInHHMM(
  timestamp1: string,
  timestamp?: Date | null,
  onlyMinutes?: boolean
): string {
  const date1 = new Date(timestamp1);
  const date2 = timestamp || new Date();

  const diff = Math.abs(date2.getTime() - date1.getTime());
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  // Only minutes condition
  if (onlyMinutes) {
      if (minutes === 0) return "Just Now";
      if (minutes === 1) return "1 min Ago";
      if (minutes >= 60) return `${hours} hr Ago`;
      return `${minutes} mins Ago`;
  }

  // If both 0
  if (hours === 0 && minutes === 0) return "Just Now";

  // If only minutes (hours=0)
  if (hours === 0) {
      if (minutes === 1) return "1 min Ago";
      return `${minutes} mins Ago`;
  }

  // If more than 24h → Days only
  if (hours >= 24) {
      const days = Math.floor(hours / 24);
      return days === 1 ? "1 day Ago" : `${days} days Ago`;
  }

  // Default → hours + mins
  return `${hours} hr ${minutes} min Ago`;
}

export function timeDifferenceInNumber(
  timestamp1: string,
  timestamp?: Date | null,
  inMinutes: boolean = true
): number {
  const date1 = new Date(timestamp1);
  const date2 = timestamp || new Date();

  const diff = Math.abs(date2.getTime() - date1.getTime());

  return inMinutes
      ? Math.floor(diff / (1000 * 60))          // minutes
      : Math.floor(diff / (1000 * 60 * 60));   // hours
}

