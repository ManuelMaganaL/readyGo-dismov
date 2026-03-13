import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export default function LoaderSpinner() {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <ActivityIndicator size={'large'} color={colors.main} />
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
