import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Modal, Text, Pressable, Platform, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigationContext } from '../context/NavigationContext';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';
import CollaborationInviteModal from './CollaborationInviteModal';
import { Language } from '../types/language';
// 靜態導入圖片
import ChangeIconImage from '../../assets/icons/change.png';

interface TopTabBarProps {
  title?: string | React.ReactNode;
  rightComponent?: React.ReactNode;
  transparent?: boolean;
  showCollaborationButton?: boolean;
}

const TopTabBar: React.FC<TopTabBarProps> = ({ title, rightComponent, transparent = false, showCollaborationButton = false }) => {
  const { theme, colorMode, toggleColorMode } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const { navigateToWelcome } = useNavigationContext();
  const { state: gameState } = useGame();
  const { signOut, isSignedIn } = useAuth();
  const [settingsModalVisible, setSettingsModalVisible] = React.useState(false);
  const [collaborationModalVisible, setCollaborationModalVisible] = React.useState(false);
  
  const currentGame = gameState.currentGame;

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
  };

  const handleColorModeToggle = () => {
    toggleColorMode();
  };

  const handleLogout = async () => {
    setSettingsModalVisible(false);
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('確定要登出嗎？');
      if (confirmed) {
        await signOut();
      }
    } else {
      Alert.alert(
        '登出',
        '確定要登出嗎？',
        [
          { text: '取消', style: 'cancel' },
          { text: '確定', onPress: () => signOut(), style: 'destructive' },
        ]
      );
    }
  };

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      // TopTabBar 背景色與頁面背景色一致
      backgroundColor: transparent ? 'transparent' : theme.colors.background,
      borderBottomWidth: 0,
      zIndex: 1000,
      // 讓 logo 貼近最上方（類似 Shopify），高度壓低成扁長橫條
      paddingTop: theme.spacing.xs,
      height: 72,
      paddingBottom: theme.spacing.xs, // 底線上移
    },
    logoButton: {
      padding: theme.spacing.xs,
      minWidth: 60,
      minHeight: 60,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoIcon: {
      width: 60,
      height: 60,
      borderRadius: 14,
    },
    titleContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    titleText: {
      fontSize: 30, // 從 lg (18) 增加到 30pt
      fontWeight: '700', // 從 600 增加到 700（匹配金萱體 75 黑）
      color: theme.colors.text, // 已更新為 #FFFFFF
      letterSpacing: 0.5,
    },
    titleRow: {
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
    titleMain: {
      fontSize: 30,
      fontWeight: '700',
      color: theme.colors.text,
      letterSpacing: 0.5,
    },
    titleSub: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.text,
      letterSpacing: 0.3,
      marginTop: -4, // 緊密排列
    },
    rightContainer: {
      position: 'absolute',
      top: theme.spacing.sm,
      right: theme.spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      zIndex: 10,
    },
    settingsButton: {
      padding: theme.spacing.sm,
      minWidth: 44,
      minHeight: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    threeDotsContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      height: 40,
      width: 40,
    },
    dot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.text,
      marginVertical: 2,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'transparent',
      justifyContent: 'flex-start',
      alignItems: 'flex-end',
      paddingTop: 72, // TopTabBar 的高度
      paddingRight: theme.spacing.lg,
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      minWidth: 200,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
    },
    option: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.sm,
      marginBottom: theme.spacing.sm,
      backgroundColor: theme.colors.background,
    },
    optionSelected: {
      backgroundColor: theme.colors.primary + '20',
    },
    optionText: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    optionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    optionIcon: {
      width: 20,
      height: 20,
      marginLeft: theme.spacing.sm,
    },
    sectionTitle: {
      fontSize: theme.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
      marginTop: theme.spacing.xs,
    },
    collaborationButton: {
      padding: theme.spacing.sm,
      minWidth: 44,
      minHeight: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  return (
    <>
      <View style={styles.container}>
        {title && (
          <View style={styles.titleContainer}>
            {typeof title === 'string' ? (
              <Text style={styles.titleText}>{title}</Text>
            ) : (
              title
            )}
          </View>
        )}
        <View style={styles.rightContainer}>
          {rightComponent}
          {showCollaborationButton && currentGame && (
            <TouchableOpacity
              style={styles.collaborationButton}
              onPress={() => setCollaborationModalVisible(true)}
              activeOpacity={0.7}
            >
              <Icon name="connect2" size={32} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setSettingsModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.threeDotsContainer}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <Modal
        visible={settingsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSettingsModalVisible(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <TouchableOpacity
              style={styles.option}
              onPress={() => {
                handleLanguageSelect(language === 'zh-TW' ? 'zh-CN' : 'zh-TW');
              }}
            >
              <View style={styles.optionRow}>
                <View style={styles.optionContent}>
                  <Text style={styles.optionText}>
                    {language === 'zh-TW' ? '繁體中文' : '简体中文'}
                  </Text>
                  <Image
                    source={ChangeIconImage}
                    style={styles.optionIcon}
                    resizeMode="contain"
                  />
                </View>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.option}
              onPress={() => {
                handleColorModeToggle();
              }}
            >
              <View style={styles.optionRow}>
                <View style={styles.optionContent}>
                  <Text style={styles.optionText}>
                    {colorMode === 'light' ? '淺色模式' : '深色模式'}
                  </Text>
                  <Image
                    source={ChangeIconImage}
                    style={styles.optionIcon}
                    resizeMode="contain"
                  />
                </View>
              </View>
            </TouchableOpacity>

            {isSignedIn && (
              <TouchableOpacity
                style={styles.option}
                onPress={handleLogout}
              >
                <View style={styles.optionRow}>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionText}>
                      登出
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* 協作邀請 Modal */}
      {currentGame && (
        <CollaborationInviteModal
          visible={collaborationModalVisible}
          onClose={() => setCollaborationModalVisible(false)}
          gameId={currentGame.id}
          gameName={currentGame.name}
        />
      )}
    </>
  );
};

export default TopTabBar;

