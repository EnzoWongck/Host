import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { useChips } from '../context/ChipsContext';
import { useNavigation } from '@react-navigation/native';
import Modal from './Modal';
import Button from './Button';

// 獲取初始螢幕尺寸（避免鍵盤彈出時重新計算）
const INITIAL_SCREEN_WIDTH = Dimensions.get('window').width;
const INITIAL_SCREEN_HEIGHT = Dimensions.get('window').height;

interface NewGameModalProps {
  visible: boolean;
  onClose: () => void;
}

const NewGameModal: React.FC<NewGameModalProps> = ({ visible, onClose }) => {
  const { theme, colorMode } = useTheme();
  const { t } = useLanguage();
  const { createGame, state, deleteGame } = useGame();
  const { chips, consumeChip, loadChipsBalance, openPurchaseModal } = useChips();
  const navigation = useNavigation<any>();
  
  const [gameName, setGameName] = useState('');
  const [hosts, setHosts] = useState(['']);
  const [hostRatios, setHostRatios] = useState<number[]>([1]); // 分成比例，默認每個 host 為 1
  const [smallBlind, setSmallBlind] = useState(5);
  const [bigBlind, setBigBlind] = useState(10);
  const [smallBlindInput, setSmallBlindInput] = useState('5');
  const [bigBlindInput, setBigBlindInput] = useState('10');
  const [gameMode, setGameMode] = useState<'rake' | 'noRake'>('rake'); // 預設抽水
  const [pendingNavigation, setPendingNavigation] = useState(false);

  // 使用固定的螢幕尺寸，避免鍵盤彈出時重新計算
  const screenWidth = INITIAL_SCREEN_WIDTH;
  const screenHeight = INITIAL_SCREEN_HEIGHT;
  const isMobile = screenWidth < 768; // 判斷是否為手機

  // 監聽 state 變化，當有新遊戲創建時自動導航
  useEffect(() => {
    if (pendingNavigation && state.currentGame) {
      setPendingNavigation(false);
      // 使用 setTimeout 確保在下一幀導航
      setTimeout(() => {
        navigation.navigate('Game');
      }, 50);
    }
  }, [pendingNavigation, state.currentGame, navigation]);

  const styles = StyleSheet.create({
    scrollContainer: {
      maxHeight: isMobile ? screenHeight * 0.7 : 800,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: theme.spacing.md,
      paddingHorizontal: 0,
    },
    inputGroup: {
      marginBottom: theme.spacing.md,
    },
    // 標題區域：牌局名稱輸入欄
    titleInput: {
      width: 140,
      borderWidth: 1,
      borderColor: colorMode === 'light' ? '#E5E7EB' : theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      paddingVertical: 6,
      paddingHorizontal: theme.spacing.sm,
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      backgroundColor: colorMode === 'light' ? '#F8F9FA' : theme.colors.surface,
      marginLeft: -theme.spacing.xs, // 向左移動對齊下方輸入欄
    },
    // 百分比輸入欄容器（包含輸入欄和%符號）
    percentInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colorMode === 'light' ? '#E5E7EB' : theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: colorMode === 'light' ? '#F8F9FA' : theme.colors.surface,
      marginLeft: theme.spacing.sm,
      paddingRight: 8,
    },
    percentInput: {
      width: 50,
      paddingVertical: 6,
      paddingHorizontal: 8,
      fontSize: 16,
      color: theme.colors.text,
      textAlign: 'center',
    },
    percentSymbol: {
      color: theme.colors.textSecondary,
      fontSize: 14,
    },
    // 同一行佈局：標籤 + 輸入欄
    inlineRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    inlineLabel: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
      width: 70,
    },
    inlineInput: {
      flex: 1,
      maxWidth: 180,
      borderWidth: 1,
      borderColor: colorMode === 'light' ? '#E5E7EB' : theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      paddingVertical: 8,
      paddingHorizontal: theme.spacing.sm,
      fontSize: 16,
      color: theme.colors.text,
      backgroundColor: colorMode === 'light' ? '#F8F9FA' : theme.colors.surface,
    },
    label: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    input: {
      borderWidth: 1,
      borderColor: colorMode === 'light' ? '#E5E7EB' : theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      paddingVertical: 8,
      paddingHorizontal: theme.spacing.sm,
      fontSize: 16,
      color: theme.colors.text,
      backgroundColor: colorMode === 'light' ? '#F8F9FA' : theme.colors.surface,
    },
    hostContainer: {
      marginBottom: 4,
    },
    hostRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    hostInput: {
      flex: 1,
      marginRight: theme.spacing.xs,
    },
    hostAddButton: {
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
    },
    hostAddText: {
      fontSize: theme.fontSize.xl,
      fontWeight: '700',
      color: '#0891B2', // 湖水綠
    },
    hostRemoveButton: {
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
    },
    hostRemoveText: {
      fontSize: theme.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.error,
    },
    blindsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    blindGroup: {
      flex: 1,
      marginHorizontal: 2,
    },
    blindRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 4,
    },
    blindButton: {
      backgroundColor: 'transparent',
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    blindButtonText: {
      color: theme.colors.textSecondary,
      fontSize: theme.fontSize.xl,
      fontWeight: 'bold',
    },
    blindValue: {
      fontSize: theme.fontSize.md,
      fontWeight: 'bold',
      color: theme.colors.text,
      minWidth: 50,
      textAlign: 'center',
    },
    blindInput: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
      minWidth: 50,
      textAlign: 'center',
      borderWidth: 1,
      borderColor: colorMode === 'light' ? '#E5E7EB' : theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      paddingVertical: 6,
      paddingHorizontal: 4,
      backgroundColor: colorMode === 'light' ? '#F8F9FA' : theme.colors.surface,
    },
    createButtonContainer: {
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.md,
    },
    modeButtonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: theme.spacing.sm,
    },
    modeButton: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      alignItems: 'center',
      marginHorizontal: 4,
    },
    activeMode: {
      borderColor: '#0891B2', // 湖水綠
      backgroundColor: 'rgba(8, 145, 178, 0.1)',
    },
    modeText: {
      color: colorMode === 'light' ? '#64748B' : theme.colors.text,
      fontWeight: '500',
      fontSize: theme.fontSize.sm,
    },
    activeText: {
      color: theme.colors.text,
      fontWeight: '600',
      fontSize: theme.fontSize.sm,
    },
    inactiveText: {
      color: colorMode === 'light' ? theme.colors.primary : theme.colors.text,
      fontWeight: '500',
      fontSize: theme.fontSize.md,
    },
    entryFeeContainer: {
      marginTop: theme.spacing.md,
    },
    entryFeeTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    entryFeeModeContainer: {
      flexDirection: 'row',
      marginBottom: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    entryFeeTab: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      marginRight: theme.spacing.md,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeTab: {
      borderBottomColor: theme.colors.primary,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    inactiveTab: {
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
  });

  const addHost = () => {
    setHosts([...hosts, '']);
    setHostRatios([...hostRatios, 1]);
  };

  const removeHost = (index: number) => {
    if (hosts.length > 1) {
      const newHosts = hosts.filter((_, i) => i !== index);
      const newRatios = hostRatios.filter((_, i) => i !== index);
      setHosts(newHosts);
      setHostRatios(newRatios);
    }
  };

  const updateHost = (index: number, value: string) => {
    const newHosts = [...hosts];
    newHosts[index] = value;
    setHosts(newHosts);
  };

  const updateHostRatio = (index: number, value: string) => {
    // 允許刪除"0"，空值時設為0
    if (value === '' || value === '0') {
      const newRatios = [...hostRatios];
      newRatios[index] = 0;
      setHostRatios(newRatios);
      return;
    }
    const numericValue = value.replace(/[^0-9.]/g, '');
    const numValue = parseFloat(numericValue) || 0;
    const newRatios = [...hostRatios];
    newRatios[index] = numValue;
    setHostRatios(newRatios);
  };

  const adjustBlind = (type: 'small' | 'big', delta: number) => {
    if (type === 'small') {
      const newValue = Math.max(5, smallBlind + delta);
      setSmallBlind(newValue);
      setSmallBlindInput(newValue.toString());
    } else {
      const newValue = Math.max(5, bigBlind + delta);
      setBigBlind(newValue);
      setBigBlindInput(newValue.toString());
    }
  };

  const handleBlindInputChange = (type: 'small' | 'big', value: string) => {
    // 只允許數字輸入，可以輸入任何數字
    const numericValue = value.replace(/[^0-9]/g, '');
    
    if (type === 'small') {
      setSmallBlindInput(numericValue);
      const numValue = parseInt(numericValue) || 0;
      setSmallBlind(numValue);
    } else {
      setBigBlindInput(numericValue);
      const numValue = parseInt(numericValue) || 0;
      setBigBlind(numValue);
    }
  };

  const handleBlindInputBlur = (type: 'small' | 'big') => {
    // 允許任何正整數，空值默認為 0
    if (type === 'small') {
      const numValue = parseInt(smallBlindInput) || 0;
      const validValue = Math.max(0, numValue);
      setSmallBlind(validValue);
      setSmallBlindInput(validValue.toString());
    } else {
      const numValue = parseInt(bigBlindInput) || 0;
      const validValue = Math.max(0, numValue);
      setBigBlind(validValue);
      setBigBlindInput(validValue.toString());
    }
  };

  const handleCreateGame = async () => {
    console.log('開始創建牌局，當前 chips:', chips);
    console.log('consumeChip 函數:', typeof consumeChip);
    console.log('loadChipsBalance 函數:', typeof loadChipsBalance);
    
    // 驗證輸入
    if (!gameName.trim()) {
      Alert.alert(t('common.error') || '錯誤', t('newGame.errorNameRequired'));
      return;
    }

    const validHosts = hosts.filter(host => host.trim() !== '');
    if (validHosts.length === 0) {
      Alert.alert(t('common.error') || '錯誤', t('newGame.errorHostRequired'));
      return;
    }

    if (smallBlind < 5 || bigBlind < 5) {
      Alert.alert(t('common.error') || '錯誤', t('newGame.errorBlindMin'));
      return;
    }

    try {
      // 創建 Host 對象
      // 如果只有一個 host，不需要檢查比例（自動為 100%）
      // 計算總比例（僅當有多個 host 時）
      let totalRatio = 0;
      if (validHosts.length > 1) {
        totalRatio = validHosts.reduce((sum, _, index) => {
          const hostIndex = hosts.findIndex((h, i) => h.trim() === validHosts[index]);
          return sum + (hostRatios[hostIndex] || 0);
        }, 0);
        
        // 驗證總比例必須為100%（僅當有多個 host 時）
        if (Math.abs(totalRatio - 100) > 0.1) {
          Alert.alert(t('common.error') || '錯誤', `總分成比例必須為 100%，目前為 ${totalRatio.toFixed(1)}%`);
          return;
        }
      } else {
        // 只有一個 host 時，總比例為 100
        totalRatio = 100;
      }
      
      // 如果總比例為0，使用平均分配
      const normalizedRatio = totalRatio > 0 ? totalRatio : validHosts.length * 100;
      
      const hostObjects: Host[] = validHosts.map((name, index) => {
        const hostIndex = hosts.findIndex((h, i) => h.trim() === name);
        let shareRatio: number;
        
        if (validHosts.length === 1) {
          // 只有一個 host 時，shareRatio 為 1（100%）
          shareRatio = 1;
        } else {
          // 多個 host 時，計算比例
          const ratio = hostRatios[hostIndex] || 1;
          shareRatio = totalRatio > 0 ? (ratio / normalizedRatio) : 1 / validHosts.length;
        }
        
        return {
          name,
          cost: 0,
          dealerSalary: 0,
          totalCashOut: 0,
          shareRatio,
          transferAmount: 0,
        };
      });
      
      // 檢查 chips 餘額
      if (chips < 1) {
        Alert.alert(
          'Chips 不足',
          '創建新牌局需要消耗 1 Chip，請先購買 Chips。',
          [
            { text: '取消', style: 'cancel' },
            { 
              text: '購買 Chips', 
              onPress: () => {
                onClose();
                openPurchaseModal();
              }
            }
          ]
        );
        return;
      }
      
      // 創建新牌局
      const gameId = await createGame({
        name: gameName.trim(),
        hosts: hostObjects,
        smallBlind,
        bigBlind,
        startTime: new Date(),
        status: 'active',
        gameMode,
      });

      if (!gameId) {
        Alert.alert('錯誤', '創建牌局失敗，請稍後再試');
        return;
      }

      // 消耗 1 chip
      console.log('開始消耗 chip，gameId:', gameId);
      if (!consumeChip) {
        console.error('consumeChip 函數未定義');
        Alert.alert('錯誤', '無法消耗 Chip，請刷新頁面後重試。');
        // 刪除已創建的牌局
        try {
          await deleteGame(gameId);
        } catch (deleteError) {
          console.error('回滾牌局創建失敗:', deleteError);
        }
        return;
      }
      
      const success = await consumeChip(gameId, 'new_game');
      console.log('消耗 chip 結果:', success);
      if (!success) {
        // 如果消耗 chip 失敗，刪除已創建的牌局（回滾）
        try {
          await deleteGame(gameId);
          console.log('已回滾牌局創建，因為消耗 Chip 失敗');
        } catch (deleteError) {
          console.error('回滾牌局創建失敗:', deleteError);
        }
        
        Alert.alert(
          '錯誤', 
          '消耗 Chip 失敗，牌局已取消創建。請檢查您的 Chips 餘額或稍後再試。',
          [{ text: '確定' }]
        );
        return;
      }

      // 刷新 chips 餘額
      await loadChipsBalance();

      // 重置表單
      setGameName('');
      setHosts(['']);
      setHostRatios([1]);
      setSmallBlind(5);
      setBigBlind(10);
      setSmallBlindInput('5');
      setBigBlindInput('10');
      setGameMode('rake');

      // 關閉 Modal
      onClose();
      
      // 設置導航標記，等待 state 更新
      setPendingNavigation(true);
    } catch (error) {
      Alert.alert(t('common.error') || '錯誤', t('newGame.errorCreateFailed'));
    }
  };

  const resetForm = () => {
    setGameName('');
    setHosts(['']);
    setHostRatios([1]);
    setSmallBlind(5);
    setBigBlind(10);
    setSmallBlindInput('5');
    setBigBlindInput('10');
    setGameMode('rake');
  };

  // 自定義標題：牌局名稱輸入欄（對齊下方 Host 輸入欄）
  const customTitle = (
    <View style={{ flexDirection: 'row', flex: 1 }}>
      <TextInput
        style={styles.titleInput}
        value={gameName}
        onChangeText={setGameName}
        placeholder={t('newGame.gameNamePlaceholder')}
        placeholderTextColor={theme.colors.textSecondary}
      />
    </View>
  );

  return (
    <Modal
      visible={visible}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title={customTitle}
      maxWidth={isMobile ? screenWidth - 32 : 500}
      maxHeight={isMobile ? screenHeight * 0.7 : Math.min(screenHeight * 0.8, 600)}
      containerStyle={isMobile ? { width: screenWidth - 32, maxWidth: screenWidth - 32 } : { width: 500 }}
    >
      <View style={styles.scrollContent} data-new-game-modal-content>
        {/* Host 區域標題 + 右上角「+」 */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xs }}>
          <Text style={styles.label}>Host</Text>
          <TouchableOpacity onPress={addHost} activeOpacity={0.7} style={styles.hostAddButton}>
            <Text style={styles.hostAddText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Host 列表 */}
        <View style={[styles.inputGroup, { marginTop: 0 }]}>
          {hosts.map((host, index) => (
            <View key={index} style={styles.hostContainer}>
              <View style={styles.inlineRow}>
                {hosts.length > 1 && (
                  <Text style={[styles.inlineLabel, { width: 30 }]}>{index + 1}</Text>
                )}
                <TextInput
                  style={[styles.inlineInput, { maxWidth: 140 }]}
                  value={host}
                  onChangeText={(value) => updateHost(index, value)}
                  placeholder={t('newGame.hostNamePlaceholder').replace('{index}', String(index + 1))}
                  placeholderTextColor={theme.colors.textSecondary}
                />
                {hosts.length > 1 && (
                  <>
                    <View style={styles.percentInputContainer}>
                      <TextInput
                        style={styles.percentInput}
                        value={hostRatios[index] === 0 ? '' : (hostRatios[index]?.toString() || '')}
                        onChangeText={(value) => updateHostRatio(index, value)}
                        placeholder="1"
                        placeholderTextColor={theme.colors.textSecondary}
                        keyboardType="numeric"
                        inputMode="decimal"
                        {...(Platform.OS === 'web' ? { pattern: '[0-9]*' } : {})}
                      />
                      <Text style={styles.percentSymbol}>%</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeHost(index)}
                      activeOpacity={0.7}
                      style={styles.hostRemoveButton}
                    >
                      <Text style={styles.hostRemoveText}>✕</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* 小盲/大盲 - 更緊湊 */}
        <View style={[styles.inputGroup, { marginBottom: theme.spacing.sm }]}>
          <View style={styles.blindsContainer}>
            <View style={styles.blindGroup}>
              <Text style={[styles.label, { textAlign: 'center', fontSize: theme.fontSize.sm }]}>{t('newGame.smallBlind')}</Text>
              <View style={styles.blindRow}>
                <TouchableOpacity style={styles.blindButton} onPress={() => adjustBlind('small', -5)} activeOpacity={0.7}>
                  <Text style={styles.blindButtonText}>-</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.blindInput}
                  value={smallBlindInput}
                  onChangeText={(value) => handleBlindInputChange('small', value)}
                  onBlur={() => handleBlindInputBlur('small')}
                  keyboardType="numeric"
                  inputMode="decimal"
                  {...(Platform.OS === 'web' ? { pattern: '[0-9]*' } : {})}
                  selectTextOnFocus
                />
                <TouchableOpacity style={styles.blindButton} onPress={() => adjustBlind('small', 5)} activeOpacity={0.7}>
                  <Text style={styles.blindButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.blindGroup}>
              <Text style={[styles.label, { textAlign: 'center', fontSize: theme.fontSize.sm }]}>{t('newGame.bigBlind')}</Text>
              <View style={styles.blindRow}>
                <TouchableOpacity style={styles.blindButton} onPress={() => adjustBlind('big', -5)} activeOpacity={0.7}>
                  <Text style={styles.blindButtonText}>-</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.blindInput}
                  value={bigBlindInput}
                  onChangeText={(value) => handleBlindInputChange('big', value)}
                  onBlur={() => handleBlindInputBlur('big')}
                  keyboardType="numeric"
                  inputMode="decimal"
                  {...(Platform.OS === 'web' ? { pattern: '[0-9]*' } : {})}
                  selectTextOnFocus
                />
                <TouchableOpacity style={styles.blindButton} onPress={() => adjustBlind('big', 5)} activeOpacity={0.7}>
                  <Text style={styles.blindButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* 遊戲模式選擇 */}
        <View style={styles.modeButtonContainer}>
          <TouchableOpacity 
            onPress={() => setGameMode('rake')} 
            style={[styles.modeButton, gameMode === 'rake' && styles.activeMode]}
            activeOpacity={0.7}
          >
            <Text style={styles.modeText}>
              {t('newGame.rakeMode')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setGameMode('noRake')} 
            style={[styles.modeButton, gameMode === 'noRake' && styles.activeMode]}
            activeOpacity={0.7}
          >
            <Text style={styles.modeText}>
              {t('newGame.noRakeMode')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 抽水 / 入場費模式說明 */}
        <View style={{ marginBottom: theme.spacing.sm }}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.xs, textAlign: 'center' }}>
            {gameMode === 'rake' ? t('newGame.rakeModeDescription') : t('newGame.noRakeModeDescription')}
          </Text>
        </View>

        {/* 建立按鈕 */}
        <View style={styles.createButtonContainer}>
          <Button
            title={t('newGame.createGame')}
            onPress={handleCreateGame}
            size="md"
          />
        </View>
      </View>
    </Modal>
  );
};

export default NewGameModal;
