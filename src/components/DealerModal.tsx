import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  Platform,
  Dimensions,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import Modal from './Modal';
import Button from './Button';
import Icon from './Icon';
import ConfirmModal from './ConfirmModal';
import AddDealerForm from './AddDealerForm';
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
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [isEditingSalary, setIsEditingSalary] = useState<Record<string, boolean>>({});
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [dealerToDelete, setDealerToDelete] = useState<Dealer | null>(null);
  const salaryInputRefs = useRef<Record<string, TextInput | null>>({});

  // 獲取螢幕尺寸
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const isMobile = screenWidth < 768; // 判斷是否為手機

  const currentGame = state.currentGame;
  const hosts = currentGame?.hosts || [];
  const hostNames = hosts.map(h => (typeof h === 'string' ? h : h.name));
  const [selectedHost, setSelectedHost] = useState<string | null>(null);
  const [editHost, setEditHost] = useState<string | null>(null);

  const styles = StyleSheet.create({
    inputRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
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
      minHeight: 50, // 增加高度以擴大點擊區域
      paddingVertical: theme.spacing.sm, // 增加垂直內邊距，擴大點擊區域
      paddingHorizontal: theme.spacing.xs, // 增加水平內邊距，擴大點擊區域
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
      overflow: 'hidden',
      backgroundColor: 'transparent',
      borderWidth: 1,
    },
    workingStatus: {
      // 發牌中：與主頁「進行中」樣式一樣
      borderColor: colorMode === 'dark' ? theme.colors.border : '#10B981',
      color: colorMode === 'dark' ? '#FFFFFF' : '#10B981',
    },
    offDutyStatus: {
      // 已結束：深色模式改為紅色邊框和紅色文字
      borderColor: colorMode === 'dark' ? '#EF4444' : '#EF4444',
      color: colorMode === 'dark' ? '#EF4444' : '#EF4444',
      backgroundColor: 'transparent',
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
    timePickerButton: {
      height: 40,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 0,
      paddingHorizontal: theme.spacing.md,
      justifyContent: 'center',
      backgroundColor: colorMode === 'light' ? '#F4F4F5' : theme.colors.surface,
    },
    timePickerText: {
      fontSize: theme.fontSize.md,
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
      backgroundColor: colorMode === 'light' ? '#E2E8F0' : theme.colors.primary,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: colorMode === 'light' ? 0.08 : 0.15,
      shadowRadius: 12,
      elevation: 6,
    },
    addDealerText: {
      color: colorMode === 'light' ? '#64748B' : '#FFFFFF',
      fontWeight: '600',
      fontSize: theme.fontSize.md,
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
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      backgroundColor: colorMode === 'light' ? '#F8F9FA' : theme.colors.surface,
    },
    inputFocused: {
      borderColor: theme.colors.primary,
      borderWidth: 1,
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
      borderColor: colorMode === 'dark' ? '#FFFFFF' : '#6B7280',
      backgroundColor: theme.colors.background,
    },
    tipShareButtonText: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    tipShareButtonTextSelected: {
      color: theme.colors.text,
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
      backgroundColor: 'transparent',
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
      borderColor: colorMode === 'dark' ? theme.colors.border : '#F4F4F5',
      marginRight: theme.spacing.sm,
      backgroundColor: theme.colors.background,
    },
    chipActive: {
      borderColor: colorMode === 'dark' ? '#FFFFFF' : '#E2E8F0',
      backgroundColor: theme.colors.background,
    },
    chipText: {
      color: colorMode === 'light' ? '#4B5563' : theme.colors.text,
      fontWeight: '600',
    },
  });

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  const calculateEstimatedSalary = (dealer: Dealer) => {
    // 預設薪金估算：小費合計 × 佔成 + 基本時薪 × 工時
    const tipPortion = dealer.totalTips * (dealer.tipShare / 100);
    const hourlyPortion = dealer.hourlyRate * dealer.workHours;
    return tipPortion + hourlyPortion;
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

  // 將 "HH:mm" 字串轉為當天的 Date 物件，供時間選擇器使用
  const timeStringToDate = (timeStr: string): Date => {
    const now = new Date();
    const normalized = normalizeTimeInput(timeStr) || '00:00';
    const [h, m] = normalized.split(':').map((v) => parseInt(v, 10));
    const d = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      isNaN(h) ? 0 : h,
      isNaN(m) ? 0 : m,
      0,
      0,
    );
    return d;
  };

  // 將 Date 轉回 "HH:mm" 字串
  const dateToTimeString = (date: Date): string => {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('zh-TW', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  // 根據目前輸入的工時與小費，自動計算薪金預估並覆蓋編輯欄位
  const recalculateEstimatedSalary = (baseDealer: Dealer, workHoursValue: string, tipsValue: string) => {
    const hours = parseFloat(workHoursValue || '0') || 0;
    const tips = parseFloat(tipsValue || '0') || 0;
    const hourly = baseDealer.hourlyRate || 0;
    const tipPortion = tips * (baseDealer.tipShare / 100);
    const hourlyPortion = hourly * hours;
    const salary = tipPortion + hourlyPortion;
    setEditEstimatedSalary(salary > 0 ? String(salary) : '0');
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
      setIsEditingSalary((prev) => {
        const newState = { ...prev };
        delete newState[item.id];
        return newState;
      });
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
    if (!currentGame) {
      return;
    }

    const updatedDealer: Dealer = {
      ...dealer,
      status: newStatus,
    };

    try {
      updateDealer(currentGame.id, updatedDealer);
    } catch (error) {
      console.error('Error updating dealer status:', error);
    }
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
      setEditingDealer(null); // 重置編輯狀態，確保下次打開時顯示卡片視窗
    } else {
      // 視窗關閉時，自動收起所有卡片並重置編輯狀態
      setExpandedMap({});
      setEditingDealer(null);
    }
  }, [visible]);

  const toggleExpanded = (id: string) => {
    setExpandedMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderDealerItem = ({ item }: { item: Dealer }) => {
    const estimatedSalary = calculateEstimatedSalary(item);
    // 依目前輸入的工時與小費即時計算「預估薪金」
    let liveTips = item.totalTips || 0;
    let liveHours = item.workHours || 0;
    if (editingDealer?.id === item.id) {
      const parsedTips = parseFloat((editTips || '').toString().trim());
      const parsedHours = parseFloat((editWorkHours || '').toString().trim());
      if (!isNaN(parsedTips)) {
        liveTips = parsedTips;
      }
      if (!isNaN(parsedHours)) {
        liveHours = parsedHours;
      }
    }
    const liveEstimatedSalary =
      (liveTips || 0) * (item.tipShare / 100) +
      (item.hourlyRate || 0) * (liveHours || 0);
    const isExpanded = !!expandedMap[item.id];

    const handleCardPress = () => {
      // 展開卡片
      if (!isExpanded) {
        setExpandedMap(prev => ({ ...prev, [item.id]: true }));
      }
      // 進入編輯模式
      setEditingDealer(item);
      // 工時：若原本為 0，編輯時預設留空，避免使用者先刪除 0 才能輸入
      setEditWorkHours(item.workHours ? String(item.workHours) : '');
      // 金額：若原本為 0 或未設定，預設為 '0'
      setEditTips(item.totalTips ? String(item.totalTips) : '0');
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
    };

    return (
      <View style={styles.dealerItem}>
        <TouchableOpacity 
          style={styles.dealerHeader}
          onPress={handleCardPress}
          activeOpacity={0.7}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.dealerName}>{item.name}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: theme.spacing.md }}>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleStatusChange(item, item.status === 'working' ? 'off_duty' : 'working');
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dealerStatus,
                  item.status === 'working' ? styles.workingStatus : styles.offDutyStatus,
                ]}
              >
                {item.status === 'working' ? t('dealer.working') : t('dealer.offDuty')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleDeleteDealer(item);
              }}
              activeOpacity={0.7}
              style={{ marginLeft: theme.spacing.md }}
            >
              <Text style={{ color: theme.colors.error, fontWeight: '600', fontSize: theme.fontSize.sm }}>
                {t('common.delete')}
              </Text>
            </TouchableOpacity>
            {/* 向左的三角形（展開後消失） */}
            {!isExpanded && (
              <View
                style={{
                  width: 0,
                  height: 0,
                  borderLeftWidth: 10,
                  borderRightWidth: 0,
                  borderTopWidth: 8,
                  borderBottomWidth: 8,
                  borderLeftColor: theme.colors.textSecondary,
                  borderTopColor: 'transparent',
                  borderBottomColor: 'transparent',
                  marginLeft: theme.spacing.md,
                }}
              />
            )}
          </View>
        </TouchableOpacity>

        {editingDealer?.id === item.id && (
          <>
            <View style={styles.dealerStats}>
              {editingDealer?.id === item.id ? (
                <>
                  {/* 編輯模式 */}
                  <View style={styles.timeInputRow}>
                    {/* 上班時間：iOS 使用滾輪式時間選擇器，其它平台維持輸入欄 */}
                    <View style={[styles.inputGroup, styles.timeInput]}>
                      <Text style={styles.label}>{t('dealer.startTime')}</Text>
                      {Platform.OS === 'ios' ? (
                        <>
                          <TouchableOpacity
                            style={styles.timePickerButton}
                            onPress={() => setShowStartPicker(true)}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.timePickerText}>
                              {editStartTime || '選擇時間'}
                            </Text>
                          </TouchableOpacity>
                          {showStartPicker && (
                            <DateTimePicker
                              value={timeStringToDate(editStartTime || '00:00')}
                              mode="time"
                              display="spinner"
                              onChange={(event: DateTimePickerEvent, date?: Date) => {
                                if (event.type === 'set' && date) {
                                  const timeStr = dateToTimeString(date);
                                  setEditStartTime(timeStr);
                                  // 自動計算工時
                                  if (timeStr && editEndTime) {
                                    const normalizedStart = normalizeTimeInput(timeStr);
                                    const normalizedEnd = normalizeTimeInput(editEndTime);
                                    if (normalizedStart && normalizedEnd) {
                                  const hours = calculateWorkHours(normalizedStart, normalizedEnd);
                                  setEditWorkHours(String(hours));
                                  recalculateEstimatedSalary(item, String(hours), editTips || '0');
                                    }
                                  }
                                }
                                setShowStartPicker(false);
                              }}
                            />
                          )}
                        </>
                      ) : (
                        <TextInput
                          style={[styles.input, focusedInput === 'editStartTime' && styles.inputFocused]}
                          value={editStartTime}
                          onFocus={() => setFocusedInput('editStartTime')}
                          onChangeText={(text) => {
                            setEditStartTime(text);
                            if (text && editEndTime) {
                              const normalizedStart = normalizeTimeInput(text);
                              const normalizedEnd = normalizeTimeInput(editEndTime);
                              if (normalizedStart && normalizedEnd) {
                                const hours = calculateWorkHours(normalizedStart, normalizedEnd);
                                setEditWorkHours(String(hours));
                                recalculateEstimatedSalary(item, String(hours), editTips || '0');
                              }
                            }
                          }}
                          onBlur={() => {
                            setFocusedInput(null);
                            const normalized = normalizeTimeInput(editStartTime || '');
                            if (normalized && normalized !== editStartTime) {
                              setEditStartTime(normalized);
                            }
                          }}
                          placeholder="1400 或 14:00"
                          placeholderTextColor={
                            focusedInput === 'editStartTime'
                              ? 'transparent'
                              : theme.colors.textSecondary
                          }
                        />
                      )}
                    </View>

                    {/* 下班時間：iOS 滾輪，其它平台維持輸入欄 */}
                    <View style={[styles.inputGroup, styles.timeInput]}>
                      <Text style={styles.label}>{t('dealer.endTime')}</Text>
                      {Platform.OS === 'ios' ? (
                        <>
                          <TouchableOpacity
                            style={styles.timePickerButton}
                            onPress={() => setShowEndPicker(true)}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.timePickerText}>
                              {editEndTime || '選擇時間'}
                            </Text>
                          </TouchableOpacity>
                          {showEndPicker && (
                            <DateTimePicker
                              value={timeStringToDate(editEndTime || '00:00')}
                              mode="time"
                              display="spinner"
                              onChange={(event: DateTimePickerEvent, date?: Date) => {
                                if (event.type === 'set' && date) {
                                  const timeStr = dateToTimeString(date);
                                  setEditEndTime(timeStr);
                                  if (editStartTime && timeStr) {
                                    const normalizedStart = normalizeTimeInput(editStartTime);
                                    const normalizedEnd = normalizeTimeInput(timeStr);
                                    if (normalizedStart && normalizedEnd) {
                                  const hours = calculateWorkHours(normalizedStart, normalizedEnd);
                                  setEditWorkHours(String(hours));
                                  recalculateEstimatedSalary(item, String(hours), editTips || '0');
                                    }
                                  }
                                }
                                setShowEndPicker(false);
                              }}
                            />
                          )}
                        </>
                      ) : (
                        <TextInput
                          style={[styles.input, focusedInput === 'editEndTime' && styles.inputFocused]}
                          value={editEndTime}
                          onFocus={() => setFocusedInput('editEndTime')}
                          onChangeText={(text) => {
                            setEditEndTime(text);
                            if (editStartTime && text) {
                              const normalizedStart = normalizeTimeInput(editStartTime);
                              const normalizedEnd = normalizeTimeInput(text);
                              if (normalizedStart && normalizedEnd) {
                                const hours = calculateWorkHours(normalizedStart, normalizedEnd);
                                setEditWorkHours(String(hours));
                                recalculateEstimatedSalary(item, String(hours), editTips || '0');
                              }
                            }
                          }}
                          onBlur={() => {
                            setFocusedInput(null);
                            const normalized = normalizeTimeInput(editEndTime || '');
                            if (normalized && normalized !== editEndTime) {
                              setEditEndTime(normalized);
                            }
                          }}
                          placeholder="2200 或 22:00"
                          placeholderTextColor={
                            focusedInput === 'editEndTime'
                              ? 'transparent'
                              : theme.colors.textSecondary
                          }
                        />
                      )}
                    </View>
                  </View>
              {/* 工時 + 小費 同一行 */}
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: theme.spacing.sm }]}>
                  <Text style={styles.label}>{t('dealer.workHours')}（可選）</Text>
                  <TextInput
                    style={[styles.input, focusedInput === 'editWorkHours' && styles.inputFocused]}
                    value={editWorkHours}
                    onChangeText={(text) => {
                      setEditWorkHours(text);
                      recalculateEstimatedSalary(item, text, editTips || '0');
                    }}
                    onFocus={() => setFocusedInput('editWorkHours')}
                    onBlur={() => {
                      setFocusedInput(null);
                      // 失去焦點時，如果為空則設為 0
                      if (!editWorkHours || editWorkHours.trim() === '') {
                        setEditWorkHours('0');
                      }
                    }}
                    placeholder={t('dealer.enterWorkHours')}
                    placeholderTextColor={
                      focusedInput === 'editWorkHours'
                        ? 'transparent'
                        : theme.colors.textSecondary
                    }
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>小費金額</Text>
                  <TextInput
                    style={[styles.input, focusedInput === 'editTips' && styles.inputFocused]}
                    value={editTips}
                    onChangeText={(text) => {
                      setEditTips(text);
                      recalculateEstimatedSalary(item, editWorkHours || '0', text || '0');
                    }}
                    onFocus={() => {
                      setFocusedInput('editTips');
                      setEditTips(''); // 點擊時自動清空
                    }}
                    onBlur={() => {
                      setFocusedInput(null);
                      // 失去焦點時，如果為空則設為 0
                      if (!editTips || editTips.trim() === '') {
                        setEditTips('0');
                      }
                    }}
                    placeholder="小費金額"
                    placeholderTextColor={
                      focusedInput === 'editTips'
                        ? 'transparent'
                        : theme.colors.textSecondary
                    }
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* 發牌員詳細（編輯）界面的綠色「薪金預估」區域 */}
              <View
                style={{
                  marginTop: theme.spacing.sm,
                  marginBottom: theme.spacing.md,
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.sm,
                  backgroundColor: theme.colors.success + '10',
                  alignSelf: 'center',
                  width: '70%',
                  maxWidth: 260,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexWrap: 'nowrap',
                }}
              >
                <Text
                  style={[styles.statLabel, { textAlign: 'center' }]}
                  numberOfLines={1}
                >
                  薪金預估：
                </Text>
                <TextInput
                  ref={(ref) => {
                    salaryInputRefs.current[item.id] = ref;
                  }}
                  style={[
                    styles.statValue,
                    {
                      fontWeight: '700',
                      padding: 0,
                      textAlign: 'left',
                      marginLeft: theme.spacing.xs,
                      marginRight: theme.spacing.xs,
                      flex: 1,
                      minWidth: 80,
                    },
                  ]}
                  value={
                    editEstimatedSalary
                      ? editEstimatedSalary
                      : String(
                          item.estimatedSalary && item.estimatedSalary > 0
                            ? item.estimatedSalary
                            : liveEstimatedSalary,
                        )
                  }
                  onChangeText={setEditEstimatedSalary}
                  keyboardType="numeric"
                  editable={isEditingSalary[item.id] || false}
                />
                <TouchableOpacity
                  onPress={() => {
                    const newEditingState = !(isEditingSalary[item.id] || false);
                    setIsEditingSalary((prev) => ({
                      ...prev,
                      [item.id]: newEditingState,
                    }));
                    if (newEditingState) {
                      // 延遲一點點確保狀態更新後再聚焦
                      setTimeout(() => {
                        salaryInputRefs.current[item.id]?.focus();
                      }, 100);
                    }
                  }}
                  activeOpacity={0.7}
                  style={{ marginLeft: theme.spacing.xs }}
                >
                  <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.sm, fontWeight: '600' }}>
                    編輯
                  </Text>
                </TouchableOpacity>
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
                        setIsEditingSalary((prev) => {
                          const newState = { ...prev };
                          delete newState[item.id];
                          return newState;
                        });
                      }}
                      variant="outline"
                      style={[
                        styles.cancelButton,
                        colorMode === 'light' && {
                          borderColor: theme.colors.primary,
                        },
                      ]}
                      textStyle={{
                        color: colorMode === 'light' ? '#64748B' : '#FFFFFF',
                      }}
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
                </>
              )}
            </View>

            {editingDealer?.id !== item.id && (
              <>
                {/* 綠色預估薪金區塊（顯示預估金額） */}
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
                  <TextInput
                    style={[
                      styles.statValue,
                      { fontWeight: '700', marginRight: theme.spacing.xs, padding: 0 },
                    ]}
                    value={
                      editingDealer?.id === item.id && editEstimatedSalary
                        ? editEstimatedSalary
                        : String(
                            item.estimatedSalary && item.estimatedSalary > 0
                              ? item.estimatedSalary
                              : liveEstimatedSalary,
                          )
                    }
                    onChangeText={setEditEstimatedSalary}
                    keyboardType="numeric"
                  />
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
      maxWidth={isMobile ? screenWidth - 32 : 500}
      maxHeight={isMobile ? screenHeight * 0.9 : undefined}
      containerStyle={isMobile ? { width: screenWidth - 32, maxWidth: screenWidth - 32 } : { width: 500, minWidth: 500, maxWidth: 'none' }}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ maxWidth: 680, alignSelf: 'center', width: '100%', paddingHorizontal: theme.spacing.lg }}>
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

        {/* 新增發牌員按鈕 */}
        {!showAddForm && (
          <TouchableOpacity
            style={styles.addDealerButton}
            onPress={() => setShowAddForm(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.addDealerText}>+ {t('dealer.addDealer')}</Text>
          </TouchableOpacity>
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

      {/* 使用新的極簡白色高級感表單 */}
      <AddDealerForm
        visible={showAddForm}
        onClose={() => {
          setShowAddForm(false);
          resetAddForm();
        }}
      />
    </Modal>
  );
};

export default DealerModal;
