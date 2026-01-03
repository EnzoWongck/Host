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
  const [chipPayer, setChipPayer] = useState<'owner' | 'collaborator'>('owner');
  const [inviteInfo, setInviteInfo] = useState<{
    id: string;
    game_name: string;
    owner_name: string;
    game_id?: string;
    owner_id?: string;
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

  // 根據 gameId 生成固定的6位協作碼（與 CollaborationInviteModal 相同算法）
  const generateFixedCode = (id: string): string => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      const char = id.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    const code = Math.abs(hash % 900000) + 100000;
    return code.toString();
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
      
      let targetGameId: string | null = null;
      
      // 如果是連結，提取 game ID
      if (input.includes('/invite') || input.includes('game=')) {
        const match = input.match(/game=([a-zA-Z0-9-]+)/);
        targetGameId = match ? match[1] : null;
        console.log('從連結提取的 gameId:', targetGameId);
      }
      
      // 如果是6位數字協作碼，遍歷用戶的遊戲找匹配的
      if (!targetGameId && /^\d{6}$/.test(input)) {
        console.log('嘗試匹配協作碼:', input);
        
        // 查詢所有遊戲（公開查詢，不受 RLS 限制）
        const { data: allGames } = await supabase
          .from('games')
          .select('id, name, user_id');
        
        if (allGames) {
          for (const game of allGames) {
            const gameCode = generateFixedCode(game.id);
            if (gameCode === input) {
              targetGameId = game.id;
              console.log('找到匹配的遊戲:', game.id, game.name);
              break;
            }
          }
        }
        
        if (!targetGameId) {
          Alert.alert('錯誤', '找不到此協作碼對應的牌局');
          return;
        }
      }
      
      if (!targetGameId) {
        // 嘗試將整個輸入作為 gameId（UUID 格式）
        if (/^[a-f0-9-]{36}$/.test(input)) {
          targetGameId = input;
        } else {
          Alert.alert('錯誤', '無效的協作碼或連結格式');
          return;
        }
      }
      
      // 直接查詢遊戲資訊
      console.log('查詢遊戲:', targetGameId);
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('id, name, user_id')
        .eq('id', targetGameId)
        .maybeSingle();
      
      console.log('遊戲查詢結果:', { gameData, gameError });
      
      if (gameError || !gameData) {
        Alert.alert('錯誤', '找不到該牌局');
        return;
      }
      
      // 檢查是否是自己的遊戲
      if (gameData.user_id === user?.uid) {
        Alert.alert('錯誤', '不能加入自己創建的牌局');
        return;
      }
      
      // 獲取擁有者名稱
      let ownerName = '用戶';
      console.log('查詢擁有者資料, user_id:', gameData.user_id);
      const { data: ownerData, error: ownerError } = await supabase
        .from('profiles')
        .select('display_name, email')
        .eq('id', gameData.user_id)
        .maybeSingle();
      
      console.log('擁有者查詢結果:', { ownerData, ownerError });
      
      if (ownerData) {
        ownerName = ownerData.display_name || ownerData.email || '用戶';
      } else if (ownerError) {
        console.error('查詢擁有者失敗:', ownerError);
      }
      
      console.log('最終擁有者名稱:', ownerName);
      
      // 設置邀請信息（不需要從 game_collaborations 查詢）
      setInviteInfo({
        id: targetGameId,
        game_name: gameData.name,
        owner_name: ownerName,
        game_id: targetGameId,
        owner_id: gameData.user_id,
      });
      
      console.log('設置邀請信息成功');
    } catch (error: any) {
      console.error('查詢邀請錯誤:', error);
      Alert.alert('錯誤', error.message || '查詢失敗，請稍後重試');
    } finally {
      setLoading(false);
    }
  };

  // 接受邀請
  const handleAccept = async () => {
    if (!inviteInfo) return;

    const gameId = inviteInfo.game_id || inviteInfo.id;
    const ownerId = inviteInfo.owner_id;
    
    // 如果協作者付費，檢查自己的 Chips
    if (chipPayer === 'collaborator') {
      if (chips < 1) {
        Alert.alert(
          'Chips 不足',
          '加入牌局需要 1 Chip，請先購買 Chips。',
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
    }
    
    // 如果邀請人付費，檢查邀請人的 Chips
    if (chipPayer === 'owner' && ownerId) {
      const { data: ownerProfile } = await supabase
        .from('profiles')
        .select('chips')
        .eq('id', ownerId)
        .maybeSingle();
      
      if (!ownerProfile || (ownerProfile.chips || 0) < 1) {
        Alert.alert('無法加入', '邀請人 Chip 餘額不足，無法加入牌局。');
        return;
      }
    }

    setLoading(true);
    try {
      console.log('接受邀請:', { gameId, ownerId, userId: user?.uid, chipPayer });
      
      // 檢查是否已經是協作者
      const { data: existingCollab } = await supabase
        .from('game_collaborations')
        .select('id')
        .eq('game_id', gameId)
        .eq('collaborator_id', user?.uid)
        .eq('status', 'accepted')
        .maybeSingle();
      
      if (existingCollab) {
        Alert.alert('提示', '你已經是這個牌局的協作者');
        if (onJoined) {
          onJoined(gameId);
        }
        onClose();
        return;
      }
      
      // 扣除 Chips
      if (chipPayer === 'collaborator') {
        // 扣除自己的 Chip
        await supabase
          .from('profiles')
          .update({ chips: chips - 1 })
          .eq('id', user?.uid);
      } else if (chipPayer === 'owner' && ownerId) {
        // 扣除邀請人的 Chip
        const { data: ownerProfile } = await supabase
          .from('profiles')
          .select('chips')
          .eq('id', ownerId)
          .maybeSingle();
        
        if (ownerProfile) {
          await supabase
            .from('profiles')
            .update({ chips: (ownerProfile.chips || 0) - 1 })
            .eq('id', ownerId);
        }
      }
      
      // 創建協作記錄
      const { error: insertError } = await supabase
        .from('game_collaborations')
        .insert({
          game_id: gameId,
          owner_id: ownerId,
          collaborator_id: user?.uid,
          collaborator_email: user?.email?.toLowerCase(),
          status: 'accepted',
          chip_payer: chipPayer,
          chip_consumed: true,
          invite_code: generateFixedCode(gameId),
        });
      
      if (insertError) {
        console.error('創建協作記錄失敗:', insertError);
        throw new Error('加入牌局失敗：' + insertError.message);
      }
      
      console.log('協作記錄創建成功');
      Alert.alert('成功', '已成功加入協作牌局');
      await loadChipsBalance();
      
      // 重置狀態
      setCodeOrLink('');
      setInviteInfo(null);
      setChipPayer('owner');
      
      if (onJoined) {
        onJoined(gameId);
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
                  <Text style={styles.inviteTitle}>牌局：{inviteInfo.game_name}</Text>
                  <Text style={styles.inviteDetail}>邀請人：{inviteInfo.owner_name}</Text>
                </View>
                
                {/* 付費方選擇 */}
                <View style={{ marginBottom: theme.spacing.md }}>
                  <Text style={{ fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm }}>
                    Chip 扣費方：
                  </Text>
                  <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        paddingVertical: theme.spacing.sm,
                        paddingHorizontal: theme.spacing.md,
                        borderRadius: theme.borderRadius.md,
                        borderWidth: 1,
                        borderColor: chipPayer === 'owner' ? theme.colors.primary : theme.colors.border,
                        backgroundColor: chipPayer === 'owner' ? `${theme.colors.primary}20` : 'transparent',
                        opacity: chipPayer === 'owner' ? 1 : 0.5,
                      }}
                      onPress={() => setChipPayer('owner')}
                    >
                      <Text style={{
                        textAlign: 'center',
                        color: theme.colors.text,
                        fontWeight: chipPayer === 'owner' ? '600' : '400',
                      }}>
                        邀請人付費
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        paddingVertical: theme.spacing.sm,
                        paddingHorizontal: theme.spacing.md,
                        borderRadius: theme.borderRadius.md,
                        borderWidth: 1,
                        borderColor: chipPayer === 'collaborator' ? theme.colors.primary : theme.colors.border,
                        backgroundColor: chipPayer === 'collaborator' ? `${theme.colors.primary}20` : 'transparent',
                        opacity: chipPayer === 'collaborator' ? 1 : 0.5,
                      }}
                      onPress={() => setChipPayer('collaborator')}
                    >
                      <Text style={{
                        textAlign: 'center',
                        color: theme.colors.text,
                        fontWeight: chipPayer === 'collaborator' ? '600' : '400',
                      }}>
                        我付費
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* 付費警告 */}
                {chipPayer === 'collaborator' && (
                  <Text style={styles.chipWarning}>
                    ⚠️ 加入牌局將消耗你一個 Chip（目前餘額：{chips}）
                  </Text>
                )}
                
                <View style={styles.buttonRow}>
                  <Button
                    title="返回"
                    variant="secondary"
                    size="md"
                    style={{ flex: 1 }}
                    onPress={() => {
                      setInviteInfo(null);
                      setChipPayer('owner');
                    }}
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

