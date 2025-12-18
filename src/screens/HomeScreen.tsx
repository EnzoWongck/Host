import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useNavigationContext } from '../context/NavigationContext';
import Card from '../components/Card';
import { useNavigation } from '@react-navigation/native';
import Button from '../components/Button';
import Icon from '../components/Icon';
import NewGameModal from '../components/NewGameModal';
import TopTabBar from '../components/TopTabBar';
import { Language } from '../types/language';
import { PAYPAL_CLIENT_ID, PAYPAL_SUBSCRIPTION_PLAN_ID, PAYPAL_SDK_URL } from '../config/dev';

declare global {
  interface Window {
    paypal?: any;
  }
}

const HomeScreen: React.FC = () => {
  const { theme, colorMode } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const { state, selectCurrentGame, deleteGame } = useGame();
  const { canCreateNewGame, forceTrialEnded, isSubscribed, trialEnded } = useSubscription();
  const navigation = useNavigation<any>();
  const { navigateToWelcome } = useNavigationContext();
  const [newGameModalVisible, setNewGameModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<{ id: string; name: string } | null>(null);
  const [pendingGameNavigation, setPendingGameNavigation] = useState<string | null>(null);
  const [showAddToHomeModal, setShowAddToHomeModal] = useState(false);
  const [showSubscriptionIntroModal, setShowSubscriptionIntroModal] = useState(false);
  const [showSubscriptionRequiredModal, setShowSubscriptionRequiredModal] = useState(false);
  const [hasShownTrialEndModal, setHasShownTrialEndModal] = useState(false);

  // 根據牌局狀態更新 trialEnded（在 useEffect 中，避免在渲染期間更新狀態）
  useEffect(() => {
    const canCreate = canCreateNewGame(state.games);
    if (!canCreate) {
      // 超過 24 小時或已結束 → 視為試用已到期
      forceTrialEnded(true);
      // 首次偵測到無法新增時，對未訂閱用戶顯示一次「試用已結束」彈窗
      if (!isSubscribed && !hasShownTrialEndModal) {
        setShowSubscriptionRequiredModal(true);
        setHasShownTrialEndModal(true);
      }
    }
  }, [state.games, canCreateNewGame, forceTrialEnded, isSubscribed, hasShownTrialEndModal]);

  // 首次進入主頁時，對未訂閱用戶顯示一次訂閱說明（仍在免費試用內）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isSubscribed) return;

    try {
      const seen = window.localStorage?.getItem('subscription_intro_seen') === '1';
      if (!seen) {
        setShowSubscriptionIntroModal(true);
      }
    } catch {
      setShowSubscriptionIntroModal(true);
    }
  }, [isSubscribed]);

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setLanguageModalVisible(false);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.md,
      paddingTop: theme.spacing.xs, // 減少頂部間距，讓牌局列表貼近TopTabBar
      paddingBottom: 80, // Space for tab bar (reduced)
    },
    header: {
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingTop: theme.spacing.sm,
    },
    title: {
      fontSize: theme.fontSize.xxl + 4,
      fontWeight: '700',
      letterSpacing: -0.8,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      fontWeight: '400',
    },
    sectionTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: '600',
      letterSpacing: -0.2,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    sectionTitleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    gameCard: {
      marginBottom: theme.spacing.md,
    },
    gameHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    gameHeaderRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    addGameButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
    },
    addGameButtonText: {
      fontSize: 32,
      fontWeight: '600',
      color: colorMode === 'light' ? '#64748B' : '#FFFFFF',
    },
    gameName: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      letterSpacing: -0.1,
      color: theme.colors.text,
    },
    gameStatus: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 6,
      borderRadius: theme.borderRadius.lg,
      fontSize: theme.fontSize.xs,
      fontWeight: '600',
      letterSpacing: 0.2,
      color: colorMode === 'dark' ? '#FFFFFF' : '#6B7280',
    },
    activeStatus: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colorMode === 'dark' ? theme.colors.border : '#10B981',
      // 進行中：淺色模式改為綠色文字
      color: colorMode === 'dark' ? '#FFFFFF' : '#10B981',
    },
    completedStatus: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colorMode === 'dark' ? '#EF4444' : '#EF4444',
      // 已結束：深色模式改為紅色邊框和紅色文字
      color: colorMode === 'dark' ? '#EF4444' : '#EF4444',
    },
    gameInfo: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
    },
    gameStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontVariant: ['tabular-nums'], // 等寬數字
      fontSize: theme.fontSize.lg,
      fontWeight: 'bold',
      color: theme.colors.success,
    },
    statLabel: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textSecondary,
    },
    newGameButton: {
      marginTop: theme.spacing.lg,
    },
    languageButton: {
      position: 'absolute',
      top: theme.spacing.md + (100 - 40) / 2,
      right: theme.spacing.md,
      padding: theme.spacing.sm,
      zIndex: 1000,
      minWidth: 44,
      minHeight: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoButton: {
      position: 'absolute',
      top: theme.spacing.md,
      left: theme.spacing.md,
      padding: theme.spacing.xs,
      zIndex: 1000,
      minWidth: 80,
      minHeight: 80,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoIcon: {
      width: 100,
      height: 100,
      borderRadius: 14,
    },
    gameActionsRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginTop: theme.spacing.sm,
      gap: theme.spacing.md,
    },
    gameActionText: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
  });

  // 使用等寬數字（Tabular Numbers）格式化金額
  const formatCurrency = (amount: number) => {
    const formatted = amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return `$${formatted}`;
  };
  
  const formatTime = (date: any) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '--:--';
    return d.toLocaleTimeString(language === 'zh-TW' ? 'zh-TW' : 'zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: any) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '--';
    return d.toLocaleDateString(language === 'zh-TW' ? 'zh-TW' : 'zh-CN');
  };

  const calculateDuration = (startTime: any, endTime?: any) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();

    // 防呆：若日期無法解析，避免 render error
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return '--';
    }

    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // 檢查當前是否已安裝為 PWA（加入主畫面）
  const isRunningStandalone = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const isStandaloneMedia =
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || false;
    const isNavigatorStandalone = (window.navigator as any)?.standalone === true;
    return isStandaloneMedia || isNavigatorStandalone;
  }, []);

  // 首次進入主頁／完成訂閱後，若尚未加入主畫面且未看過教學，顯示提示彈窗（僅 Web）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (Platform.OS !== 'web') return;
    if (isRunningStandalone) return;

    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    // 在 localhost 總是顯示彈窗，方便開發測試
    if (isLocalhost) {
      setShowAddToHomeModal(true);
      return;
    }

    try {
      const dismissed = window.localStorage?.getItem('lunchips_a2hs_dismissed') === '1';
      if (!dismissed) {
        setShowAddToHomeModal(true);
      }
    } catch {
      // localStorage 失敗時，仍可顯示一次
      setShowAddToHomeModal(true);
    }
  }, [isRunningStandalone, isSubscribed]);

  const handleDismissAddToHome = () => {
    setShowAddToHomeModal(false);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage?.setItem('lunchips_a2hs_dismissed', '1');
      } catch {
        // ignore
      }
    }
  };

  const handleDeleteGame = (gameId: string, gameName: string) => {
    setGameToDelete({ id: gameId, name: gameName });
    setDeleteConfirmVisible(true);
  };

  // 監聽 state 變化，當 currentGame 更新時自動導航
  useEffect(() => {
    if (pendingGameNavigation && state.currentGame?.id === pendingGameNavigation) {
      setPendingGameNavigation(null);
      // 使用 setTimeout 確保在下一幀導航
      setTimeout(() => {
        navigation.navigate('Game');
      }, 50);
    }
  }, [pendingGameNavigation, state.currentGame, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <TopTabBar />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 120 }}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
          </View>

          {/* Games List */}
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>{t('home.gameList')}</Text>
            <TouchableOpacity
              style={[
                styles.addGameButton,
                !canCreateNewGame(state.games) && { opacity: 0.5 },
              ]}
              onPress={() => {
                if (!canCreateNewGame(state.games)) {
                  // 無法新增 → 顯示強制訂閱彈窗
                  setShowSubscriptionRequiredModal(true);
                  return;
                }
                // 若是未訂閱但仍在免費期，且尚未顯示過說明，先顯示說明彈窗
                if (!isSubscribed && !trialEnded) {
                  setShowSubscriptionIntroModal(true);
                } else {
                  setNewGameModalVisible(true);
                }
              }}
              activeOpacity={0.7}
              disabled={!canCreateNewGame(state.games)}
            >
              <Text style={styles.addGameButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          
          {state.games.length === 0 ? (
            <Card style={styles.gameCard}>
              <Text style={[styles.gameInfo, { textAlign: 'center' }]}>{t('home.noGames')}</Text>
            </Card>
          ) : (
            // 排序：先按狀態（active 在前），然後按時間（最新的在前）
            [...state.games]
              .sort((a, b) => {
                // 先按狀態排序：active 在前，completed 在後
                if (a.status !== b.status) {
                  return a.status === 'active' ? -1 : 1;
                }
                // 相同狀態時，按時間排序：最新的在前
                const timeA = new Date(a.startTime).getTime();
                const timeB = new Date(b.startTime).getTime();
                return timeB - timeA; // 降序：最新的在前
              })
              .map((game) => (
              <TouchableOpacity 
                key={game.id} 
                onPress={() => { 
                  selectCurrentGame(game.id);
                  // 設置導航標記，等待 state 更新
                  setPendingGameNavigation(game.id);
                }}
                activeOpacity={0.7}
              >
                <Card style={styles.gameCard}>
                  <View style={styles.gameHeader}>
                    <Text style={styles.gameName}>{game.name}</Text>
                    <View style={styles.gameHeaderRight}>
                      <Text
                        style={[
                          styles.gameStatus,
                          game.status === 'active' ? styles.activeStatus : styles.completedStatus,
                        ]}
                      >
                        {game.status === 'active' ? t('home.active') : t('home.completed')}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.gameInfo}>
                    {game.status === 'active' 
                      ? `${t('home.startTime')}: ${formatTime(game.startTime)} | ${t('home.inProgressTime')}: ${calculateDuration(game.startTime)}`
                      : `${formatDate(game.startTime)} | ${t('home.duration')}: ${calculateDuration(game.startTime, game.endTime)}`
                    }
                  </Text>

                  <View style={styles.gameStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{formatCurrency(game.totalBuyIn)}</Text>
                      <Text style={styles.statLabel}>{t('home.totalBuyIn')}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{game.players.length}</Text>
                      <Text style={styles.statLabel}>{t('home.players')}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: game.status === 'active' ? theme.colors.warning : theme.colors.success }]}>
                        {formatCurrency(game.netProfit)}
                      </Text>
                      <Text style={styles.statLabel}>
                        {game.status === 'active' ? t('home.currentProfit') : t('home.finalProfit')}
                      </Text>
                    </View>
                  </View>
                  {/* 操作列：右側刪除按鈕 */}
                  <View style={styles.gameActionsRow}>
                    <TouchableOpacity
                      onPress={(e: any) => {
                        e?.stopPropagation?.();
                        handleDeleteGame(game.id, game.name);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.gameActionText, { color: theme.colors.error }]}>
                        刪除
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}

          {/* New Game Button */}
          <Button title={`+ ${t('home.newGame')}`} onPress={() => setNewGameModalVisible(true)} style={styles.newGameButton} />
        </View>
      </ScrollView>

      {/* New Game Modal */}
      <NewGameModal visible={newGameModalVisible} onClose={() => setNewGameModalVisible(false)} />

      {/* Language Selection Modal */}
      <Modal
        visible={languageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={1}
          onPress={() => setLanguageModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.lg,
              padding: theme.spacing.lg,
              minWidth: 200,
            }}
          >
            <Text style={{ fontSize: theme.fontSize.lg, fontWeight: '600', color: theme.colors.text, marginBottom: theme.spacing.md }}>
              {t('settings.language')}
            </Text>
            <TouchableOpacity
              style={{
                padding: theme.spacing.md,
                borderRadius: theme.borderRadius.sm,
                backgroundColor: language === 'zh-TW' ? theme.colors.primary + '20' : 'transparent',
                marginBottom: theme.spacing.sm,
              }}
              onPress={() => handleLanguageSelect('zh-TW')}
            >
              <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.md }}>{t('settings.traditionalChinese')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                padding: theme.spacing.md,
                borderRadius: theme.borderRadius.sm,
                backgroundColor: language === 'zh-CN' ? theme.colors.primary + '20' : 'transparent',
              }}
              onPress={() => handleLanguageSelect('zh-CN')}
            >
              <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.md, fontWeight: language === 'zh-CN' ? '700' : '400' }}>{t('settings.simplifiedChinese')}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Delete Game Confirm Modal */}
      <Modal
        visible={deleteConfirmVisible}
        transparent
        animationType="none"
        onRequestClose={() => setDeleteConfirmVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: '80%',
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.lg,
              padding: theme.spacing.lg,
            }}
          >
            <Text
              style={{
                fontSize: theme.fontSize.lg,
                fontWeight: '700',
                color: theme.colors.text,
                marginBottom: theme.spacing.sm,
              }}
            >
              {t('common.delete') || '刪除牌局'}
            </Text>
            <Text
              style={{
                fontSize: theme.fontSize.sm,
                color: theme.colors.textSecondary,
                marginBottom: theme.spacing.lg,
              }}
            >
              {gameToDelete
                ? isSubscribed
                  ? `確定要刪除牌局「${gameToDelete.name}」嗎？`
                  : `確定要刪除牌局「${gameToDelete.name}」嗎？即將失去免費額度。`
                : '確定要刪除這個牌局嗎？'}
            </Text>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                gap: theme.spacing.md,
              }}
            >
              <TouchableOpacity
                onPress={() => setDeleteConfirmVisible(false)}
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    fontSize: theme.fontSize.sm,
                    color: theme.colors.textSecondary,
                    fontWeight: '600',
                  }}
                >
                  {t('common.cancel') || '取消'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (gameToDelete) {
                    const remainingGames = state.games.filter(g => g.id !== gameToDelete.id);
                    deleteGame(gameToDelete.id);
                    // 刪除後檢查是否可以新增牌局
                    if (!isSubscribed && !canCreateNewGame(remainingGames)) {
                      // 無法新增牌局，顯示訂閱彈窗
                      setTimeout(() => {
                        setShowSubscriptionRequiredModal(true);
                      }, 100);
                    }
                  }
                  setDeleteConfirmVisible(false);
                  setGameToDelete(null);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    fontSize: theme.fontSize.sm,
                    color: theme.colors.error,
                    fontWeight: '700',
                  }}
                >
                  {t('common.delete') || '刪除'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 訂閱說明彈窗（免費試用期間的友善提示） */}
      <Modal
        visible={showSubscriptionIntroModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowSubscriptionIntroModal(false);
          if (typeof window !== 'undefined') {
            try {
              window.localStorage?.setItem('subscription_intro_seen', '1');
            } catch {
              // ignore
            }
          }
        }}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: theme.spacing.lg,
          }}
          activeOpacity={1}
          onPress={() => {
            setShowSubscriptionIntroModal(false);
            if (typeof window !== 'undefined') {
              try {
                window.localStorage?.setItem('subscription_intro_seen', '1');
              } catch {
                // ignore
              }
            }
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.lg,
              padding: theme.spacing.lg,
              maxWidth: 420,
              width: '100%',
            }}
          >
            <Text
              style={{
                fontSize: theme.fontSize.lg,
                fontWeight: '700',
                color: theme.colors.text,
                marginBottom: theme.spacing.md,
              }}
            >
              需要訂閱以繼續使用
            </Text>
            <Text
              style={{
                fontSize: theme.fontSize.sm,
                color: theme.colors.textSecondary,
                marginBottom: theme.spacing.md,
                lineHeight: 20,
              }}
            >
              你現可免費記錄 1 個牌局；超過 24 小時或結束牌局後，需進行訂閱。{'\n'}
              立刻訂閱月費計劃，無上限記錄、編輯牌局！
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                gap: theme.spacing.md,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setShowSubscriptionIntroModal(false);
                  if (typeof window !== 'undefined') {
                    try {
                      window.localStorage?.setItem('subscription_intro_seen', '1');
                    } catch {
                      // ignore
                    }
                  }
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    fontSize: theme.fontSize.sm,
                    color: theme.colors.textSecondary,
                    fontWeight: '600',
                  }}
                >
                  我知道了
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowSubscriptionIntroModal(false);
                  navigation.navigate('Settings');
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    fontSize: theme.fontSize.sm,
                    color: theme.colors.primary,
                    fontWeight: '700',
                  }}
                >
                  前往訂閱
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* 訂閱必要彈窗（試用已結束或牌局已結束） */}
      <Modal
        visible={showSubscriptionRequiredModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSubscriptionRequiredModal(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: theme.spacing.lg,
          }}
          activeOpacity={1}
          onPress={() => setShowSubscriptionRequiredModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.lg,
              padding: theme.spacing.lg,
              maxWidth: 420,
              width: '100%',
            }}
          >
            <Text
              style={{
                fontSize: theme.fontSize.lg,
                fontWeight: '700',
                color: theme.colors.text,
                marginBottom: theme.spacing.md,
              }}
            >
              需要訂閱以繼續使用
            </Text>
            <Text
              style={{
                fontSize: theme.fontSize.sm,
                color: theme.colors.textSecondary,
                marginBottom: theme.spacing.md,
                lineHeight: 20,
              }}
            >
              你已超過 24 小時免費試用時間或牌局已結束，立刻訂閱月費計劃，無上限記錄、編輯牌局！
            </Text>
            
            {/* PayPal 訂閱按鈕容器 */}
            {Platform.OS === 'web' && (
              <View style={{ width: '100%', minHeight: 48, marginBottom: theme.spacing.md }}>
                <PayPalSubscriptionButton
                  onSuccess={() => {
                    setShowSubscriptionRequiredModal(false);
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new Event('paypal-subscription-success'));
                    }
                  }}
                />
              </View>
            )}
            
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                gap: theme.spacing.md,
              }}
            >
              <TouchableOpacity
                onPress={() => setShowSubscriptionRequiredModal(false)}
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    fontSize: theme.fontSize.sm,
                    color: theme.colors.primary,
                    fontWeight: '700',
                  }}
                >
                  先不要
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowSubscriptionRequiredModal(false);
                  navigation.navigate('Settings');
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    fontSize: theme.fontSize.sm,
                    color: theme.colors.textSecondary,
                    fontWeight: '600',
                  }}
                >
                  前往訂閱
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Add to Home Screen 教學彈窗（僅 Web 顯示） */}
      {Platform.OS === 'web' && (
        <Modal
          visible={showAddToHomeModal}
          transparent
          animationType="fade"
          onRequestClose={handleDismissAddToHome}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: theme.spacing.lg,
            }}
            activeOpacity={1}
            onPress={handleDismissAddToHome}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius.lg,
                padding: theme.spacing.lg,
                maxWidth: 420,
                width: '100%',
              }}
            >
              <Text
                style={{
                  fontSize: theme.fontSize.lg,
                  fontWeight: '700',
                  color: theme.colors.text,
                  marginBottom: theme.spacing.lg,
                }}
              >
                將 LunChips 加到主畫面，以享受更佳體驗
              </Text>

              <Text
                style={{
                  fontSize: theme.fontSize.sm,
                  fontWeight: '600',
                  color: theme.colors.text,
                  marginBottom: theme.spacing.xs,
                }}
              >
                Safari
              </Text>
              <Text
                style={{
                  fontSize: theme.fontSize.sm,
                  color: theme.colors.textSecondary,
                  marginBottom: theme.spacing.md,
                  lineHeight: 20,
                }}
              >
                1. 點選瀏覽器下方的分享按鈕{'\n'}
                2. 向下滑找到「加入主畫面」並點選{'\n'}
                3. 按右上「加入」即可
              </Text>

              <Text
                style={{
                  fontSize: theme.fontSize.sm,
                  fontWeight: '600',
                  color: theme.colors.text,
                  marginBottom: theme.spacing.xs,
                }}
              >
                Chrome
              </Text>
              <Text
                style={{
                  fontSize: theme.fontSize.sm,
                  color: theme.colors.textSecondary,
                  marginBottom: theme.spacing.lg,
                  lineHeight: 20,
                }}
              >
                1. 點選右上角「⋮」選單{'\n'}
                2. 選擇「安裝應用程式」或「加入主畫面」{'\n'}
                3. 按「加入」即可
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  marginTop: theme.spacing.sm,
                }}
              >
                <TouchableOpacity
                  onPress={handleDismissAddToHome}
                  activeOpacity={0.7}
                  style={{
                    paddingVertical: theme.spacing.sm,
                    paddingHorizontal: theme.spacing.lg,
                    borderRadius: theme.borderRadius.sm,
                    backgroundColor: theme.colors.primary,
                  }}
                >
                  <Text
                    style={{
                      fontSize: theme.fontSize.sm,
                      fontWeight: '600',
                      color: theme.colors.text,
                    }}
                  >
                    我知道了
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}
    </SafeAreaView>
  );
};

