// src/utils/icons.ts
import { Platform } from "react-native";

/**
 * Dynamically load Lucide icons for the correct platform.
 * This prevents Metro from bundling lucide-react-native in web builds.
 */
let cachedIcons: any = null;

export async function loadIcons() {
  if (cachedIcons) return cachedIcons;

  if (Platform.OS === "web") {
    cachedIcons = await import("lucide-react");
  } else {
    cachedIcons = await import("lucide-react-native");
  }

  return cachedIcons;
}
