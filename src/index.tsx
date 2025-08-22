import { NativeModules } from 'react-native';
// Export the native component with a different name to avoid conflicts
export { default as TPStreamsPlayerNative } from '../spec/TPStreamsPlayerViewNativeComponent';
export * from '../spec/TPStreamsPlayerViewNativeComponent';

// Export the wrapper component as TPStreamsPlayerView
export { default as TPStreamsPlayerView } from './TPStreamsPlayer';
export type { TPStreamsPlayerRef } from './TPStreamsPlayer';

// Export the original download module
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

// Export the TPStreamsDownloads TurboModule directly
export { default as TPStreamsDownloads } from '../spec/NativeTPStreamsDownloads';
export type { DownloadItem as TPStreamsDownloadsItem } from '../spec/NativeTPStreamsDownloads';

const TPStreamsModule = NativeModules.TPStreams;

export const TPStreams = {
  initialize: (organizationId: string): void => {
    TPStreamsModule.initialize(organizationId);
  },
};
