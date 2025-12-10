export default function formatDate(inputDate: string | number | Date) {
  const dateObject = new Date(inputDate);

  const year = dateObject.getFullYear();
  const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObject.getDate().toString().padStart(2, '0');

  return `${year}${month}${day}`;
};


export function formatDateIRCTCtoAPI(dateStr: any) {
  // Split the date string into parts
  const parts = dateStr.split('-');

  // Create a new date object (Note: Month is 0-based in JavaScript)
  const date = new Date(parts[2], parts[1] - 1, parts[0]);

  // Format the date
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}


//dd-mm-yyyy----  to  -----yyyyddmm---->>>
export function DaymonthYear(dateString: string) {
  const parts = dateString.split('-'); // Splits "14-1-2024" into ["14", "1", "2024"]

  // Parts are day, month, and year. Ensure month and day are two digits
  const day = parts[0].padStart(2, '0'); // Adds leading zero if needed
  const month = parts[1].padStart(2, '0'); // Adds leading zero if needed
  const year = parts[2];

  return `${year}${month}${day}`; // Concatenates in the YYYYMMDD format
}