import { NativeModules, NativeEventEmitter } from 'react-native';
import type { EmitterSubscription } from 'react-native';
import TPStreamsDownloads from '../spec/NativeTPStreamsDownloads';

const { TPStreamsDownload } = NativeModules;

export interface DownloadItem {
  videoId: string;
  title: string;
  thumbnailUrl?: string;
  totalBytes: number;
  downloadedBytes: number;
  progressPercentage: number;
  state: string;
  metadata: string;
}

export type DownloadProgressChange = DownloadItem;
export type DownloadProgressListener = (
  downloads: DownloadProgressChange[]
) => void;
export type DownloadStateChangeListener = (download: DownloadItem) => void;
export type DownloadErrorListener = (error: {
  videoId: string;
  message: string;
  code: number;
}) => void;

// Event constants
export const DOWNLOAD_EVENTS = {
  PROGRESS_CHANGED: 'onDownloadProgressChanged',
  STATE_CHANGED: 'onDownloadStateChanged',
  COMPLETED: 'onDownloadCompleted',
  ERROR: 'onDownloadError',
};

const downloadEventEmitter = new NativeEventEmitter(TPStreamsDownloads);

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
    DOWNLOAD_EVENTS.PROGRESS_CHANGED,
    listener
  );
}

export function onDownloadStateChanged(
  listener: DownloadStateChangeListener
): EmitterSubscription {
  return downloadEventEmitter.addListener(
    DOWNLOAD_EVENTS.STATE_CHANGED,
    listener
  );
}

export function onDownloadCompleted(
  listener: DownloadStateChangeListener
): EmitterSubscription {
  return downloadEventEmitter.addListener(DOWNLOAD_EVENTS.COMPLETED, listener);
}

export function onDownloadError(
  listener: DownloadErrorListener
): EmitterSubscription {
  return downloadEventEmitter.addListener(DOWNLOAD_EVENTS.ERROR, listener);
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
