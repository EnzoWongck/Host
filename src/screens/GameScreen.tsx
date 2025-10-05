import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useTheme } from '../context/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
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
import InOutModal from '../components/InOutModal';

const GameScreen: React.FC = () => {
  const { theme, colorMode } = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { state, setGameSummaryModalVisible } = useGame();
  const [playersExpanded, setPlayersExpanded] = useState(false);
  
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
  const [inOutModalVisible, setInOutModalVisible] = useState(false);

  const currentGame = state.currentGame;

  // 處理導航參數
  useEffect(() => {
    const params = route.params as any;
    if (params?.action === 'end_direct') {
      setEndGameModalVisible(true);
      // 清除參數避免重複觸發
      navigation.setParams({ action: undefined });
    }
  }, [route.params, navigation]);


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.lg,
      paddingBottom: 120, // Space for fixed buttons and tab bar
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xl,
    },
    title: {
      fontSize: theme.fontSize.xl,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
    },
    playersCard: {
      marginBottom: theme.spacing.md,
    },
    playersHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
    },
    playersInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    playersIcon: {
      fontSize: theme.fontSize.xl,
      marginRight: theme.spacing.sm,
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
      maxHeight: 200,
      borderRadius: theme.borderRadius.sm,
      overflow: 'hidden',
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
      fontWeight: '500',
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
      fontWeight: '500',
    },
    playerStatus: {
      fontSize: theme.fontSize.xs,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: 12,
      color: '#FFFFFF',
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
    functionCard: {
      backgroundColor: colorMode === 'light' ? '#FFFFFF' : theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 0,
      borderColor: 'transparent',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    functionIcon: {
      marginBottom: theme.spacing.xs,
    },
    functionText: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
      marginTop: 6,
    },
    functionTextLarge: {
      fontSize: theme.fontSize.lg,
      fontWeight: '700',
      color: theme.colors.text,
      textAlign: 'center',
      letterSpacing: 0.5,
    },
    dealerCard: {
      marginBottom: theme.spacing.md,
    },
    dealerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dealerInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    dealerIcon: {
      marginRight: theme.spacing.sm,
    },
    dealerTitle: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
    },
    dealerSubtitle: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    arrow: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
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

  const getStatusColor = (status: string) => {
    return status === 'active' ? theme.colors.success : theme.colors.textSecondary;
  };

  if (!currentGame) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={styles.title}>目前沒有進行中的牌局</Text>
          <Button
            title="新增牌局"
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
      <View style={styles.header}>
        <Text style={styles.title}>目前牌局</Text>
        <CollaborationButton
          onPress={() => {
            console.log('GameScreen: 協作按鈕被點擊，設置模態框可見');
            setCollaborationModalVisible(true);
          }}
          gameId={currentGame?.id || "default-game"}
        />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        bounces={true}
        decelerationRate="fast"
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Players Card */}
          <Card style={styles.playersCard}>
            <TouchableOpacity 
              style={styles.playersHeader}
              onPress={() => setPlayersExpanded(!playersExpanded)}
              activeOpacity={1}
            >
              <View style={styles.playersInfo}>
                <Icon name="player2" size={34} style={{ marginRight: theme.spacing.sm }} />
                <View>
                  <Text style={styles.playersTitle}>玩家</Text>
                  <Text style={styles.playersSubtitle}>
                    {currentGame.players.length} 人進行中
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
              <View style={styles.playersList}>
                <ScrollView 
                  nestedScrollEnabled 
                  showsVerticalScrollIndicator={false}
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
                        onPress={() => Alert.alert('刪除玩家', `確定刪除 ${player.name}？`, [
                          { text: '取消', style: 'cancel' },
                          { text: '刪除', style: 'destructive', onPress: () => {
                              // 接上 context 刪除玩家
                              try {
                                const { deletePlayer } = require('../context/GameContext');
                              } catch {}
                            } },
                        ])}
                      >
                        <Text style={{ color: '#FFF', fontWeight: '700' }}>刪除</Text>
                      </TouchableOpacity>
                    )}
                  >
                  <TouchableOpacity style={styles.playerItem} onPress={() => { setDetailsPlayer(player); setDetailsVisible(true); }}>
                    <View style={styles.playerInfo}>
                      <Text style={styles.playerName}>{player.name}</Text>
                      <Text style={styles.playerBuyIn}>
                        買入: {formatCurrency(player.buyIn)}
                      </Text>
                    </View>
                    <View style={styles.playerProfit}>
                      <Text style={[
                        styles.profitAmount,
                        { color: getProfitColor(player.profit) }
                      ]}>
                        {player.profit >= 0 ? '+' : ''}{formatCurrency(player.profit)}
                      </Text>
                      <Text style={[
                        styles.playerStatus,
                        { backgroundColor: getStatusColor(player.status) }
                      ]}>
                        {player.status === 'active' ? '進行中' : '已兌現'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  </Swipeable>
                ))}
                </ScrollView>
                <Button
                  title="+ 新增玩家"
                  onPress={() => setBuyInModalVisible(true)}
                  style={{ marginTop: theme.spacing.md }}
                />
              </View>
            )}
          </Card>

          {/* All Function Buttons in Grid Layout */}
          <View style={styles.functionsGrid}>
            <TouchableOpacity 
              style={[styles.functionButton, styles.functionCard]}
              onPress={() => setInOutModalVisible(true)}
              activeOpacity={1}
            >
              <Icon name="inout2" size={40} style={styles.functionIcon} />
              <Text style={styles.functionText}>買入/兌現</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.functionButton, styles.functionCard]}
              onPress={() => setRakeModalVisible(true)}
              activeOpacity={1}
            >
              <Icon name="rake" size={36} style={styles.functionIcon} />
              <Text style={styles.functionText}>抽水</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.functionButton, styles.functionCard]}
              onPress={() => setExpenseModalVisible(true)}
              activeOpacity={1}
            >
              <Icon name="cost" size={36} style={styles.functionIcon} />
              <Text style={styles.functionText}>支出</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.functionButton, styles.functionCard]}
              onPress={() => setInsuranceRecordsVisible(true)}
              activeOpacity={1}
            >
              <Icon name="insurance" size={36} style={styles.functionIcon} />
              <Text style={styles.functionText}>保險</Text>
            </TouchableOpacity>
          </View>

          {/* Dealer Card */}
          <Card style={styles.dealerCard}>
            <TouchableOpacity 
              style={styles.dealerHeader}
              onPress={() => setDealerModalVisible(true)}
              activeOpacity={1}
            >
              <View style={styles.dealerInfo}>
                <Icon name="dealer" size={44} style={styles.dealerIcon} />
                <View>
                  <Text style={styles.dealerTitle}>發牌員</Text>
                  <Text style={styles.dealerSubtitle}>
                    {currentGame.dealers.length} 人發牌中
                  </Text>
                </View>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          </Card>
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
      <InOutModal
        visible={inOutModalVisible}
        onClose={() => setInOutModalVisible(false)}
        onBuyIn={() => setBuyInModalVisible(true)}
        onCashOut={() => setCashOutModalVisible(true)}
      />
    </SafeAreaView>
  );
};

export default GameScreen;
