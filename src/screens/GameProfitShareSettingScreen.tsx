import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import Modal from '../components/Modal';
import { Host } from '../types/game';

interface GameProfitShareSettingModalProps {
  visible: boolean;
  onClose: () => void;
}

const GameProfitShareSettingModal: React.FC<GameProfitShareSettingModalProps> = ({
  visible,
  onClose,
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { state, updateGame } = useGame();

  const currentGame = state.currentGame;

  const rawHosts = (currentGame?.hosts || []) as (Host | string)[];

  const initialHosts: { name: string; shareRatio: number }[] = useMemo(() => {
    if (!rawHosts.length) return [];
    const equalShare = 1 / rawHosts.length;
    return rawHosts.map((h) => {
      if (typeof h === 'string') {
        return { name: h, shareRatio: equalShare };
      }
      return { name: h.name, shareRatio: h.shareRatio ?? equalShare };
    });
    // 依賴整個 hosts 陣列，確保更新後重新計算
  }, [rawHosts]);

  const [hostShares, setHostShares] = useState(initialHosts);
  const [hostInputs, setHostInputs] = useState<string[]>(
    initialHosts.map((h) => (h.shareRatio * 100).toFixed(1))
  );

  useEffect(() => {
    if (visible) {
      setHostShares(initialHosts);
      setHostInputs(initialHosts.map((h) => (h.shareRatio * 100).toFixed(1)));
    }
  }, [visible, initialHosts]);

  if (!currentGame) {
    return null;
  }

  const styles = StyleSheet.create({
    saveButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.success,
      opacity: 1,
    },
    saveButtonDisabled: {
      backgroundColor: theme.colors.border,
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: theme.fontSize.sm,
    },
    content: {
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.lg,
    },
    hostRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border + '40',
    },
    hostName: {
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      flex: 1,
    },
    ratioInput: {
      width: 80,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      textAlign: 'right',
      color: theme.colors.text,
    },
    ratioSuffix: {
      marginLeft: 4,
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    totalRow: {
      marginTop: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    totalLabel: {
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
    },
    totalValue: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
    },
    hintText: {
      marginTop: theme.spacing.sm,
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
    },
  });

  const totalPercent = hostShares.reduce(
    (sum, h) => sum + (isNaN(h.shareRatio) ? 0 : h.shareRatio * 100),
    0
  );
  const roundedTotal = Math.round(totalPercent);
  const isValidTotal = roundedTotal === 100 && hostShares.length > 0;

  const handleChangeShare = (index: number, text: string) => {
    // 允許整數與一個小數點（例如 33、33.3、40.5），其他字元自動過濾
    let numericText = text.replace(/[^0-9.]/g, '');
    const firstDot = numericText.indexOf('.');
    if (firstDot !== -1) {
      // 只保留第一個小數點，其餘移除
      numericText =
        numericText.slice(0, firstDot + 1) +
        numericText
          .slice(firstDot + 1)
          .replace(/\./g, '');
    }

    setHostInputs((prev) =>
      prev.map((v, i) => (i === index ? numericText : v))
    );

    const value = parseFloat(numericText);
    const percent = isNaN(value) ? 0 : value;
    const ratio = percent / 100;
    setHostShares((prev) =>
      prev.map((h, i) => (i === index ? { ...h, shareRatio: ratio } : h))
    );
  };

  const handleSave = () => {
    if (!currentGame || !isValidTotal) return;

    const updatedHosts: (Host | string)[] = rawHosts.map((h) => {
      const name = typeof h === 'string' ? h : h.name;
      const found = hostShares.find((hs) => hs.name === name);
      const shareRatio = found ? found.shareRatio : 0;

      if (typeof h === 'string') {
        return {
          name,
          cost: 0,
          dealerSalary: 0,
          totalCashOut: 0,
          shareRatio,
          transferAmount: 0,
        } as Host;
      }

      return { ...h, shareRatio };
    });

    updateGame({
      ...currentGame,
      hosts: updatedHosts,
    });

    onClose();
  };

  return (
    <Modal visible={visible} onClose={onClose} title="牌局分成設定">
      <ScrollView style={styles.content}>
        {hostShares.map((h, index) => (
          <View key={h.name} style={styles.hostRow}>
            <Text style={styles.hostName}>{h.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                style={styles.ratioInput}
                keyboardType="numeric"
                value={hostInputs[index] ?? ''}
                onChangeText={(text) => handleChangeShare(index, text)}
              />
              <Text style={styles.ratioSuffix}>%</Text>
            </View>
          </View>
        ))}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>比例總和：</Text>
          <Text
            style={[
              styles.totalValue,
              { color: isValidTotal ? theme.colors.success : theme.colors.error },
            ]}
          >
            {roundedTotal}%
          </Text>
        </View>
        <Text style={styles.hintText}>比例總和必須為 100% 才能儲存。</Text>

        <View style={{ marginTop: theme.spacing.lg, alignItems: 'flex-end' }}>
          <Text
            style={[
              styles.saveButtonText,
              { color: isValidTotal ? theme.colors.success : theme.colors.textSecondary },
            ]}
            onPress={isValidTotal ? handleSave : undefined}
          >
            儲存
          </Text>
        </View>
      </ScrollView>
    </Modal>
  );
};

export default GameProfitShareSettingModal;


