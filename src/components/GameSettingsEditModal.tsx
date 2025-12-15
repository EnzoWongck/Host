import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import Modal from './Modal';
import Button from './Button';
import { Host } from '../types/game';

interface GameSettingsEditModalProps {
  visible: boolean;
  onClose: () => void;
  editType: 'gameName' | 'blinds' | 'hostName' | null;
  hostIndex?: number;
}

const GameSettingsEditModal: React.FC<GameSettingsEditModalProps> = ({
  visible,
  onClose,
  editType,
  hostIndex,
}) => {
  const { theme, colorMode } = useTheme();
  const { t } = useLanguage();
  const { state, updateGame } = useGame();
  const { showToast } = useToast();
  const currentGame = state.currentGame;

  const [gameName, setGameName] = useState('');
  const [smallBlind, setSmallBlind] = useState('');
  const [bigBlind, setBigBlind] = useState('');
  const [hostName, setHostName] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  useEffect(() => {
    if (visible && currentGame) {
      if (editType === 'gameName') {
        setGameName(currentGame.name);
      } else if (editType === 'blinds') {
        setSmallBlind(currentGame.smallBlind.toString());
        setBigBlind(currentGame.bigBlind.toString());
      } else if (editType === 'hostName' && hostIndex !== undefined) {
        const hosts = currentGame.hosts || [];
        const host = hosts[hostIndex];
        if (host) {
          setHostName(typeof host === 'string' ? host : host.name);
        }
      }
    }
  }, [visible, currentGame, currentGame?.hosts, editType, hostIndex]); // 添加 currentGame?.hosts 依賴，確保 host 更新時觸發

  const handleSave = () => {
    if (!currentGame) return;

    if (editType === 'gameName') {
      if (!gameName.trim()) {
        Alert.alert('錯誤', '請輸入牌局名稱');
        return;
      }
      updateGame({ ...currentGame, name: gameName.trim() });
      showToast('牌局名稱已更新', 'success');
    } else if (editType === 'blinds') {
      const small = parseInt(smallBlind);
      const big = parseInt(bigBlind);
      if (isNaN(small) || isNaN(big) || small < 5 || big < 5) {
        Alert.alert('錯誤', '小盲和大盲必須至少為 5');
        return;
      }
      updateGame({ ...currentGame, smallBlind: small, bigBlind: big });
      showToast('盲注已更新', 'success');
    } else if (editType === 'hostName' && hostIndex !== undefined) {
      if (!hostName.trim()) {
        Alert.alert('錯誤', '請輸入 Host 名稱');
        return;
      }
      const hosts = currentGame.hosts || [];
      const updatedHosts: Host[] = hosts.map((h, idx) => {
        if (idx === hostIndex) {
          if (typeof h === 'string') {
            return {
              name: hostName.trim(),
              cost: 0,
              dealerSalary: 0,
              totalCashOut: 0,
              shareRatio: 1 / hosts.length,
              transferAmount: 0,
            };
          }
          return { ...h, name: hostName.trim() };
        }
        return typeof h === 'string' ? {
          name: h,
          cost: 0,
          dealerSalary: 0,
          totalCashOut: 0,
          shareRatio: 1 / hosts.length,
          transferAmount: 0,
        } : h;
      });
      updateGame({ ...currentGame, hosts: updatedHosts });
      showToast('Host 名稱已更新', 'success');
    }

    onClose();
  };

  const styles = StyleSheet.create({
    inputGroup: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    input: {
      borderWidth: 1,
      borderColor: colorMode === 'light' ? '#E5E7EB' : theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      backgroundColor: colorMode === 'light' ? '#F8F9FA' : theme.colors.surface,
    },
    inputFocused: {
      borderColor: colorMode === 'light' ? '#E5E7EB' : theme.colors.primary,
      borderWidth: 1,
    },
    blindsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
    },
    blindInput: {
      flex: 1,
    },
  });

  const getTitle = () => {
    if (editType === 'gameName') return '編輯牌局名稱';
    if (editType === 'blinds') return '編輯盲注';
    if (editType === 'hostName') return '編輯 Host 名稱';
    return '編輯';
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={getTitle()}
    >
      {editType === 'gameName' && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>牌局名稱</Text>
          <TextInput
            style={[styles.input, focusedInput === 'gameName' && styles.inputFocused]}
            value={gameName}
            onChangeText={setGameName}
            placeholder="輸入牌局名稱"
            placeholderTextColor={focusedInput === 'gameName' ? 'transparent' : theme.colors.textSecondary}
            onFocus={() => setFocusedInput('gameName')}
            onBlur={() => setFocusedInput(null)}
          />
        </View>
      )}

      {editType === 'blinds' && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>小盲 / 大盲</Text>
          <View style={styles.blindsRow}>
            <TextInput
              style={[styles.input, styles.blindInput, focusedInput === 'smallBlind' && styles.inputFocused]}
              value={smallBlind}
              onChangeText={(value) => {
                const numericValue = value.replace(/[^0-9]/g, '');
                setSmallBlind(numericValue);
              }}
              placeholder="小盲"
              placeholderTextColor={focusedInput === 'smallBlind' ? 'transparent' : theme.colors.textSecondary}
              keyboardType="numeric"
              onFocus={() => setFocusedInput('smallBlind')}
              onBlur={() => setFocusedInput(null)}
            />
            <TextInput
              style={[styles.input, styles.blindInput, focusedInput === 'bigBlind' && styles.inputFocused]}
              value={bigBlind}
              onChangeText={(value) => {
                const numericValue = value.replace(/[^0-9]/g, '');
                setBigBlind(numericValue);
              }}
              placeholder="大盲"
              placeholderTextColor={focusedInput === 'bigBlind' ? 'transparent' : theme.colors.textSecondary}
              keyboardType="numeric"
              onFocus={() => setFocusedInput('bigBlind')}
              onBlur={() => setFocusedInput(null)}
            />
          </View>
        </View>
      )}

      {editType === 'hostName' && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Host 名稱</Text>
          <TextInput
            style={[styles.input, focusedInput === 'hostName' && styles.inputFocused]}
            value={hostName}
            onChangeText={setHostName}
            placeholder="輸入 Host 名稱"
            placeholderTextColor={focusedInput === 'hostName' ? 'transparent' : theme.colors.textSecondary}
            onFocus={() => setFocusedInput('hostName')}
            onBlur={() => setFocusedInput(null)}
          />
        </View>
      )}

      <Button
        title="儲存"
        onPress={handleSave}
        size="lg"
        variant="primary"
      />
    </Modal>
  );
};

export default GameSettingsEditModal;


