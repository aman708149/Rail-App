import axios, { AxiosError } from "axios";
import { showMessage } from "./showMessage";

export function handleAxiosError(error: unknown) {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const status = error.response.status;
      const serverMessage = error.response.data?.message;

      const message = Array.isArray(serverMessage)
        ? serverMessage[0]
        : serverMessage || getHttpStatusMessage(status);

      showMessage("Error", message); // ✔ Correct usage
    } 
    else if (error.request) {
      showMessage("Error", "Cannot reach the server. Please check your connection.");
    } 
    else {
      showMessage("Error", "Error setting up request. Please try again.");
    }
  } else {
    const msg = typeof error === "string" ? error : "Unexpected error occurred.";
    showMessage("Error", msg);
  }
}

/**
 * Returns friendly message for common HTTP status codes
 */
function getHttpStatusMessage(status: number): string {
  switch (status) {
    case 400: return "Bad Request: Please check your input.";
    case 401: return "Unauthorized: Please login again.";
    case 403: return "Forbidden: You do not have permission.";
    case 404: return "Not Found: The requested resource was not found.";
    case 405: return "Method Not Allowed: Check your HTTP method.";
    case 408: return "Request Timeout: Try again later.";
    case 409: return "Conflict: There’s a conflict in your request.";
    case 413: return "Payload Too Large: File size too big.";
    case 415: return "Unsupported Media Type: The file format isn’t supported.";
    case 429: return "Too Many Requests: Please wait a moment.";
    case 500: return "Server Error: Please try again later.";
    case 502: return "Bad Gateway: The server is unavailable.";
    case 503: return "Service Unavailable: Try again later.";
    default: return "An unexpected API error occurred.";
  }
}
