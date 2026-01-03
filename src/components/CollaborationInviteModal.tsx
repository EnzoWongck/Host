import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { useChips } from '../context/ChipsContext';
import { supabase } from '../config/supabase';
import Button from './Button';
import Icon from './Icon';

interface CollaborationInviteModalProps {
  visible: boolean;
  onClose: () => void;
  gameId: string;
  gameName: string;
}

interface Collaborator {
  id: string;
  email: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  chip_payer: 'owner' | 'collaborator';
  chip_consumed: boolean;
  created_at: string;
  collaborator_name?: string;
}

const CollaborationInviteModal: React.FC<CollaborationInviteModalProps> = ({
  visible,
  onClose,
  gameId,
  gameName,
}) => {
  const { theme, colorMode } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { chips, loadChipsBalance } = useChips();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [showCodeLink, setShowCodeLink] = useState(false);
  const [chipPayer, setChipPayer] = useState<'owner' | 'collaborator'>('owner');
  const [inviteLink, setInviteLink] = useState('');
  const [collaborationCode, setCollaborationCode] = useState('');

  // 檢測是否為手機
  const isMobile = Platform.OS !== 'web' || (typeof window !== 'undefined' && window.innerWidth < 768);

  // 載入現有協作者
  const loadCollaborators = useCallback(async () => {
    if (!gameId || !user?.uid) return;

    try {
      const { data, error } = await supabase
        .from('game_collaborations')
        .select('*')
        .eq('game_id', gameId)
        .eq('owner_id', user.uid)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('載入協作者失敗:', error);
        return;
      }

      // 獲取協作者名稱
      const collaboratorIds = (data || [])
        .filter((c: any) => c.collaborator_id)
        .map((c: any) => c.collaborator_id);

      let nameMap = new Map<string, string>();
      if (collaboratorIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name, email')
          .in('id', collaboratorIds);

        (profiles || []).forEach((p: any) => {
          nameMap.set(p.id, p.display_name || p.email || '');
        });
      }

      const collaboratorList: Collaborator[] = (data || []).map((c: any) => ({
        id: c.id,
        email: c.collaborator_email,
        status: c.status,
        chip_payer: c.chip_payer,
        chip_consumed: c.chip_consumed,
        created_at: c.created_at,
        collaborator_name: c.collaborator_id ? nameMap.get(c.collaborator_id) : undefined,
      }));

      setCollaborators(collaboratorList);
    } catch (error) {
      console.error('載入協作者錯誤:', error);
    }
  }, [gameId, user?.uid]);

  // 根據 gameId 生成固定的6位協作碼
  const generateFixedCode = (id: string): string => {
    // 使用 gameId 的字符生成固定的6位數字
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      const char = id.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    // 確保是正數並取6位
    const code = Math.abs(hash % 900000) + 100000;
    return code.toString();
  };

  // 保存協作碼到數據庫（直接傳入 code）- 不扣費，等對方接受時再扣
  const ensureCollaborationCodeSaved = async (code: string) => {
    if (!code || !user?.uid || !gameId) return;
    
    try {
      // 檢查是否已存在
      const { data: existing } = await supabase
        .from('game_collaborations')
        .select('id')
        .eq('game_id', gameId)
        .eq('invite_code', code)
        .maybeSingle();
      
      if (existing) {
        console.log('協作碼已存在於數據庫');
        return;
      }
      
      // 創建新記錄（不立即扣費）
      console.log('自動保存協作碼:', code);
      const { error } = await supabase
        .from('game_collaborations')
        .insert({
          game_id: gameId,
          owner_id: user.uid,
          collaborator_id: null,
          collaborator_email: null,
          status: 'pending',
          chip_payer: chipPayer, // 使用當前選擇的付費方
          chip_consumed: false, // 不立即扣費
          invite_code: code,
        });
      
      if (error) {
        console.error('自動保存協作碼失敗:', error);
      } else {
        console.log('協作碼自動保存成功');
      }
    } catch (err) {
      console.error('ensureCollaborationCodeSaved 錯誤:', err);
    }
  };

  // 生成邀請連結和協作碼
  const generateInviteLink = useCallback(async () => {
    const baseUrl = Platform.OS === 'web' && typeof window !== 'undefined'
      ? window.location.origin
      : 'https://lunchips.com';
    const link = `${baseUrl}/invite?game=${gameId}`;
    setInviteLink(link);
    
    // 每個牌局使用固定的協作碼
    const fixedCode = generateFixedCode(gameId);
    setCollaborationCode(fixedCode);
    
    // 自動保存協作碼到數據庫
    await ensureCollaborationCodeSaved(fixedCode);
  }, [gameId, user?.uid]);

  // 保存協作碼到數據庫
  const saveCollaborationCode = useCallback(async (): Promise<boolean> => {
    console.log('saveCollaborationCode 開始:', { collaborationCode, userId: user?.uid, gameId, chipPayer });
    
    if (!collaborationCode || !user?.uid || !gameId) {
      console.log('saveCollaborationCode 缺少必要參數');
      return false;
    }
    
    try {
      // 檢查此牌局是否已有協作碼邀請（無論狀態）
      const { data: existing, error: checkError } = await supabase
        .from('game_collaborations')
        .select('id, status')
        .eq('game_id', gameId)
        .eq('invite_code', collaborationCode)
        .maybeSingle();
      
      console.log('檢查現有協作碼:', { existing, checkError });
      
      if (existing) {
        console.log('此牌局協作碼已存在');
        return true; // 已存在，視為成功
      }
      
      // 創建協作碼邀請記錄（不綁定 email）
      const insertData = {
        game_id: gameId,
        owner_id: user.uid,
        collaborator_id: null,
        collaborator_email: null,
        status: 'pending',
        chip_payer: chipPayer,
        chip_consumed: chipPayer === 'owner',
        invite_code: collaborationCode,
      };
      
      console.log('插入協作碼記錄:', insertData);
      
      const { data: insertedData, error } = await supabase
        .from('game_collaborations')
        .insert(insertData)
        .select();
      
      console.log('插入結果:', { insertedData, error });
      
      if (error) {
        console.error('保存協作碼失敗:', error);
        Alert.alert('保存失敗', '協作碼保存失敗：' + error.message);
        return false;
      }
      
      console.log('協作碼保存成功！');
      
      // 不在這裡扣費，改為對方接受時扣費
      
      return true;
    } catch (err) {
      console.error('saveCollaborationCode 錯誤:', err);
      return false;
    }
  }, [collaborationCode, user?.uid, gameId, chipPayer, chips, loadChipsBalance]);

  useEffect(() => {
    if (visible) {
      loadCollaborators();
      generateInviteLink();
    }
  }, [visible, loadCollaborators, generateInviteLink]);

  // 發送邀請
  const handleSendInvite = async () => {
    if (!email.trim()) {
      Alert.alert('錯誤', '請輸入 Email 地址');
      return;
    }

    // 驗證 email 格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('錯誤', '請輸入有效的 Email 地址');
      return;
    }

    // 檢查是否邀請自己
    if (email.trim().toLowerCase() === user?.email?.toLowerCase()) {
      Alert.alert('錯誤', '不能邀請自己');
      return;
    }

    // 檢查是否已經邀請過
    const existingInvite = collaborators.find(
      c => c.email.toLowerCase() === email.trim().toLowerCase() && 
      (c.status === 'pending' || c.status === 'accepted')
    );
    if (existingInvite) {
      Alert.alert('錯誤', '已經邀請過這個用戶');
      return;
    }

    // 如果由擁有者付費，檢查 chips 餘額
    if (chipPayer === 'owner' && chips < 1) {
      Alert.alert(
        'Chips 不足', 
        '你的 Chips 餘額不足，請先購買 Chips 或選擇由對方支付。',
        [
          { text: '取消', style: 'cancel' },
          { text: '購買 Chips', onPress: () => openPurchaseModal() },
        ]
      );
      return;
    }

    setLoading(true);
    try {
      // 生成6位數字邀請碼
      const inviteCode = Math.floor(100000 + Math.random() * 900000).toString();

      // 查找被邀請者的 user_id（如果已註冊）
      const { data: inviteeProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      // 創建邀請記錄（不立即扣費，等對方接受時再扣）
      const { error: insertError } = await supabase
        .from('game_collaborations')
        .insert({
          game_id: gameId,
          owner_id: user?.uid,
          collaborator_id: inviteeProfile?.id || null,
          collaborator_email: email.trim().toLowerCase(),
          status: 'pending',
          chip_payer: chipPayer,
          chip_consumed: false, // 不立即扣費
          invite_code: inviteCode,
        });

      if (insertError) {
        console.error('創建邀請失敗:', insertError);
        Alert.alert('錯誤', '發送邀請失敗，請稍後重試');
        return;
      }

      // 不在邀請時扣費，改為對方接受時扣費
      // 移除立即扣費的邏輯
      if (false) {
        const { error: chipError } = await supabase
          .from('profiles')
          .update({ chips: chips - 1 })
          .eq('id', user?.uid);

        if (chipError) {
          console.error('扣除 Chip 失敗:', chipError);
          // 回滾邀請
          await supabase
            .from('game_collaborations')
            .delete()
            .eq('invite_code', inviteCode);
          Alert.alert('錯誤', '扣除 Chip 失敗，請稍後重試');
          return;
        }

        // 更新邀請狀態為已消耗 chip
        await supabase
          .from('game_collaborations')
          .update({ chip_consumed: true })
          .eq('invite_code', inviteCode);

        // 刷新 chips 餘額
        await loadChipsBalance();
      }

      Alert.alert('成功', `已發送邀請至 ${email}`);
      setEmail('');
      loadCollaborators();
    } catch (error) {
      console.error('發送邀請錯誤:', error);
      Alert.alert('錯誤', '發送邀請失敗，請稍後重試');
    } finally {
      setLoading(false);
    }
  };

  // 取消邀請
  const handleCancelInvite = async (collaboratorId: string) => {
    if (Platform.OS === 'web') {
      if (!window.confirm('確定要取消這個邀請嗎？')) return;
    } else {
      Alert.alert('確認', '確定要取消這個邀請嗎？', [
        { text: '取消', style: 'cancel' },
        { text: '確定', onPress: () => doCancelInvite(collaboratorId) },
      ]);
      return;
    }
    await doCancelInvite(collaboratorId);
  };

  const doCancelInvite = async (collaboratorId: string) => {
    try {
      const { error } = await supabase
        .from('game_collaborations')
        .delete()
        .eq('id', collaboratorId);

      if (error) {
        console.error('取消邀請失敗:', error);
        Alert.alert('錯誤', '取消邀請失敗');
        return;
      }

      loadCollaborators();
    } catch (error) {
      console.error('取消邀請錯誤:', error);
    }
  };

  // 複製邀請連結
  const handleCopyLink = async () => {
    try {
      await Clipboard.setStringAsync(inviteLink);
      Alert.alert('已複製', '邀請連結已複製到剪貼簿');
    } catch (error) {
      console.error('複製失敗:', error);
      Alert.alert('錯誤', '複製失敗');
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '待接受';
      case 'accepted':
        return '已接受';
      case 'rejected':
        return '已拒絕';
      case 'expired':
        return '已過期';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return theme.colors.warning;
      case 'accepted':
        return theme.colors.success;
      case 'rejected':
      case 'expired':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
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
      width: isMobile ? '100%' : 500,
      maxWidth: isMobile ? 420 : 500,
      maxHeight: isMobile ? '90%' : '85%',
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
    section: {
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    inputRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      color: theme.colors.text,
      backgroundColor: colorMode === 'light' ? '#F8F9FA' : '#1E2023',
      fontSize: theme.fontSize.md,
    },
    payerSection: {
      marginBottom: theme.spacing.md,
    },
    payerLabel: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    payerOptions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    payerOption: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      opacity: 0.5,
    },
    payerOptionActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '20',
      opacity: 1,
    },
    payerOptionText: {
      fontSize: theme.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.text,
    },
    payerOptionTextInactive: {
      fontWeight: '500',
      color: theme.colors.textSecondary,
    },
    toggleContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      padding: 2,
      marginBottom: theme.spacing.md,
    },
    toggleButton: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.sm,
      alignItems: 'center',
    },
    toggleButtonActive: {
      backgroundColor: theme.colors.primary,
    },
    toggleText: {
      fontSize: theme.fontSize.sm,
      fontWeight: '600',
      color: colorMode === 'light' ? theme.colors.textSecondary : '#FFFFFF',
    },
    toggleTextInactive: {
      color: colorMode === 'light' ? '#FFFFFF' : theme.colors.textSecondary,
    },
    linkContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    linkText: {
      flex: 1,
      padding: theme.spacing.sm,
      backgroundColor: colorMode === 'light' ? '#F8F9FA' : '#1E2023',
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      color: theme.colors.textSecondary,
      fontSize: theme.fontSize.sm,
    },
    copyButton: {
      padding: theme.spacing.sm,
    },
    codeContainer: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
    },
    codeLabel: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
    },
    codeDisplay: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colorMode === 'light' ? '#F8F9FA' : '#1E2023',
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xl,
      marginBottom: theme.spacing.sm,
    },
    codeText: {
      fontSize: 32,
      fontWeight: '700',
      color: theme.colors.text,
      letterSpacing: 8,
    },
    codeHint: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    collaboratorsList: {
      maxHeight: 200,
    },
    collaboratorItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.md,
      backgroundColor: colorMode === 'light' ? '#F8F9FA' : '#1E2023',
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.sm,
    },
    collaboratorInfo: {
      flex: 1,
    },
    collaboratorEmail: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
    },
    collaboratorMeta: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    collaboratorStatus: {
      fontSize: theme.fontSize.sm,
      fontWeight: '600',
    },
    cancelButton: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    cancelButtonText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.error,
    },
    emptyText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      paddingVertical: theme.spacing.lg,
    },
    chipsInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.xs,
    },
    chipsIcon: {
      width: 16,
      height: 16,
    },
    chipsText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
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
              <Text style={styles.title}>邀請協作</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={{ fontSize: theme.fontSize.xl, color: theme.colors.textSecondary, fontWeight: '300' }}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* 遊戲名稱 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>牌局：{gameName}</Text>
            </View>

            {/* 邀請方式切換 */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, !showCodeLink && styles.toggleButtonActive]}
                onPress={() => setShowCodeLink(false)}
              >
                <Text style={[styles.toggleText, showCodeLink && styles.toggleTextInactive]}>
                  Email 邀請
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, showCodeLink && styles.toggleButtonActive]}
                onPress={() => setShowCodeLink(true)}
              >
                <Text style={[styles.toggleText, !showCodeLink && styles.toggleTextInactive]}>
                  協作碼/連結
                </Text>
              </TouchableOpacity>
            </View>

            {/* Email 邀請 */}
            {!showCodeLink && (
              <View style={styles.section}>
                {/* 付費方選擇 */}
                <View style={styles.payerSection}>
                  <Text style={styles.payerLabel}>Chip 扣費方：</Text>
                  <View style={styles.payerOptions}>
                    <TouchableOpacity
                      style={[styles.payerOption, chipPayer === 'owner' && styles.payerOptionActive]}
                      onPress={() => setChipPayer('owner')}
                    >
                      <Text style={[styles.payerOptionText, chipPayer !== 'owner' && styles.payerOptionTextInactive]}>
                        我付費
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.payerOption, chipPayer === 'collaborator' && styles.payerOptionActive]}
                      onPress={() => setChipPayer('collaborator')}
                    >
                      <Text style={[styles.payerOptionText, chipPayer !== 'collaborator' && styles.payerOptionTextInactive]}>
                        對方付費
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {chipPayer === 'owner' && (
                    <View style={styles.chipsInfo}>
                      {Platform.OS === 'web' && (
                        <Image
                          source={{ uri: '/icons/chips3.PNG' }}
                          style={styles.chipsIcon}
                        />
                      )}
                      <Text style={styles.chipsText}>
                        目前餘額：{chips} Chips（加入後將消耗 1 Chip）
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    placeholder="輸入對方 Email"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Button
                    title={loading ? '發送中...' : '邀請'}
                    onPress={handleSendInvite}
                    size="sm"
                    disabled={loading}
                  />
                </View>
              </View>
            )}

            {/* 協作碼/連結 */}
            {showCodeLink && (
              <View style={styles.section}>
                {/* 付費方選擇 */}
                <View style={styles.payerSection}>
                  <Text style={styles.payerLabel}>Chip 扣費方：</Text>
                  <View style={styles.payerOptions}>
                    <TouchableOpacity
                      style={[styles.payerOption, chipPayer === 'owner' && styles.payerOptionActive]}
                      onPress={() => setChipPayer('owner')}
                    >
                      <Text style={[styles.payerOptionText, chipPayer !== 'owner' && styles.payerOptionTextInactive]}>
                        我付費
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.payerOption, chipPayer === 'collaborator' && styles.payerOptionActive]}
                      onPress={() => setChipPayer('collaborator')}
                    >
                      <Text style={[styles.payerOptionText, chipPayer !== 'collaborator' && styles.payerOptionTextInactive]}>
                        對方付費
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 6位協作碼 */}
                <View style={styles.codeContainer}>
                  <View style={styles.codeDisplay}>
                    <Text style={styles.codeText} selectable>{collaborationCode}</Text>
                    <TouchableOpacity 
                      onPress={async () => {
                        const codeToCopy = collaborationCode;
                        console.log('複製協作碼:', codeToCopy);
                        
                        // 複製到剪貼簿
                        try {
                          if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
                            await navigator.clipboard.writeText(codeToCopy);
                            console.log('Web 複製成功');
                          } else {
                            await Clipboard.setStringAsync(codeToCopy);
                            console.log('Native 複製成功');
                          }
                          Alert.alert('已複製', `協作碼 ${codeToCopy} 已複製到剪貼簿`);
                        } catch (err) {
                          console.error('複製失敗:', err);
                          Alert.alert('複製失敗', `請手動複製協作碼：${codeToCopy}`);
                        }
                      }} 
                      style={styles.copyButton}
                    >
                      <Icon name="copy" size={20} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.codeHint}>將協作碼分享給對方，對方可在「加入牌局」中輸入</Text>
                </View>

                {/* 連結 */}
                <View style={{ marginTop: theme.spacing.md }}>
                  <Text style={styles.codeLabel}>或分享連結</Text>
                  <View style={styles.linkContainer}>
                    <Text style={styles.linkText} numberOfLines={1}>{inviteLink}</Text>
                    <TouchableOpacity onPress={handleCopyLink} style={styles.copyButton}>
                      <Icon name="copy" size={20} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* 協作者列表 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>已邀請協作者</Text>
              <ScrollView style={styles.collaboratorsList} nestedScrollEnabled>
                {collaborators.length === 0 ? (
                  <Text style={styles.emptyText}>尚未邀請任何協作者</Text>
                ) : (
                  collaborators.map((collaborator) => (
                    <View key={collaborator.id} style={styles.collaboratorItem}>
                      <View style={styles.collaboratorInfo}>
                        <Text style={styles.collaboratorEmail}>
                          {collaborator.collaborator_name || collaborator.email || '協作碼邀請'}
                        </Text>
                        <Text style={styles.collaboratorMeta}>
                          扣費方：{collaborator.chip_payer === 'owner' ? '你' : collaborator.collaborator_name || collaborator.email || '對方'}
                          {collaborator.chip_consumed ? ' · 已扣費' : ' · 待扣費'}
                        </Text>
                      </View>
                      <Text style={[styles.collaboratorStatus, { color: getStatusColor(collaborator.status) }]}>
                        {getStatusText(collaborator.status)}
                      </Text>
                      {collaborator.status === 'pending' && (
                        <TouchableOpacity
                          style={styles.cancelButton}
                          onPress={() => handleCancelInvite(collaborator.id)}
                        >
                          <Text style={styles.cancelButtonText}>取消</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default CollaborationInviteModal;

