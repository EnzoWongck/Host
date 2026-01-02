import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useChips } from '../context/ChipsContext';
import { supabase } from '../config/supabase';
import Button from './Button';
import Icon from './Icon';

interface PendingInvite {
  id: string;
  game_id: string;
  game_name?: string;
  owner_email?: string;
  owner_name?: string;
  chip_payer: 'owner' | 'collaborator';
  chip_consumed: boolean;
  created_at: string;
  expires_at: string;
}

interface PendingInvitesModalProps {
  visible: boolean;
  onClose: () => void;
  onAccepted?: (gameId: string) => void;
}

const PendingInvitesModal: React.FC<PendingInvitesModalProps> = ({
  visible,
  onClose,
  onAccepted,
}) => {
  const { theme, colorMode } = useTheme();
  const { user } = useAuth();
  const { chips, loadChipsBalance, openPurchaseModal } = useChips();
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [invites, setInvites] = useState<PendingInvite[]>([]);

  // 檢測是否為手機
  const isMobile = Platform.OS !== 'web' || (typeof window !== 'undefined' && window.innerWidth < 768);

  // 載入待處理邀請
  const loadPendingInvites = useCallback(async () => {
    if (!user?.email) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('game_collaborations')
        .select('*')
        .eq('collaborator_email', user.email.toLowerCase())
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('載入邀請失敗:', error);
        return;
      }

      // 獲取遊戲和擁有者信息
      const gameIds = [...new Set((data || []).map((d: any) => d.game_id))];
      const ownerIds = [...new Set((data || []).map((d: any) => d.owner_id))];

      let gameMap = new Map<string, string>();
      let ownerMap = new Map<string, { email: string; name: string }>();

      if (gameIds.length > 0) {
        const { data: gamesData } = await supabase
          .from('games')
          .select('id, name')
          .in('id', gameIds);

        (gamesData || []).forEach((g: any) => {
          gameMap.set(g.id, g.name);
        });
      }

      if (ownerIds.length > 0) {
        const { data: ownersData } = await supabase
          .from('profiles')
          .select('id, email, display_name')
          .in('id', ownerIds);

        (ownersData || []).forEach((o: any) => {
          ownerMap.set(o.id, { 
            email: o.email, 
            name: o.display_name || o.email 
          });
        });
      }

      const pendingInvites: PendingInvite[] = (data || [])
        .filter((d: any) => new Date(d.expires_at) > new Date())
        .map((d: any) => ({
          id: d.id,
          game_id: d.game_id,
          game_name: gameMap.get(d.game_id) || '未知牌局',
          owner_email: ownerMap.get(d.owner_id)?.email,
          owner_name: ownerMap.get(d.owner_id)?.name,
          chip_payer: d.chip_payer,
          chip_consumed: d.chip_consumed,
          created_at: d.created_at,
          expires_at: d.expires_at,
        }));

      setInvites(pendingInvites);
    } catch (error) {
      console.error('載入邀請錯誤:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (visible) {
      loadPendingInvites();
    }
  }, [visible, loadPendingInvites]);

  // 接受邀請
  const handleAcceptInvite = async (invite: PendingInvite) => {
    // 如果由協作者付費且未扣費，檢查餘額
    if (invite.chip_payer === 'collaborator' && !invite.chip_consumed) {
      if (chips < 1) {
        Alert.alert(
          'Chips 不足',
          '接受邀請需要 1 Chip，請先購買 Chips。',
          [
            { text: '取消', style: 'cancel' },
            { 
              text: '購買 Chips', 
              onPress: () => {
                onClose();
                openPurchaseModal();
              }
            },
          ]
        );
        return;
      }

      // 確認扣費
      const confirmMessage = `接受邀請將消耗 1 Chip。目前餘額：${chips} Chips`;
      if (Platform.OS === 'web') {
        if (!window.confirm(confirmMessage)) return;
      } else {
        return new Promise<void>((resolve) => {
          Alert.alert('確認', confirmMessage, [
            { text: '取消', style: 'cancel', onPress: () => resolve() },
            { text: '確定', onPress: () => doAcceptInvite(invite).then(resolve) },
          ]);
        });
      }
    }

    await doAcceptInvite(invite);
  };

  const doAcceptInvite = async (invite: PendingInvite) => {
    setAccepting(invite.id);
    try {
      const apiUrl = Platform.OS === 'web' && typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'https://lunchips.com'
        : '';

      const response = await fetch(`${apiUrl}/api/collaboration/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inviteId: invite.id,
          userId: user?.uid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.needsChip) {
          Alert.alert('Chips 不足', data.message);
          return;
        }
        throw new Error(data.error || '接受邀請失敗');
      }

      Alert.alert('成功', '已成功加入協作牌局');
      
      // 刷新餘額和邀請列表
      await loadChipsBalance();
      await loadPendingInvites();

      // 通知外部組件
      if (onAccepted) {
        onAccepted(invite.game_id);
      }

      onClose();
    } catch (error: any) {
      console.error('接受邀請錯誤:', error);
      Alert.alert('錯誤', error.message || '接受邀請失敗');
    } finally {
      setAccepting(null);
    }
  };

  // 拒絕邀請
  const handleRejectInvite = async (inviteId: string) => {
    if (Platform.OS === 'web') {
      if (!window.confirm('確定要拒絕這個邀請嗎？')) return;
    } else {
      return new Promise<void>((resolve) => {
        Alert.alert('確認', '確定要拒絕這個邀請嗎？', [
          { text: '取消', style: 'cancel', onPress: () => resolve() },
          { text: '確定', onPress: () => doRejectInvite(inviteId).then(resolve) },
        ]);
      });
    }

    await doRejectInvite(inviteId);
  };

  const doRejectInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('game_collaborations')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', inviteId);

      if (error) {
        console.error('拒絕邀請失敗:', error);
        Alert.alert('錯誤', '拒絕邀請失敗');
        return;
      }

      loadPendingInvites();
    } catch (error) {
      console.error('拒絕邀請錯誤:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-TW', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: isMobile ? theme.spacing.md : 0,
      paddingVertical: isMobile ? theme.spacing.xl : 0,
    },
    modal: {
      width: isMobile ? '100%' : 450,
      maxWidth: isMobile ? 400 : 450,
      maxHeight: isMobile ? '85%' : '80%',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    title: {
      fontSize: theme.fontSize.xl,
      fontWeight: '700',
      color: theme.colors.text,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    content: {
      padding: theme.spacing.lg,
    },
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl * 2,
    },
    emptyText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    inviteItem: {
      padding: theme.spacing.md,
      backgroundColor: colorMode === 'light' ? '#F8F9FA' : '#1E2023',
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.md,
    },
    inviteHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    inviteGameName: {
      fontSize: theme.fontSize.lg,
      fontWeight: '700',
      color: theme.colors.text,
    },
    inviteOwner: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    inviteMeta: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    chipInfo: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.warning,
      marginTop: theme.spacing.xs,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.md,
    },
    loadingContainer: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl,
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
            <View style={styles.headerLeft}>
              <Icon name="connect2" size={28} />
              <Text style={styles.title}>協作邀請</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={{ fontSize: theme.fontSize.xl, color: theme.colors.textSecondary, fontWeight: '300' }}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            ) : invites.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>沒有待處理的邀請</Text>
              </View>
            ) : (
              invites.map((invite) => (
                <View key={invite.id} style={styles.inviteItem}>
                  <View style={styles.inviteHeader}>
                    <Text style={styles.inviteGameName}>{invite.game_name}</Text>
                  </View>
                  <Text style={styles.inviteOwner}>
                    邀請人：{invite.owner_name || invite.owner_email}
                  </Text>
                  <Text style={styles.inviteMeta}>
                    邀請時間：{formatDate(invite.created_at)}
                  </Text>
                  <Text style={styles.inviteMeta}>
                    有效期至：{formatDate(invite.expires_at)}
                  </Text>
                  {invite.chip_payer === 'collaborator' && !invite.chip_consumed && (
                    <Text style={styles.chipInfo}>
                      ⚠️ 接受邀請需消耗 1 Chip
                    </Text>
                  )}
                  <View style={styles.buttonRow}>
                    <Button
                      title={accepting === invite.id ? '處理中...' : '接受'}
                      onPress={() => handleAcceptInvite(invite)}
                      size="sm"
                      disabled={accepting === invite.id}
                      style={{ flex: 1 }}
                    />
                    <Button
                      title="拒絕"
                      onPress={() => handleRejectInvite(invite.id)}
                      size="sm"
                      variant="secondary"
                      disabled={accepting === invite.id}
                      style={{ flex: 1 }}
                    />
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default PendingInvitesModal;

