import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { 
  signInWithGoogle as firebaseGoogleSignIn, 
  signInWithAppleFirebase, 
  getUserProfile, 
  hasValidToken,
  signOutUser 
} from '../services/firebaseAuth';

const FirebaseTest: React.FC = () => {
  const { theme, colorMode } = useTheme();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const profile = getUserProfile();
    const hasToken = hasValidToken();
    setUserProfile(profile);
    setIsLoggedIn(hasToken);
  };

  const handleGoogleSignIn = async () => {
    try {
      await firebaseGoogleSignIn();
      checkAuthStatus();
      Alert.alert('成功', 'Google 登入成功！');
    } catch (error) {
      Alert.alert('錯誤', 'Google 登入失敗：' + (error as Error).message);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      await signInWithAppleFirebase();
      checkAuthStatus();
      Alert.alert('成功', 'Apple 登入成功！');
    } catch (error) {
      Alert.alert('錯誤', 'Apple 登入失敗：' + (error as Error).message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      checkAuthStatus();
      Alert.alert('成功', '已登出！');
    } catch (error) {
      Alert.alert('錯誤', '登出失敗：' + (error as Error).message);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorMode === 'dark' ? '#1A1A1A' : '#F5F5F7',
      padding: theme.spacing.lg,
    },
    title: {
      fontSize: theme.fontSize.xl,
      fontWeight: '600',
      color: colorMode === 'dark' ? '#FFFFFF' : '#000000',
      marginBottom: theme.spacing.lg,
      textAlign: 'center',
    },
    statusCard: {
      backgroundColor: colorMode === 'dark' ? '#2A2A2A' : '#FFFFFF',
      borderRadius: 12,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: colorMode === 'dark' ? '#3A3A3C' : '#E5E5EA',
    },
    statusTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: '600',
      color: colorMode === 'dark' ? '#FFFFFF' : '#000000',
      marginBottom: theme.spacing.md,
    },
    statusItem: {
      marginBottom: theme.spacing.sm,
    },
    statusLabel: {
      fontSize: theme.fontSize.sm,
      color: colorMode === 'dark' ? '#6B7280' : '#6B7280',
    },
    statusValue: {
      fontSize: theme.fontSize.sm,
      color: colorMode === 'dark' ? '#FFFFFF' : '#000000',
      fontWeight: '500',
    },
    buttonContainer: {
      marginTop: theme.spacing.lg,
    },
    button: {
      backgroundColor: '#007AFF',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    googleButton: {
      backgroundColor: '#4285F4',
    },
    appleButton: {
      backgroundColor: '#000000',
    },
    signOutButton: {
      backgroundColor: '#FF3B30',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: theme.fontSize.md,
      fontWeight: '500',
    },
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Firebase Auth 測試</Text>
      
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>認證狀態</Text>
        
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>登入狀態:</Text>
          <Text style={styles.statusValue}>
            {isLoggedIn ? '✅ 已登入' : '❌ 未登入'}
          </Text>
        </View>
        
        {userProfile && (
          <>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>用戶 UID:</Text>
              <Text style={styles.statusValue}>{userProfile.uid}</Text>
            </View>
            
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>電子郵件:</Text>
              <Text style={styles.statusValue}>{userProfile.email || '未提供'}</Text>
            </View>
            
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>顯示名稱:</Text>
              <Text style={styles.statusValue}>{userProfile.displayName || '未提供'}</Text>
            </View>
            
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>提供者:</Text>
              <Text style={styles.statusValue}>{userProfile.providerId}</Text>
            </View>
          </>
        )}
        
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Token:</Text>
          <Text style={styles.statusValue}>
            {hasValidToken() ? '✅ 有效' : '❌ 無效'}
          </Text>
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.googleButton]} 
          onPress={handleGoogleSignIn}
        >
          <Text style={styles.buttonText}>Google 登入測試</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.appleButton]} 
          onPress={handleAppleSignIn}
        >
          <Text style={styles.buttonText}>Apple 登入測試</Text>
        </TouchableOpacity>
        
        {isLoggedIn && (
          <TouchableOpacity 
            style={[styles.button, styles.signOutButton]} 
            onPress={handleSignOut}
          >
            <Text style={styles.buttonText}>登出</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

export default FirebaseTest;
