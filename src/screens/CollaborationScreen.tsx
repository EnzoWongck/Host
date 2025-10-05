import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useCollaboration } from '../context/CollaborationContext';
import { useGame } from '../context/GameContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Icon from '../components/Icon';

const CollaborationScreen: React.FC = () => {
  const theme = useTheme();
  const { state: collaborationState, setConflictResolution, requestSync } = useCollaboration();
  const { state: gameState } = useGame();
  const [gameId, setGameId] = useState('default-game');
  const [customWebSocketUrl, setCustomWebSocketUrl] = useState('ws://localhost:3001');

  const handleConflictResolutionChange = (value: boolean) => {
    setConflictResolution(value ? 'auto' : 'manual');
  };

  const handleSyncRequest = () => {
    requestSync();
    Alert.alert('同步請求', '已發送同步請求到服務器');
  };

  const handleGameIdChange = (newGameId: string) => {
    setGameId(newGameId);
    Alert.alert('遊戲ID變更', '請重新啟動應用程式以應用新的遊戲ID');
  };

  const getConnectionStatusColor = () => {
    switch (collaborationState.connectionStatus) {
      case 'connected':
        return theme.colors.success;
      case 'connecting':
        return theme.colors.warning;
      case 'disconnected':
        return theme.colors.text + '60';
      case 'error':
        return theme.colors.error;
      default:
        return theme.colors.text + '60';
    }
  };

  const getConnectionStatusText = () => {
    switch (collaborationState.connectionStatus) {
      case 'connected':
        return '已連接';
      case 'connecting':
        return '連接中...';
      case 'disconnected':
        return '未連接';
      case 'error':
        return '連接錯誤';
      default:
        return '未知狀態';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Icon name="users" size={24} color={theme.colors.primary} />
          <Text style={[styles.title, { color: theme.colors.text }]}>協作設置</Text>
        </View>

        {/* 連接狀態 */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="wifi" size={20} color={getConnectionStatusColor()} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>連接狀態</Text>
          </View>
          <View style={styles.statusInfo}>
            <Text style={[styles.statusText, { color: getConnectionStatusColor() }]}>
              {getConnectionStatusText()}
            </Text>
            {collaborationState.isOnline && (
              <Text style={[styles.onlineText, { color: theme.colors.success }]}>
                網絡已連接
              </Text>
            )}
          </View>
        </Card>

        {/* 遊戲房間設置 */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="target" size={20} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>遊戲房間</Text>
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>遊戲ID</Text>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              value={gameId}
              onChangeText={setGameId}
              placeholder="輸入遊戲ID"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>WebSocket 服務器</Text>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              value={customWebSocketUrl}
              onChangeText={setCustomWebSocketUrl}
              placeholder="ws://localhost:3001"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
        </Card>

        {/* 協作設置 */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="settings" size={20} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>協作設置</Text>
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>自動衝突解決</Text>
              <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                自動合併其他用戶的更改
              </Text>
            </View>
            <Switch
              value={collaborationState.conflictResolution === 'auto'}
              onValueChange={handleConflictResolutionChange}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
              thumbColor={collaborationState.conflictResolution === 'auto' ? theme.colors.primary : theme.colors.textSecondary}
            />
          </View>
        </Card>

        {/* 活動用戶 */}
        {collaborationState.activeUsers.length > 0 && (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="users" size={20} color={theme.colors.primary} />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>在線用戶</Text>
            </View>
            <View style={styles.usersList}>
              {collaborationState.activeUsers.map((userId, index) => (
                <View key={userId} style={styles.userItem}>
                  <Icon name="user" size={16} color={theme.colors.primary} />
                  <Text style={[styles.userText, { color: theme.colors.text }]}>
                    用戶 {index + 1}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* 同步信息 */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="refresh-cw" size={20} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>同步信息</Text>
          </View>
          <View style={styles.syncInfo}>
            <Text style={[styles.syncLabel, { color: theme.colors.text }]}>最後同步時間</Text>
            <Text style={[styles.syncValue, { color: theme.colors.textSecondary }]}>
              {collaborationState.lastSyncTime 
                ? new Date(collaborationState.lastSyncTime).toLocaleString('zh-TW')
                : '從未同步'
              }
            </Text>
          </View>
          <Button
            title="請求同步"
            onPress={handleSyncRequest}
            size="sm"
            style={styles.syncButton}
            leftIconName="refresh-cw"
          />
        </Card>

        {/* 當前遊戲信息 */}
        {gameState.currentGame && (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="info" size={20} color={theme.colors.primary} />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>當前遊戲</Text>
            </View>
            <View style={styles.gameInfo}>
              <Text style={[styles.gameName, { color: theme.colors.text }]}>
                {gameState.currentGame.name}
              </Text>
              <Text style={[styles.gameStatus, { color: theme.colors.textSecondary }]}>
                狀態: {gameState.currentGame.status}
              </Text>
              <Text style={[styles.gamePlayers, { color: theme.colors.textSecondary }]}>
                玩家: {gameState.currentGame.players.length}人
              </Text>
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    marginLeft: theme.spacing.sm,
  },
  card: {
    marginBottom: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  statusInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  onlineText: {
    fontSize: theme.fontSize.sm,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    fontSize: theme.fontSize.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  settingInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  settingTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  settingDescription: {
    fontSize: theme.fontSize.sm,
  },
  usersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  userText: {
    fontSize: theme.fontSize.sm,
    marginLeft: theme.spacing.xs,
  },
  syncInfo: {
    marginBottom: theme.spacing.md,
  },
  syncLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  syncValue: {
    fontSize: theme.fontSize.sm,
  },
  syncButton: {
    alignSelf: 'flex-start',
  },
  gameInfo: {
    marginTop: theme.spacing.sm,
  },
  gameName: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  gameStatus: {
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.xs,
  },
  gamePlayers: {
    fontSize: theme.fontSize.sm,
  },
});

export default CollaborationScreen;





