import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useChips } from '../context/ChipsContext';
import { supabase } from '../config/supabase';
import Button from './Button';
import Icon from './Icon';

interface JoinGameModalProps {
  visible: boolean;
  onClose: () => void;
  onJoined?: (gameId: string) => void;
}

const JoinGameModal: React.FC<JoinGameModalProps> = ({
  visible,
  onClose,
  onJoined,
}) => {
  const { theme, colorMode } = useTheme();
  const { user } = useAuth();
  const { chips, loadChipsBalance, openPurchaseModal } = useChips();
  const [loading, setLoading] = useState(false);
  const [codeOrLink, setCodeOrLink] = useState('');
  const [inviteInfo, setInviteInfo] = useState<{
    id: string;
    game_name: string;
    owner_name: string;
    chip_payer: 'owner' | 'collaborator';
    chip_consumed: boolean;
  } | null>(null);

  // 檢測是否為手機
  const isMobile = Platform.OS !== 'web' || (typeof window !== 'undefined' && window.innerWidth < 768);

  // 從剪貼簿貼上
  const handlePaste = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setCodeOrLink(text);
      }
    } catch (error) {
      console.error('貼上失敗:', error);
    }
  };

  // 查詢邀請資訊
  const handleLookup = async () => {
    if (!codeOrLink.trim()) {
      Alert.alert('錯誤', '請輸入協作碼或連結');
      return;
    }

    setLoading(true);
    try {
      // 解析輸入：可能是6位數字碼或連結
      let inviteCode = codeOrLink.trim();
      
      // 如果是連結，提取 game ID
      if (inviteCode.includes('/invite')) {
        const url = new URL(inviteCode);
        const gameId = url.searchParams.get('game');
        if (gameId) {
          // 透過 game_id 查詢
          const { data, error } = await supabase
            .from('game_collaborations')
            .select('*')
            .eq('game_id', gameId)
            .eq('collaborator_email', user?.email?.toLowerCase())
            .eq('status', 'pending')
            .maybeSingle();

          if (error || !data) {
            Alert.alert('錯誤', '找不到該邀請或邀請已過期');
            return;
          }

          await fetchInviteDetails(data);
          return;
        }
      }

      // 如果是6位數字碼
      if (/^\d{6}$/.test(inviteCode)) {
        const { data, error } = await supabase
          .from('game_collaborations')
          .select('*')
          .eq('invite_code', inviteCode)
          .eq('status', 'pending')
          .maybeSingle();

        if (error || !data) {
          Alert.alert('錯誤', '協作碼無效或已過期');
          return;
        }

        // 檢查是否過期
        if (new Date(data.expires_at) < new Date()) {
          Alert.alert('錯誤', '此邀請已過期');
          return;
        }

        await fetchInviteDetails(data);
        return;
      }

      Alert.alert('錯誤', '請輸入有效的6位數字協作碼或邀請連結');
    } catch (error: any) {
      console.error('查詢邀請錯誤:', error);
      Alert.alert('錯誤', '查詢失敗，請稍後重試');
    } finally {
      setLoading(false);
    }
  };

  // 獲取邀請詳細信息
  const fetchInviteDetails = async (data: any) => {
    // 獲取遊戲名稱
    const { data: gameData } = await supabase
      .from('games')
      .select('name')
      .eq('id', data.game_id)
      .maybeSingle();

    // 獲取邀請者名稱
    const { data: ownerData } = await supabase
      .from('profiles')
      .select('display_name, email')
      .eq('id', data.owner_id)
      .maybeSingle();

    setInviteInfo({
      id: data.id,
      game_name: gameData?.name || data.game_id,
      owner_name: ownerData?.display_name || ownerData?.email || '未知用戶',
      chip_payer: data.chip_payer,
      chip_consumed: data.chip_consumed,
    });
  };

  // 接受邀請
  const handleAccept = async () => {
    if (!inviteInfo) return;

    // 如果需要協作者付費且未扣費
    if (inviteInfo.chip_payer === 'collaborator' && !inviteInfo.chip_consumed) {
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
      }
    }

    setLoading(true);
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
          inviteId: inviteInfo.id,
          userId: user?.uid,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '接受邀請失敗');
      }

      Alert.alert('成功', '已成功加入協作牌局');
      await loadChipsBalance();
      
      // 重置狀態
      setCodeOrLink('');
      setInviteInfo(null);
      
      if (onJoined) {
        onJoined(result.gameId);
      }
      onClose();
    } catch (error: any) {
      console.error('接受邀請錯誤:', error);
      Alert.alert('錯誤', error.message || '接受邀請失敗');
    } finally {
      setLoading(false);
    }
  };

  // 重置並關閉
  const handleClose = () => {
    setCodeOrLink('');
    setInviteInfo(null);
    onClose();
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: isMobile ? theme.spacing.md : 0,
    },
    modal: {
      width: isMobile ? '100%' : 420,
      maxWidth: isMobile ? 400 : 420,
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
    inputContainer: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      color: theme.colors.text,
      backgroundColor: colorMode === 'light' ? '#F8F9FA' : '#1E2023',
      fontSize: theme.fontSize.lg,
      textAlign: 'center',
      letterSpacing: 4,
    },
    pasteButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      justifyContent: 'center',
    },
    pasteButtonText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.text,
      fontWeight: '600',
    },
    hint: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    inviteCard: {
      backgroundColor: colorMode === 'light' ? '#F8F9FA' : '#1E2023',
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    inviteTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    inviteDetail: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    chipWarning: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.warning,
      marginTop: theme.spacing.sm,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Icon name="connect2" size={28} />
              <Text style={styles.title}>加入牌局</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={{ fontSize: theme.fontSize.xl, color: theme.colors.textSecondary, fontWeight: '300' }}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {!inviteInfo ? (
              <>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={codeOrLink}
                    onChangeText={setCodeOrLink}
                    placeholder="輸入6位協作碼"
                    placeholderTextColor={theme.colors.textSecondary}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus
                  />
                  <TouchableOpacity style={styles.pasteButton} onPress={handlePaste}>
                    <Text style={styles.pasteButtonText}>貼上</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.hint}>
                  輸入協作碼或貼上邀請連結加入牌局
                </Text>
                <Button
                  title={loading ? '查詢中...' : '查詢'}
                  onPress={handleLookup}
                  disabled={loading || !codeOrLink.trim()}
                />
              </>
            ) : (
              <>
                <View style={styles.inviteCard}>
                  <Text style={styles.inviteTitle}>{inviteInfo.game_name}</Text>
                  <Text style={styles.inviteDetail}>邀請人：{inviteInfo.owner_name}</Text>
                  <Text style={styles.inviteDetail}>
                    扣費方：{inviteInfo.chip_payer === 'owner' ? '對方付費' : '你付費'}
                  </Text>
                  {inviteInfo.chip_payer === 'collaborator' && !inviteInfo.chip_consumed && (
                    <Text style={styles.chipWarning}>
                      ⚠️ 接受邀請將消耗 1 Chip（目前餘額：{chips}）
                    </Text>
                  )}
                </View>
                <View style={styles.buttonRow}>
                  <Button
                    title="返回"
                    variant="secondary"
                    size="md"
                    style={{ flex: 1 }}
                    onPress={() => setInviteInfo(null)}
                  />
                  <Button
                    title={loading ? '處理中...' : '加入牌局'}
                    size="md"
                    style={{ flex: 1 }}
                    onPress={handleAccept}
                    disabled={loading}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default JoinGameModal;

