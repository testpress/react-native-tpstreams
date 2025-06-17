# react-native-tpstreams

Video player component for TPStreams

---

## Installation

```sh
npm install react-native-tpstreams
```

---

## Getting Started

### Initialize TPStreams

First, initialize TPStreams with your organization ID. This should be done **only once** at your app's entry point (e.g., App.js or index.js):

```js
import { TPStreams } from "react-native-tpstreams";

// Initialize with your organization ID
// Do this only once at your app's entry point
TPStreams.initialize('YOUR_ORGANIZATION_ID');
```

### Add the Player Component

Then add the player component to your app:

```js
import { TPStreamsPlayerView } from "react-native-tpstreams";

// Use the player component where needed
<TPStreamsPlayerView 
  videoId="YOUR_VIDEO_ID"
  accessToken="YOUR_ACCESS_TOKEN"
  style={{ width: '100%', height: 300 }}
/>
```

---

## Player Methods

- `play()`: Starts video playback.

- `pause()`: Pauses video playback.

- `seekTo(positionMs: number)`: Seeks to position in milliseconds.

- `setPlaybackSpeed(speed: number)`: Sets playback speed (e.g., 0.5, 1.0, 2.0).

- `getCurrentPosition()`: Gets current position in milliseconds. Returns `Promise<number>`.

- `getDuration()`: Gets video duration in milliseconds. Returns `Promise<number>`.

- `isPlaying()`: Checks if video is currently playing. Returns `Promise<boolean>`.

- `getPlaybackSpeed()`: Gets current playback speed. Returns `Promise<number>`.

---

## Player Events

- `onPlayerStateChanged(state: number)`: Fires when player state changes.

- `onIsPlayingChanged(isPlaying: boolean)`: Fires when playing state changes.

- `onPlaybackSpeedChanged(speed: number)`: Fires when playback speed changes.

- `onIsLoadingChanged(isLoading: boolean)`: Fires when loading state changes.

- `onError(error: {message: string, code: number, details?: string})`: Fires when an error occurs.

---

## Example

```js
import { useRef } from 'react';
import { View, Button } from 'react-native';
import { TPStreamsPlayerView } from 'react-native-tpstreams';
import type { TPStreamsPlayerRef } from 'react-native-tpstreams';

function TPStreamsPlayerExample() {
  const playerRef = useRef<TPStreamsPlayerRef>(null);
  
  const handlePlay = () => {
    playerRef.current?.play();
  };
  
  const handlePause = () => {
    playerRef.current?.pause();
  };
  
  const handleSeek = () => {
    playerRef.current?.seekTo(30000); // 30 seconds
  };
  
  const checkPosition = async () => {
    try {
      const position = await playerRef.current?.getCurrentPosition();
      console.log(`Current position: ${position}ms`);
    } catch (error) {
      console.error('Error getting position:', error);
    }
  };
  
  return (
    <View>
      <TPStreamsPlayerView
        ref={playerRef}
        videoId="YOUR_VIDEO_ID"
        accessToken="YOUR_ACCESS_TOKEN"
        style={{ height: 250 }}
        onPlayerStateChanged={(state) => console.log(`Player state: ${state}`)}
        onIsPlayingChanged={(isPlaying) => console.log(`Is playing: ${isPlaying}`)}
        onPlaybackSpeedChanged={(speed) => console.log(`Speed changed: ${speed}x`)}
        onIsLoadingChanged={(isLoading) => console.log(`Loading: ${isLoading}`)}
        onError={(error) => console.error('Player error:', error)}
      />
      
      <Button title="Play" onPress={handlePlay} />
      <Button title="Pause" onPress={handlePause} />
      <Button title="Seek to 30s" onPress={handleSeek} />
      <Button title="2x Speed" onPress={() => playerRef.current?.setPlaybackSpeed(2.0)} />
      <Button title="Get Position" onPress={checkPosition} />
    </View>
  );
}
```

---

## Download Management

The TPStreamsDownload module provides functionality to manage downloaded videos. Download initiation is handled by the TPStreams Player SDK directly, but you can use this module to view and manage existing downloads.

### Download Methods

- `getDownloads()`: Returns `Promise<DownloadItem[]>` - Gets all download items with details

- `getDownloadStatus(videoId: string)`: Returns `Promise<number>` - Gets download state for a specific video

- `pauseDownload(videoId: string)`: Returns `Promise<boolean>` - Pauses an ongoing download

- `resumeDownload(videoId: string)`: Returns `Promise<boolean>` - Resumes a paused download

- `cancelDownload(videoId: string)`: Returns `Promise<boolean>` - Cancels and removes a download

- `isDownloaded(videoId: string)`: Returns `Promise<boolean>` - Checks if a video is downloaded

### Download States

Download states are represented as integers:
- `0` - Idle
- `1` - Downloading
- `2` - Paused
- `3` - Completed
- `4` - Failed

### DownloadItem Properties

The `DownloadItem` object contains:
- `videoId: string` - The video identifier
- `assetId: string` - The asset identifier
- `title: string` - Video title
- `thumbnailUrl?: string` - Optional thumbnail URL
- `totalBytes: number` - Total download size in bytes
- `downloadedBytes: number` - Downloaded bytes so far
- `progressPercentage: number` - Download progress (0-100)
- `state: number` - Current download state

### Download Example

```js
import { TPStreamsDownload } from 'react-native-tpstreams';
import type { DownloadItem } from 'react-native-tpstreams';

// Get all downloads
const downloads = await TPStreamsDownload.getDownloads();

// Check download state
const state = await TPStreamsDownload.getDownloadStatus('video-id');

// Manage downloads
if (state === 1) { // Downloading
  await TPStreamsDownload.pauseDownload('video-id');
} else if (state === 2) { // Paused
  await TPStreamsDownload.resumeDownload('video-id');
}

// Remove download
await TPStreamsDownload.cancelDownload('video-id');

// Check if downloaded
const isDownloaded = await TPStreamsDownload.isDownloaded('video-id');
```

---

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---