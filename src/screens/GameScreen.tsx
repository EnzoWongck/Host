import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../types/language';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useGame } from '../context/GameContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Icon from '../components/Icon';
import BuyInModal from '../components/BuyInModal';
import ExpenseModal from '../components/ExpenseModal';
import RakeModal from '../components/RakeModal';
import CashOutModal from '../components/CashOutModal';
import InsuranceModal from '../components/InsuranceModal';
import InsuranceRecordsModal from '../components/InsuranceRecordsModal';
import DealerModal from '../components/DealerModal';
import GameSummaryModal from '../components/GameSummaryModal';
import EndGameModal from '../components/EndGameModal';
import PlayerDetailsModal from '../components/PlayerDetailsModal';
import NewGameModal from '../components/NewGameModal';
import CollaborationButton from '../components/CollaborationButton';
import GameCollaborationModal from '../components/GameCollaborationModal';
import EntryFeeModal from '../components/EntryFeeModal';
import GameProfitShareSettingModal from './GameProfitShareSettingScreen';
import TopTabBar from '../components/TopTabBar';

const GameScreen: React.FC = () => {
  const { theme, colorMode } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { state, setGameSummaryModalVisible } = useGame();
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setLanguageModalVisible(false);
  };
  const [playersExpanded, setPlayersExpanded] = useState(false);
  const playersScrollRef = useRef<ScrollView>(null);
  
  // Modal states
  const [newGameModalVisible, setNewGameModalVisible] = useState(false);
  const [buyInModalVisible, setBuyInModalVisible] = useState(false);
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);
  const [rakeModalVisible, setRakeModalVisible] = useState(false);
  const [insuranceModalVisible, setInsuranceModalVisible] = useState(false);
  const [insuranceRecordsVisible, setInsuranceRecordsVisible] = useState(false);
  const [dealerModalVisible, setDealerModalVisible] = useState(false);
  const [endGameModalVisible, setEndGameModalVisible] = useState(false);
  const [cashOutModalVisible, setCashOutModalVisible] = useState(false);
  const [detailsPlayer, setDetailsPlayer] = useState<any>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [collaborationModalVisible, setCollaborationModalVisible] = useState(false);
  const [entryFeeModalVisible, setEntryFeeModalVisible] = useState(false);
  const [profitShareVisible, setProfitShareVisible] = useState(false);

  const currentGame = state.currentGame;
  
  // 計算玩家列表動態高度：根據玩家數量，最多600
  const playerItemHeight = 70; // 每個玩家項目的估算高度（包括padding和margin）
  const playerListHeight = currentGame?.players?.length 
    ? Math.min(currentGame.players.length * playerItemHeight, 600)
    : 0;

  // 處理導航參數
  useEffect(() => {
    const params = route.params as any;
    if (params?.action === 'end_direct') {
      setEndGameModalVisible(true);
      // 清除參數避免重複觸發
      navigation.setParams({ action: undefined });
    }
  }, [route.params, navigation]);

  // 當 Modal 關閉時，將玩家列表滾動到頂部
  useEffect(() => {
    if (!detailsVisible && !cashOutModalVisible && playersExpanded) {
      // 延遲執行，確保 Modal 完全關閉
      setTimeout(() => {
        playersScrollRef.current?.scrollTo({ y: 0, animated: false });
      }, 100);
    }
  }, [detailsVisible, cashOutModalVisible, playersExpanded]);

  // 開啟牌局總結時，自動收起玩家列表（避免關閉時看到收回動畫）
  useEffect(() => {
    if (state.gameSummaryModalVisible) {
      setPlayersExpanded(false);
    }
  }, [state.gameSummaryModalVisible]);

  // 每次返回目前牌局頁面時，自動收起玩家列表
  useFocusEffect(
    useCallback(() => {
      setPlayersExpanded(false);
      return () => {};
    }, [])
  );



  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.lg,
      paddingBottom: 180, // Space for fixed "新增玩家" button and tab bar
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xl,
    },
    headerLeft: {
      width: 80, // 左側放 Host27o icon + 設定按鈕，同時保持中間文字置中
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: theme.spacing.xs,
    },
    headerTitleContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,
    },
    hostTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 4,
    },
    gameTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      width: 120,
      gap: theme.spacing.sm,
    },
    languageButton: {
      padding: theme.spacing.sm,
      minWidth: 44,
      minHeight: 44,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'flex-end',
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
    settingsButton: {
      padding: theme.spacing.sm,
    },
    playersCard: {
      marginBottom: theme.spacing.md,
      shadowColor: theme.colorMode === 'light' ? '#000' : '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: theme.colorMode === 'light' ? 0.08 : 0.15,
      shadowRadius: 12,
      elevation: 6,
    },
    playersHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
    },
    playersInfo: {
      flexDirection: 'row',
      alignItems: 'flex-start', // 改為 flex-start 以便調整 icon 位置
    },
    playersIcon: {
      fontSize: theme.fontSize.xl,
      marginRight: theme.spacing.sm,
    },
    playersIconContainer: {
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      marginRight: theme.spacing.sm,
    },
    playersIconStyle: {
      marginRight: theme.spacing.sm,
      marginTop: theme.spacing.xs / 2, // 向下移動一點
    },
    playersTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: '600',
      color: theme.colors.text,
    },
    playersSubtitle: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    playersAmount: {
      fontSize: theme.fontSize.lg,
      fontWeight: 'bold',
      color: theme.colors.success,
      marginRight: theme.spacing.sm,
    },
    expandIcon: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
    },
    playersList: {
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderRadius: theme.borderRadius.sm,
      overflow: 'hidden',
    },
    playersListFullScreen: {
      marginTop: theme.spacing.md,
      marginBottom: 0,
      borderRadius: theme.borderRadius.sm,
      overflow: 'hidden',
    },
    playersListContainer: {
      position: 'relative',
    },
    playersScrollContainer: {
      // 移除 paddingBottom，因為按鈕已經移到外面
    },
    fixedAddPlayerContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      zIndex: 10,
    },
    fixedAddPlayerButton: {
      position: 'absolute',
      bottom: 90,
      left: theme.spacing.lg,
      right: theme.spacing.lg,
      zIndex: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
    },
    playerItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.sm,
      marginBottom: theme.spacing.sm,
      borderWidth: 0.5,
      borderColor: theme.colors.border,
    },
    playerInfo: {
      flex: 1,
    },
    playerName: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
    },
    playerBuyIn: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    playerProfit: {
      alignItems: 'flex-end',
    },
    profitAmount: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
    },
    playerStatus: {
      fontSize: theme.fontSize.xs,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: 12,
      marginTop: 4,
    },
    functionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.lg,
    },
    functionButton: {
      width: '48%',
      marginBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 85,
    },
    functionButtonLarge: {
      width: '48%',
      marginBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xl,
      alignItems: 'center',
      justifyContent: 'center',
      height: 110,
      flexDirection: 'column',
    },
    functionCard: {
      backgroundColor: colorMode === 'light' ? '#FFFFFF' : theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 0,
      borderColor: 'transparent',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: colorMode === 'light' ? 0.08 : 0.15,
      shadowRadius: 12,
      elevation: 6,
    },
    functionIcon: {
      marginBottom: theme.spacing.xs,
    },
    dealerIcon: {
      marginBottom: theme.spacing.xs, // 頂部對齊：與保險 icon 使用相同的 marginBottom
      marginTop: theme.spacing.xs / 2, // 向下移動一點點
    },
    functionText: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
      marginTop: 6,
      height: 20,
      lineHeight: 20,
    },
    dealerText: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
      marginTop: 6,
      height: 20,
      lineHeight: 20,
      transform: [{ translateY: -9 }], // 向上移動更多，icon 位置不變
    },
    functionTextLarge: {
      fontSize: theme.fontSize.lg,
      fontWeight: '700',
      color: theme.colors.text,
      textAlign: 'center',
      letterSpacing: 0.5,
    },
    fixedButtons: {
      position: 'absolute',
      bottom: 80,
      left: 0,
      right: 0,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.background,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    fixedButton: {
      flex: 1,
      marginHorizontal: theme.spacing.xs,
    },
  });

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  const getProfitColor = (profit: number) => {
    if (profit > 0) return theme.colors.success;
    if (profit < 0) return theme.colors.error;
    return theme.colors.textSecondary;
  };

  const getStatusStyle = (status: string) => {
    if (status === 'active') {
      return {
        backgroundColor: '#202124',
        borderWidth: 0,
        borderColor: 'transparent',
        color: '#FFFFFF',
      };
    }
    return {
      backgroundColor: colorMode === 'light' ? theme.colors.textSecondary : '#3F3F46',
      borderWidth: 0,
      borderColor: 'transparent',
      color: '#FFFFFF',
    };
  };

  if (!currentGame) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={styles.title}>{t('game.noGameInProgress')}</Text>
          <Button
            title={t('game.newGame')}
            onPress={() => setNewGameModalVisible(true)}
            style={{ marginTop: theme.spacing.lg }}
          />
        </View>
        
        {/* 新增牌局彈窗 */}
        <NewGameModal
          visible={newGameModalVisible}
          onClose={() => setNewGameModalVisible(false)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TopTabBar 
        title={currentGame ? `牌局 - ${currentGame.name}` : t('game.currentGame')}
        rightComponent={
          <CollaborationButton
            onPress={() => {
              console.log('GameScreen: 協作按鈕被點擊，設置模態框可見');
              setCollaborationModalVisible(true);
            }}
            gameId={currentGame?.id || "default-game"}
          />
        }
      />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        bounces={true}
        decelerationRate="fast"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingTop: 120 }}
      >
        <View style={styles.content}>
          {/* Settings Button - Moved down to be closer to player list */}
          <View style={{ marginBottom: theme.spacing.md, paddingHorizontal: theme.spacing.lg }}>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => {
                setProfitShareVisible(true);
              }}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 20, color: colorMode === 'dark' ? '#FFFFFF' : '#000000' }}>
                ⚙️
              </Text>
            </TouchableOpacity>
          </View>
          {/* Players Card */}
          <Card style={styles.playersCard}>
            <TouchableOpacity 
              style={styles.playersHeader}
              onPress={() => {
                setPlayersExpanded(!playersExpanded);
              }}
              activeOpacity={1}
            >
              <View style={styles.playersInfo}>
                <Icon name="player2" size={42} style={styles.playersIconStyle} />
                <View>
                  <Text style={styles.playersTitle}>{t('game.players')}</Text>
                  <Text style={styles.playersSubtitle}>
                    {currentGame.players.filter(p => p.status === 'active').length} {t('game.playersInProgress')}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.playersAmount}>
                  {formatCurrency(currentGame.totalBuyIn)}
                </Text>
                <Text style={[styles.expandIcon, { 
                  transform: [{ rotate: playersExpanded ? '180deg' : '0deg' }] 
                }]}>
                  ▼
                </Text>
              </View>
            </TouchableOpacity>

            {playersExpanded && (
              <View style={[styles.playersList, { height: playerListHeight }]}>
                <ScrollView 
                  ref={playersScrollRef}
                  nestedScrollEnabled 
                  showsVerticalScrollIndicator={true}
                  scrollEnabled={true}
                  bounces={true}
                  decelerationRate="fast"
                >
                {currentGame.players
                  .slice()
                  .sort((a, b) => (a.status === 'active' && b.status !== 'active' ? -1 : a.status !== 'active' && b.status === 'active' ? 1 : 0))
                  .map((player) => (
                    <Swipeable
                      key={player.id}
                      renderRightActions={() => (
                        <TouchableOpacity
                          style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.error, paddingHorizontal: theme.spacing.lg, borderRadius: theme.borderRadius.sm }}
                            onPress={() => Alert.alert(t('game.deletePlayer'), `${t('game.confirmDelete')} ${player.name}？`, [
                              { text: t('common.cancel'), style: 'cancel' },
                              { text: t('common.delete'), style: 'destructive', onPress: () => {
                                  // 接上 context 刪除玩家
                                  try {
                                    const { deletePlayer } = require('../context/GameContext');
                                  } catch {}
                                } },
                            ])}
                          >
                            <Text style={{ color: '#FFF', fontWeight: '700' }}>{t('common.delete')}</Text>
                        </TouchableOpacity>
                      )}
                    >
                    <TouchableOpacity style={styles.playerItem} onPress={() => { setDetailsPlayer(player); setDetailsVisible(true); }}>
                      <View style={styles.playerInfo}>
                        <Text style={styles.playerName}>{player.name}</Text>
                            <Text style={styles.playerBuyIn}>
                              {t('game.buyIn')}: {formatCurrency(player.buyIn)}
                            </Text>
                      </View>
                      <View style={styles.playerProfit}>
                        {player.status === 'cashed_out' && (
                          <Text style={[
                            styles.profitAmount,
                            { color: getProfitColor(player.profit) }
                          ]}>
                            {player.profit >= 0 ? '+' : ''}{formatCurrency(player.profit)}
                          </Text>
                        )}
                            <Text style={[
                              styles.playerStatus,
                              getStatusStyle(player.status)
                            ]}>
                              {player.status === 'active' ? t('game.inProgress') : t('game.cashedOut')}
                            </Text>
                      </View>
                    </TouchableOpacity>
                    </Swipeable>
                  ))}
                </ScrollView>
              </View>
            )}
          </Card>

          {/* 新增玩家卡片 */}
          {playersExpanded && (
            <Card style={styles.playersCard}>
              <Button
                title={`+ ${t('game.addPlayer')}`}
                onPress={() => setBuyInModalVisible(true)}
                size="lg"
              />
            </Card>
          )}

          {/* All Function Buttons in Grid Layout */}
          {!playersExpanded && (
            <View style={styles.functionsGrid}>
              <TouchableOpacity 
                style={[styles.functionButtonLarge, styles.functionCard]}
                onPress={() => setBuyInModalVisible(true)}
                activeOpacity={1}
              >
                <Icon name="buy-in" size={40} style={styles.functionIcon} />
                <Text style={styles.functionText}>{t('game.functions.buyIn') || t('game.functions.buyInCashOut')}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.functionButtonLarge, styles.functionCard]}
                onPress={() => setCashOutModalVisible(true)}
                activeOpacity={1}
              >
                <Icon name="cashout" size={40} style={styles.functionIcon} />
                <Text style={styles.functionText}>{t('game.functions.cashOut') || t('cashOut.title') || '兌現'}</Text>
              </TouchableOpacity>

              {currentGame.gameMode === 'noRake' ? (
                <TouchableOpacity 
                  style={[styles.functionButtonLarge, styles.functionCard]}
                  onPress={() => setEntryFeeModalVisible(true)}
                  activeOpacity={1}
                >
                  <Icon name="rake" size={40} style={styles.functionIcon} />
                  <Text style={styles.functionText}>{t('game.functions.entryFee')}</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={[styles.functionButtonLarge, styles.functionCard]}
                  onPress={() => setRakeModalVisible(true)}
                  activeOpacity={1}
                >
                  <Icon name="rake" size={40} style={styles.functionIcon} />
                  <Text style={styles.functionText}>{t('game.functions.rake')}</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[styles.functionButtonLarge, styles.functionCard]}
                onPress={() => setExpenseModalVisible(true)}
                activeOpacity={1}
              >
                <Icon name="cost" size={40} style={styles.functionIcon} />
                <Text style={styles.functionText}>{t('game.functions.expense')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.functionButtonLarge, styles.functionCard]}
                onPress={() => setInsuranceRecordsVisible(true)}
                activeOpacity={1}
              >
                <Icon name="insurance" size={40} style={styles.functionIcon} />
                <Text style={styles.functionText}>{t('game.functions.insurance')}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.functionButtonLarge, styles.functionCard]}
                onPress={() => setDealerModalVisible(true)}
                activeOpacity={1}
              >
                <Icon name="dealer" size={60} style={styles.dealerIcon} />
                <Text style={styles.dealerText}>{t('game.functions.dealer')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 移除頁內底部按鈕，交由 DoubleTabBar 控制 */}

      {/* All Modals */}
      <BuyInModal
        visible={buyInModalVisible}
        onClose={() => setBuyInModalVisible(false)}
      />
      <ExpenseModal
        visible={expenseModalVisible}
        onClose={() => setExpenseModalVisible(false)}
      />
      <RakeModal
        visible={rakeModalVisible}
        onClose={() => setRakeModalVisible(false)}
      />
      <InsuranceModal
        visible={insuranceModalVisible}
        onClose={() => setInsuranceModalVisible(false)}
        onCompleted={() => {
          // 新增保險完成後：關閉新增視窗 → 自動開啟紀錄視窗並滾到頂端
          setTimeout(() => setInsuranceRecordsVisible(true), 0);
        }}
      />
      <InsuranceRecordsModal
        visible={insuranceRecordsVisible}
        onClose={() => setInsuranceRecordsVisible(false)}
        onAddInsurance={() => {
          setInsuranceRecordsVisible(false);
          setTimeout(() => setInsuranceModalVisible(true), 0);
        }}
      />
      <DealerModal
        visible={dealerModalVisible}
        onClose={() => setDealerModalVisible(false)}
      />
      <GameSummaryModal
        visible={state.gameSummaryModalVisible}
        onClose={() => {
          console.log('關閉牌局總結 modal');
          setGameSummaryModalVisible(false);
        }}
      />
      <EndGameModal
        visible={endGameModalVisible}
        onClose={() => setEndGameModalVisible(false)}
      />
      <CashOutModal
        visible={cashOutModalVisible}
        onClose={() => setCashOutModalVisible(false)}
      />
      <PlayerDetailsModal
        visible={detailsVisible}
        onClose={() => setDetailsVisible(false)}
        player={detailsPlayer}
      />
      <GameCollaborationModal
        visible={collaborationModalVisible}
        onClose={() => {
          console.log('GameScreen: 關閉協作模態框');
          setCollaborationModalVisible(false);
        }}
        gameId={currentGame?.id || ''}
      />
      <EntryFeeModal
        visible={entryFeeModalVisible}
        onClose={() => setEntryFeeModalVisible(false)}
      />

      {/* 牌局 Host Profit Share 設定（彈出視窗） */}
      <GameProfitShareSettingModal
        visible={profitShareVisible}
        onClose={() => setProfitShareVisible(false)}
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
    </SafeAreaView>
  );
};

export default GameScreen;
