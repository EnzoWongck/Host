import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import Card from '../components/Card';
import { useNavigation } from '@react-navigation/native';
import Button from '../components/Button';
import Icon from '../components/Icon';
import NewGameModal from '../components/NewGameModal';
import { Language } from '../types/language';

const HomeScreen: React.FC = () => {
  const { theme, colorMode } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const { state, selectCurrentGame, deleteGame } = useGame();
  const navigation = useNavigation<any>();
  const [newGameModalVisible, setNewGameModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<{ id: string; name: string } | null>(null);

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
      paddingBottom: 100, // Space for tab bar
    },
    header: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl,
      paddingTop: theme.spacing.xl + 8,
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
    languageButton: {
      position: 'absolute',
      top: theme.spacing.md,
      right: theme.spacing.md,
      padding: theme.spacing.sm,
      zIndex: 1000,
      minWidth: 44,
      minHeight: 44,
      justifyContent: 'center',
      alignItems: 'center',
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

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  
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

  const handleDeleteGame = (gameId: string, gameName: string) => {
    setGameToDelete({ id: gameId, name: gameName });
    setDeleteConfirmVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.languageButton}
        onPress={() => setLanguageModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={{ fontSize: 24, color: colorMode === 'dark' ? '#FFFFFF' : '#000000' }}>
          🌐
        </Text>
      </TouchableOpacity>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Host</Text>
            <Text style={styles.subtitle}>{t('welcome.subtitle')}</Text>
          </View>

          {/* Games List */}
          <Text style={styles.sectionTitle}>{t('home.gameList')}</Text>
          
          {state.games.length === 0 ? (
            <Card style={styles.gameCard}>
              <Text style={[styles.gameInfo, { textAlign: 'center' }]}>{t('home.noGames')}</Text>
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
                      {game.status === 'active' ? t('home.active') : t('home.completed')}
                    </Text>
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
                      <Text style={styles.statValue}>{game.players.length} {t('summaryExport.people')}</Text>
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
                    deleteGame(gameToDelete.id);
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
    </SafeAreaView>
  );
};

export default HomeScreen;
