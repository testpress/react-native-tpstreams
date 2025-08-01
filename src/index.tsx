import { NativeModules } from 'react-native';
// Export the native component with a different name to avoid conflicts
export { default as TPStreamsPlayerNative } from './TPStreamsPlayerViewNativeComponent';
export * from './TPStreamsPlayerViewNativeComponent';

// Export the wrapper component as TPStreamsPlayerView
export { default as TPStreamsPlayerView } from './TPStreamsPlayer';
export type { TPStreamsPlayerRef } from './TPStreamsPlayer';

export {
  pauseDownload,
  resumeDownload,
  removeDownload,
  isDownloaded,
  isDownloading,
  isPaused,
  getDownloadStatus,
  getAllDownloads,
  addDownloadProgressListener,
  removeDownloadProgressListener,
  onDownloadProgressChanged,
  type DownloadItem,
  type DownloadProgressChange,
  type DownloadProgressListener,
} from './TPStreamsDownload';

const TPStreamsModule = NativeModules.TPStreams;

export const TPStreams = {
  initialize: (organizationId: string): void => {
    TPStreamsModule.initialize(organizationId);
  },
};
