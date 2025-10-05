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
import Modal from './Modal';
import Button from './Button';
import Icon from './Icon';
import { Dealer } from '../types/game';

interface DealerModalProps {
  visible: boolean;
  onClose: () => void;
}

const DealerModal: React.FC<DealerModalProps> = ({ visible, onClose }) => {
  const { theme, colorMode } = useTheme();
  const { state, addDealer, updateDealer } = useGame();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});
  const [dealerName, setDealerName] = useState('');
  const [tipShare, setTipShare] = useState<50 | 100>(50);
  const [hourlyRate, setHourlyRate] = useState('');
  const [workHours, setWorkHours] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const currentGame = state.currentGame;

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
  });

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  const calculateEstimatedSalary = (dealer: Dealer) => {
    // 薪金 = 小費合計 × 佔成 + 基本時薪 × 工時
    const tipPortion = dealer.totalTips * (dealer.tipShare / 100);
    const hourlyPortion = dealer.hourlyRate * dealer.workHours;
    return tipPortion + hourlyPortion;
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('zh-TW', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const handleAddDealer = () => {
    if (!currentGame) {
      Alert.alert('錯誤', '沒有進行中的牌局');
      return;
    }

    if (!dealerName.trim()) {
      Alert.alert('錯誤', '請輸入發牌員名稱');
      return;
    }

    const rate = parseFloat(hourlyRate);
    if (isNaN(rate) || rate < 0) {
      Alert.alert('錯誤', '請輸入有效的基本時薪');
      return;
    }

    const hours = parseFloat(workHours);
    if (isNaN(hours) || hours < 0) {
      Alert.alert('錯誤', '請輸入有效的工作時數');
      return;
    }

    const newDealer: Omit<Dealer, 'id' | 'totalTips' | 'estimatedSalary'> = {
      name: dealerName.trim(),
      tipShare,
      hourlyRate: rate,
      workHours: hours,
      startTime: startTime ? new Date(`2000-01-01 ${startTime}`) : undefined,
      endTime: endTime ? new Date(`2000-01-01 ${endTime}`) : undefined,
      status: 'working',
    };

    addDealer(currentGame.id, newDealer);

    Alert.alert('成功', `已新增發牌員：${dealerName.trim()}`);

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

    Alert.alert('成功', `${dealer.name} 狀態已更新為：${newStatus === 'working' ? '發牌中' : '已下班'}`);
  };

  const resetAddForm = () => {
    setDealerName('');
    setTipShare(50);
    setHourlyRate('');
    setWorkHours('');
    setStartTime('');
    setEndTime('');
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
            {item.status === 'working' ? '發牌中' : '已下班'}
          </Text>
        </TouchableOpacity>

        {isExpanded && (
          <>
            <View style={styles.dealerStats}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>工作時數：</Text>
                <Text style={styles.statValue}>{item.workHours} 小時</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>小費合計：</Text>
                <Text style={styles.statValue}>{formatCurrency(item.totalTips)}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>佔成比例：</Text>
                <Text style={styles.statValue}>{item.tipShare}%</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>基本時薪：</Text>
                <Text style={styles.statValue}>{formatCurrency(item.hourlyRate)}/小時</Text>
              </View>
            </View>

            <Text style={styles.estimatedSalary}>
              薪金預估：{formatCurrency(estimatedSalary)}
            </Text>

            <View style={styles.dealerActions}>
              <TouchableOpacity
                style={[styles.statusButton, styles.workingButton]}
                onPress={() => handleStatusChange(item, 'working')}
                disabled={item.status === 'working'}
                activeOpacity={1}
              >
                <Text style={styles.statusButtonText}>發牌中</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.statusButton, styles.offDutyButton]}
                onPress={() => handleStatusChange(item, 'off_duty')}
                disabled={item.status === 'off_duty'}
                activeOpacity={1}
              >
                <Text style={styles.statusButtonText}>已下班</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={showAddForm ? "新增發牌員" : "發牌員"}
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
                <Text style={styles.emptyText}>目前沒有發牌員</Text>
              </View>
            )}
          </>
        )}

        {/* 新增發牌員按鈕或表單 */}
        {!showAddForm ? (
          <TouchableOpacity
            style={styles.addDealerButton}
            onPress={() => setShowAddForm(true)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="dealer" size={34} style={{ marginRight: theme.spacing.sm }} />
              <Text style={styles.addDealerText}>+ 新增發牌員</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.addForm}>
            <Text style={styles.addFormTitle}>新增發牌員</Text>

            {/* 發牌員名稱 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>發牌員名稱</Text>
              <TextInput
                style={styles.input}
                value={dealerName}
                onChangeText={setDealerName}
                placeholder="輸入發牌員名稱"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            {/* 佔成選擇 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>小費佔成</Text>
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
              <Text style={styles.label}>基本時薪</Text>
              <TextInput
                style={styles.input}
                value={hourlyRate}
                onChangeText={setHourlyRate}
                placeholder="輸入基本時薪"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
              />
            </View>

            {/* 工作時數 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>工作時數</Text>
              <TextInput
                style={styles.input}
                value={workHours}
                onChangeText={setWorkHours}
                placeholder="輸入工作時數"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
              />
            </View>

            {/* 上下班時間 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>上下班時間（可選）</Text>
              <View style={styles.timeInputRow}>
                <View style={styles.timeInput}>
                  <TextInput
                    style={styles.input}
                    value={startTime}
                    onChangeText={setStartTime}
                    placeholder="上班時間"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>
                <View style={styles.timeInput}>
                  <TextInput
                    style={styles.input}
                    value={endTime}
                    onChangeText={setEndTime}
                    placeholder="下班時間"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>
              </View>
            </View>

            {/* 表單按鈕 */}
            <View style={styles.formActions}>
              <Button
                title="取消"
                onPress={() => {
                  resetAddForm();
                  setShowAddForm(false);
                }}
                variant="outline"
                style={styles.cancelButton}
              />
              <Button
                title="確定"
                onPress={handleAddDealer}
                style={styles.confirmButton}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </Modal>
  );
};

export default DealerModal;
