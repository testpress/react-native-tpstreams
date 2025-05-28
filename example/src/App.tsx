import { View, StyleSheet } from 'react-native';
import { TPStreamsPlayerView } from 'react-native-tpstreams';

export default function App() {
  return (
    <View style={styles.container}>
      <TPStreamsPlayerView
        source="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
        style={styles.box}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: '100%',
    height: 300,
    marginVertical: 20,
  },
});
