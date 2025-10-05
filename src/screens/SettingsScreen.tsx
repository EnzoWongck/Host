import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useCollaboration } from '../context/CollaborationContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Card from '../components/Card';
import Icon from '../components/Icon';

const SettingsScreen: React.FC = () => {
  const { theme, colorMode, setColorMode } = useTheme();
  const { state: collaborationState } = useCollaboration();
  const { user, isSignedIn, signInWithApple, signInWithGoogle, signInWithEmail, signOut } = useAuth();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.md,
      paddingBottom: 100, // Space for tab bar
    },
    header: {
      alignItems: 'center',
      paddingVertical: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    title: {
      fontSize: theme.fontSize.xl,
      fontWeight: '600',
      color: theme.colors.text,
    },
    sectionTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      marginTop: theme.spacing.lg,
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    settingLabel: {
      fontSize: theme.fontSize.md,
      fontWeight: '500',
      color: theme.colors.text,
    },
    picker: {
      backgroundColor: colorMode === 'light' ? '#FFFFFF' : 'transparent',
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      minWidth: 120,
      borderWidth: colorMode === 'dark' ? 1 : 0,
      borderColor: theme.colors.border,
    },
    pickerText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      textAlign: 'center',
    },
    colorModeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
      marginTop: theme.spacing.sm,
    },
    colorModeButton: {
      flex: 1,
      marginHorizontal: theme.spacing.xs,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 2,
      alignItems: 'center',
    },
    lightModeButton: {
      backgroundColor: theme.colors.surface,
      borderColor: colorMode === 'light' ? theme.colors.primary : '#E5E5EA',
    },
    darkModeButton: {
      backgroundColor: '#000000',
      borderColor: colorMode === 'dark' ? theme.colors.primary : '#3A3A3C',
    },
    lightModeText: {
      color: colorMode === 'light' ? theme.colors.primary : '#FFFFFF',
      fontSize: theme.fontSize.sm,
      fontWeight: '500',
    },
    darkModeText: {
      color: '#FFFFFF',
      fontSize: theme.fontSize.sm,
      fontWeight: '500',
    },
    statusText: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.sm,
    },
    dataManagementItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.md,
      backgroundColor: colorMode === 'light' ? '#FFFFFF' : 'transparent',
      borderRadius: theme.borderRadius.sm,
      marginBottom: theme.spacing.sm,
    },
    dataItemContent: {
      flex: 1,
    },
    dataItemTitle: {
      fontSize: theme.fontSize.md,
      fontWeight: '500',
      color: theme.colors.text,
    },
    dataItemSubtitle: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    arrow: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
    },
    aboutInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    aboutLabel: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    aboutValue: {
      fontSize: theme.fontSize.sm,
      fontWeight: '500',
      color: theme.colors.text,
    },
    linksContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    link: {
      color: theme.colors.primary,
      fontWeight: '500',
      fontSize: theme.fontSize.sm,
    },
    linkSeparator: {
      color: theme.colors.border,
      marginHorizontal: theme.spacing.sm,
    },
    authCard: {
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.md,
    },
    authTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    authRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.sm,
    },
    authEmailInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.sm,
    },
    authEmailInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
      marginRight: theme.spacing.sm,
    },
    authUserLine: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>設定</Text>
      </View>

      {/* 登入區塊 */}
      <View style={styles.authCard}>
        <Text style={styles.authTitle}>{isSignedIn ? '已登入' : '登入'}</Text>
        {isSignedIn ? (
          <>
            <Text style={styles.authUserLine}>{user?.name}{user?.email ? ` ・ ${user.email}` : ''}</Text>
            <View style={styles.authRow}>
              <Button title="登出" size="sm" onPress={signOut} />
            </View>
          </>
        ) : (
          <>
            <View style={styles.authRow}>
              <Button title="以 Apple 登入" size="sm" onPress={signInWithApple} style={{ marginRight: theme.spacing.sm }} />
              <Button title="以 Google 登入" size="sm" onPress={signInWithGoogle} />
            </View>
            <View style={styles.authEmailInputRow}>
              <TextInput style={styles.authEmailInput} placeholder="name@example.com" placeholderTextColor={theme.colors.textSecondary} autoCapitalize="none" keyboardType="email-address" />
              <Button title="Email 登入" size="sm" onPress={() => signInWithEmail('name@example.com')} />
            </View>
          </>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* General Settings */}
          <Text style={styles.sectionTitle}>一般設定</Text>
          <Card>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>語言</Text>
              <TouchableOpacity style={styles.picker}>
                <Text style={styles.pickerText}>繁體中文</Text>
              </TouchableOpacity>
            </View>

            <View>
              <Text style={styles.settingLabel}>用戶介面顏色模式</Text>
              <View style={styles.colorModeContainer}>
                <TouchableOpacity
                  style={[styles.colorModeButton, styles.lightModeButton]}
                  onPress={() => setColorMode('light')}
                >
                  <Text style={styles.lightModeText}>淺色模式</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.colorModeButton, styles.darkModeButton]}
                  onPress={() => setColorMode('dark')}
                >
                  <Text style={styles.darkModeText}>深色模式</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.statusText}>
                目前使用：{colorMode === 'light' ? '淺色模式' : '深色模式'}
              </Text>
            </View>
          </Card>

          {/* Collaboration Settings */}
          <Text style={styles.sectionTitle}>協作設置</Text>
          <Card padding="sm">
            <TouchableOpacity style={styles.dataManagementItem}>
              <View style={styles.dataItemContent}>
                <Text style={styles.dataItemTitle}>協作狀態</Text>
                <Text style={styles.dataItemSubtitle}>
                  {collaborationState.isConnected 
                    ? `已連接 (${collaborationState.activeUsers.length + 1}人)` 
                    : '未連接'
                  }
                </Text>
              </View>
              <Icon 
                name="user" 
                size={16} 
                color={collaborationState.isConnected ? theme.colors.success : theme.colors.error} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.dataManagementItem}>
              <View style={styles.dataItemContent}>
                <Text style={styles.dataItemTitle}>衝突解決</Text>
                <Text style={styles.dataItemSubtitle}>
                  {collaborationState.conflictResolution === 'auto' ? '自動合併' : '手動處理'}
                </Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>

            {collaborationState.lastSyncTime && (
              <View style={styles.dataManagementItem}>
                <View style={styles.dataItemContent}>
                  <Text style={styles.dataItemTitle}>最後同步</Text>
                  <Text style={styles.dataItemSubtitle}>
                    {new Date(collaborationState.lastSyncTime).toLocaleString('zh-TW')}
                  </Text>
                </View>
                <Icon name="refresh-cw" size={16} color={theme.colors.textSecondary} />
              </View>
            )}
          </Card>

          {/* Data Management */}
          <Text style={styles.sectionTitle}>資料管理</Text>
          <Card padding="sm">
            <TouchableOpacity style={styles.dataManagementItem}>
              <View style={styles.dataItemContent}>
                <Text style={styles.dataItemTitle}>匯出資料</Text>
                <Text style={styles.dataItemSubtitle}>將牌局資料匯出為 CSV 檔案</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.dataManagementItem}>
              <View style={styles.dataItemContent}>
                <Text style={styles.dataItemTitle}>備份資料</Text>
                <Text style={styles.dataItemSubtitle}>備份所有牌局和設定資料</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          </Card>

          {/* 通知設定已移除 */}

          {/* About */}
          <Text style={styles.sectionTitle}>關於</Text>
          <Card>
            <View style={styles.aboutInfo}>
              <Text style={styles.aboutLabel}>版本</Text>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </View>
            
            <View style={styles.aboutInfo}>
              <Text style={styles.aboutLabel}>開發者</Text>
              <Text style={styles.aboutValue}>Poker Host Team</Text>
            </View>
            
            <View style={styles.aboutInfo}>
              <Text style={styles.aboutLabel}>最後更新</Text>
              <Text style={styles.aboutValue}>2025/01/09</Text>
            </View>

            <View style={styles.linksContainer}>
              <TouchableOpacity>
                <Text style={styles.link}>隱私政策</Text>
              </TouchableOpacity>
              <Text style={styles.linkSeparator}>|</Text>
              <TouchableOpacity>
                <Text style={styles.link}>服務條款</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
