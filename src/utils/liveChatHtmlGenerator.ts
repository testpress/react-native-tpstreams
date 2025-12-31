import type {
  TPStreamsLiveChatProps,
  ChatColors,
  ChatTypography,
} from '../types/TPStreamsLiveChatTypes';
import { CHAT_SDK_CONSTANTS, ChatMessageType } from './constants';

/**
 * Generates the complete HTML content for the chat WebView
 */
export function generateChatHTML(props: TPStreamsLiveChatProps): string {
  const { username, roomId, title } = props;
  const styles = generateStylesAndScripts(props);

  return `
    <!DOCTYPE html>
    <html lang="en" style="height: 100%; margin: 0;">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
        <link rel="stylesheet" href="${CHAT_SDK_CONSTANTS.STYLES_URL}">
        ${styles.css}
      </head>
      <body style="height: 100%; margin: 0; overflow: hidden;">
        <div id="app" style="height: 100%;"></div>
        <script src="${CHAT_SDK_CONSTANTS.SDK_SCRIPT_URL}"></script>
        <script>
          (function() {
            const config = {
              username: ${JSON.stringify(username)},
              roomId: ${JSON.stringify(roomId)},
              title: ${JSON.stringify(title)}
            };
            
            function postToNative(type, message = null) {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type, message }));
              }
            }

            try {
              new TPStreamsChat.load(document.querySelector("#app"), config);
              postToNative('${ChatMessageType.READY}');
            } catch (error) {
              postToNative('${ChatMessageType.ERROR}', error.message || 'Failed to initialize chat');
            }
          })();
        </script>
      </body>
    </html>
  `;
}

/**
 * Combines all CSS generation logic
 */
function generateStylesAndScripts(props: TPStreamsLiveChatProps) {
  const { colors, typography, customCSS } = props;
  const rules: string[] = [];

  if (typography) rules.push(getTypographyCSS(typography));
  if (colors) rules.push(getColorCSS(colors));
  if (customCSS) rules.push(customCSS);

  return {
    css: `<style>${rules.join('\n\n')}</style>`,
  };
}

/**
 * Generate color-related CSS using functional approach
 */
function getColorCSS(colors: ChatColors): string {
  const rules: string[] = [];

  if (colors.primary) {
    rules.push(`
      button, [class*="bg-blue-"], [class*="bg-indigo-"], [class*="primary"] {
        background-color: ${colors.primary} !important;
        color: white !important;
      }
      .text-blue-600, .text-indigo-600, [class*="text-blue-"]:not([class*="bg-"]), [class*="text-indigo-"]:not([class*="bg-"]) {
        color: ${colors.primary} !important;
      }
      [class*="bg-blue-"] *, [class*="bg-indigo-"] *, [class*="primary"] * {
        color: white !important;
      }
    `);
  }

  if (colors.background) {
    rules.push(`
      body, #app, .chat-container, [class*="bg-white"], [class*="bg-gray-50"], [class*="bg-slate-"] {
        background-color: ${colors.background} !important;
      }
    `);
  }

  if (colors.text) {
    rules.push(`
      body, p, input, textarea,
      div:not([class*="bg-blue-"]):not([class*="bg-indigo-"]):not([class*="primary"]),
      span:not([class*="bg-blue-"]):not([class*="bg-indigo-"]):not([class*="primary"]) {
        color: ${colors.text} !important;
      }
    `);
  }

  if (colors.inputBackground) {
    rules.push(`
      textarea, input[type="text"], [class*="bg-gray-"], [class*="bg-slate-"] {
        background-color: ${colors.inputBackground} !important;
      }
    `);
  }

  if (colors.border) {
    rules.push(`
      [class*="border"], [class*="divide-"] > * {
        border-color: ${colors.border} !important;
      }
    `);
  }

  return rules.join('\n');
}

function getTypographyCSS(typography: ChatTypography): string {
  const styles: string[] = [];
  if (typography.fontSize)
    styles.push(`font-size: ${typography.fontSize}px !important;`);
  if (typography.fontFamily)
    styles.push(`font-family: ${typography.fontFamily} !important;`);
  if (typography.fontWeight)
    styles.push(`font-weight: ${typography.fontWeight} !important;`);
  if (typography.lineHeight)
    styles.push(`line-height: ${typography.lineHeight} !important;`);

  return styles.length > 0
    ? `body, button, input, textarea, div, span, p { ${styles.join(' ')} }`
    : '';
}
