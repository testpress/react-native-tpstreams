/**
 * URLs for the Live Chat SDK assets and base configuration
 */
export const CHAT_SDK_CONSTANTS = {
  // The domain where the chat is hosted/associated
  BASE_URL: 'https://media.testpress.in',

  // CDN path for the CSS styles
  STYLES_URL: 'https://media.testpress.in/static/live_chat/live_chat.css',

  // CDN path for the UMD build of the SDK
  SDK_SCRIPT_URL:
    'https://media.testpress.in/static/live_chat/live_chat.umd.cjs',

  // Default values
  DEFAULT_PRIMARY_COLOR: '#007AFF',
  DEFAULT_BACKGROUND_COLOR: '#FFFFFF',
};

/**
 * Message types for communication between WebView and React Native
 */
export enum ChatMessageType {
  READY = 'ready',
  ERROR = 'error',
  MESSAGE = 'message',
  DEBUG = 'debug',
}
