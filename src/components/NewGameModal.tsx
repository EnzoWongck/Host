import React, { useState, useEffect } from 'react';
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
import { useSubscription } from '../context/SubscriptionContext';
import { useNavigation } from '@react-navigation/native';
import Modal from './Modal';
import Button from './Button';

interface NewGameModalProps {
  visible: boolean;
  onClose: () => void;
}

const NewGameModal: React.FC<NewGameModalProps> = ({ visible, onClose }) => {
  const { theme, colorMode } = useTheme();
  const { t } = useLanguage();
  const { createGame, state } = useGame();
  const { canCreateNewGame } = useSubscription();
  const navigation = useNavigation<any>();
  
  const [gameName, setGameName] = useState('');
  const [hosts, setHosts] = useState(['']);
  const [hostRatios, setHostRatios] = useState<number[]>([1]); // 分成比例，默認每個 host 為 1
  const [smallBlind, setSmallBlind] = useState(5);
  const [bigBlind, setBigBlind] = useState(10);
  const [smallBlindInput, setSmallBlindInput] = useState('5');
  const [bigBlindInput, setBigBlindInput] = useState('10');
  const [gameMode, setGameMode] = useState<'rake' | 'noRake'>('rake'); // 預設抽水
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [pendingNavigation, setPendingNavigation] = useState(false);

  // 獲取螢幕尺寸
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
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
      maxHeight: isMobile ? screenHeight * 0.7 : 800, // 手機上使用螢幕高度的70%
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: theme.spacing.lg,
      paddingHorizontal: 0, // 移除水平 padding，讓內容可以使用自己的 padding
    },
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
      // 保留原有邊框顏色，但不改變背景，以維持「幾乎無視覺變化」
      borderColor: colorMode === 'light' ? '#E5E7EB' : theme.colors.primary,
      borderWidth: 1,
    },
    hostContainer: {
      marginBottom: theme.spacing.sm,
    },
    hostRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    hostInput: {
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    hostAddButton: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xs,
    },
    hostAddText: {
      fontSize: theme.fontSize.xxl, // 再放大與標題更接近
      fontWeight: '800',
      color: theme.colors.textSecondary,
    },
    hostRemoveButton: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      marginLeft: theme.spacing.xs,
    },
    hostRemoveText: {
      fontSize: theme.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.error, // 紅色「刪除」文字
    },
    blindsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    blindGroup: {
      flex: 1,
      marginHorizontal: theme.spacing.xs,
    },
    blindRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: theme.spacing.sm,
    },
    blindButton: {
      // 放大點擊區域，仍不使用背景色
      backgroundColor: 'transparent',
      width: 56,
      height: 56,
      justifyContent: 'center',
      alignItems: 'center',
    },
    blindButtonText: {
      // 使用主題灰色作為文字顏色，字級再放大一階
      color: theme.colors.textSecondary,
      fontSize: theme.fontSize.xxl,
      fontWeight: 'bold',
    },
    blindValue: {
      fontSize: theme.fontSize.lg,
      fontWeight: 'bold',
      color: theme.colors.text,
      minWidth: 60,
      textAlign: 'center',
    },
    blindInput: {
      fontSize: theme.fontSize.lg,
      fontWeight: 'bold',
      color: theme.colors.text,
      minWidth: 60,
      textAlign: 'center',
      borderWidth: 1,
      borderColor: colorMode === 'light' ? '#E5E7EB' : theme.colors.border,
      borderRadius: theme.borderRadius.sm,
    },
    blindInputFocused: {
      borderColor: colorMode === 'light' ? '#E2E8F0' : theme.colors.primary,
      borderWidth: 1,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xs,
      backgroundColor: colorMode === 'light' ? '#F8F9FA' : theme.colors.surface,
    },
    createButtonContainer: {
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    modeButtonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: theme.spacing.lg,
    },
    modeButton: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 2,
      borderColor: theme.colors.border,
      alignItems: 'center',
      marginHorizontal: theme.spacing.xs,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: colorMode === 'light' ? 0.08 : 0.15,
      shadowRadius: 12,
      elevation: 6,
    },
    activeMode: {
      borderColor: colorMode === 'light' ? theme.colors.primary : theme.colors.textSecondary,
      backgroundColor: theme.colors.primary + '10',
    },
    activeText: {
      color: colorMode === 'light' ? '#64748B' : theme.colors.textSecondary,
      fontWeight: '600',
      fontSize: theme.fontSize.md,
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
    // 只允許數字輸入
    const numericValue = value.replace(/[^0-9]/g, '');
    
    if (type === 'small') {
      setSmallBlindInput(numericValue);
      const numValue = parseInt(numericValue) || 0;
      if (numValue >= 5) {
        setSmallBlind(numValue);
      }
    } else {
      setBigBlindInput(numericValue);
      const numValue = parseInt(numericValue) || 0;
      if (numValue >= 5) {
        setBigBlind(numValue);
      }
    }
  };

  const handleBlindInputBlur = (type: 'small' | 'big') => {
    if (type === 'small') {
      const numValue = parseInt(smallBlindInput) || 5;
      const validValue = Math.max(5, numValue);
      setSmallBlind(validValue);
      setSmallBlindInput(validValue.toString());
    } else {
      const numValue = parseInt(bigBlindInput) || 5;
      const validValue = Math.max(5, numValue);
      setBigBlind(validValue);
      setBigBlindInput(validValue.toString());
    }
  };

  const handleCreateGame = () => {
    // 檢查是否可以新增牌局
    if (!canCreateNewGame(state.games)) {
      Alert.alert(
        t('common.error') || '錯誤',
        '你現可免費記錄 1 個牌局；超過 24 小時或結束牌局後，需先完成訂閱。',
        [{ text: '確定' }]
      );
      return;
    }

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
      
      // 創建新牌局
      const gameId = Date.now().toString();
      createGame({
        name: gameName.trim(),
        hosts: hostObjects,
        smallBlind,
        bigBlind,
        startTime: new Date(),
        status: 'active',
        gameMode,
      });

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

  return (
    <Modal
      visible={visible}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title={t('modals.newGame')}
      maxWidth={isMobile ? screenWidth - 32 : 800} // 手機上留出左右各16px的間距
      maxHeight={isMobile ? screenHeight * 0.85 : Math.min(screenHeight * 0.85, 700)} // 限制最大高度，確保視窗不會超出螢幕
      containerStyle={isMobile ? { width: screenWidth - 32, maxWidth: screenWidth - 32 } : undefined}
    >
      <View style={styles.scrollContent} data-new-game-modal-content>
        {/* 牌局名稱 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('newGame.gameName')}</Text>
          <TextInput
            style={[styles.input, focusedInput === 'gameName' && styles.inputFocused]}
            value={gameName}
            onChangeText={setGameName}
            placeholder={t('newGame.gameNamePlaceholder')}
            placeholderTextColor={
              focusedInput === 'gameName'
                ? 'transparent'
                : theme.colors.textSecondary
            }
            onFocus={() => setFocusedInput('gameName')}
            onBlur={() => setFocusedInput(null)}
          />
        </View>

        {/* Host */}
        <View style={styles.inputGroup}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.label}>Host</Text>
            <TouchableOpacity
              onPress={addHost}
              activeOpacity={0.7}
              style={styles.hostAddButton}
            >
              <Text style={styles.hostAddText}>+</Text>
            </TouchableOpacity>
          </View>
          {hosts.map((host, index) => (
            <View key={index} style={styles.hostContainer}>
              <View style={styles.hostRow}>
                <TextInput
                  style={[styles.input, styles.hostInput, focusedInput === `host-${index}` && styles.inputFocused]}
                  value={host}
                  onChangeText={(value) => updateHost(index, value)}
                  placeholder={t('newGame.hostNamePlaceholder').replace('{index}', String(index + 1))}
                  placeholderTextColor={
                    focusedInput === `host-${index}`
                      ? 'transparent'
                      : theme.colors.textSecondary
                  }
                  onFocus={() => setFocusedInput(`host-${index}`)}
                  onBlur={() => setFocusedInput(null)}
                />
                {hosts.length > 1 && (
                  <>
                    <TextInput
                      style={[styles.input, { width: 80, marginRight: theme.spacing.sm }, focusedInput === `ratio-${index}` && styles.inputFocused]}
                      value={hostRatios[index] === 0 ? '' : (hostRatios[index]?.toString() || '')}
                      onChangeText={(value) => updateHostRatio(index, value)}
                      placeholder="比例"
                      placeholderTextColor={
                        focusedInput === `ratio-${index}`
                          ? 'transparent'
                          : theme.colors.textSecondary
                      }
                      onFocus={() => setFocusedInput(`ratio-${index}`)}
                      onBlur={() => setFocusedInput(null)}
                      keyboardType="numeric"
                      inputMode="decimal"
                      {...(Platform.OS === 'web' ? { pattern: '[0-9]*' } : {})}
                    />
                    <TouchableOpacity
                      onPress={() => removeHost(index)}
                      activeOpacity={0.7}
                      style={styles.hostRemoveButton}
                    >
                      <Text style={styles.hostRemoveText}>{t('newGame.removeHost') || '刪除'}</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
              {hosts.length > 1 && (
                <Text style={{ fontSize: theme.fontSize.xs, color: theme.colors.textSecondary, marginTop: theme.spacing.xs, marginLeft: theme.spacing.sm }}>
                  可在牌局設定調整
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* 小盲/大盲 */}
        <View style={styles.inputGroup}>
          <View style={styles.blindsContainer}>
            <View style={styles.blindGroup}>
              <Text style={[styles.label, { textAlign: 'center' }]}>{t('newGame.smallBlind')}</Text>
              <View style={styles.blindRow}>
                <TouchableOpacity
                  style={styles.blindButton}
                  onPress={() => adjustBlind('small', -5)}
                  activeOpacity={1}
                >
                  <Text style={styles.blindButtonText}>-</Text>
                </TouchableOpacity>
                <TextInput
                  style={[styles.blindInput, focusedInput === 'smallBlind' && styles.blindInputFocused]}
                  value={smallBlindInput}
                  onChangeText={(value) => handleBlindInputChange('small', value)}
                  onBlur={() => {
                    handleBlindInputBlur('small');
                    setFocusedInput(null);
                  }}
                  onFocus={() => setFocusedInput('smallBlind')}
                  keyboardType="numeric"
                  inputMode="decimal"
                  {...(Platform.OS === 'web' ? { pattern: '[0-9]*' } : {})}
                  selectTextOnFocus
                />
                <TouchableOpacity
                  style={styles.blindButton}
                  onPress={() => adjustBlind('small', 5)}
                  activeOpacity={1}
                >
                  <Text style={styles.blindButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.blindGroup}>
              <Text style={[styles.label, { textAlign: 'center' }]}>{t('newGame.bigBlind')}</Text>
              <View style={styles.blindRow}>
                <TouchableOpacity
                  style={styles.blindButton}
                  onPress={() => adjustBlind('big', -5)}
                  activeOpacity={1}
                >
                  <Text style={styles.blindButtonText}>-</Text>
                </TouchableOpacity>
                <TextInput
                  style={[styles.blindInput, focusedInput === 'bigBlind' && styles.blindInputFocused]}
                  value={bigBlindInput}
                  onChangeText={(value) => handleBlindInputChange('big', value)}
                  onBlur={() => {
                    handleBlindInputBlur('big');
                    setFocusedInput(null);
                  }}
                  onFocus={() => setFocusedInput('bigBlind')}
                  keyboardType="numeric"
                  inputMode="decimal"
                  {...(Platform.OS === 'web' ? { pattern: '[0-9]*' } : {})}
                  selectTextOnFocus
                />
                <TouchableOpacity
                  style={styles.blindButton}
                  onPress={() => adjustBlind('big', 5)}
                  activeOpacity={1}
                >
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
            <Text style={gameMode === 'rake' ? styles.activeText : styles.inactiveText}>
              {t('newGame.rakeMode')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setGameMode('noRake')} 
            style={[styles.modeButton, gameMode === 'noRake' && styles.activeMode]}
            activeOpacity={0.7}
          >
            <Text style={gameMode === 'noRake' ? styles.activeText : styles.inactiveText}>
              {t('newGame.noRakeMode')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 抽水 / 入場費模式說明（僅保留說明文字，移除重複標題） */}
        {gameMode === 'rake' && (
          <View style={styles.inputGroup}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.sm }}>
              {t('newGame.rakeModeDescription')}
            </Text>
          </View>
        )}

        {gameMode === 'noRake' && (
          <View style={styles.inputGroup}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.sm }}>
              {t('newGame.noRakeModeDescription')}
            </Text>
          </View>
        )}

        {/* 建立按鈕 */}
        <View style={styles.createButtonContainer}>
          <Button
            title={t('newGame.createGame')}
            onPress={handleCreateGame}
            size="lg"
          />
        </View>
      </View>
    </Modal>
  );
};

export default NewGameModal;
