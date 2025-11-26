import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import Modal from './Modal';
import Button from './Button';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Player } from '../types/game';

interface PlayerEntryFeeEditModalProps {
  visible: boolean;
  onClose: () => void;
  player: Player | null;
  onSave: (playerId: string, customEntryFee: number | undefined) => void;
  calculatedFee: number; // 計算出的入場費
}

const PlayerEntryFeeEditModal: React.FC<PlayerEntryFeeEditModalProps> = ({
  visible,
  onClose,
  player,
  onSave,
  calculatedFee,
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [customFee, setCustomFee] = useState('');

  useEffect(() => {
    if (visible && player) {
      // 如果有自訂入場費，顯示自訂值；否則顯示計算值
      if (player.customEntryFee !== undefined) {
        setCustomFee(String(player.customEntryFee));
      } else {
        setCustomFee('');
      }
    }
  }, [visible, player]);

  const handleSave = () => {
    if (!player) return;

    // 如果輸入為空，清除自訂入場費（使用計算值）
    if (customFee.trim() === '') {
      onSave(player.id, undefined);
      onClose();
      return;
    }

    const fee = parseFloat(customFee);
    if (isNaN(fee) || fee < 0) {
      Alert.alert(
        t('common.error') || '錯誤',
        t('entryFee.errorEntryFeeRequired') || '請輸入有效的入場費金額'
      );
      return;
    }

    onSave(player.id, fee);
    onClose();
  };

  const handleReset = () => {
    setCustomFee('');
    if (player) {
      onSave(player.id, undefined);
    }
    onClose();
  };

  const styles = StyleSheet.create({
    container: {
      padding: theme.spacing.md,
    },
    label: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.md,
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
      marginBottom: theme.spacing.md,
    },
    calculatedFee: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    resetButton: {
      flex: 1,
      backgroundColor: theme.colors.border,
    },
  });

  if (!player) return null;

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={t('entryFee.editPlayerFee') || '編輯玩家入場費'}
    >
      <View style={styles.container}>
        <Text style={styles.label}>{t('entryFee.playerName') || '玩家名稱'}</Text>
        <Text style={{ fontSize: theme.fontSize.md, color: theme.colors.text, marginBottom: theme.spacing.md }}>
          {player.name}
        </Text>

        <Text style={styles.label}>
          {t('entryFee.customEntryFee') || '自訂入場費'}
        </Text>
        <Text style={styles.calculatedFee}>
          {t('entryFee.calculatedFee') || '計算值'}：${calculatedFee.toLocaleString()}
        </Text>
        <TextInput
          style={styles.input}
          placeholder={t('entryFee.enterCustomFee') || '輸入自訂入場費（留空則使用計算值）'}
          value={customFee}
          onChangeText={setCustomFee}
          keyboardType="numeric"
          placeholderTextColor={theme.colors.textSecondary}
        />

        <View style={styles.buttonContainer}>
          <Button
            title={t('common.cancel') || '取消'}
            onPress={handleReset}
            size="lg"
            style={styles.resetButton}
          />
          <Button
            title={t('common.save') || '儲存'}
            onPress={handleSave}
            size="lg"
          />
        </View>
      </View>
    </Modal>
  );
};

export default PlayerEntryFeeEditModal;

