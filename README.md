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

- `onAccessTokenExpired(videoId: string, callback: (newToken: string) => void)`: Fires when the access token expires. Call the callback with a new token to continue playback.

---

## Player Props

- `videoId`: (Required) The ID of the video to play.

- `accessToken`: (Required) Access token for the video.

- `startAt`: (Optional) Position in seconds where playback should start. Default is 0.

- `shouldAutoPlay`: (Optional) Whether the video should start playing automatically. Default is true.

- `showDefaultCaptions`: (Optional) Whether to show default captions if available. Default is false.

- `enableDownload`: (Optional) Whether to enable download functionality for the video. When set to true, the player will show a download button. Default is false.

- `downloadMetadata`: (Optional) Custom metadata to attach to downloads. Accepts an object with string key-value pairs. This metadata is stored with the download and can be retrieved later. Default is undefined.

---

## Downloads

### Download Methods

- `pauseDownload(videoId: string)`: Pauses an ongoing download. Returns `Promise<void>`.

- `resumeDownload(videoId: string)`: Resumes a paused download. Returns `Promise<void>`.

- `removeDownload(videoId: string)`: Removes a downloaded video. Returns `Promise<void>`.

- `isDownloaded(videoId: string)`: Checks if a video has been downloaded. Returns `Promise<boolean>`.

- `isDownloading(videoId: string)`: Checks if a video is currently downloading. Returns `Promise<boolean>`.

- `isPaused(videoId: string)`: Checks if a video download is paused. Returns `Promise<boolean>`.

- `getDownloadStatus(videoId: string)`: Gets the download status of a video as a descriptive string. Returns `Promise<string>`.

- `getAllDownloads()`: Gets all downloaded videos. Returns `Promise<DownloadItem[]>`.

### Real-time Download Progress

The library provides real-time download progress updates for optimal performance:

#### Progress Listener Methods

- `addDownloadProgressListener()`: Starts listening for download progress updates. Returns `Promise<void>`.

- `removeDownloadProgressListener()`: Stops listening for download progress updates. Returns `Promise<void>`.

- `onDownloadProgressChanged(listener: DownloadProgressListener)`: Adds a listener for progress changes. Returns `EmitterSubscription`.

#### Progress Listener Types

```typescript
// Progress update event (uses existing DownloadItem interface)
type DownloadProgressChange = DownloadItem;

// Listener function type
type DownloadProgressListener = (downloads: DownloadProgressChange[]) => void;
```

### Download Item

The download item object (`DownloadItem`) contains information about a downloaded or downloading video, including:

- `videoId`: The ID of the video.
- `title`: The title of the video.
- `thumbnailUrl`: URL to the video thumbnail (if available).
- `totalBytes`: Total size of the video in bytes.
- `downloadedBytes`: Number of bytes downloaded so far.
- `progressPercentage`: Download progress from 0 to 100.
- `state`: The current state of the download as String (Queued, Downloading, Completed, Failed, Removing, Restarting, Paused).
- `metadata`: Custom metadata attached to the download as a JSON string (if provided during download).

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
        onAccessTokenExpired={async (videoId, callback) => {
          // Fetch a new token from your server
          const newToken = await getNewTokenForVideo(videoId);
          callback(newToken);
        }}
        downloadMetadata={{
          category: 'educational',
          subject: 'mathematics',
          level: 'intermediate'
        }}
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
  getAllDownloads,
  getDownloadStatus,
  isDownloaded,
  isDownloading,
  type DownloadItem,
} from 'react-native-tpstreams';

