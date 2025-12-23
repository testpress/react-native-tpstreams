import {
  forwardRef,
  useRef,
  useImperativeHandle,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import WebView, { type WebViewMessageEvent } from 'react-native-webview';

import type {
  TPStreamsLiveChatProps,
  TPStreamsLiveChatRef,
} from './types/TPStreamsLiveChatTypes';
import { isChatMessage } from './types/TPStreamsLiveChatTypes';
import { generateChatHTML } from './utils/liveChatHtmlGenerator';
import { CHAT_SDK_CONSTANTS, ChatMessageType } from './utils/constants';

const TPStreamsLiveChat = forwardRef<
  TPStreamsLiveChatRef,
  TPStreamsLiveChatProps
>((props, ref) => {
  const {
    username,
    roomId,
    title,
    colors,
    typography,
    customCSS,
    style,
    onChatReady,
    onChatError,
    onMessageReceived,
  } = props;

  const webViewRef = useRef<WebView>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );

  const htmlContent = useMemo(
    () =>
      generateChatHTML({
        username,
        roomId,
        title,
        colors,
        typography,
        customCSS,
      }),
    [username, roomId, title, colors, typography, customCSS]
  );

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const { type, message } = JSON.parse(event.nativeEvent.data);

        switch (type) {
          case ChatMessageType.READY:
            setStatus('ready');
            onChatReady?.();
            break;

          case ChatMessageType.ERROR:
            setStatus('error');
            onChatError?.(message || 'SDK initialization failed');
            break;

          case ChatMessageType.MESSAGE:
            if (isChatMessage(message)) {
              onMessageReceived?.(message);
            } else {
              console.warn(
                '[TPStreamsLiveChat] Received invalid message format:',
                message
              );
            }
            break;

          case ChatMessageType.DEBUG:
            console.debug('[TPStreamsLiveChat] WebView:', message);
            break;
        }
      } catch (err) {
        console.error('[TPStreamsLiveChat] Failed to parse message:', err);
      }
    },
    [onChatReady, onChatError, onMessageReceived]
  );

  const handleWebViewError = useCallback(
    (syntheticEvent: any) => {
      const { nativeEvent } = syntheticEvent;
      setStatus('error');
      onChatError?.(nativeEvent.description || 'WebView failed to load');
    },
    [onChatError]
  );

  useImperativeHandle(
    ref,
    () => ({
      reload: () => {
        setStatus('loading');
        webViewRef.current?.reload();
      },
      injectCSS: (css: string) => {
        const script = `
                    (function() {
                        const style = document.createElement('style');
                        style.textContent = ${JSON.stringify(css)};
                        document.head.appendChild(style);
                    })();
                `;
        webViewRef.current?.injectJavaScript(script);
      },
    }),
    []
  );

  const renderLoading = () =>
    status === 'loading' && (
      <View
        style={[
          styles.overlay,
          {
            backgroundColor:
              colors?.background || CHAT_SDK_CONSTANTS.DEFAULT_BACKGROUND_COLOR,
          },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={colors?.primary || CHAT_SDK_CONSTANTS.DEFAULT_PRIMARY_COLOR}
        />
      </View>
    );

  return (
    <View style={[styles.container, style]}>
      <WebView
        key={`${colors?.background}-${typography?.fontFamily}`}
        ref={webViewRef}
        source={{
          html: htmlContent,
          baseUrl: CHAT_SDK_CONSTANTS.BASE_URL,
        }}
        originWhitelist={[CHAT_SDK_CONSTANTS.BASE_URL]}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={handleMessage}
        onError={handleWebViewError}
        style={styles.webview}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        scrollEnabled={false}
      />
      {renderLoading()}
    </View>
  );
});

TPStreamsLiveChat.displayName = 'TPStreamsLiveChat';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});

export default TPStreamsLiveChat;
