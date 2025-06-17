import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { TPStreamsDownload } from 'react-native-tpstreams';
import type { DownloadItem } from 'react-native-tpstreams';

interface DownloadExampleProps {
  onBack?: () => void;
}

export default function DownloadExample({ onBack }: DownloadExampleProps) {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = async () => {
    try {
      setLoading(true);
      const downloadItems = await TPStreamsDownload.getDownloads();
      setDownloads(downloadItems);
    } catch (error) {
      Alert.alert('Error', 'Failed to load downloads');
    } finally {
      setLoading(false);
    }
  };

  const handlePauseResume = async (item: DownloadItem) => {
    try {
      if (item.state === 1) {
        // DOWNLOADING
        await TPStreamsDownload.pauseDownload(item.videoId);
      } else if (item.state === 2) {
        // PAUSED
        await TPStreamsDownload.resumeDownload(item.videoId);
      }
      loadDownloads();
    } catch (error) {
      Alert.alert('Error', `Failed to pause/resume download`);
    }
  };

  const handleCancel = async (videoId: string) => {
    try {
      await TPStreamsDownload.cancelDownload(videoId);
      loadDownloads();
    } catch (error) {
      Alert.alert('Error', `Failed to cancel download`);
    }
  };

  const getStateText = (state: number): string => {
    switch (state) {
      case 0:
        return 'Idle';
      case 1:
        return 'Downloading';
      case 2:
        return 'Paused';
      case 3:
        return 'Completed';
      case 4:
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  const renderDownloadItem = ({ item }: { item: DownloadItem }) => {
    const isPaused = item.state === 2;
    const isDownloading = item.state === 1;

    return (
      <View style={styles.downloadItem}>
        <View style={styles.downloadInfo}>
          <Text style={styles.title}>{item.title || 'Untitled'}</Text>
          <Text style={styles.status}>Status: {getStateText(item.state)}</Text>
          <Text style={styles.progress}>
            Progress: {Math.round(item.progressPercentage)}%
          </Text>
        </View>

        <View style={styles.actions}>
          {(isDownloading || isPaused) && (
            <TouchableOpacity
              style={styles.button}
              onPress={() => handlePauseResume(item)}
            >
              <Text style={styles.buttonText}>
                {isPaused ? 'Resume' : 'Pause'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => handleCancel(item.videoId)}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Downloads</Text>
      </View>

      {loading ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : downloads.length === 0 ? (
        <Text style={styles.noDownloads}>No downloads found</Text>
      ) : (
        <FlatList
          data={downloads}
          renderItem={renderDownloadItem}
          keyExtractor={(item) => item.videoId}
          style={styles.list}
        />
      )}

      <TouchableOpacity style={styles.refreshButton} onPress={loadDownloads}>
        <Text style={styles.buttonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2196F3',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  loading: {
    textAlign: 'center',
    marginTop: 20,
  },
  noDownloads: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  list: {
    flex: 1,
  },
  downloadItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  downloadInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  progress: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
  },
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  refreshButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
});
