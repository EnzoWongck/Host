import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
// 使用 TextInput 模擬時間選擇器（因為項目中沒有安裝 Picker）
import { useGame } from '../context/GameContext';
import { useTheme } from '../context/ThemeContext';
import Button from './Button';
import { Dealer } from '../types/game';

interface AddDealerFormProps {
  visible: boolean;
  onClose: () => void;
}

const AddDealerForm: React.FC<AddDealerFormProps> = ({ visible, onClose }) => {
  const { state, addDealer } = useGame();
  const { theme, colorMode } = useTheme();
  const currentGame = state.currentGame;

  // 表單狀態
  const [dealerName, setDealerName] = useState('');
  const [tipShare, setTipShare] = useState<number>(50);
  const [hourlyRate, setHourlyRate] = useState('');
  const [workHours, setWorkHours] = useState(''); // 工時為可選欄位
  const [focusedInput, setFocusedInput] = useState<string | null>(null);


  // 處理確認
  const handleConfirm = () => {
    if (!dealerName.trim() || !currentGame) return;

    const dealerData: Omit<Dealer, 'id' | 'totalTips' | 'estimatedSalary'> = {
      name: dealerName.trim(),
      tipShare: (tipShare >= 50 && tipShare <= 100 ? (tipShare === 50 || tipShare === 100 ? tipShare : 50) : 50) as 50 | 100,
      // 時薪與工時皆為可選（預設 0），允許只計算小費佔成
      hourlyRate: hourlyRate.trim() ? parseFloat(hourlyRate) || 0 : 0,
      workHours: workHours.trim() ? parseFloat(workHours) || 0 : 0,
      // 移除上下班狀態，不再使用
      status: 'working',
    };

    addDealer(currentGame.id, dealerData);
    
    // 重置表單
    setDealerName('');
    setTipShare(50);
    setHourlyRate('');
    setWorkHours('');
    
    onClose();
  };


  // 根據深色模式動態創建樣式
  const dynamicStyles = StyleSheet.create({
    modalContent: {
      width: '90%',
      maxWidth: 520,
      maxHeight: '90%',
      backgroundColor: colorMode === 'dark' ? theme.colors.background : '#FFFFFF',
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 10,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colorMode === 'dark' ? theme.colors.text : '#111111',
      marginBottom: 48,
      fontFamily: Platform.select({
        ios: '-apple-system',
        android: 'Roboto',
        web: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }),
    },
    label: {
      fontSize: 15,
      fontWeight: '500',
      color: colorMode === 'dark' ? theme.colors.text : '#111111',
      marginBottom: 12,
      fontFamily: Platform.select({
        ios: '-apple-system',
        android: 'Roboto',
        web: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }),
    },
    labelValue: {
      fontSize: 20,
      fontWeight: '700',
      color: colorMode === 'dark' ? theme.colors.text : '#111111',
      fontFamily: Platform.select({
        ios: '-apple-system',
        android: 'Roboto',
        web: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }),
    },
    input: {
      backgroundColor: colorMode === 'dark' ? theme.colors.surface : '#F4F4F5',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colorMode === 'dark' ? theme.colors.text : '#000000',
      fontFamily: Platform.select({
        ios: '-apple-system',
        android: 'Roboto',
        web: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }),
      borderWidth: 0,
      borderColor: 'transparent',
    },
    inputFocused: {
      borderWidth: 0,
      borderColor: 'transparent',
      backgroundColor: colorMode === 'dark' ? theme.colors.surface : '#F4F4F5',
    },
    inputWithSuffix: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colorMode === 'dark' ? theme.colors.surface : '#F4F4F5',
      borderRadius: 12,
      paddingLeft: 16,
      paddingRight: 16,
      borderWidth: 0,
      borderColor: 'transparent',
    },
    inputSuffix: {
      fontSize: 16,
      color: colorMode === 'dark' ? theme.colors.textSecondary : '#666666',
      marginRight: 8,
      fontFamily: Platform.select({
        ios: '-apple-system',
        android: 'Roboto',
        web: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }),
    },
    buttonCancelText: {
      fontSize: 16,
      fontWeight: '600',
      color: colorMode === 'dark' ? theme.colors.textSecondary : '#666666',
      textAlign: 'center',
      fontFamily: Platform.select({
        ios: '-apple-system',
        android: 'Roboto',
        web: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }),
    },
    sliderTrack: {
      height: 6,
      backgroundColor: colorMode === 'dark' ? theme.colors.border : '#E5E5E5',
      borderRadius: 3,
      marginBottom: 16,
      overflow: 'hidden',
    },
    sliderLabelText: {
      fontSize: 14,
      color: colorMode === 'dark' ? theme.colors.textSecondary : '#999999',
      fontFamily: Platform.select({
        ios: '-apple-system',
        android: 'Roboto',
        web: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }),
    },
    sliderValueText: {
      fontSize: 32,
      fontWeight: '700',
      color: '#0066FF',
      fontFamily: Platform.select({
        ios: '-apple-system',
        android: 'Roboto',
        web: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }),
    },
    confirmButtonDark: {
      backgroundColor: '#303134',
    },
    confirmButtonLight: {
      backgroundColor: '#E2E8F0',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      // 移除開啟時的動畫，讓點擊「新增發牌員」後立即顯示表單，避免延遲感
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={dynamicStyles.modalContent}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* 標題 */}
            <Text style={dynamicStyles.title}>新增發牌員</Text>

            {/* 名稱 */}
            <View style={styles.formGroup}>
              <TextInput
                style={[
                  dynamicStyles.input,
                  focusedInput === 'name' && dynamicStyles.inputFocused,
                ]}
                value={dealerName}
                onChangeText={setDealerName}
                placeholder="輸入名稱"
                placeholderTextColor={
                  focusedInput === 'name'
                    ? 'transparent'
                    : colorMode === 'dark'
                      ? theme.colors.textSecondary
                      : '#6B7280'
                }
                onFocus={() => setFocusedInput('name')}
                onBlur={() => setFocusedInput(null)}
                returnKeyType="next"
              />
            </View>

            {/* 小費分成 */}
            <View style={styles.formGroup}>
              <Text style={dynamicStyles.label}>小費分成</Text>
              <View style={dynamicStyles.inputWithSuffix}>
                <TextInput
                  style={[
                    dynamicStyles.input,
                    styles.inputWithSuffixInput,
                    focusedInput === 'tipShare' && dynamicStyles.inputFocused,
                  ]}
                  value={tipShare > 0 ? tipShare.toString() : ''}
                  onChangeText={(text) => {
                    const numericText = text.replace(/[^0-9]/g, '');
                    if (numericText === '') {
                      setTipShare(0); // 允許空值
                    } else {
                      const value = parseInt(numericText, 10);
                      if (!isNaN(value) && value >= 0 && value <= 100) {
                        setTipShare(value);
                      }
                    }
                  }}
                  onFocus={() => setFocusedInput('tipShare')}
                  onBlur={() => {
                    setFocusedInput(null);
                    // 如果為空或 0，恢復為預設值 50
                    if (tipShare === 0 || tipShare === undefined) {
                      setTipShare(50);
                    }
                  }}
                  keyboardType="numeric"
                  inputMode="numeric"
                  {...(Platform.OS === 'web' ? { pattern: '[0-9]*' } : {})}
                  placeholder="50"
                  placeholderTextColor={
                    focusedInput === 'tipShare'
                      ? 'transparent'
                      : colorMode === 'dark'
                        ? theme.colors.textSecondary
                        : '#6B7280'
                  }
                />
                <Text style={dynamicStyles.inputSuffix}>%</Text>
              </View>
            </View>

            {/* 時薪和工時（同一行） */}
            <View style={styles.formGroup}>
              <View style={{ flexDirection: 'row', gap: theme.spacing.md, alignItems: 'flex-start' }}>
                {/* 時薪 */}
                <View style={{ width: 150 }}>
                  <View style={dynamicStyles.inputWithSuffix}>
                    <Text style={dynamicStyles.inputSuffix}>$</Text>
                    <TextInput
                      style={[
                        dynamicStyles.input,
                        styles.inputWithSuffixInput,
                        focusedInput === 'hourlyRate' && dynamicStyles.inputFocused,
                      ]}
                      value={hourlyRate}
                      onChangeText={setHourlyRate}
                      placeholder="時薪"
                      placeholderTextColor={
                        focusedInput === 'hourlyRate'
                          ? 'transparent'
                          : colorMode === 'dark'
                            ? theme.colors.textSecondary
                            : '#6B7280'
                      }
                      keyboardType="numeric"
                      inputMode="decimal"
                      {...(Platform.OS === 'web' ? { pattern: '[0-9]*' } : {})}
                      onFocus={() => setFocusedInput('hourlyRate')}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>
                </View>
                {/* 工時 */}
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={[
                      dynamicStyles.input,
                      focusedInput === 'workHours' && dynamicStyles.inputFocused,
                    ]}
                    value={workHours}
                    onChangeText={setWorkHours}
                    placeholder="工時（小時）"
                    placeholderTextColor={
                      focusedInput === 'workHours'
                        ? 'transparent'
                        : colorMode === 'dark'
                          ? theme.colors.textSecondary
                          : '#6B7280'
                    }
                    keyboardType="numeric"
                    inputMode="decimal"
                    {...(Platform.OS === 'web' ? { pattern: '[0-9]*' } : {})}
                    onFocus={() => setFocusedInput('workHours')}
                    onBlur={() => setFocusedInput(null)}
                    returnKeyType="done"
                    onSubmitEditing={handleConfirm}
                  />
                </View>
              </View>
            </View>

            {/* 按鈕 */}
            <View style={[styles.buttonGroup, { paddingHorizontal: theme.spacing.xs, marginTop: theme.spacing.sm, marginBottom: theme.spacing.md }]}>
              <Button
                title="取消"
                onPress={onClose}
                variant="outline"
                style={styles.cancelButton}
                textStyle={dynamicStyles.buttonCancelText}
              />
              <Button
                title="確認"
                onPress={handleConfirm}
                disabled={!dealerName.trim()}
                style={[
                  styles.confirmButton,
                  colorMode === 'dark' ? dynamicStyles.confirmButtonDark : dynamicStyles.confirmButtonLight,
                ].filter(Boolean) as any}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    width: '90%',
    maxWidth: 520,
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  scrollContent: {
    padding: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 32,
    fontFamily: Platform.select({
      ios: '-apple-system',
      android: 'Roboto',
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }),
  },
  formGroup: {
    marginBottom: 32,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111111',
    marginBottom: 12,
    fontFamily: Platform.select({
      ios: '-apple-system',
      android: 'Roboto',
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }),
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  labelValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0066FF',
    fontFamily: Platform.select({
      ios: '-apple-system',
      android: 'Roboto',
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }),
  },
  input: {
    backgroundColor: '#F4F4F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000000',
    fontFamily: Platform.select({
      ios: '-apple-system',
      android: 'Roboto',
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }),
    // 完全移除邊框，避免按下時出現框線特效
    borderWidth: 0,
    borderColor: 'transparent',
  },
  inputFocused: {
    // 聚焦時也不顯示邊框，並保持與未聚焦時相同的淺灰背景
    borderWidth: 0,
    borderColor: 'transparent',
    backgroundColor: '#F4F4F5',
  },
  inputWithSuffix: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F5',
    borderRadius: 12,
    paddingRight: 16,
    // 淺色極簡風：移除外層容器邊框，避免出現黑色框線
    borderWidth: 0,
    borderColor: 'transparent',
  },
  inputWithSuffixInput: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingRight: 8,
  },
  inputSuffix: {
    fontSize: 16,
    color: '#666666',
    fontFamily: Platform.select({
      ios: '-apple-system',
      android: 'Roboto',
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }),
  },
  inputWithMarginTop: {
    marginTop: 12,
  },
  // 按鈕樣式
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
  },
  confirmButton: {
    flex: 1,
    marginLeft: 8,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
});

export default AddDealerForm;

