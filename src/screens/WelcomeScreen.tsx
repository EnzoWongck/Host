import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/Button';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted }) => {
  const { theme, colorMode } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorMode === 'dark' ? '#0A0A0A' : '#F5F5F7',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    logoImage: {
      width: 180,
      height: 180,
      marginBottom: theme.spacing.lg,
    },
    hostTitle: {
      fontSize: 48,
      fontWeight: '700',
      color: colorMode === 'dark' ? '#FFFFFF' : '#000000',
      letterSpacing: -1,
    },
    subtitle: {
      fontSize: theme.fontSize.lg,
      color: colorMode === 'dark' ? '#6B7280' : '#6B7280',
      textAlign: 'center',
      marginTop: theme.spacing.md,
      lineHeight: 24,
    },
    buttonContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      paddingHorizontal: theme.spacing.md,
    },
    getStartedButton: {
      backgroundColor: colorMode === 'dark' ? '#007AFF' : '#007AFF',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: theme.spacing.md,
      width: 160,
      shadowColor: '#007AFF',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
    },
    getStartedText: {
      color: '#FFFFFF',
      fontSize: theme.fontSize.lg,
      fontWeight: '600',
    },
    bottomLinks: {
      alignItems: 'center',
    },
    privacyText: {
      fontSize: theme.fontSize.sm,
      color: colorMode === 'dark' ? '#6B7280' : '#6B7280',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/icons/pokercard.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.hostTitle}>Host</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.getStartedButton}
            onPress={onGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.getStartedText}>免費試用</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomLinks}>
          <Text style={styles.privacyText}>Privacy Preferences</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;
