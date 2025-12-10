export const formatDateType = (dateString: string) => {
  if (!dateString) return "";

  let date: Date;

  // CASE 1: Backend format like 15-11-2025 (DD-MM-YYYY)
  if (dateString.includes("-")) {
    const parts = dateString.split("-");
    if (parts[0].length === 2 && parts[1].length === 2) {
      // Convert DD-MM-YYYY → YYYY-MM-DD for JS
      date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    } else {
      date = new Date(dateString); // ISO format
    }
  }
  // CASE 2: Support 15/11/2025
  else if (dateString.includes("/")) {
    const parts = dateString.split("/");
    if (parts[0].length === 2 && parts[1].length === 2) {
      date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    } else {
      date = new Date(dateString);
    }
  }
  else {
    date = new Date(dateString);
  }

  // If still invalid → return original
  if (isNaN(date.getTime())) return dateString;

  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
};

// FORMAT: dd-MM-yyyy  --->  EEE, dd MMM  (e.g. Tue, 10 Dec)
export function formatDateWithDayandmonth(dateString: string, onlyMinute: boolean = false) {
  if (!dateString) return "";

  // Split dd-MM-yyyy → [dd, MM, yyyy]
  const parts = dateString.split("-");
  if (parts.length !== 3) return dateString;  // invalid format

  const [day, month, year] = parts;

  // Create JS Date → Correctly formatted
  const date = new Date(`${year}-${month}-${day}`);

  if (isNaN(date.getTime())) return dateString; // invalid date

  // Format output → "Tue, 10 Dec"
  const formatted = date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

  return formatted;  // e.g. "Mon, 25 Dec"
}

export function formatDateWithDay(inputDateStr: string): string {
  if (!inputDateStr) return ""; // safety check

  const parts = inputDateStr.split("-");
  if (parts.length !== 3) return inputDateStr; // invalid format

  const [day, month, year] = parts;
  const date = new Date(`${year}-${month}-${day}`); // create JS date

  if (isNaN(date.getTime())) return inputDateStr; // invalid date

  return date.toLocaleDateString("en-US", {
    weekday: "short",  // Mon, Tue...
    day: "numeric",    // 12, 25...
    month: "short",    // Jan, Feb...
  });
}


