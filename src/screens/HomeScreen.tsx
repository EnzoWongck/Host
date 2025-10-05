import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import Card from '../components/Card';
import { useNavigation } from '@react-navigation/native';
import Button from '../components/Button';
import Icon from '../components/Icon';
import NewGameModal from '../components/NewGameModal';

const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const { state, selectCurrentGame } = useGame();
  const navigation = useNavigation<any>();
  const [newGameModalVisible, setNewGameModalVisible] = useState(false);

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
    },
    title: {
      fontSize: theme.fontSize.xxl,
      fontWeight: '700',
      letterSpacing: -0.5,
      color: theme.colors.text,
    },
    sectionTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: '600',
      letterSpacing: -0.2,
      color: theme.colors.text,
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
      color: '#FFFFFF',
    },
    activeStatus: {
      backgroundColor: theme.colors.success,
    },
    completedStatus: {
      backgroundColor: theme.colors.textSecondary,
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
  });

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  
  const formatTime = (date: any) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '--:--';
    return d.toLocaleTimeString('zh-TW', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: any) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '--';
    return d.toLocaleDateString('zh-TW');
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Host</Text>
          </View>

          {/* Games List */}
          <Text style={styles.sectionTitle}>牌局列表</Text>
          
          {state.games.length === 0 ? (
            <Card style={styles.gameCard}>
              <Text style={[styles.gameInfo, { textAlign: 'center' }]}>尚未建立任何牌局</Text>
            </Card>
          ) : (
            state.games.map((game) => (
              <TouchableOpacity 
                key={game.id} 
                onPress={() => { selectCurrentGame(game.id); navigation.navigate('Game'); }}
                activeOpacity={1}
              >
                <Card style={styles.gameCard}>
                  <View style={styles.gameHeader}>
                    <Text style={styles.gameName}>{game.name}</Text>
                    <Text
                      style={[
                        styles.gameStatus,
                        game.status === 'active' ? styles.activeStatus : styles.completedStatus,
                      ]}
                    >
                      {game.status === 'active' ? '進行中' : '已結束'}
                    </Text>
                  </View>
                  
                  <Text style={styles.gameInfo}>
                    {game.status === 'active' 
                      ? `開始時間: ${formatTime(game.startTime)} | 進行時間: ${calculateDuration(game.startTime)}`
                      : `${formatDate(game.startTime)} | 時長: ${calculateDuration(game.startTime, game.endTime)}`
                    }
                  </Text>

                  <View style={styles.gameStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{formatCurrency(game.totalBuyIn)}</Text>
                      <Text style={styles.statLabel}>總買入</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{game.players.length} 人</Text>
                      <Text style={styles.statLabel}>玩家數</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: game.status === 'active' ? theme.colors.warning : theme.colors.success }]}>
                        {formatCurrency(game.netProfit)}
                      </Text>
                      <Text style={styles.statLabel}>
                        {game.status === 'active' ? '目前利潤' : '最終利潤'}
                      </Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}

          {/* New Game Button */}
          <Button title="+ 新增牌局" onPress={() => setNewGameModalVisible(true)} style={styles.newGameButton} />
        </View>
      </ScrollView>

      {/* New Game Modal */}
      <NewGameModal visible={newGameModalVisible} onClose={() => setNewGameModalVisible(false)} />
    </SafeAreaView>
  );
};

export default HomeScreen;
