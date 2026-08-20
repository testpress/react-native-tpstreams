import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import { TPStreams } from 'react-native-tpstreams';

TPStreams.initialize('9q94nm', { allowFallbackToL3: true });

AppRegistry.registerComponent(appName, () => App);
