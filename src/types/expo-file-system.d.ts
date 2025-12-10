// This file extends the Expo FileSystem type definitions
declare module "expo-file-system/legacy" {
  // add any missing exports here
  export const cacheDirectory: string;

  export interface DownloadResult {
    uri: string;
    status?: number;
    headers?: Record<string, string>;
    md5?: string | null;
  }

  export function downloadAsync(
    uri: string,
    fileUri: string,
    options?: any
  ): Promise<DownloadResult>;
}
