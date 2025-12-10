// 📌 Capitalize every word in a string (Production Safe)
export const capitalizeWords = (str: string): string => {
  if (!str || typeof str !== "string") return "";

  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });
};