// PayPal 訂閱按鈕組件（黃色按鈕，用於「需要訂閱以繼續使用」視窗）
const PayPalSubscriptionButton: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonsInstanceRef = useRef<any>(null);
  const isMountedRef = useRef(true);
  const [isRendered, setIsRendered] = useState(false);
  const PAYPAL_PLAN_ID = PAYPAL_SUBSCRIPTION_PLAN_ID;
  const CONTAINER_ID = `paypal-subscription-button-${PAYPAL_PLAN_ID}-${Date.now()}`;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    let retryTimeout: NodeJS.Timeout;
    let mounted = true;

    const checkAndRender = () => {
      if (!isMountedRef.current || !mounted) {
        return;
      }

      let container = document.getElementById(CONTAINER_ID);
      if (!container) {
        container = document.querySelector(`[data-native-id="${CONTAINER_ID}"]`) as HTMLElement;
      }
      if (!container && containerRef.current) {
        // @ts-ignore
        const node = containerRef.current._nativeNode || containerRef.current;
        if (node && node.nodeType === 1 && document.body.contains(node)) {
          container = node;
        }
      }

      if (!container || !document.body.contains(container)) {
        const retryCount = parseInt(sessionStorage.getItem('paypal-subscription-retry-count') || '0', 10);
        if (retryCount < 50 && isMountedRef.current && mounted) {
          sessionStorage.setItem('paypal-subscription-retry-count', (retryCount + 1).toString());
          retryTimeout = setTimeout(checkAndRender, 100);
        } else {
          sessionStorage.removeItem('paypal-subscription-retry-count');
          console.warn('PayPal 容器未找到，停止重試');
        }
        return;
      }

      sessionStorage.removeItem('paypal-subscription-retry-count');

      const loadPayPalScript = () =>
        new Promise<void>((resolve, reject) => {
          if (window.paypal) {
            resolve();
            return;
          }
          const existing = document.querySelector<HTMLScriptElement>(
            `script[src^="${PAYPAL_SDK_URL}"]`
          );
          if (existing) {
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', reject, { once: true });
            return;
          }

          const script = document.createElement('script');
          script.src = `${PAYPAL_SDK_URL}?client-id=${PAYPAL_CLIENT_ID}&vault=true&intent=subscription`;
          script.setAttribute('data-sdk-integration-source', 'button-factory');
          script.async = true;
          script.onload = () => resolve();
          script.onerror = reject;
          document.head.appendChild(script);
        });

      loadPayPalScript()
        .then(() => {
          if (!isMountedRef.current || !mounted) {
            return;
          }

          if (!window.paypal) {
            console.error('PayPal SDK 未載入');
            return;
          }

          const containerElement = document.getElementById(CONTAINER_ID);
          if (!containerElement || !document.body.contains(containerElement)) {
            console.error('PayPal 容器不存在或已被移除');
            return;
          }

          containerElement.innerHTML = '';

          if (buttonsInstanceRef.current) {
            try {
              buttonsInstanceRef.current = null;
            } catch (e) {
              // 忽略清理錯誤
            }
          }

          try {
            const buttons = window.paypal.Buttons({
              style: {
                shape: 'pill',
                color: 'gold', // 黃色 PayPal 按鈕
                layout: 'vertical',
                label: 'paypal',
              },
              createSubscription: function(data: any, actions: any) {
                console.log('創建 PayPal 訂閱，計劃 ID:', PAYPAL_PLAN_ID);
                return actions.subscription.create({
                  plan_id: PAYPAL_PLAN_ID
                });
              },
              onApprove: function(data: any, actions: any) {
                console.log('PayPal 訂閱成功:', data.subscriptionID);
                onSuccess();
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new Event('paypal-subscription-success'));
                }
              },
              onError: function(err: any) {
                console.error('PayPal 訂閱錯誤:', err);
                if (err?.name === 'RESOURCE_NOT_FOUND' || err?.message?.includes('RESOURCE_NOT_FOUND')) {
                  const errorMsg = `訂閱計劃未找到。請確認 Plan ID "${PAYPAL_PLAN_ID}" 在 PayPal Live 環境中存在。`;
                  alert(errorMsg);
                } else {
                  alert(`PayPal 訂閱錯誤：${err?.message || JSON.stringify(err)}`);
                }
              },
            });

            buttonsInstanceRef.current = buttons;

            const finalContainer = document.getElementById(CONTAINER_ID);
            if (!finalContainer || !document.body.contains(finalContainer)) {
              console.error('PayPal 容器在渲染前被移除');
              return;
            }

            buttons
              .render(`#${CONTAINER_ID}`)
              .then(() => {
                if (isMountedRef.current && mounted) {
                  setIsRendered(true);
                  console.log('PayPal 按鈕渲染成功');
                }
              })
              .catch((err: any) => {
                if (err.message && err.message.includes('removed from DOM')) {
                  console.warn('PayPal 容器在渲染過程中被移除');
                } else {
                  console.error('渲染 PayPal 按鈕失敗', err);
                }
              });
          } catch (error: any) {
            console.error('創建 PayPal 按鈕失敗', error);
          }
        })
        .catch((err) => {
          console.error('載入 PayPal SDK 失敗', err);
        });
    };

    checkAndRender();

    return () => {
      mounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      const container = document.getElementById(CONTAINER_ID);
      if (container) {
        container.innerHTML = '';
      }
      buttonsInstanceRef.current = null;
      sessionStorage.removeItem('paypal-subscription-retry-count');
    };
  }, [onSuccess]);

  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <View style={{ width: '100%', minHeight: 48 }}>
      {/* @ts-ignore - Web 平台使用原生 HTML 元素 */}
      <div
        ref={containerRef}
        id={CONTAINER_ID}
        style={{ width: '100%', minHeight: 48 }}
      />
    </View>
  );
};

export default HomeScreen;
