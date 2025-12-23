import type { ViewStyle } from 'react-native';

/**
 * Color configuration for the chat interface
 */
export interface ChatColors {
  /** Primary brand color (buttons, links, accents) */
  primary?: string;
  /** Chat background color */
  background?: string;
  /** Default text color */
  text?: string;
  /** Input field background color */
  inputBackground?: string;
  /** Border and divider color */
  border?: string;
}

/**
 * Chat message structure
 */
export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: number;
}

/**
 * Type guard for ChatMessage
 */
export function isChatMessage(data: any): data is ChatMessage {
  return (
    data &&
    typeof data.id === 'string' &&
    typeof data.username === 'string' &&
    typeof data.message === 'string' &&
    typeof data.timestamp === 'number'
  );
}

/**
 * Typography configuration for the chat interface
 */
export interface ChatTypography {
  /** Base font size in pixels */
  fontSize?: number;
  /** Font family (e.g., 'Inter, sans-serif') */
  fontFamily?: string;
  /** Font weight (e.g., '400', 'bold', 600) */
  fontWeight?: string | number;
  /** Line height multiplier */
  lineHeight?: number;
}

/**
 * Props for TPStreamsLiveChat component
 */
export interface TPStreamsLiveChatProps {
  // Required configuration
  /** Username of the current user */
  username: string;
  /** Room ID for the chat (obtained from live stream details) */
  roomId: string;
  /** Title displayed in the chat header */
  title: string;

  // Optional styling configuration
  /** Color scheme configuration */
  colors?: ChatColors;
  /** Typography configuration */
  typography?: ChatTypography;

  // Advanced customization
  /** Custom CSS to inject (for advanced users) */
  customCSS?: string;

  // Standard React Native props
  /** Container style */
  style?: ViewStyle;

  // Event callbacks
  /** Called when chat is successfully loaded and ready */
  onChatReady?: () => void;
  /** Called when an error occurs */
  onChatError?: (error: string) => void;
  /** Called when a new message is received */
  onMessageReceived?: (message: ChatMessage) => void;
}

/**
 * Ref methods exposed by TPStreamsLiveChat component
 */
export interface TPStreamsLiveChatRef {
  /** Reload the chat interface */
  reload: () => void;
  /** Inject custom CSS dynamically */
  injectCSS?: (css: string) => void;
}
