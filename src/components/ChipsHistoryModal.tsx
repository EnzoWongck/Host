import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';
import Icon from './Icon';

interface ChipsHistoryModalProps {
  visible: boolean;
  onClose: () => void;
}

interface ChipUsageRecord {
  id: string;
  game_id: string;
  game_name?: string;
  consumed_at: string;
  expires_at: string;
  reason: string;
}

const ChipsHistoryModal: React.FC<ChipsHistoryModalProps> = ({
  visible,
  onClose,
}) => {
  const { theme, colorMode } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [usageRecords, setUsageRecords] = useState<ChipUsageRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'usage' | 'purchase'>('usage');

  useEffect(() => {
    if (visible && user?.uid) {
      loadUsageRecords();
    }
  }, [visible, user?.uid]);

  const loadUsageRecords = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      // 查詢 game_chips 表獲取使用記錄
      const { data: chipRecords, error } = await supabase
        .from('game_chips')
        .select(`
          id,
          game_id,
          consumed_at,
          expires_at,
          reason
        `)
        .eq('user_id', user.uid)
        .order('consumed_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('載入使用記錄失敗:', error);
        return;
      }

      // 獲取所有相關的遊戲名稱
      const gameIds = [...new Set((chipRecords || []).map((r: any) => r.game_id))];
      const { data: gamesData } = await supabase
        .from('games')
        .select('id, name')
        .in('id', gameIds);

      const gameMap = new Map((gamesData || []).map((g: any) => [g.id, g.name]));

      const records: ChipUsageRecord[] = (chipRecords || []).map((record: any) => ({
        id: record.id,
        game_id: record.game_id,
        game_name: gameMap.get(record.game_id) || '未知牌局',
        consumed_at: record.consumed_at,
        expires_at: record.expires_at,
        reason: record.reason || 'game_session',
      }));

      setUsageRecords(records);
    } catch (error) {
      console.error('載入使用記錄錯誤:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getReasonText = (reason: string) => {
    const reasonMap: Record<string, string> = {
      game_session: '牌局編輯',
      restore_game: '恢復牌局',
      chip_expired: 'Chip 過期',
    };
    return reasonMap[reason] || reason;
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modal: {
      width: Platform.OS === 'web' ? 600 : '90%',
      maxHeight: Platform.OS === 'web' ? '80%' : '80%',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    title: {
      fontSize: theme.fontSize.xl,
      fontWeight: '700',
      color: theme.colors.text,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    tabs: {
      flexDirection: 'row',
      marginBottom: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    tab: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeTab: {
      borderBottomColor: theme.colors.primary,
    },
    tabText: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    activeTabText: {
      color: theme.colors.primary,
    },
    content: {
      maxHeight: Platform.OS === 'web' ? 400 : 300,
    },
    emptyState: {
      padding: theme.spacing.xl,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    recordItem: {
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      backgroundColor: colorMode === 'light' ? '#F8F9FA' : '#1E2023',
      borderRadius: theme.borderRadius.md,
    },
    recordHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    recordTitle: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
    },
    recordDate: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    recordDetails: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Chips 記錄</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="x" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'usage' && styles.activeTab]}
              onPress={() => setActiveTab('usage')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'usage' && styles.activeTabText,
                ]}
              >
                使用記錄
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'purchase' && styles.activeTab]}
              onPress={() => setActiveTab('purchase')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'purchase' && styles.activeTabText,
                ]}
              >
                購買記錄
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.emptyState}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            ) : activeTab === 'usage' ? (
              usageRecords.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>暫無使用記錄</Text>
                </View>
              ) : (
                usageRecords.map((record) => (
                  <View key={record.id} style={styles.recordItem}>
                    <View style={styles.recordHeader}>
                      <Text style={styles.recordTitle}>
                        {getReasonText(record.reason)}
                      </Text>
                      <Text style={styles.recordDate}>
                        {formatDate(record.consumed_at)}
                      </Text>
                    </View>
                    <Text style={styles.recordDetails}>
                      牌局：{record.game_name}
                    </Text>
                    <Text style={styles.recordDetails}>
                      有效期至：{formatDate(record.expires_at)}
                    </Text>
                  </View>
                ))
              )
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>購買記錄功能開發中</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default ChipsHistoryModal;

