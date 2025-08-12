import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  addDownloadProgressListener,
  removeDownloadProgressListener,
  onDownloadProgressChanged,
  onDownloadStateChanged,
  onDownloadCompleted,
  onDownloadError,
  pauseDownload,
  resumeDownload,
  removeDownload,
  getAllDownloads,
  type DownloadItem,
  type DownloadProgressChange,
} from 'react-native-tpstreams';

const DownloadList = () => {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let progressSubscription: any = null;
    let stateSubscription: any = null;
    let completedSubscription: any = null;
    let errorSubscription: any = null;

    // Load initial downloads
    const loadInitialDownloads = async () => {
      try {
        const items = await getAllDownloads();
        setDownloads(items);
        console.log(`Loaded ${items.length} downloads initially`);
      } catch (error) {
        console.error('Failed to load initial downloads:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    // Setup progress listener when component mounts
    const setupProgressListener = async () => {
      try {
        // Start listening for progress updates
        await addDownloadProgressListener();

        // Add listener for progress updates
        progressSubscription = onDownloadProgressChanged(
          (downloadItems: DownloadProgressChange[]) => {
            console.log(
              'Progress changes received:',
              downloadItems.length,
              'downloads'
            );
            setDownloads(downloadItems);
          }
        );

        // Add listener for state changes
        stateSubscription = onDownloadStateChanged((download) => {
          console.log(
            'Download state changed:',
            download.videoId,
            download.state
          );
          setDownloads((prevDownloads) => {
            const updatedDownloads = [...prevDownloads];
            const index = updatedDownloads.findIndex(
              (item) => item.videoId === download.videoId
            );
            if (index !== -1) {
              updatedDownloads[index] = download;
            } else {
              updatedDownloads.push(download);
            }
            return updatedDownloads;
          });
        });

        // Add listener for completed downloads
        completedSubscription = onDownloadCompleted((download) => {
          console.log('Download completed:', download.videoId);
          Alert.alert(
            'Download Complete',
            `${download.title} has been downloaded successfully.`
          );
          setDownloads((prevDownloads) => {
            const updatedDownloads = [...prevDownloads];
            const index = updatedDownloads.findIndex(
              (item) => item.videoId === download.videoId
            );
            if (index !== -1) {
              updatedDownloads[index] = download;
            }
            return updatedDownloads;
          });
        });

        // Add listener for download errors
        errorSubscription = onDownloadError((error) => {
          console.error('Download error:', error);
          Alert.alert(
            'Download Error',
            `Error downloading video: ${error.message}`
          );
        });

        loadInitialDownloads();
      } catch (error) {
        console.error('Failed to setup progress listener:', error);
        setIsInitializing(false);
      }
    };

    setupProgressListener();

    // Cleanup function
    return () => {
      if (progressSubscription) {
        progressSubscription.remove();
      }
      if (stateSubscription) {
        stateSubscription.remove();
      }
      if (completedSubscription) {
        completedSubscription.remove();
      }
      if (errorSubscription) {
        errorSubscription.remove();
      }
      removeDownloadProgressListener();
    };
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
      Alert.alert(
        'Remove Download',
        'Are you sure you want to remove this download?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Remove',
            onPress: async () => {
              await removeDownload(videoId);
              console.log('Download removed successfully');
              // Update the UI by filtering out the removed download
              setDownloads((prevDownloads) =>
                prevDownloads.filter((item) => item.videoId !== videoId)
              );
            },
            style: 'destructive',
          },
        ]
      );
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
                  { width: `${item.progressPercentage}%` },
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
            {(item.downloadedBytes / (1024 * 1024)).toFixed(1)} MB /{' '}
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading downloads...</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
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
    marginRight: 8,
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
    padding: 20,
  },
});

export default DownloadList;
