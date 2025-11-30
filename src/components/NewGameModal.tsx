import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
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
  const { createGame } = useGame();
  const navigation = useNavigation<any>();
  
  const [gameName, setGameName] = useState('');
  const [hosts, setHosts] = useState(['']);
  const [smallBlind, setSmallBlind] = useState(5);
  const [bigBlind, setBigBlind] = useState(10);
  const [smallBlindInput, setSmallBlindInput] = useState('5');
  const [bigBlindInput, setBigBlindInput] = useState('10');
  const [gameMode, setGameMode] = useState<'rake' | 'noRake'>('rake'); // 預設抽水
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const styles = StyleSheet.create({
    scrollContainer: {
      maxHeight: 800,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: theme.spacing.lg,
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
      backgroundColor: colorMode === 'light' ? '#F8F9FA' : theme.colors.background,
    },
    inputFocused: {
      borderColor: colorMode === 'light' ? '#E2E8F0' : theme.colors.primary,
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
    removeHostButton: {
      backgroundColor: theme.colors.error,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
    },
    removeHostText: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    addHostButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.sm,
      alignItems: 'center',
      marginTop: theme.spacing.sm,
    },
    addHostText: {
      color: '#64748B',
      fontWeight: '600',
      fontSize: theme.fontSize.md,
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
      backgroundColor: theme.colors.primary,
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    blindButtonText: {
      color: '#FFFFFF',
      fontSize: theme.fontSize.lg,
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
      backgroundColor: colorMode === 'light' ? '#F8F9FA' : theme.colors.background,
    },
    createButtonContainer: {
      marginTop: theme.spacing.xl,
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
      borderColor: theme.colors.primary,
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
  };

  const removeHost = (index: number) => {
    if (hosts.length > 1) {
      const newHosts = hosts.filter((_, i) => i !== index);
      setHosts(newHosts);
    }
  };

  const updateHost = (index: number, value: string) => {
    const newHosts = [...hosts];
    newHosts[index] = value;
    setHosts(newHosts);
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
      const equalShare = validHosts.length > 0 ? 1 / validHosts.length : 0;
      const hostObjects: Host[] = validHosts.map(name => ({
        name,
        cost: 0,
        dealerSalary: 0,
        totalCashOut: 0,
        shareRatio: equalShare,
        transferAmount: 0,
      }));
      
      // 創建新牌局
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
      setSmallBlind(5);
      setBigBlind(10);
      setSmallBlindInput('5');
      setBigBlindInput('10');
      setGameMode('rake');

      // 關閉 Modal 並導向「目前牌局」
      onClose();
      navigation.navigate('Game');
    } catch (error) {
      Alert.alert(t('common.error') || '錯誤', t('newGame.errorCreateFailed'));
    }
  };

  const resetForm = () => {
    setGameName('');
    setHosts(['']);
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
    >
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 牌局名稱 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('newGame.gameName')}</Text>
          <TextInput
            style={[styles.input, focusedInput === 'gameName' && styles.inputFocused]}
            value={gameName}
            onChangeText={setGameName}
            placeholder={t('newGame.gameNamePlaceholder')}
            placeholderTextColor={theme.colors.textSecondary}
            onFocus={() => setFocusedInput('gameName')}
            onBlur={() => setFocusedInput(null)}
          />
        </View>

        {/* Host 名稱 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('newGame.hostName')}</Text>
          {hosts.map((host, index) => (
            <View key={index} style={styles.hostContainer}>
              <View style={styles.hostRow}>
                <TextInput
                  style={[styles.input, styles.hostInput, focusedInput === `host-${index}` && styles.inputFocused]}
                  value={host}
                  onChangeText={(value) => updateHost(index, value)}
                  placeholder={t('newGame.hostNamePlaceholder').replace('{index}', String(index + 1))}
                  placeholderTextColor={theme.colors.textSecondary}
                  onFocus={() => setFocusedInput(`host-${index}`)}
                  onBlur={() => setFocusedInput(null)}
                />
                {hosts.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeHostButton}
                    onPress={() => removeHost(index)}
                    activeOpacity={1}
                  >
                    <Text style={styles.removeHostText}>{t('newGame.removeHost')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.addHostButton} onPress={addHost} activeOpacity={1}>
            <Text style={styles.addHostText}>{t('newGame.addHost')}</Text>
          </TouchableOpacity>
        </View>

        {/* 小盲/大盲 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('summary.blinds')}</Text>
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

        {/* 抽水模式說明 */}
        {gameMode === 'rake' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('newGame.rakeMode')}</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.sm }}>
              {t('newGame.rakeModeDescription')}
            </Text>
          </View>
        )}

        {/* 入場費模式說明 */}
        {gameMode === 'noRake' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('newGame.noRakeMode')}</Text>
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
      </ScrollView>
    </Modal>
  );
};

export default NewGameModal;
