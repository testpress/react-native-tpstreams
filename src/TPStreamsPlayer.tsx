import { forwardRef, useImperativeHandle, useRef, useCallback } from 'react';
import TPStreamsPlayerView, {
  Commands,
} from './TPStreamsPlayerViewNativeComponent';
import type { NativeProps } from './TPStreamsPlayerViewNativeComponent';

// Create a unique ID for each instance to track promises
let nextInstanceId = 0;

// Type for tracking promises waiting to be resolved
type PromiseMap = {
  [key: string]: {
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
  };
};

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

/**
 * TPStreamsPlayer - React component wrapper for TPStreamsPlayerView
 * Provides a simple imperative API for controlling the player
 */
const TPStreamsPlayer = forwardRef<TPStreamsPlayerRef, NativeProps>(
  (props, ref) => {
    const nativeRef = useRef(null);
    const instanceId = useRef<number>(nextInstanceId++);
    // Keep track of promises that are waiting for native events
    const promiseMap = useRef<PromiseMap>({});

    // Event handlers that resolve promises
    const onCurrentPosition = useCallback((event: any) => {
      const key = `position-${instanceId.current}`;
      if (promiseMap.current[key]) {
        const handler = promiseMap.current[key];
        if (handler) {
          handler.resolve(event.nativeEvent.position);
          delete promiseMap.current[key];
        }
      }
    }, []);

    const onDuration = useCallback((event: any) => {
      const key = `duration-${instanceId.current}`;
      if (promiseMap.current[key]) {
        const handler = promiseMap.current[key];
        if (handler) {
          handler.resolve(event.nativeEvent.duration);
          delete promiseMap.current[key];
        }
      }
    }, []);

    const onIsPlaying = useCallback((event: any) => {
      const key = `isPlaying-${instanceId.current}`;
      if (promiseMap.current[key]) {
        const handler = promiseMap.current[key];
        if (handler) {
          handler.resolve(event.nativeEvent.isPlaying);
          delete promiseMap.current[key];
        }
      }
    }, []);

    const onPlaybackSpeed = useCallback((event: any) => {
      const key = `playbackSpeed-${instanceId.current}`;
      if (promiseMap.current[key]) {
        const handler = promiseMap.current[key];
        if (handler) {
          handler.resolve(event.nativeEvent.speed);
          delete promiseMap.current[key];
        }
      }
    }, []);

    useImperativeHandle(ref, () => ({
      play: () => {
        if (nativeRef.current) {
          Commands.play(nativeRef.current);
        }
      },
      pause: () => {
        if (nativeRef.current) {
          Commands.pause(nativeRef.current);
        }
      },
      seekTo: (positionMs: number) => {
        if (nativeRef.current) {
          Commands.seekTo(nativeRef.current, positionMs);
        }
      },
      setPlaybackSpeed: (speed: number) => {
        if (nativeRef.current) {
          Commands.setPlaybackSpeed(nativeRef.current, speed);
        }
      },
      getCurrentPosition: () => {
        return new Promise<number>((resolve, reject) => {
          if (nativeRef.current) {
            const key = `position-${instanceId.current}`;
            promiseMap.current[key] = { resolve, reject };
            Commands.getCurrentPosition(nativeRef.current);

            // Set a timeout to reject the promise if it's not resolved in time
            setTimeout(() => {
              if (promiseMap.current[key]) {
                reject(new Error('Timeout getting current position'));
                delete promiseMap.current[key];
              }
            }, 5000);
          } else {
            reject(new Error('Player is not initialized'));
          }
        });
      },
      getDuration: () => {
        return new Promise<number>((resolve, reject) => {
          if (nativeRef.current) {
            const key = `duration-${instanceId.current}`;
            promiseMap.current[key] = { resolve, reject };
            Commands.getDuration(nativeRef.current);

            setTimeout(() => {
              if (promiseMap.current[key]) {
                reject(new Error('Timeout getting duration'));
                delete promiseMap.current[key];
              }
            }, 5000);
          } else {
            reject(new Error('Player is not initialized'));
          }
        });
      },
      isPlaying: () => {
        return new Promise<boolean>((resolve, reject) => {
          if (nativeRef.current) {
            const key = `isPlaying-${instanceId.current}`;
            promiseMap.current[key] = { resolve, reject };
            Commands.isPlaying(nativeRef.current);

            setTimeout(() => {
              if (promiseMap.current[key]) {
                reject(new Error('Timeout getting playing state'));
                delete promiseMap.current[key];
              }
            }, 5000);
          } else {
            reject(new Error('Player is not initialized'));
          }
        });
      },
      getPlaybackSpeed: () => {
        return new Promise<number>((resolve, reject) => {
          if (nativeRef.current) {
            const key = `playbackSpeed-${instanceId.current}`;
            promiseMap.current[key] = { resolve, reject };
            Commands.getPlaybackSpeed(nativeRef.current);

            setTimeout(() => {
              if (promiseMap.current[key]) {
                reject(new Error('Timeout getting playback speed'));
                delete promiseMap.current[key];
              }
            }, 5000);
          } else {
            reject(new Error('Player is not initialized'));
          }
        });
      },
    }));

    // Add event handlers to the combined props
    const combinedProps = {
      ...props,
      onCurrentPosition,
      onDuration,
      onIsPlaying,
      onPlaybackSpeed,
    };

    return <TPStreamsPlayerView {...combinedProps} ref={nativeRef} />;
  }
);

export default TPStreamsPlayer;
