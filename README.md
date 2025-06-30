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

## Player Props

- `videoId`: (Required) The ID of the video to play.

- `accessToken`: (Required) Access token for the video.

- `startAt`: (Optional) Position in seconds where playback should start. Default is 0.

- `shouldAutoPlay`: (Optional) Whether the video should start playing automatically. Default is true.

- `showDefaultCaptions`: (Optional) Whether to show default captions if available. Default is false.

- `enableDownload`: (Optional) Whether to enable download functionality for the video. When set to true, the player will show a download button. Default is false.

---

## Downloads

### Download Methods

- `pauseDownload(videoId: string)`: Pauses an ongoing download. Returns `Promise<void>`.

- `resumeDownload(videoId: string)`: Resumes a paused download. Returns `Promise<void>`.

- `removeDownload(videoId: string)`: Removes a downloaded video. Returns `Promise<void>`.

- `isDownloaded(videoId: string)`: Checks if a video has been downloaded. Returns `Promise<boolean>`.

- `isDownloading(videoId: string)`: Checks if a video is currently downloading. Returns `Promise<boolean>`.

- `isPaused(videoId: string)`: Checks if a video download is paused. Returns `Promise<boolean>`.

- `getDownloadStatus(videoId: string)`: Gets the download status of a video as a descriptive string. Returns `Promise<string>` with values like "Downloading: 45%", "Downloaded", "Paused", etc.

- `getAllDownloadItems()`: Gets all downloaded videos. Returns `Promise<DownloadItem[]>`.

### Download Item

The download item object (`DownloadItem`) contains information about a downloaded or downloading video, including:

- `assetId`: The ID of the video.
- `state`: The current state of the download (0: queued, 1: downloading, 2: completed, 3: failed, 6: stopped/paused).
- `progressPercentage`: Download progress from 0 to 100.
- `title`: The title of the video (if available).
- `thumbnailUrl`: URL to the video thumbnail (if available).

### Download States

| Constant | Value | Meaning |
|----------|-------|---------|
| STATE_QUEUED | 0 | Download is waiting to start (e.g., waiting for Wi-Fi) |
| STATE_STOPPED | 1 | Download paused/stopped due to user or other stop reason |
| STATE_DOWNLOADING | 2 | Actively downloading |
| STATE_COMPLETED | 3 | Successfully downloaded |
| STATE_FAILED | 4 | Download failed |
| STATE_REMOVING | 5 | Download is being removed |

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
        startAt={100}
        shouldAutoPlay={false}
        showDefaultCaptions={true}
        enableDownload={true}
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

## Download Example

```js
import {
  pauseDownload,
  resumeDownload,
  removeDownload,
  getAllDownloadItems,
  getDownloadStatus,
  isDownloaded,
  isDownloading,
  type DownloadItem,
} from 'react-native-tpstreams';

// Get all downloads
const loadDownloads = async () => {
  try {
    const items: DownloadItem[] = await getAllDownloadItems();
    console.log(`Found ${items.length} downloads`);
    
    items.forEach((item: DownloadItem) => {
      console.log(`Video ${item.title}: ${item.progressPercentage.toFixed(1)}% downloaded`);
      console.log(`State: ${getStateText(item.state)}`);
    });
    
    return items;
  } catch (error) {
    console.error('Failed to load downloads:', error);
  }
};

// Helper function to convert state to readable text
const getStateText = (state: number): string => {
  switch (state) {
    case 0: return 'Queued';
    case 1: return 'Paused';
    case 2: return 'Downloading';
    case 3: return 'Completed';
    case 4: return 'Failed';
    case 5: return 'Removing';
    default: return 'Unknown';
  }
};

// Check download status
const checkStatus = async (videoId: string) => {
  try {
    const status = await getDownloadStatus(videoId);
    console.log(`Status: ${status}`);
    return status;
  } catch (error) {
    console.error('Error checking status:', error);
  }
};

// Check if video is downloaded
const checkIfDownloaded = async (videoId: string) => {
  try {
    const downloaded: boolean = await isDownloaded(videoId);
    console.log(`Is downloaded: ${downloaded}`);
    return downloaded;
  } catch (error) {
    console.error('Error checking if downloaded:', error);
  }
};

// Check if video is currently downloading
const checkIfDownloading = async (videoId: string) => {
  try {
    const downloading: boolean = await isDownloading(videoId);
    console.log(`Is downloading: ${downloading}`);
    return downloading;
  } catch (error) {
    console.error('Error checking if downloading:', error);
  }
};

// Pause a download
const pauseVideoDownload = async (videoId: string) => {
  try {
    await pauseDownload(videoId);
    console.log('Download paused successfully');
    
    // Check status after pausing
    const status = await getDownloadStatus(videoId);
    console.log(`New status: ${status}`);
  } catch (error) {
    console.error('Error pausing download:', error);
  }
};

// Resume a download
const resumeVideoDownload = async (videoId: string) => {
  try {
    await resumeDownload(videoId);
    console.log('Download resumed');
    
    // Check status after resuming
    const status = await getDownloadStatus(videoId);
    console.log(`New status: ${status}`);
  } catch (error) {
    console.error('Error resuming download:', error);
  }
};

// Remove a download
const removeVideoDownload = async (videoId: string) => {
  try {
    await removeDownload(videoId);
    console.log('Download removed');
  } catch (error) {
    console.error('Error removing download:', error);
  }
};
```

---

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT