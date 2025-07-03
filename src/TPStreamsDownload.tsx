import { NativeModules } from 'react-native';

const { TPStreamsDownload } = NativeModules;

export interface DownloadItem {
  videoId: string;
  title: string;
  thumbnailUrl?: string;
  totalBytes: number;
  downloadedBytes: number;
  progressPercentage: number;
  state: string;
}

export function pauseDownload(videoId: string): Promise<void> {
  return TPStreamsDownload.pauseDownload(videoId);
}

export function resumeDownload(videoId: string): Promise<void> {
  return TPStreamsDownload.resumeDownload(videoId);
}

export function removeDownload(videoId: string): Promise<void> {
  return TPStreamsDownload.removeDownload(videoId);
}

export function isDownloaded(videoId: string): Promise<boolean> {
  return TPStreamsDownload.isDownloaded(videoId);
}

export function isDownloading(videoId: string): Promise<boolean> {
  return TPStreamsDownload.isDownloading(videoId);
}

export function isPaused(videoId: string): Promise<boolean> {
  return TPStreamsDownload.isPaused(videoId);
}

export function getDownloadStatus(videoId: string): Promise<string> {
  return TPStreamsDownload.getDownloadStatus(videoId);
}

export function getAllDownloads(): Promise<DownloadItem[]> {
  return TPStreamsDownload.getAllDownloads();
}
