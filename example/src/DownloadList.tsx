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
  pauseDownload,
  resumeDownload,
  removeDownload,
  getAllDownloads,
  type DownloadItem,
} from 'react-native-tpstreams';

const DownloadList = () => {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription: any = null;

    const setupProgressListener = async () => {
      try {
        // Initial load of all downloads
        const initialDownloads = await getAllDownloads();
        setDownloads(initialDownloads);

        // Start listening for progress updates
        await addDownloadProgressListener();

        // Add listener for progress updates
        subscription = onDownloadProgressChanged((updatedDownloads) => {
          setDownloads(updatedDownloads);
        });

        setLoading(false);
      } catch (error) {
        console.error('Failed to setup download progress listener:', error);
        setLoading(false);
        Alert.alert('Error', 'Failed to load downloads');
      }
    };

    setupProgressListener();

    // Cleanup function
    return () => {
      if (subscription) {
        subscription.remove();
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
        <Text style={styles.title}>
          {item.title || `Video ${item.videoId}`}
        </Text>
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading downloads...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Downloads ({downloads.length})</Text>

      <ScrollView style={styles.scrollView}>
        {downloads.length > 0 ? (
          downloads.map(renderDownloadItem)
        ) : (
          <Text style={styles.emptyText}>No downloads available</Text>
        )}
      </ScrollView>
    </View>
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
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
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
    marginTop: 20,
  },
});

export default DownloadList;