// Get all downloads
const loadDownloads = async () => {
  try {
    const items: DownloadItem[] = await getAllDownloads();
    console.log(`Found ${items.length} downloads`);
    return items;
  } catch (error) {
    console.error('Failed to load downloads:', error);
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

## Real-time Download Progress Example

Here's a complete example showing how to implement real-time download progress in a React Native component:

```jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {
  addDownloadProgressListener,
  removeDownloadProgressListener,
  onDownloadProgressChanged,
  pauseDownload,
  resumeDownload,
  removeDownload,
  type DownloadItem,
  type DownloadProgressChange,
} from 'react-native-tpstreams';

const DownloadProgressExample = () => {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Setup progress listener when component mounts
    const setupProgressListener = async () => {
      try {
        // Start listening for progress updates
        await addDownloadProgressListener();
        
        // Add listener for progress updates
        const subscription = onDownloadProgressChanged((downloads: DownloadProgressChange[]) => {
          console.log('Progress changes received:', downloads.length, 'downloads');
          
          // Simply replace the state with the complete list from native
          setDownloads(downloads);
        });

        // Cleanup function
        return () => {
          subscription.remove(); // Remove the listener
          removeDownloadProgressListener(); // Stop listening
        };
      } catch (error) {
        console.error('Failed to setup progress listener:', error);
        setIsInitializing(false);
      }
    };

    setupProgressListener();
  }, []);

  const handlePauseDownload = async (videoId: string) => {
    try {
      await pauseDownload(videoId);
      console.log('Download paused successfully');
    } catch (error) {
      console.error('Error pausing download:', error);
      Alert.alert('Error', 'Failed to pause download');
    }
  };

  const handleResumeDownload = async (videoId: string) => {
    try {
      await resumeDownload(videoId);
      console.log('Download resumed successfully');
    } catch (error) {
      console.error('Error resuming download:', error);
      Alert.alert('Error', 'Failed to resume download');
    }
  };

  const handleRemoveDownload = async (videoId: string) => {
    try {
      await removeDownload(videoId);
      console.log('Download removed successfully');
    } catch (error) {
      console.error('Error removing download:', error);
      Alert.alert('Error', 'Failed to remove download');
    }
  };

  const renderDownloadItem = (item: DownloadItem) => {
    const isCompleted = item.state === 'Completed';
    const isDownloading = item.state === 'Downloading';
    const isPaused = item.state === 'Paused';

    return (
      <View key={item.videoId} style={styles.downloadItem}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.status}>Status: {item.state}</Text>
        
        {!isCompleted && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${item.progressPercentage}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {item.progressPercentage.toFixed(1)}%
            </Text>
          </View>
        )}
        
        {item.totalBytes > 0 && (
          <Text style={styles.bytesText}>
            {(item.downloadedBytes / (1024 * 1024)).toFixed(1)} MB / 
            {(item.totalBytes / (1024 * 1024)).toFixed(1)} MB
          </Text>
        )}
        
        <View style={styles.buttonContainer}>
          {!isCompleted && (
            <>
              {isDownloading && (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handlePauseDownload(item.videoId)}
                >
                  <Text style={styles.buttonText}>Pause</Text>
                </TouchableOpacity>
              )}
              
              {isPaused && (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleResumeDownload(item.videoId)}
                >
                  <Text style={styles.buttonText}>Resume</Text>
                </TouchableOpacity>
              )}
            </>
          )}
          
          <TouchableOpacity
            style={[styles.button, styles.removeButton]}
            onPress={() => handleRemoveDownload(item.videoId)}
          >
            <Text style={styles.buttonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isInitializing) {
    return (
      <View style={styles.container}>
        <Text>Loading downloads...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Downloads ({downloads.length})</Text>
      
      {downloads.length > 0 ? (
        downloads.map(renderDownloadItem)
      ) : (
        <Text style={styles.emptyText}>No downloads available</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  downloadItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  status: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    width: 40,
  },
  bytesText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  removeButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
});

export default DownloadProgressExample;
```

### Key Features of the Real-time Progress System:

1. **Real-time Updates**: Progress bars and status update in real-time
2. **Automatic UI Updates**: UI automatically reflects current download states
3. **Efficient State Management**: Uses functional state updates to avoid race conditions
4. **Proper Cleanup**: Removes listeners when component unmounts
5. **Error Handling**: Graceful error handling with user feedback
6. **Type Safety**: Full TypeScript support with proper types

### Best Practices:

1. **Start listening when needed**: Only start the progress listener when your screen is active
2. **Stop listening when not needed**: Always stop listening to save resources
3. **Use functional state updates**: Prevents race conditions with concurrent updates
4. **Debounce if needed**: Consider debouncing updates for better UI performance

---

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT