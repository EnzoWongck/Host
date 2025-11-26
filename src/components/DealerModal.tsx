import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import Modal from './Modal';
import Button from './Button';
import Icon from './Icon';
import ConfirmModal from './ConfirmModal';
import { Dealer } from '../types/game';

interface DealerModalProps {
  visible: boolean;
  onClose: () => void;
}

const DealerModal: React.FC<DealerModalProps> = ({ visible, onClose }) => {
  const { theme, colorMode } = useTheme();
  const { t, language } = useLanguage();
  const { state, addDealer, updateDealer, deleteDealer } = useGame();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});
  const [dealerName, setDealerName] = useState('');
  const [tipShare, setTipShare] = useState<50 | 100>(50);
  const [hourlyRate, setHourlyRate] = useState('');
  const [workHours, setWorkHours] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [editingDealer, setEditingDealer] = useState<Dealer | null>(null);
  const [editWorkHours, setEditWorkHours] = useState('');
  const [editTips, setEditTips] = useState('');
  const [editEstimatedSalary, setEditEstimatedSalary] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [dealerToDelete, setDealerToDelete] = useState<Dealer | null>(null);

  const currentGame = state.currentGame;
  const hosts = currentGame?.hosts || [];
  const hostNames = hosts.map(h => (typeof h === 'string' ? h : h.name));
  const [selectedHost, setSelectedHost] = useState<string | null>(null);
  const [editHost, setEditHost] = useState<string | null>(null);

  const styles = StyleSheet.create({
    dealersList: {
      marginBottom: theme.spacing.lg,
    },
    dealerItem: {
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    dealerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    dealerName: {
      fontSize: theme.fontSize.lg,
      fontWeight: '600',
      color: theme.colors.text,
    },
    dealerStatus: {
      fontSize: theme.fontSize.xs,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: 12,
      color: '#FFFFFF',
      overflow: 'hidden',
    },
    workingStatus: {
      backgroundColor: theme.colors.success,
    },
    offDutyStatus: {
      backgroundColor: theme.colors.textSecondary,
    },
    dealerStats: {
      marginBottom: theme.spacing.sm,
    },
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xs,
    },
    statLabel: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    statValue: {
      fontSize: theme.fontSize.sm,
      fontWeight: '500',
      color: theme.colors.text,
    },
    estimatedSalary: {
      fontSize: theme.fontSize.md,
      fontWeight: 'bold',
      color: theme.colors.success,
      textAlign: 'center',
      marginTop: theme.spacing.sm,
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.success + '10',
      borderRadius: theme.borderRadius.sm,
    },
    dealerActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.md,
    },
    statusButton: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.sm,
      marginHorizontal: theme.spacing.xs,
      alignItems: 'center',
    },
    workingButton: {
      backgroundColor: theme.colors.success,
    },
    offDutyButton: {
      backgroundColor: theme.colors.textSecondary,
    },
    statusButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: theme.fontSize.sm,
    },
    addDealerButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    addDealerText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: theme.fontSize.lg,
    },
    addForm: {
      backgroundColor: theme.colorMode === 'dark' ? theme.colors.surface : '#FFFFFF',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.lg,
    },
    addFormTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    inputGroup: {
      marginBottom: theme.spacing.md,
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
    },
    tipShareButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    tipShareButton: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      marginHorizontal: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    tipShareButtonSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '10',
    },
    tipShareButtonText: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    tipShareButtonTextSelected: {
      color: theme.colors.primary,
    },
    timeInputRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    timeInput: {
      flex: 1,
      marginHorizontal: theme.spacing.xs,
    },
    formActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.lg,
    },
    cancelButton: {
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    confirmButton: {
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    editButton: {
      marginTop: theme.spacing.sm,
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.primary + '10',
      borderRadius: theme.borderRadius.sm,
      alignItems: 'center',
    },
    emptyState: {
      alignItems: 'center',
      padding: theme.spacing.xl,
      backgroundColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.lg,
    },
    emptyText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    hostChipRow: {
      flexDirection: 'row',
    },
    chip: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: theme.colors.border,
      marginRight: theme.spacing.sm,
      backgroundColor: theme.colors.background,
    },
    chipActive: {
      borderColor: theme.colors.primary,
      backgroundColor: '#FFFFFF',
    },
    chipText: {
      color: theme.colors.text,
      fontWeight: '600',
    },
  });

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  const calculateEstimatedSalary = (dealer: Dealer) => {
    // 預設薪金估算：小費合計 × 佔成 + 基本時薪 × 工時
    const tipPortion = dealer.totalTips * (dealer.tipShare / 100);
    const hourlyPortion = dealer.hourlyRate * dealer.workHours;
    return dealer.estimatedSalary && dealer.estimatedSalary > 0
      ? dealer.estimatedSalary
      : tipPortion + hourlyPortion;
  };

  // 將時間字符串轉換為標準格式 HH:MM
  const normalizeTimeInput = (timeInput: string): string => {
    if (!timeInput || timeInput.trim() === '') {
      return '';
    }
    
    const trimmed = timeInput.trim();
    
    // 如果已經是 HH:MM 格式，直接返回
    if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    
    // 如果是純數字格式（如 1400, 900, 1430）
    if (/^\d{3,4}$/.test(trimmed)) {
      const num = parseInt(trimmed, 10);
      const hours = Math.floor(num / 100);
      const minutes = num % 100;
      
      // 驗證有效性
      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
    }
    
    // 如果格式不正確，返回原值（讓用戶自己修正）
    return trimmed;
  };

  // 計算工作時數，以0.5小時為單位，不足半小時也當半小時計算
  const calculateWorkHours = (startTimeStr: string, endTimeStr: string): number => {
    try {
      // 先標準化時間格式
      const normalizedStart = normalizeTimeInput(startTimeStr);
      const normalizedEnd = normalizeTimeInput(endTimeStr);
      
      if (!normalizedStart || !normalizedEnd) {
        return 0;
      }
      
      const [startHour, startMin] = normalizedStart.split(':').map(Number);
      const [endHour, endMin] = normalizedEnd.split(':').map(Number);
      
      if (isNaN(startHour) || isNaN(startMin) || isNaN(endHour) || isNaN(endMin)) {
        return 0;
      }

      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      if (endMinutes <= startMinutes) {
        // 跨日情況，假設是第二天
        const totalMinutes = (24 * 60 - startMinutes) + endMinutes;
        const hours = totalMinutes / 60;
        // 向上取整到0.5小時
        return Math.ceil(hours * 2) / 2;
      }
      
      const totalMinutes = endMinutes - startMinutes;
      const hours = totalMinutes / 60;
      // 向上取整到0.5小時
      return Math.ceil(hours * 2) / 2;
    } catch (error) {
      return 0;
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('zh-TW', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const handleSaveEditDealer = (item: Dealer) => {
    if (!currentGame) {
      Alert.alert(t('common.error') || '錯誤', t('dealer.errorNoGame'));
      return;
    }
    
    // 驗證工作時數（可選，留空時自動設為 0）
    let hours = 0; // 預設為 0
    // 如果 editWorkHours 有值且不為空字符串，才進行驗證
    if (editWorkHours && String(editWorkHours).trim() !== '') {
      const hoursValue = String(editWorkHours).trim();
      // 如果輸入的是 '0'，直接設為 0
      if (hoursValue === '0') {
        hours = 0;
      } else {
        // 嘗試解析為數字
        const parsedHours = parseFloat(hoursValue);
        if (isNaN(parsedHours) || parsedHours < 0) {
          // 只有在輸入了無效的值時才報錯
          Alert.alert(t('common.error') || '錯誤', t('dealer.errorWorkHoursInvalid'));
          return;
        }
        hours = parsedHours;
      }
    }
    // 如果 editWorkHours 為空/undefined/null，hours 保持為 0（不需要驗證）
    
    // 驗證小費（允許為空或 0，自動設為 0）
    let tips = 0;
    const tipsValue = (editTips || '').toString().trim();
    if (tipsValue === '') {
      tips = 0;
    } else {
      const parsedTips = parseFloat(tipsValue);
      if (isNaN(parsedTips) || parsedTips < 0) {
        Alert.alert(t('common.error') || '錯誤', t('dealer.errorTipsRequired'));
        return;
      }
      tips = parsedTips;
    }

    // 驗證/計算薪金預估（可選；若留空則使用自動計算）
    let estimatedSalary = calculateEstimatedSalary(item);
    const estimatedValue = (editEstimatedSalary || '').toString().trim();
    if (estimatedValue !== '') {
      const parsedEst = parseFloat(estimatedValue);
      if (!isNaN(parsedEst) && parsedEst >= 0) {
        estimatedSalary = parsedEst;
      }
    }
    
    // 處理時間（可選）
    let startTimeDate: Date | undefined;
    let endTimeDate: Date | undefined;
    
    if (editStartTime && String(editStartTime).trim()) {
      const normalizedStart = normalizeTimeInput(String(editStartTime));
      if (normalizedStart) {
        try {
          startTimeDate = new Date(`2000-01-01 ${normalizedStart}`);
        } catch (e) {
          // 忽略時間解析錯誤
        }
      }
    }
    
    if (editEndTime && String(editEndTime).trim()) {
      const normalizedEnd = normalizeTimeInput(String(editEndTime));
      if (normalizedEnd) {
        try {
          endTimeDate = new Date(`2000-01-01 ${normalizedEnd}`);
        } catch (e) {
          // 忽略時間解析錯誤
        }
      }
    }
    
    try {
      // Host 選擇：編輯時優先使用 editHost，其次保留原有 host，若單一 Host 則自動指派
      let hostName = editHost ?? item.host;
      if (!hostName && hostNames.length === 1) {
        hostName = hostNames[0];
      }

      const updatedDealer: Dealer = {
        ...item,
        workHours: hours,
        totalTips: tips,
        startTime: startTimeDate || item.startTime,
        endTime: endTimeDate || item.endTime,
        host: hostName,
        estimatedSalary,
      };
      
      updateDealer(currentGame.id, updatedDealer);
      setEditingDealer(null);
      setEditWorkHours('');
      setEditTips('');
      setEditStartTime('');
      setEditEndTime('');
      setEditEstimatedSalary('');
      Alert.alert(t('common.success') || '成功', t('success.updated'));
    } catch (error) {
      console.error('Error saving dealer:', error);
      Alert.alert(t('common.error') || '錯誤', '儲存失敗，請重試');
    }
  };

  const handleAddDealer = () => {
    if (!currentGame) {
      Alert.alert(t('common.error') || '錯誤', t('dealer.errorNoGame'));
      return;
    }

    if (!dealerName.trim()) {
      Alert.alert(t('common.error') || '錯誤', t('dealer.errorNameRequired'));
      return;
    }

    const rate = parseFloat(hourlyRate);
    if (isNaN(rate) || rate < 0) {
      Alert.alert(t('common.error') || '錯誤', t('dealer.errorRateRequired'));
      return;
    }

    // 工作時數為可選，若為空或 undefined 則設為 0
    const hours = workHours ? parseFloat(workHours) : 0;
    // 只有在輸入了無效的值時才報錯（不是空值）
    if (workHours && workHours.trim() !== '' && (isNaN(hours) || hours < 0)) {
      Alert.alert(t('common.error') || '錯誤', t('dealer.errorWorkHoursInvalid'));
      return;
    }

    // Host 選擇：單一 Host 自動指派，多 Host 可以之後在編輯頁再指定，不強制必選
    let hostName: string | undefined = selectedHost || undefined;
    if (!hostName && hostNames.length === 1) {
      hostName = hostNames[0];
    }

    const newDealer: Omit<Dealer, 'id' | 'totalTips' | 'estimatedSalary'> = {
      name: dealerName.trim(),
      tipShare,
      hourlyRate: rate,
      workHours: hours || 0, // 確保至少為 0
      startTime: startTime ? new Date(`2000-01-01 ${startTime}`) : undefined,
      endTime: endTime ? new Date(`2000-01-01 ${endTime}`) : undefined,
      status: 'working',
      host: hostName,
    };

    addDealer(currentGame.id, newDealer);

    Alert.alert(t('common.success') || '成功', `${t('dealer.successAdded')}${dealerName.trim()}`);

    // 重置表單
    resetAddForm();
    setShowAddForm(false);
  };

  const handleStatusChange = (dealer: Dealer, newStatus: 'working' | 'off_duty') => {
    if (!currentGame) return;

    const updatedDealer: Dealer = {
      ...dealer,
      status: newStatus,
    };

    updateDealer(currentGame.id, updatedDealer);

    Alert.alert(t('common.success') || '成功', `${dealer.name} ${t('dealer.successUpdated')}${newStatus === 'working' ? t('dealer.working') : t('dealer.offDuty')}`);
  };

  const handleDeleteDealer = (dealer: Dealer) => {
    setDealerToDelete(dealer);
    setDeleteConfirmVisible(true);
  };

  const confirmDeleteDealer = () => {
    if (!currentGame || !dealerToDelete) return;

    deleteDealer(currentGame.id, dealerToDelete.id);
    setDeleteConfirmVisible(false);
    setDealerToDelete(null);
    Alert.alert(t('common.success') || '成功', t('success.deleted'));
  };

  const resetAddForm = () => {
    setDealerName('');
    setTipShare(50);
    setHourlyRate('');
    setWorkHours('');
    setStartTime('');
    setEndTime('');
    setSelectedHost(null);
  };

  React.useEffect(() => {
    if (showAddForm) {
      setStartTime(getCurrentTime());
    }
  }, [showAddForm]);

  // 每次開啟視窗時，預設顯示「現有發牌員」區塊，隱藏新增表單
  React.useEffect(() => {
    if (visible) {
      setShowAddForm(false);
      resetAddForm();
      setExpandedMap({});
      setEditHost(null);
    } else {
      // 視窗關閉時，自動收起所有卡片
      setExpandedMap({});
    }
  }, [visible]);

  const toggleExpanded = (id: string) => {
    setExpandedMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderDealerItem = ({ item }: { item: Dealer }) => {
    const estimatedSalary = calculateEstimatedSalary(item);
    const isExpanded = !!expandedMap[item.id];

    return (
      <View style={styles.dealerItem}>
        <TouchableOpacity style={styles.dealerHeader} onPress={() => toggleExpanded(item.id)} activeOpacity={1}>
          <Text style={styles.dealerName}>{item.name}</Text>
          <Text
            style={[
              styles.dealerStatus,
              item.status === 'working' ? styles.workingStatus : styles.offDutyStatus,
            ]}
          >
            {item.status === 'working' ? t('dealer.working') : t('dealer.offDuty')}
          </Text>
        </TouchableOpacity>

        {isExpanded && (
          <>
            <View style={styles.dealerStats}>
              {editingDealer?.id === item.id ? (
                <>
                  {/* 編輯模式 */}
                  <View style={styles.timeInputRow}>
                    <View style={[styles.inputGroup, styles.timeInput]}>
                      <Text style={styles.label}>{t('dealer.startTime')}</Text>
                      <TextInput
                        style={styles.input}
                        value={editStartTime}
                        onChangeText={(text) => {
                          setEditStartTime(text);
                          // 如果兩個時間都有，可以選擇自動計算工作時數
                          if (text && editEndTime) {
                            const normalizedStart = normalizeTimeInput(text);
                            const normalizedEnd = normalizeTimeInput(editEndTime);
                            if (normalizedStart && normalizedEnd) {
                              const hours = calculateWorkHours(normalizedStart, normalizedEnd);
                              if (hours > 0) {
                                // 只在有效計算時更新，但不強制覆蓋手動輸入的值
                                // 如果工作時數為空或為 0，才自動填入計算結果
                                const currentHours = editWorkHours ? editWorkHours.trim() : '';
                                if (currentHours === '' || parseFloat(currentHours) === 0) {
                                  setEditWorkHours(String(hours));
                                }
                              }
                            }
                          }
                        }}
                        onBlur={(e) => {
                          // 失去焦點時自動格式化
                          const normalized = normalizeTimeInput(e.nativeEvent.text);
                          if (normalized && normalized !== editStartTime) {
                            setEditStartTime(normalized);
                          }
                        }}
                        placeholder="1400 或 14:00"
                        placeholderTextColor={theme.colors.textSecondary}
                      />
                    </View>
                    <View style={[styles.inputGroup, styles.timeInput]}>
                      <Text style={styles.label}>{t('dealer.endTime')}</Text>
                      <TextInput
                        style={styles.input}
                        value={editEndTime}
                        onChangeText={(text) => {
                          setEditEndTime(text);
                          // 如果兩個時間都有，可以選擇自動計算工作時數
                          if (editStartTime && text) {
                            const normalizedStart = normalizeTimeInput(editStartTime);
                            const normalizedEnd = normalizeTimeInput(text);
                            if (normalizedStart && normalizedEnd) {
                              const hours = calculateWorkHours(normalizedStart, normalizedEnd);
                              if (hours > 0) {
                                // 只在有效計算時更新，但不強制覆蓋手動輸入的值
                                // 如果工作時數為空或為 0，才自動填入計算結果
                                const currentHours = editWorkHours ? editWorkHours.trim() : '';
                                if (currentHours === '' || parseFloat(currentHours) === 0) {
                                  setEditWorkHours(String(hours));
                                }
                              }
                            }
                          }
                        }}
                        onBlur={(e) => {
                          // 失去焦點時自動格式化
                          const normalized = normalizeTimeInput(e.nativeEvent.text);
                          if (normalized && normalized !== editEndTime) {
                            setEditEndTime(normalized);
                          }
                        }}
                        placeholder="2200 或 22:00"
                        placeholderTextColor={theme.colors.textSecondary}
                      />
                    </View>
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t('dealer.workHours')}（可選）</Text>
                    <TextInput
                      style={styles.input}
                      value={editWorkHours}
                      onChangeText={setEditWorkHours}
                      onBlur={() => {
                        // 失去焦點時，如果為空則設為 0
                        if (!editWorkHours || editWorkHours.trim() === '') {
                          setEditWorkHours('0');
                        }
                      }}
                      placeholder={t('dealer.enterWorkHours')}
                      placeholderTextColor={theme.colors.textSecondary}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t('dealer.totalTips')}</Text>
                    <TextInput
                      style={styles.input}
                      value={editTips}
                      onChangeText={setEditTips}
                      placeholder={t('dealer.totalTips')}
                      placeholderTextColor={theme.colors.textSecondary}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>{'薪金預估（可選）'}</Text>
                    <TextInput
                      style={styles.input}
                      value={editEstimatedSalary}
                      onChangeText={setEditEstimatedSalary}
                      placeholder={formatCurrency(estimatedSalary)}
                      placeholderTextColor={theme.colors.textSecondary}
                      keyboardType="numeric"
                    />
                  </View>
                  {!!currentGame && hostNames.length > 1 && (
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>{'負責 Host（薪金）'}</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.hostChipRow}>
                          {hostNames.map((name) => (
                            <TouchableOpacity
                              key={name}
                              style={[
                                styles.chip,
                                (editHost ?? item.host) === name && styles.chipActive,
                              ]}
                              onPress={() => setEditHost(name)}
                              activeOpacity={1}
                            >
                              <Text style={styles.chipText}>{name}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </ScrollView>
                    </View>
                  )}
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>{t('dealer.shareRatio')}</Text>
                    <Text style={styles.statValue}>{item.tipShare}%</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>{t('dealer.hourlyRate')}：</Text>
                    <Text style={styles.statValue}>{formatCurrency(item.hourlyRate)}{t('dealer.perHour')}</Text>
                  </View>
                  <View style={styles.dealerActions}>
                    <Button
                      title={t('common.cancel')}
                      onPress={() => {
                        setEditingDealer(null);
                        setEditWorkHours('');
                        setEditTips('');
                        setEditStartTime('');
                        setEditEndTime('');
                      }}
                      variant="outline"
                      style={styles.cancelButton}
                    />
                    <Button
                      title={t('common.confirm')}
                      onPress={() => handleSaveEditDealer(item)}
                      style={styles.confirmButton}
                    />
                  </View>
                </>
              ) : (
                <>
                  {/* 顯示模式 */}
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>{t('dealer.workHours')}：</Text>
                    <Text style={styles.statValue}>{item.workHours} {t('summaryExport.hours')}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>{t('dealer.totalTips')}：</Text>
                    <Text style={styles.statValue}>{formatCurrency(item.totalTips)}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>{t('dealer.shareRatio')}</Text>
                    <Text style={styles.statValue}>{item.tipShare}%</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>{t('dealer.hourlyRate')}：</Text>
                    <Text style={styles.statValue}>{formatCurrency(item.hourlyRate)}{t('dealer.perHour')}</Text>
                  </View>
                  {!!item.host && (
                    <View style={styles.statRow}>
                      <Text style={styles.statLabel}>負責 Host：</Text>
                      <Text style={styles.statValue}>{item.host}</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={{
                      marginTop: theme.spacing.sm,
                      padding: theme.spacing.sm,
                      backgroundColor: theme.colors.primary + '10',
                      borderRadius: theme.borderRadius.sm,
                      alignItems: 'center',
                    }}
                    onPress={() => {
                      setEditingDealer(item);
                      // 工時：若原本為 0，編輯時預設留空，避免使用者先刪除 0 才能輸入
                      setEditWorkHours(item.workHours ? String(item.workHours) : '');
                      // 小費：若原本為 0，編輯時預設留空，讓使用者直接輸入金額
                      setEditTips(item.totalTips ? String(item.totalTips) : '');
                      const locale = language === 'zh-TW' ? 'zh-TW' : 'zh-CN';
                      setEditStartTime(
                        item.startTime
                          ? new Date(item.startTime).toLocaleTimeString(locale, {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                            })
                          : ''
                      );
                      setEditEndTime(
                        item.endTime
                          ? new Date(item.endTime).toLocaleTimeString(locale, {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                            })
                          : ''
                      );
                    }}
                  >
                    <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>{t('dealer.addWorkHoursTips')}</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {editingDealer?.id !== item.id && (
              <>
                <View
                  style={{
                    marginTop: theme.spacing.sm,
                    padding: theme.spacing.sm,
                    borderRadius: theme.borderRadius.sm,
                    backgroundColor: theme.colors.success + '10',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={styles.statLabel}>薪金預估：</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.statValue, { fontWeight: '700', marginRight: theme.spacing.xs }]}>
                      {formatCurrency(estimatedSalary)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setEditingDealer(item);
                        setEditWorkHours(item.workHours ? String(item.workHours) : '');
                        setEditTips(item.totalTips ? String(item.totalTips) : '');
                        setEditEstimatedSalary(
                          item.estimatedSalary && item.estimatedSalary > 0
                            ? String(item.estimatedSalary)
                            : String(estimatedSalary)
                        );
                        const locale = language === 'zh-TW' ? 'zh-TW' : 'zh-CN';
                        setEditStartTime(
                          item.startTime
                            ? new Date(item.startTime).toLocaleTimeString(locale, {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                              })
                            : ''
                        );
                        setEditEndTime(
                          item.endTime
                            ? new Date(item.endTime).toLocaleTimeString(locale, {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                              })
                            : ''
                        );
                      }}
                      activeOpacity={0.7}
                      style={{ paddingHorizontal: theme.spacing.xs }}
                    >
                      <Text style={{ fontSize: 18, color: theme.colors.primary }}>✏️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.dealerActions}>
                  <TouchableOpacity
                    style={[styles.statusButton, styles.workingButton]}
                    onPress={() => handleStatusChange(item, 'working')}
                    disabled={item.status === 'working'}
                    activeOpacity={1}
                  >
                    <Text style={styles.statusButtonText}>{t('dealer.working')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.statusButton, styles.offDutyButton]}
                    onPress={() => handleStatusChange(item, 'off_duty')}
                    disabled={item.status === 'off_duty'}
                    activeOpacity={1}
                  >
                    <Text style={styles.statusButtonText}>{t('dealer.offDuty')}</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={{
                    marginTop: theme.spacing.sm,
                    padding: theme.spacing.sm,
                    backgroundColor: theme.colors.error + '10',
                    borderRadius: theme.borderRadius.sm,
                    alignItems: 'center',
                  }}
                  onPress={() => handleDeleteDealer(item)}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: theme.colors.error, fontWeight: '600' }}>{t('common.delete')}</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={showAddForm ? t('dealer.addDealer') : t('game.dealer')}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 發牌員列表（在新增模式時隱藏） */}
        {!showAddForm && (
          <>
            {currentGame?.dealers && currentGame.dealers.length > 0 ? (
              <FlatList
                data={currentGame.dealers}
                renderItem={renderDealerItem}
                keyExtractor={(item) => item.id}
                style={styles.dealersList}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>{t('dealer.noDealers')}</Text>
              </View>
            )}
          </>
        )}

        {/* 新增發牌員按鈕或表單 */}
        {!showAddForm ? (
          <TouchableOpacity
            style={styles.addDealerButton}
            onPress={() => setShowAddForm(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.addDealerText}>+ {t('dealer.addDealer')}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.addForm}>
            <Text style={styles.addFormTitle}>{t('dealer.addDealer')}</Text>

            {/* 發牌員名稱 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('dealer.dealerName')}</Text>
              <TextInput
                style={styles.input}
                value={dealerName}
                onChangeText={setDealerName}
                placeholder={t('dealer.dealerName')}
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            {/* 佔成選擇 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('dealer.tipShare')}</Text>
              <View style={styles.tipShareButtons}>
                <TouchableOpacity
                  style={[
                    styles.tipShareButton,
                    tipShare === 50 && styles.tipShareButtonSelected,
                  ]}
                  onPress={() => setTipShare(50)}
                >
                  <Text
                    style={[
                      styles.tipShareButtonText,
                      tipShare === 50 && styles.tipShareButtonTextSelected,
                    ]}
                  >
                    50%
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tipShareButton,
                    tipShare === 100 && styles.tipShareButtonSelected,
                  ]}
                  onPress={() => setTipShare(100)}
                >
                  <Text
                    style={[
                      styles.tipShareButtonText,
                      tipShare === 100 && styles.tipShareButtonTextSelected,
                    ]}
                  >
                    100%
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 基本時薪 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('dealer.hourlyRate')}</Text>
              <TextInput
                style={styles.input}
                value={hourlyRate}
                onChangeText={setHourlyRate}
                placeholder={t('dealer.hourlyRate')}
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
              />
            </View>

            {/* 工作時數 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('dealer.workHours')}（可選）</Text>
              <TextInput
                style={styles.input}
                value={workHours}
                onChangeText={setWorkHours}
                placeholder={t('dealer.enterWorkHours')}
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
              />
            </View>

            {/* 上下班時間 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('dealer.startTime')}/{t('dealer.endTime')}（可選）</Text>
              <View style={styles.timeInputRow}>
                <View style={styles.timeInput}>
                  <TextInput
                    style={styles.input}
                    value={startTime}
                    onChangeText={setStartTime}
                    onBlur={(e) => {
                      const normalized = normalizeTimeInput(e.nativeEvent.text);
                      if (normalized && normalized !== startTime) {
                        setStartTime(normalized);
                      }
                    }}
                    placeholder="1400 或 14:00"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>
                <View style={styles.timeInput}>
                  <TextInput
                    style={styles.input}
                    value={endTime}
                    onChangeText={setEndTime}
                    onBlur={(e) => {
                      const normalized = normalizeTimeInput(e.nativeEvent.text);
                      if (normalized && normalized !== endTime) {
                        setEndTime(normalized);
                      }
                    }}
                    placeholder="2200 或 22:00"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>
              </View>
            </View>

            {/* 負責 Host（薪金）選擇：僅在多 Host 時顯示 */}
            {!!currentGame && hostNames.length > 1 && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{'負責 Host（薪金）'}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.hostChipRow}>
                    {hostNames.map((name) => (
                      <TouchableOpacity
                        key={name}
                        style={[
                          styles.chip,
                          selectedHost === name && styles.chipActive,
                        ]}
                        onPress={() => setSelectedHost(name)}
                        activeOpacity={1}
                      >
                        <Text style={styles.chipText}>{name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* 表單按鈕 */}
            <View style={styles.formActions}>
              <Button
                title={t('common.cancel')}
                onPress={() => {
                  resetAddForm();
                  setShowAddForm(false);
                }}
                variant="outline"
                style={styles.cancelButton}
              />
              <Button
                title={t('common.confirm')}
                onPress={handleAddDealer}
                style={styles.confirmButton}
              />
            </View>
          </View>
        )}
      </ScrollView>

      <ConfirmModal
        visible={deleteConfirmVisible}
        onClose={() => {
          setDeleteConfirmVisible(false);
          setDealerToDelete(null);
        }}
        onConfirm={confirmDeleteDealer}
        title={t('common.delete')}
        message={dealerToDelete ? `${t('dealer.deleteConfirm')} ${dealerToDelete.name}？` : ''}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        confirmVariant="danger"
      />
    </Modal>
  );
};

export default DealerModal;
