import { NativeModules } from 'react-native';

const { TPStreamsDownload } = NativeModules;

export interface DownloadItem {
  assetId: string;
  title: string;
  thumbnailUrl?: string;
  totalBytes: number;
  downloadedBytes: number;
  progressPercentage: number;
  state: number;
}

export function pauseDownload(assetId: string): Promise<void> {
  return TPStreamsDownload.pauseDownload(assetId);
}

export function resumeDownload(assetId: string): Promise<void> {
  return TPStreamsDownload.resumeDownload(assetId);
}

export function removeDownload(assetId: string): Promise<void> {
  return TPStreamsDownload.removeDownload(assetId);
}

export function isDownloaded(assetId: string): Promise<boolean> {
  return TPStreamsDownload.isDownloaded(assetId);
}

export function isDownloading(assetId: string): Promise<boolean> {
  return TPStreamsDownload.isDownloading(assetId);
}

export function isPaused(assetId: string): Promise<boolean> {
  return TPStreamsDownload.isPaused(assetId);
}

export function getDownloadStatus(assetId: string): Promise<string> {
  return TPStreamsDownload.getDownloadStatus(assetId);
}

export function getAllDownloadItems(): Promise<DownloadItem[]> {
  return TPStreamsDownload.getAllDownloadItems();
}
