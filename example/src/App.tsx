import { useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Button,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { TPStreamsPlayerView } from 'react-native-tpstreams';
import type {
  TPStreamsPlayerRef,
  WatermarkConfig,
} from 'react-native-tpstreams';
import DownloadList from './DownloadList';

const SAMPLE_WATERMARKS: WatermarkConfig[] = [
  {
    text: 'DRAFT',
    x: 50,
    y: 50,
    color: 0x80ffffff,
    textSize: 24,
    opacity: 0.4,
  },
  {
    text: 'tpstreams.com',
    x: 80,
    y: 90,
    color: 0xccffffff,
    textSize: 12,
    opacity: 0.6,
    animation: {
      type: 'pingPong',
      duration: 12000,
    },
  },
];

export default function App() {
  const playerRef = useRef<TPStreamsPlayerRef>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [currentScreen, setCurrentScreen] = useState<'player' | 'downloads'>(
    'player'
  );

  const [userId] = useState('demo-user-123');
  const [showWatermarks, setShowWatermarks] = useState(true);

  const handlePlay = () => {
    playerRef.current?.play();
  };

  const handlePause = () => {
    playerRef.current?.pause();
  };

  const handleSeek = () => {
    playerRef.current?.seekTo(30000);
  };

  const handleSpeedNormal = () => {
    playerRef.current?.setPlaybackSpeed(1.0);
  };

  const handleSpeedFast = () => {
    playerRef.current?.setPlaybackSpeed(2.0);
  };

  const checkCurrentPosition = async () => {
    try {
      const position = await playerRef.current?.getCurrentPosition();
      console.log(`Current position: ${position}ms`);
    } catch (error) {
      console.error('Error getting position:', error);
    }
  };

  const checkDuration = async () => {
    try {
      const duration = await playerRef.current?.getDuration();
      console.log(`Duration: ${duration}ms`);
    } catch (error) {
      console.error('Error getting duration:', error);
    }
  };

  const checkIsPlaying = async () => {
    try {
      const playing = await playerRef.current?.isPlaying();
      console.log(`Is playing: ${playing}`);
    } catch (error) {
      console.error('Error checking play status:', error);
    }
  };

  const checkPlaybackSpeed = async () => {
    try {
      const speed = await playerRef.current?.getPlaybackSpeed();
      console.log(`Current playback speed: ${speed}`);
    } catch (error) {
      console.error('Error getting playback speed:', error);
    }
  };

  const handlePlayerStateChanged = (state: number) => {
    console.log(`Player state: ${state}`);
  };

  const handleIsPlayingChanged = (isPlaying: boolean) => {
    console.log(`Is playing: ${isPlaying}`);
  };

  const handlePlaybackSpeedChanged = (speed: number) => {
    console.log(`Playback speed: ${speed}`);
  };

  const handleIsLoadingChanged = (isLoading: boolean) => {
    console.log(`Is loading: ${isLoading}`);
  };

  const handleError = (error: {
    message: string;
    code: number;
    details?: string;
  }) => {
    const errorMessage = `Error (${error.code}): ${error.message}${error.details ? ` - ${error.details}` : ''}`;
    console.error(errorMessage);
    setLastError(errorMessage);
  };

  const handleAccessTokenExpired = useCallback(
    (expiredVideoId: string, callback: (newToken: string) => void) => {
      console.log(`Access token expired for video: ${expiredVideoId}`);
      const freshToken = 'cde2c1a6-434d-4fd1-99f4-9e2024bf2576';
      callback(freshToken);
    },
    []
  );

  const navigateToDownloads = () => {
    setCurrentScreen('downloads');
  };

  const navigateToPlayer = () => {
    setCurrentScreen('player');
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>
        {currentScreen === 'player' ? 'TPStreams Player' : 'Downloads'}
      </Text>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={
          currentScreen === 'player' ? navigateToDownloads : navigateToPlayer
        }
      >
        <Text style={styles.headerButtonText}>
          {currentScreen === 'player' ? 'View Downloads' : 'Back to Player'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (currentScreen === 'downloads') {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <DownloadList />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      <ScrollView style={styles.scrollView}>
        <View style={styles.contentContainer}>
          <View style={styles.playerContainer}>
            <TPStreamsPlayerView
              ref={playerRef}
              videoId="4P3nJXp2xFT"
              accessToken="cde2c1a6-434d-4fd1-99f4-9e2024bf2576"
              style={styles.player}
              userId={userId}
              watermarks={showWatermarks ? SAMPLE_WATERMARKS : undefined}
              onPlayerStateChanged={handlePlayerStateChanged}
              onIsPlayingChanged={handleIsPlayingChanged}
              onPlaybackSpeedChanged={handlePlaybackSpeedChanged}
              onIsLoadingChanged={handleIsLoadingChanged}
              onError={handleError}
              onAccessTokenExpired={handleAccessTokenExpired}
              enableDownload={true}
              showDefaultCaptions={true}
            />
          </View>

          {lastError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{lastError}</Text>
            </View>
          )}

          <View style={styles.configSection}>
            <Text style={styles.sectionTitle}>Configuration</Text>
            <View style={styles.configRow}>
              <Text style={styles.configLabel}>User ID</Text>
              <Text style={styles.configValue}>{userId}</Text>
            </View>
            <View style={styles.configRow}>
              <Text style={styles.configLabel}>Watermarks</Text>
              <Switch
                value={showWatermarks}
                onValueChange={setShowWatermarks}
              />
            </View>
          </View>

          <View style={styles.buttonSection}>
            <Text style={styles.sectionTitle}>Playback Controls</Text>
            <View style={styles.buttonRow}>
              <View style={styles.button}>
                <Button title="Play" onPress={handlePlay} />
              </View>
              <View style={styles.button}>
                <Button title="Pause" onPress={handlePause} />
              </View>
            </View>
            <View style={styles.buttonRow}>
              <View style={styles.button}>
                <Button title="Seek to 30s" onPress={handleSeek} />
              </View>
            </View>
          </View>

          <View style={styles.buttonSection}>
            <Text style={styles.sectionTitle}>Playback Speed</Text>
            <View style={styles.buttonRow}>
              <View style={styles.button}>
                <Button title="Normal (1x)" onPress={handleSpeedNormal} />
              </View>
              <View style={styles.button}>
                <Button title="Fast (2x)" onPress={handleSpeedFast} />
              </View>
            </View>
          </View>

          <View style={styles.buttonSection}>
            <Text style={styles.sectionTitle}>
              Player Information (Check Console)
            </Text>
            <View style={styles.buttonRow}>
              <View style={styles.button}>
                <Button
                  title="Get Current Position"
                  onPress={checkCurrentPosition}
                />
              </View>
              <View style={styles.button}>
                <Button title="Get Duration" onPress={checkDuration} />
              </View>
            </View>
            <View style={styles.buttonRow}>
              <View style={styles.button}>
                <Button title="Is Playing" onPress={checkIsPlaying} />
              </View>
              <View style={styles.button}>
                <Button
                  title="Get Playback Speed"
                  onPress={checkPlaybackSpeed}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#007AFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
  },
  headerButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: 20,
  },
  playerContainer: {
    width: '100%',
    backgroundColor: '#000',
  },
  player: {
    height: 250,
  },
  errorContainer: {
    width: '90%',
    marginTop: 10,
    padding: 10,
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#f44336',
    borderRadius: 4,
  },
  errorText: {
    color: '#b71c1c',
    fontSize: 14,
  },
  configSection: {
    width: '90%',
    padding: 12,
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  configLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  configValue: {
    fontSize: 14,
    color: '#666',
  },
  buttonSection: {
    width: '90%',
    padding: 12,
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  button: {
    minWidth: 120,
    marginHorizontal: 8,
  },
});
