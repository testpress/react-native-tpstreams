import { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Button,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  TPStreamsPlayerView,
  isDownloaded,
  isDownloading,
  startDownload,
} from 'react-native-tpstreams';
import type { TPStreamsPlayerRef } from 'react-native-tpstreams';
import DownloadList from './DownloadList';

const VIDEO_ID = '7xbZeQzR36h';
const ORG_CODE = '9q94nm';
/**
 * Org API auth from POST https://app.tpstreams.com/api/auth/login/
 * Header: Authorization: Token <API_AUTH_TOKEN>
 * Local test only — do not commit real tokens to shared remotes if avoidable.
 */
const API_AUTH_TOKEN =
  'af127fb90f52103bbd5182284c747759577fa45ec276b7fce97c29e2f988745';
/** Initial player token (replaced on renewal via onAccessTokenExpired). */
const ACCESS_TOKEN = '3d9838f3-db51-4fc3-8472-075ab5e40b64';
const LICENSE_DURATION = 120; // seconds
/** One-time asset access token TTL used when renewing after license expiry. */
const RENEWAL_ACCESS_TOKEN_TTL_SECONDS = 50;

type AccessTokenResponse = {
  code: string;
  valid_until: string | null;
};

async function createOneTimeAccessToken(): Promise<string> {
  if (!API_AUTH_TOKEN) {
    throw new Error(
      'Set API_AUTH_TOKEN in example/src/App.tsx (from /api/auth/login/).'
    );
  }

  const url = `https://app.tpstreams.com/api/v1/${ORG_CODE}/assets/${VIDEO_ID}/access_tokens/`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Token ${API_AUTH_TOKEN}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      time_to_live: RENEWAL_ACCESS_TOKEN_TTL_SECONDS,
      expires_after_first_usage: true,
    }),
  });

  const bodyText = await response.text();
  if (!response.ok) {
    throw new Error(`createAccessToken failed (${response.status}): ${bodyText}`);
  }

  const data = JSON.parse(bodyText) as AccessTokenResponse;
  if (!data.code) {
    throw new Error(`createAccessToken missing code: ${bodyText}`);
  }
  console.log('[TOKEN] renewed one-time access token', {
    code: data.code,
    valid_until: data.valid_until,
    ttl: RENEWAL_ACCESS_TOKEN_TTL_SECONDS,
  });
  return data.code;
}

