import { forwardRef, useImperativeHandle, useRef, useCallback } from 'react';
import TPStreamsPlayerView, {
  Commands,
} from './TPStreamsPlayerViewNativeComponent';
import type {
  NativeProps,
  ErrorEvent,
} from './TPStreamsPlayerViewNativeComponent';
import type { ViewProps } from 'react-native';

// Create a unique ID for each instance to track promises
let nextInstanceId = 0;

// Type for tracking promises waiting to be resolved
type PromiseMap = {
  [key: string]: {
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
  };
};

// Return type for player API methods
export interface TPStreamsPlayerRef {
  play: () => void;
  pause: () => void;
  seekTo: (positionMs: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  getCurrentPosition: () => Promise<number>;
  getDuration: () => Promise<number>;
  isPlaying: () => Promise<boolean>;
  getPlaybackSpeed: () => Promise<number>;
}

// Prop types for the player component
export interface TPStreamsPlayerProps extends ViewProps {
  videoId?: string;
  accessToken?: string;
  onPlayerStateChanged?: (state: number) => void;
  onIsPlayingChanged?: (isPlaying: boolean) => void;
  onPlaybackSpeedChanged?: (speed: number) => void;
  onIsLoadingChanged?: (isLoading: boolean) => void;
  onError?: (error: {
    message: string;
    code: number;
    details?: string;
  }) => void;
}

/**
 * TPStreamsPlayer - React component wrapper for TPStreamsPlayerView
 * Provides a simple imperative API for controlling the player
 */
const TPStreamsPlayer = forwardRef<TPStreamsPlayerRef, TPStreamsPlayerProps>(
  (props, ref) => {
    const {
      videoId,
      accessToken,
      style,
      onPlayerStateChanged,
      onIsPlayingChanged,
      onPlaybackSpeedChanged,
      onIsLoadingChanged,
      onError,
      ...restProps
    } = props;

    const nativeRef = useRef(null);
    const instanceId = useRef<number>(nextInstanceId++);
    const promiseMap = useRef<PromiseMap>({});

    // Event handlers that resolve promises
    const onCurrentPosition = useCallback((event: any) => {
      const key = `position-${instanceId.current}`;
      const handler = promiseMap.current[key];
      if (handler) {
        handler.resolve(event.nativeEvent.position);
        delete promiseMap.current[key];
      }
    }, []);

    const onDuration = useCallback((event: any) => {
      const key = `duration-${instanceId.current}`;
      const handler = promiseMap.current[key];
      if (handler) {
        handler.resolve(event.nativeEvent.duration);
        delete promiseMap.current[key];
      }
    }, []);

    const onIsPlaying = useCallback((event: any) => {
      const key = `isPlaying-${instanceId.current}`;
      const handler = promiseMap.current[key];
      if (handler) {
        handler.resolve(event.nativeEvent.isPlaying);
        delete promiseMap.current[key];
      }
    }, []);

    const onPlaybackSpeed = useCallback((event: any) => {
      const key = `playbackSpeed-${instanceId.current}`;
      const handler = promiseMap.current[key];
      if (handler) {
        handler.resolve(event.nativeEvent.speed);
        delete promiseMap.current[key];
      }
    }, []);

    // Player event handlers
    const handlePlayerStateChanged = useCallback(
      (event: any) => {
        onPlayerStateChanged?.(event.nativeEvent.playbackState);
      },
      [onPlayerStateChanged]
    );

    const handleIsPlayingChanged = useCallback(
      (event: any) => {
        onIsPlayingChanged?.(event.nativeEvent.isPlaying);
      },
      [onIsPlayingChanged]
    );

    const handlePlaybackSpeedChanged = useCallback(
      (event: any) => {
        onPlaybackSpeedChanged?.(event.nativeEvent.speed);
      },
      [onPlaybackSpeedChanged]
    );

    const handleIsLoadingChanged = useCallback(
      (event: any) => {
        onIsLoadingChanged?.(event.nativeEvent.isLoading);
      },
      [onIsLoadingChanged]
    );

    const handleError = useCallback(
      (event: { nativeEvent: ErrorEvent }) => {
        const { message, code, details } = event.nativeEvent;

        // Reject any pending promises with this error
        Object.entries(promiseMap.current).forEach(([key, handler]) => {
          handler.reject(
            new Error(`${message}: ${details || 'Unknown error'}`)
          );
          delete promiseMap.current[key];
        });

        // Forward the error to the client if they provided an onError handler
        onError?.({ message, code, details });
      },
      [onError]
    );

    // Helper to create promise-based API methods
    const createPromiseMethod = useCallback(
      (command: (ref: any) => void, eventKey: string) => {
        return () =>
          new Promise<any>((resolve, reject) => {
            if (nativeRef.current) {
              const key = `${eventKey}-${instanceId.current}`;
              promiseMap.current[key] = { resolve, reject };
              command(nativeRef.current);

              // Set a timeout to reject the promise if it's not resolved in time
              setTimeout(() => {
                if (promiseMap.current[key]) {
                  reject(new Error(`Timeout getting ${eventKey}`));
                  delete promiseMap.current[key];
                }
              }, 5000);
            } else {
              reject(new Error('Player is not initialized'));
            }
          });
      },
      []
    );

    useImperativeHandle(
      ref,
      () => ({
        play: () => nativeRef.current && Commands.play(nativeRef.current),
        pause: () => nativeRef.current && Commands.pause(nativeRef.current),
        seekTo: (positionMs: number) =>
          nativeRef.current && Commands.seekTo(nativeRef.current, positionMs),
        setPlaybackSpeed: (speed: number) =>
          nativeRef.current &&
          Commands.setPlaybackSpeed(nativeRef.current, speed),
        getCurrentPosition: createPromiseMethod(
          Commands.getCurrentPosition,
          'position'
        ),
        getDuration: createPromiseMethod(Commands.getDuration, 'duration'),
        isPlaying: createPromiseMethod(Commands.isPlaying, 'isPlaying'),
        getPlaybackSpeed: createPromiseMethod(
          Commands.getPlaybackSpeed,
          'speed'
        ),
      }),
      [createPromiseMethod]
    );

    // Create native props object with the correct types
    const nativeProps: NativeProps = {
      ...restProps,
      videoId,
      accessToken,
      style,
      onCurrentPosition,
      onDuration,
      onIsPlaying,
      onPlaybackSpeed,
      onPlayerStateChanged: handlePlayerStateChanged,
      onIsPlayingChanged: handleIsPlayingChanged,
      onPlaybackSpeedChanged: handlePlaybackSpeedChanged,
      onIsLoadingChanged: handleIsLoadingChanged,
      onError: handleError,
    };

    return <TPStreamsPlayerView {...nativeProps} ref={nativeRef} />;
  }
);

export default TPStreamsPlayer;
