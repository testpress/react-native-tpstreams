import { NativeModules } from 'react-native';
export { default as TPStreamsPlayerView } from './TPStreamsPlayerViewNativeComponent';
export * from './TPStreamsPlayerViewNativeComponent';

export { default as TPStreamsPlayer } from './TPStreamsPlayer';
export type { TPStreamsPlayerRef } from './TPStreamsPlayer';

const TPStreamsModule = NativeModules.TPStreams;

export const TPStreams = {
  initialize: (organizationId: string): void => {
    TPStreamsModule.initialize(organizationId);
  },
};
