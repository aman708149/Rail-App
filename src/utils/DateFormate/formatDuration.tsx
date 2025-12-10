import { DateTime } from "luxon";

export const formatDuration = (duration: string): string => {
    const [hours, minutes] = duration.split(":");
    return `${hours}h:${minutes}m`;
  };
  
  // Function to format time
export const formatTimeHHMM = (timeString: string): string => {
  // Parse the time string into a DateTime object using 24-hour format (HHmm)
  const time = DateTime.fromFormat(timeString, 'HHmm');
  
  // Return the formatted time in 12-hour format with AM/PM
  return time.isValid ? formatDuration(time.toFormat('HH:mm')) : 'Invalid time format';
};