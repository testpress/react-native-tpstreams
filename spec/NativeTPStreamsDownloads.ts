import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type DownloadItem = {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  totalBytes: number;
  downloadedBytes: number;
  progressPercentage: number;
  state: string;
};

export interface Spec extends TurboModule {
  // Download management methods
  getAll(): Promise<DownloadItem[]>;
  get(videoId: string): Promise<DownloadItem | null>;
  pause(videoId: string): Promise<void>;
  resume(videoId: string): Promise<void>;
  remove(videoId: string): Promise<void>;

  // Progress monitoring methods
  startProgressUpdates(): void;
  stopProgressUpdates(): void;

  // Required by React Native's NativeEventEmitter
  // These are used internally by the event emitter
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('TPStreamsDownloads');
