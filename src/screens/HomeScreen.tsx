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
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigationContext } from '../context/NavigationContext';
import { useChips } from '../context/ChipsContext';
import Card from '../components/Card';
import { useNavigation } from '@react-navigation/native';
import Button from '../components/Button';
import Icon from '../components/Icon';
import NewGameModal from '../components/NewGameModal';
import JoinGameModal from '../components/JoinGameModal';
import TopTabBar from '../components/TopTabBar';
import { Language } from '../types/language';

const HomeScreen: React.FC = () => {
  const { theme, colorMode } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const { state, selectCurrentGame, deleteGame, updateGame } = useGame();
  const { loadChipsBalance } = useChips();
  const navigation = useNavigation<any>();
  const { navigateToWelcome } = useNavigationContext();
  const [newGameModalVisible, setNewGameModalVisible] = useState(false);
  const [joinGameModalVisible, setJoinGameModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<{ id: string; name: string } | null>(null);
  const [pendingGameNavigation, setPendingGameNavigation] = useState<string | null>(null);
  const [showAddToHomeModal, setShowAddToHomeModal] = useState(false);

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
  }, [isRunningStandalone]);

  // 監聽支付成功，重新載入 chips 餘額
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const handlePaymentSuccess = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('payment') === 'success') {
        // 重新載入 chips 餘額
        await loadChipsBalance();
        // 等待一下確保餘額已更新
        await new Promise(resolve => setTimeout(resolve, 500));
        // 再次載入確保狀態同步
        await loadChipsBalance();
      }
    };

    handlePaymentSuccess();
  }, [loadChipsBalance]);

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
              style={styles.addGameButton}
              onPress={() => {
                setNewGameModalVisible(true);
              }}
              activeOpacity={0.7}
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
                    // 直接進入牌局，不檢查 chip 狀態
                    // chip 狀態檢查和購買視窗將在 GameScreen 中的按鈕點擊時處理
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

          {/* New Game & Join Game Buttons */}
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <Button title={`+ ${t('home.newGame')}`} onPress={() => setNewGameModalVisible(true)} style={[styles.newGameButton, { flex: 1 }]} />
            <Button title="加入牌局" variant="secondary" onPress={() => setJoinGameModalVisible(true)} style={[styles.newGameButton, { flex: 1 }]} />
          </View>
        </View>
      </ScrollView>

      {/* New Game Modal */}
      <NewGameModal visible={newGameModalVisible} onClose={() => setNewGameModalVisible(false)} />

      {/* Join Game Modal */}
      <JoinGameModal 
        visible={joinGameModalVisible} 
        onClose={() => setJoinGameModalVisible(false)}
        onJoined={(gameId) => {
          console.log('已加入牌局:', gameId);
          loadGames();
        }}
      />

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
                ? `確定要刪除牌局「${gameToDelete.name}」嗎？`
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


export default HomeScreen;
