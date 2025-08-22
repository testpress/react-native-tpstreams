import { NativeModules } from 'react-native';

import TPStreamsPlayerViewNativeComponent from '../spec/TPStreamsPlayerViewNativeComponent';
import type {
  ErrorEvent,
  NativeProps,
} from '../spec/TPStreamsPlayerViewNativeComponent';
import NativeTPStreamsDownloads from '../spec/NativeTPStreamsDownloads';
import type { DownloadItem as TPStreamsDownloadsItem } from '../spec/NativeTPStreamsDownloads';

export const TPStreamsPlayerNative = TPStreamsPlayerViewNativeComponent;
export type { ErrorEvent, NativeProps };

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
export const TPStreamsDownloads = NativeTPStreamsDownloads;
export type { TPStreamsDownloadsItem };

const TPStreamsModule = NativeModules.TPStreams;

export const TPStreams = {
  initialize: (organizationId: string): void => {
    TPStreamsModule.initialize(organizationId);
  },
};
