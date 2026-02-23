import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { MAIN_COLOR } from '@/constants/theme';

export default function LoaderSpinner() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={'large'} color={MAIN_COLOR} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
