# react-native-tpstreams

Video player component for TPStreams

## Installation

```sh
npm install react-native-tpstreams
```

## Usage

Initialize TPStreams with your organization ID:

```js
import { TPStreams } from "react-native-tpstreams";

// Initialize with your organization ID
TPStreams.initialize('YOUR_ORGANIZATION_ID');
```

Then use the player component:

```js
import { TPStreamsPlayerView } from "react-native-tpstreams";

// Use the player component where needed
<TPStreamsPlayerView 
  videoId="YOUR_VIDEO_ID"
  accessToken="YOUR_ACCESS_TOKEN"
  style={{ width: '100%', height: 300 }}
/>
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
