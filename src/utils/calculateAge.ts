export const calculateAge = (
  birthyear: number,
  birthmonth: number,
  birthday: number
): number => {
  try {
    const today = new Date();
    const birthDate = new Date(birthyear, birthmonth - 1, birthday); // JS uses 0-indexed months

    if (isNaN(birthDate.getTime())) {
      console.warn("❌ Invalid birth date provided:", birthyear, birthmonth, birthday);
      return 0;
    }

    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  } catch (error) {
    console.error("calculateAge() failed:", error);
    return 0; // fallback in case of error
  }
};
