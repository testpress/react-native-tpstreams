import { NativeModules } from 'react-native';
export { default as TPStreamsPlayerView } from './TPStreamsPlayerViewNativeComponent';
export * from './TPStreamsPlayerViewNativeComponent';

const TPStreamsModule = NativeModules.TPStreams;

export const TPStreams = {
  initialize: (organizationId: string): void => {
    TPStreamsModule.initialize(organizationId);
  },
};
