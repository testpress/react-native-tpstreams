import { NativeModules, Platform } from 'react-native';
// Export the native component with a different name to avoid conflicts
export { default as TPStreamsPlayerNative } from './TPStreamsPlayerViewNativeComponent';
export * from './TPStreamsPlayerViewNativeComponent';

// Export the wrapper component as TPStreamsPlayerView
export { default as TPStreamsPlayerView } from './TPStreamsPlayer';
export type { TPStreamsPlayerRef, WatermarkConfig } from './TPStreamsPlayer';

export {
  startDownload,
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
  onDownloadStateChanged,
  onDownloadStarted,
  onDownloadPaused,
  onDownloadResumed,
  onDownloadCompleted,
  onDownloadFailed,
  onDownloadDeleted,
  type DownloadItem,
  type DownloadProgressChange,
  type DownloadProgressListener,
  type DownloadStateChangeListener,
} from './TPStreamsDownload';

const TPStreamsModule = NativeModules.TPStreams;

export interface TPStreamsConfig {
  allowFallbackToL3?: boolean;
}

export const TPStreams = {
  initialize: (organizationId: string, config: TPStreamsConfig = {}): void => {
    if (Platform.OS === 'android') {
      TPStreamsModule.initialize(organizationId, {
        allowFallbackToL3: config.allowFallbackToL3 ?? false,
      });
    } else {
      TPStreamsModule.initialize(organizationId);
    }
  },
};

export { default as TPStreamsLiveChat } from './TPStreamsLiveChat';
export type {
  TPStreamsLiveChatProps,
  TPStreamsLiveChatRef,
  ChatColors,
  ChatTypography,
  ChatMessage,
} from './types/TPStreamsLiveChatTypes';
