import { View, StyleSheet } from 'react-native';
import { TPStreamsPlayerView } from 'react-native-tpstreams';

export default function App() {
  return (
    <View style={styles.container}>
      <TPStreamsPlayerView
        videoId="3G2p5NdMaRu"
        accessToken="328f6f1c-c188-4c3f-8e38-345c9aaa1a51"
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
