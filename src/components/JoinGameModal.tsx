import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
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
    const input = codeOrLink.trim();
    if (!input) {
      Alert.alert('錯誤', '請輸入協作碼或連結');
      return;
    }

    setLoading(true);
    try {
      console.log('查詢協作碼/連結:', input);
      
      // 如果是連結，提取 game ID
      if (input.includes('/invite') || input.includes('game=')) {
        try {
          let gameId: string | null = null;
          if (input.includes('game=')) {
            // 從 URL 參數提取
            const match = input.match(/game=([a-zA-Z0-9-]+)/);
            gameId = match ? match[1] : null;
          }
          
          if (gameId) {
            console.log('從連結提取的 gameId:', gameId);
            // 透過 game_id 查詢（允許無 email 的邀請）
            const { data, error } = await supabase
              .from('game_collaborations')
              .select('*')
              .eq('game_id', gameId)
              .eq('status', 'pending')
              .or(`collaborator_email.eq.${user?.email?.toLowerCase()},collaborator_email.is.null`)
              .limit(1)
              .maybeSingle();

            console.log('連結查詢結果:', { data, error });

            if (error) {
              console.error('查詢錯誤:', error);
              Alert.alert('錯誤', '查詢失敗');
              return;
            }
            
            if (!data) {
              Alert.alert('錯誤', '找不到該邀請或邀請已過期');
              return;
            }

            await fetchInviteDetails(data);
            return;
          }
        } catch (urlError) {
          console.error('解析連結失敗:', urlError);
        }
      }

      // 嘗試作為協作碼查詢（支持任意長度的碼）
      console.log('嘗試作為協作碼查詢:', input);
      
      // 使用更寬鬆的查詢（不限制 status 和 email）
      const { data: allData, error: allError } = await supabase
        .from('game_collaborations')
        .select('*')
        .eq('invite_code', input);
      
      console.log('所有協作碼結果:', { allData, allError });
      
      // 過濾出有效的邀請
      const validInvite = allData?.find(d => 
        d.status === 'pending' && 
        (!d.collaborator_email || d.collaborator_email === user?.email?.toLowerCase())
      );
      
      console.log('有效邀請:', validInvite);

      if (allError) {
        console.error('協作碼查詢錯誤:', allError);
        Alert.alert('錯誤', '查詢失敗：' + allError.message);
        return;
      }
      
      if (!validInvite) {
        if (allData && allData.length > 0) {
          // 有找到但不符合條件
          const invite = allData[0];
          if (invite.status !== 'pending') {
            Alert.alert('錯誤', '此協作碼已被使用或已過期');
          } else if (invite.collaborator_email && invite.collaborator_email !== user?.email?.toLowerCase()) {
            Alert.alert('錯誤', '此協作碼是發給其他用戶的');
          } else {
            Alert.alert('錯誤', '協作碼無效');
          }
        } else {
          Alert.alert('錯誤', '找不到此協作碼，請確認輸入正確');
        }
        return;
      }
      
      const data = validInvite;

      // 檢查是否過期
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        Alert.alert('錯誤', '此邀請已過期');
        return;
      }

      // 檢查是否是自己發的邀請
      if (data.owner_id === user?.uid) {
        Alert.alert('錯誤', '不能加入自己創建的牌局邀請');
        return;
      }

      await fetchInviteDetails(data);
    } catch (error: any) {
      console.error('查詢邀請錯誤:', error);
      Alert.alert('錯誤', error.message || '查詢失敗，請稍後重試');
    } finally {
      setLoading(false);
    }
  };

  // 獲取邀請詳細信息
  const fetchInviteDetails = async (data: any) => {
    try {
      console.log('獲取邀請詳情:', data);
      
      // 獲取遊戲名稱（可能因 RLS 失敗）
      let gameName = data.game_id;
      try {
        const { data: gameData } = await supabase
          .from('games')
          .select('name')
          .eq('id', data.game_id)
          .maybeSingle();
        if (gameData?.name) {
          gameName = gameData.name;
        }
      } catch (e) {
        console.log('無法獲取遊戲名稱（可能是 RLS 限制）');
      }

      // 獲取邀請者名稱
      let ownerName = '用戶';
      try {
        const { data: ownerData } = await supabase
          .from('profiles')
          .select('display_name, email')
          .eq('id', data.owner_id)
          .maybeSingle();
        if (ownerData) {
          ownerName = ownerData.display_name || ownerData.email || '用戶';
        }
      } catch (e) {
        console.log('無法獲取邀請者名稱');
      }

      console.log('設置邀請信息:', { gameName, ownerName });
      setInviteInfo({
        id: data.id,
        game_name: gameName,
        owner_name: ownerName,
        chip_payer: data.chip_payer,
        chip_consumed: data.chip_consumed,
      });
    } catch (error) {
      console.error('fetchInviteDetails 錯誤:', error);
      // 即使獲取詳情失敗，也設置基本信息
      setInviteInfo({
        id: data.id,
        game_name: '牌局',
        owner_name: '用戶',
        chip_payer: data.chip_payer,
        chip_consumed: data.chip_consumed,
      });
    }
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
      fontSize: theme.fontSize.md,
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
                    placeholder="協作碼或連結"
                    placeholderTextColor={theme.colors.textSecondary}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                  />
                  <TouchableOpacity style={styles.pasteButton} onPress={handlePaste}>
                    <Text style={styles.pasteButtonText}>貼上</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.hint}>
                  輸入6位協作碼或貼上邀請連結加入牌局
                </Text>
                <Button
                  title={loading ? '查詢中...' : '查詢'}
                  onPress={handleLookup}
                  disabled={loading}
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

