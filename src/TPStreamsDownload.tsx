import { NativeModules, NativeEventEmitter } from 'react-native';
import type { EmitterSubscription } from 'react-native';

const { TPStreamsDownload } = NativeModules;

export interface DownloadItem {
  videoId: string;
  title: string;
  thumbnailUrl?: string;
  totalBytes: number;
  downloadedBytes: number;
  progressPercentage: number;
  state: string;
  metadata: Record<string, any>;
}

export type DownloadProgressChange = DownloadItem;
export type DownloadProgressListener = (
  downloads: DownloadProgressChange[]
) => void;

export interface DownloadError {
  message: string;
  type: string;
}

export type DownloadStateChangeListener = (
  downloadItem: DownloadItem,
  error: DownloadError | null
) => void;

const downloadEventEmitter = new NativeEventEmitter(TPStreamsDownload);

export function startDownload(
  videoId: string,
  accessToken: string,
  resolution: string | null = null,
  metadata: Record<string, any> | null = null
): Promise<void> {
  return TPStreamsDownload.startDownload(
    videoId,
    accessToken,
    resolution,
    metadata
  );
}

export function addDownloadProgressListener(): Promise<void> {
  return TPStreamsDownload.addDownloadProgressListener();
}

export function removeDownloadProgressListener(): Promise<void> {
  return TPStreamsDownload.removeDownloadProgressListener();
}

export function onDownloadProgressChanged(
  listener: DownloadProgressListener
): EmitterSubscription {
  return downloadEventEmitter.addListener(
    'onDownloadProgressChanged',
    listener
  );
}

export function onDownloadStateChanged(
  listener: DownloadStateChangeListener
): EmitterSubscription {
  return downloadEventEmitter.addListener('onDownloadStateChanged', (event) => {
    listener(event.downloadItem, event.error);
  });
}

export function onDownloadStarted(
  listener: DownloadStateChangeListener
): EmitterSubscription {
  return downloadEventEmitter.addListener('onDownloadStarted', (event) => {
    listener(event.downloadItem, event.error);
  });
}

export function onDownloadPaused(
  listener: DownloadStateChangeListener
): EmitterSubscription {
  return downloadEventEmitter.addListener('onDownloadPaused', (event) => {
    listener(event.downloadItem, event.error);
  });
}

export function onDownloadResumed(
  listener: DownloadStateChangeListener
): EmitterSubscription {
  return downloadEventEmitter.addListener('onDownloadResumed', (event) => {
    listener(event.downloadItem, event.error);
  });
}

export function onDownloadCompleted(
  listener: DownloadStateChangeListener
): EmitterSubscription {
  return downloadEventEmitter.addListener('onDownloadCompleted', (event) => {
    listener(event.downloadItem, event.error);
  });
}

export function onDownloadFailed(
  listener: DownloadStateChangeListener
): EmitterSubscription {
  return downloadEventEmitter.addListener('onDownloadFailed', (event) => {
    listener(event.downloadItem, event.error);
  });
}

export function onDownloadDeleted(
  listener: (videoId: string) => void
): EmitterSubscription {
  return downloadEventEmitter.addListener('onDownloadDeleted', (event) => {
    listener(event.videoId);
  });
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
