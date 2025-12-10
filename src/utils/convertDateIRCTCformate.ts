export default function convertDateIRCTCformate(originalDate: string) {
  const parts = originalDate.split('-'); // Split the date by '-'
  const year = parts[2];
  const month = parts[1].padStart(2, '0'); // Ensure month is 2 digits
  const day = parts[0].padStart(2, '0'); // Ensure day is 2 digits

  return `${year}${month}${day}`;
}