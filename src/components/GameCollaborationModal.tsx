import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { useTheme } from '../context/ThemeContext';
// 移除實際協作邏輯匯入，僅保留視覺樣式
import Modal from './Modal';
import Button from './Button';
import Icon from './Icon';

interface GameCollaborationModalProps {
  visible: boolean;
  onClose: () => void;
  gameId: string;
}

const GameCollaborationModal: React.FC<GameCollaborationModalProps> = ({
  visible,
  onClose,
  gameId
}) => {
  const themeContext = useTheme();
  const collabState = { isConnected: false, activeUsers: [], editors: [] as string[] };
  const generateInviteLink = (id: string) => `https://host.example/invite/${id || 'default'}`;
  const [inviteCode, setInviteCode] = useState('');
  const [email, setEmail] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  
  if (!themeContext || !themeContext.theme || !themeContext.theme.colors) {
    console.log('Theme not available:', themeContext);
    return null;
  }
  
  const { theme } = themeContext;

  const styles = createStyles(theme);

  const startCollaboration = () => {
    Alert.alert('協作已開始', '此為展示模式，無連線功能');
  };

  const stopCollaboration = () => {
    Alert.alert('停止協作', '協作功能已關閉');
  };

  const handleAddEditor = () => {
    if (!email) return;
    setEmail('');
    Alert.alert('已新增協作者', '此為展示模式');
  };

  useEffect(() => {
    if (visible && !inviteCode) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      setInviteCode(code);
    }
  }, [visible]);

  return (
    <Modal visible={visible} onClose={onClose} title="牌局協作" leftIconName="connect2">
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface }] }>
        <ScrollView contentContainerStyle={{ paddingBottom: theme.spacing.lg, paddingHorizontal: 0 }} showsVerticalScrollIndicator={false}>
        <View style={{
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.borderRadius.sm,
          backgroundColor: theme.colors.background,
          borderWidth: 1,
          borderColor: theme.colors.border,
          marginBottom: theme.spacing.md,
        }}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.sm }}>
            目前為展示模式（未連線）。
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>協作狀態</Text>
          <View style={styles.row}>
            <Icon name="player" size={18} style={{ tintColor: theme.colors.success, marginRight: 8 }} />
            <Text style={[styles.statusText, { color: theme.colors.textSecondary }]}>
              {collabState.isConnected ? `已連接 (${collabState.activeUsers.length + 1}人)` : '未連接 - 僅本地編輯'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>邀請協作者</Text>
          
          {/* 切換按鈕 */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, !showQRCode && styles.toggleButtonActive]}
              onPress={() => setShowQRCode(false)}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleText, !showQRCode && styles.toggleTextActive]}>連結</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, showQRCode && styles.toggleButtonActive]}
              onPress={() => setShowQRCode(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleText, showQRCode && styles.toggleTextActive]}>QR Code</Text>
            </TouchableOpacity>
          </View>

          {/* 連結視圖 */}
          {!showQRCode && (
            <View style={styles.linkContainer}>
              <Text style={[styles.inviteLink, { color: theme.colors.textSecondary }]}>{generateInviteLink(gameId)}</Text>
              <TouchableOpacity
                onPress={async () => {
                  try {
                    const link = generateInviteLink(gameId);
                    console.log('嘗試複製連結:', link);
                    await Clipboard.setStringAsync(link);
                    console.log('複製成功');
                    Alert.alert('已複製', '邀請連結已複製到剪貼簿');
                  } catch (e) {
                    console.error('複製失敗:', e);
                    Alert.alert('複製失敗', `錯誤: ${e.message || '請稍後再試'}`);
                  }
                }}
                style={styles.copyButton}
                activeOpacity={0.7}
              >
                <View style={styles.copyIconContainer}>
                  <Icon name="copy" size={24} />
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* QR Code 視圖 */}
          {showQRCode && (
            <View style={styles.qrContainer}>
              <View style={styles.qrCodeWrapper}>
                <QRCode
                  value={generateInviteLink(gameId)}
                  size={200}
                  color={theme.colors.text}
                  backgroundColor={theme.colors.background}
                />
              </View>
              <Text style={[styles.qrDescription, { color: theme.colors.textSecondary }]}>
                掃描 QR Code 加入協作
              </Text>
            </View>
          )}
          
          <View style={styles.emailSection}>
            <Text style={[styles.label, { color: theme.colors.text }]}>新增協作 Email</Text>
            <TextInput
              placeholder="name@example.com"
              placeholderTextColor={theme.colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              style={[styles.input, { 
                borderColor: theme.colors.border, 
                backgroundColor: theme.colors.surface, 
                color: theme.colors.text 
              }]}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Button 
              title="新增協作者" 
              onPress={handleAddEditor} 
              size="sm" 
              style={styles.addButton} 
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>協作控制</Text>
          <View style={styles.controlButtons}>
            <Button 
              title="開始協作" 
              onPress={startCollaboration} 
              size="md" 
              style={[styles.controlButton, { marginRight: theme.spacing.sm }]} 
            />
            <Button 
              title="停止協作" 
              onPress={stopCollaboration} 
              size="md" 
              variant="danger" 
              style={styles.controlButton} 
            />
          </View>
        </View>

        {collabState.editors.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>協作者清單</Text>
            {collabState.editors.map((editor, index) => (
              <View key={index} style={styles.editorItem}>
                <Icon name="user" size={16} style={{ tintColor: theme.colors.primary, marginRight: 8 }} />
                <Text style={[styles.editorText, { color: theme.colors.text }]}>{editor}</Text>
              </View>
            ))}
          </View>
        )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 0,
  },
  section: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    shadowColor: 'transparent',
    elevation: 0,
    width: '100%',
    alignSelf: 'stretch',
    minHeight: 56,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: theme.fontSize.sm,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    width: '100%',
  },
  inviteLink: {
    fontSize: theme.fontSize.sm,
    flex: 1,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
  },
         copyButton: {
           padding: theme.spacing.sm,
           justifyContent: 'center',
           alignItems: 'center',
           backgroundColor: 'transparent',
           borderWidth: 0,
           marginLeft: -4,
         },
         copyIconContainer: {
           width: 24,
           height: 24,
           justifyContent: 'center',
           alignItems: 'center',
         },
  emailSection: {
    marginTop: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  addButton: {
    alignSelf: 'flex-start',
  },
  controlButtons: {
    flexDirection: 'row',
  },
  controlButton: {
    flex: 1,
  },
  editorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  editorText: {
    fontSize: theme.fontSize.sm,
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
    color: theme.colors.textSecondary,
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  qrCodeWrapper: {
    padding: theme.spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    shadowColor: 'transparent',
    elevation: 0,
  },
  qrDescription: {
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
  },
});

export default GameCollaborationModal;