export default function App() {
  const playerRef = useRef<TPStreamsPlayerRef>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [currentScreen, setCurrentScreen] = useState<'player' | 'downloads'>(
    'player'
  );
  const [showPlayer, setShowPlayer] = useState(false);
  const [contentDownloaded, setContentDownloaded] = useState(false);
  const [checkingDownload, setCheckingDownload] = useState(false);
  const [downloadInProgress, setDownloadInProgress] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null);
  const [licenseTimeRemaining, setLicenseTimeRemaining] = useState(LICENSE_DURATION);
  const [licenseToastVisible, setLicenseToastVisible] = useState(false);
  const [tokenBanner, setTokenBanner] = useState<string | null>(null);

  // Countdown timer for offline license expiry
  useEffect(() => {
    if (!showPlayer) {
      setLicenseTimeRemaining(LICENSE_DURATION);
      setLicenseToastVisible(false);
      setTokenBanner(null);
      return;
    }
    const interval = setInterval(() => {
      setLicenseTimeRemaining(prev => {
        if (prev === 1) {
          setLicenseToastVisible(true);
          setTimeout(() => setLicenseToastVisible(false), 4000);
        }
        return Math.max(0, prev - 1);
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showPlayer]);

  const handleAccessTokenExpired = useCallback(
    async (videoId: string, callback: (token: string | null) => void) => {
      console.log('[TOKEN] onAccessTokenExpired', { videoId });
      setTokenBanner('Access token expired — fetching a new one-time token…');
      Alert.alert(
        'Access token expired',
        `Video ${videoId} needs a new access token. Fetching a one-time token (${RENEWAL_ACCESS_TOKEN_TTL_SECONDS}s).`
      );

      try {
        const token = await createOneTimeAccessToken();
        setTokenBanner(
          `Token renewed (one-time, ${RENEWAL_ACCESS_TOKEN_TTL_SECONDS}s): ${token.slice(0, 8)}…`
        );
        callback(token);
        setTimeout(() => setTokenBanner(null), 6000);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('[TOKEN] renewal failed', error);
        setTokenBanner(`Token renewal failed: ${message}`);
        Alert.alert('Token renewal failed', message);
        callback(null);
      }
    },
    []
  );

  // Check download status and open player
  const handleOpenPlayer = useCallback(async () => {
    setCheckingDownload(true);
    setLastError(null);
    try {
      const downloaded = await isDownloaded(VIDEO_ID);
      setContentDownloaded(downloaded);
      setShowPlayer(true);
    } catch (error) {
      console.error('Error checking download status:', error);
      // Open player anyway
      setContentDownloaded(false);
      setShowPlayer(true);
    } finally {
      setCheckingDownload(false);
    }
  }, []);

  // Check initial download state whenever landing screen is shown
  useEffect(() => {
    if (!showPlayer && currentScreen === 'player') {
      isDownloading(VIDEO_ID).then(setDownloadInProgress).catch(() => {});
      isDownloaded(VIDEO_ID).then(setContentDownloaded).catch(() => {});
    }
  }, [showPlayer, currentScreen]);

  const handleStartDownload = useCallback(async () => {
    setDownloadInProgress(true);
    setDownloadMessage('Starting download…');
    setLastError(null);
    try {
      await startDownload(VIDEO_ID, ACCESS_TOKEN, null, null, 60);
      setDownloadMessage('Download started — check Downloads tab for progress');
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setDownloadMessage(`Download failed: ${msg}`);
      setLastError(`Download failed: ${msg}`);
      setDownloadInProgress(false);
    }
  }, []);

  const handlePlayDownloadedVideo = useCallback((_videoId: string) => {
    setContentDownloaded(true);
    setShowPlayer(true);
    setCurrentScreen('player');
    setLicenseTimeRemaining(LICENSE_DURATION);
    setLicenseToastVisible(false);
    setTokenBanner(null);
    setLastError(null);
  }, []);

  const handleClosePlayer = useCallback(() => {
    setShowPlayer(false);
    setLastError(null);
  }, []);

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

  // Navigation
  const navigateToDownloads = () => {
    setCurrentScreen('downloads');
  };

  const navigateToPlayer = () => {
    setCurrentScreen('player');
  };

  // Render the navigation header
  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>
        {currentScreen === 'downloads'
          ? 'Downloads'
          : showPlayer
            ? 'TPStreams Player'
            : 'TPStreams'}
      </Text>
      <View style={styles.headerRight}>
        {currentScreen === 'player' && showPlayer && (
          <TouchableOpacity style={styles.headerButton} onPress={handleClosePlayer}>
            <Text style={styles.headerButtonText}>Close</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.headerButton}
          onPress={
            currentScreen === 'player' ? navigateToDownloads : navigateToPlayer
          }
        >
          <Text style={styles.headerButtonText}>
            {currentScreen === 'player' ? 'Downloads' : 'Player'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Main render: downloads screen
  if (currentScreen === 'downloads') {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <DownloadList onPlayVideo={handlePlayDownloadedVideo} />
      </View>
    );
  }

  // Main render: player screen (either initial button or actual player)
  return (
    <View style={styles.container}>
      {renderHeader()}
      {showPlayer ? (
        <View style={styles.playerContainer}>
          <View style={styles.playerWrapper}>
            {licenseToastVisible && (
              <View style={styles.toastOverlay}>
                <View style={styles.toast}>
                  <Text style={styles.toastText}>Offline license expired</Text>
                </View>
              </View>
            )}
            {tokenBanner && (
              <View style={styles.toastOverlay}>
                <View
                  style={[
                    styles.toast,
                    tokenBanner.includes('failed')
                      ? styles.toastError
                      : tokenBanner.includes('renewed')
                        ? styles.toastSuccess
                        : styles.toastWarn,
                  ]}
                >
                  <Text style={styles.toastText}>{tokenBanner}</Text>
                </View>
              </View>
            )}
            <TPStreamsPlayerView
              ref={playerRef}
              videoId={VIDEO_ID}
              accessToken={ACCESS_TOKEN}
              style={styles.player}
              onPlayerStateChanged={handlePlayerStateChanged}
              onIsPlayingChanged={handleIsPlayingChanged}
              onPlaybackSpeedChanged={handlePlaybackSpeedChanged}
              onIsLoadingChanged={handleIsLoadingChanged}
              onError={handleError}
              enableDownload={true}
              showDefaultCaptions={true}
              offlineLicenseExpireTime={LICENSE_DURATION}
              offlineOnly={contentDownloaded}
              onAccessTokenExpired={handleAccessTokenExpired}
            />
          </View>

          <ScrollView style={styles.controlsScrollView}>
            {lastError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{lastError}</Text>
              </View>
            )}

            {contentDownloaded && (
              <View style={styles.offlineBadge}>
                <Text style={styles.offlineBadgeText}>Offline Mode</Text>
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
              <Text style={styles.sectionTitle}>Offline License</Text>
              <View style={styles.licenseInfo}>
                <Text style={styles.licenseLabel}>License Duration</Text>
                <Text style={styles.licenseValue}>{LICENSE_DURATION}s</Text>
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
          </ScrollView>
        </View>
      ) : (
        <View style={styles.landingContainer}>
          {checkingDownload ? (
            <View style={styles.landingContent}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.landingSubtext}>Preparing player...</Text>
            </View>
          ) : (
            <View style={styles.landingContent}>
              <Text style={styles.landingTitle}>TPStreams Player</Text>
              <Text style={styles.landingSubtext}>
                Tap play to start watching
              </Text>
              <TouchableOpacity
                style={styles.playButton}
                onPress={handleOpenPlayer}
              >
                <Text style={styles.playButtonText}>▶  Play Video</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.downloadButton,
                  (downloadInProgress || contentDownloaded) &&
                    styles.downloadButtonDisabled,
                ]}
                onPress={handleStartDownload}
                disabled={downloadInProgress || contentDownloaded}
              >
                <Text
                  style={[
                    styles.downloadButtonText,
                    contentDownloaded && styles.downloadButtonTextDone,
                  ]}
                >
                  {contentDownloaded
                    ? '✓ Downloaded'
                    : downloadInProgress
                      ? downloadMessage ?? 'Downloading…'
                      : 'Start Download'}
                </Text>
              </TouchableOpacity>
              {downloadMessage && downloadInProgress && (
                <Text style={styles.downloadStatusText}>{downloadMessage}</Text>
              )}
              <TouchableOpacity
                style={styles.downloadsLink}
                onPress={navigateToDownloads}
              >
                <Text style={styles.downloadsLinkText}>View Downloads</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
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
  headerRight: {
    flexDirection: 'row',
    gap: 8,
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
  playerWrapper: {
    width: '100%',
    backgroundColor: '#000',
  },
  player: {
    height: 250,
  },
  playerContainer: {
    flex: 1,
  },
  controlsScrollView: {
    flex: 1,
  },
  errorContainer: {
    width: '90%',
    alignSelf: 'center',
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
  offlineBadge: {
    alignSelf: 'center',
    marginTop: 10,
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: '#34C759',
    borderRadius: 12,
  },
  offlineBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  buttonSection: {
    width: '90%',
    alignSelf: 'center',
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
  landingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  landingContent: {
    alignItems: 'center',
  },
  landingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  landingSubtext: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  playButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  downloadsLink: {
    marginTop: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  downloadsLinkText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  downloadButton: {
    marginTop: 16,
    backgroundColor: '#34C759',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  downloadButtonDisabled: {
    backgroundColor: '#ccc',
    elevation: 0,
    shadowOpacity: 0,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  downloadButtonTextDone: {
    color: '#fff',
  },
  downloadStatusText: {
    marginTop: 8,
    fontSize: 13,
    color: '#666',
  },
  licenseInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  licenseLabel: {
    fontSize: 14,
    color: '#666',
  },
  licenseValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  licenseExpiring: {
    color: '#ff3b30',
  },
  licenseExpiredText: {
    marginTop: 8,
    fontSize: 12,
    color: '#ff3b30',
    textAlign: 'center',
  },
  toastOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    alignItems: 'center',
    paddingTop: 8,
  },
  toast: {
    backgroundColor: '#333',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  toastError: {
    backgroundColor: '#ff3b30',
  },
  toastWarn: {
    backgroundColor: '#ff9500',
  },
  toastSuccess: {
    backgroundColor: '#34c759',
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
