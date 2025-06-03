import { useRef, useState } from 'react';
import { View, StyleSheet, Button, Text, ScrollView } from 'react-native';
import { TPStreamsPlayer } from 'react-native-tpstreams';
import type { TPStreamsPlayerRef } from 'react-native-tpstreams';

export default function App() {
  const playerRef = useRef<TPStreamsPlayerRef>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const handlePlay = () => {
    playerRef.current?.play();
    console.log('Play called');
  };

  const handlePause = () => {
    playerRef.current?.pause();
    console.log('Pause called');
  };

  const handleSeek = () => {
    playerRef.current?.seekTo(30000);
    console.log('Seek to 30s called');
  };

  const handleSpeedNormal = () => {
    playerRef.current?.setPlaybackSpeed(1.0);
    console.log('Speed set to 1.0x');
  };

  const handleSpeedFast = () => {
    playerRef.current?.setPlaybackSpeed(2.0);
    console.log('Speed set to 2.0x');
  };

  // Get current position with the new Promise-based approach
  const checkCurrentPosition = async () => {
    try {
      const position = await playerRef.current?.getCurrentPosition();
      console.log(`Current position: ${position}ms`);
    } catch (error) {
      console.error('Error getting position:', error);
    }
  };

  // Get duration with the new Promise-based approach
  const checkDuration = async () => {
    try {
      const duration = await playerRef.current?.getDuration();
      console.log(`Duration: ${duration}ms`);
    } catch (error) {
      console.error('Error getting duration:', error);
    }
  };

  // Get playing status with the new Promise-based approach
  const checkIsPlaying = async () => {
    try {
      const playing = await playerRef.current?.isPlaying();
      console.log(`Is playing: ${playing}`);
    } catch (error) {
      console.error('Error checking play status:', error);
    }
  };

  // Get playback speed with the new Promise-based approach
  const checkPlaybackSpeed = async () => {
    try {
      const speed = await playerRef.current?.getPlaybackSpeed();
      console.log(`Current playback speed: ${speed}`);
    } catch (error) {
      console.error('Error getting playback speed:', error);
    }
  };

  // Event handlers for player events
  const handlePlayerStateChanged = (state: number) => {
    console.log(`EVENT - Player state changed: ${state}`);
  };

  const handleIsPlayingChanged = (isPlaying: boolean) => {
    console.log(`EVENT - Is playing changed: ${isPlaying}`);
  };

  const handlePlaybackSpeedChanged = (speed: number) => {
    console.log(`EVENT - Playback speed changed: ${speed}`);
  };

  const handleIsLoadingChanged = (isLoading: boolean) => {
    console.log(`EVENT - Is loading changed: ${isLoading}`);
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

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <View style={styles.playerContainer}>
          <TPStreamsPlayer
            ref={playerRef}
            videoId="3G2p5NdMaRu"
            accessToken="328f6f1c-c188-4c3f-8e38-345c9aaa1a51"
            style={styles.player}
            onPlayerStateChanged={handlePlayerStateChanged}
            onIsPlayingChanged={handleIsPlayingChanged}
            onPlaybackSpeedChanged={handlePlaybackSpeedChanged}
            onIsLoadingChanged={handleIsLoadingChanged}
            onError={handleError}
          />
        </View>

        {lastError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{lastError}</Text>
          </View>
        )}

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
              <Button title="Get Playback Speed" onPress={checkPlaybackSpeed} />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 40,
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
