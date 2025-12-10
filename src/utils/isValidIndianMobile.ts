// utils/validation.ts

/**
 * Validate Indian mobile number format and patterns
 * Works for React Native + Expo (no browser dependency)
 */
export const isValidIndianMobile = (mobile: string): boolean => {
  // Must be 10 digits, start with 6–9
  if (!/^[6-9]\d{9}$/.test(mobile)) return false;

  // Reject if all digits same (e.g. 9999999999)
  if (/^(\d)\1{9}$/.test(mobile)) return false;

  // Reject if 8 or more digits are same
  const digitCounts = new Map<string, number>();
  for (const digit of mobile) {
    digitCounts.set(digit, (digitCounts.get(digit) || 0) + 1);
  }
  if (Math.max(...digitCounts.values()) >= 8) return false;

  // Reject repeating 2- or 3-digit patterns like 8989898989 or 1231231231
  if (/(\d{2})\1{4}/.test(mobile) || /(\d{3})\1{2}/.test(mobile)) return false;

  // Reject sequential numbers
  const increasingSeq = "0123456789";
  const decreasingSeq = "9876543210";
  if (increasingSeq.includes(mobile) || decreasingSeq.includes(mobile)) return false;

  return true;
};
