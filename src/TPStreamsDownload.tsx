import { NativeModules } from 'react-native';

const { TPStreamsDownload } = NativeModules;

export interface DownloadItem {
  videoId: string;
  assetId: string;
  title: string;
  thumbnailUrl?: string;
  totalBytes: number;
  downloadedBytes: number;
  progressPercentage: number;
  state: number;
}

export default {
  getDownloads(): Promise<DownloadItem[]> {
    return TPStreamsDownload.getDownloads();
  },

  getDownloadStatus(videoId: string): Promise<number> {
    return TPStreamsDownload.getDownloadStatus(videoId);
  },

  pauseDownload(videoId: string): Promise<boolean> {
    return TPStreamsDownload.pauseDownload(videoId);
  },

  resumeDownload(videoId: string): Promise<boolean> {
    return TPStreamsDownload.resumeDownload(videoId);
  },

  cancelDownload(videoId: string): Promise<boolean> {
    return TPStreamsDownload.cancelDownload(videoId);
  },

  isDownloaded(videoId: string): Promise<boolean> {
    return TPStreamsDownload.isDownloaded(videoId);
  },
};
