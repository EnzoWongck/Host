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
import { useNavigation } from '@react-navigation/native';
import Modal from './Modal';
import Button from './Button';

interface NewGameModalProps {
  visible: boolean;
  onClose: () => void;
}

const NewGameModal: React.FC<NewGameModalProps> = ({ visible, onClose }) => {
  const { theme, colorMode } = useTheme();
  const { createGame } = useGame();
  const navigation = useNavigation<any>();
  
  const [gameName, setGameName] = useState('');
  const [hosts, setHosts] = useState(['']);
  const [smallBlind, setSmallBlind] = useState(5);
  const [bigBlind, setBigBlind] = useState(10);
  const [smallBlindInput, setSmallBlindInput] = useState('5');
  const [bigBlindInput, setBigBlindInput] = useState('10');

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
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.md,
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
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
      color: '#FFFFFF',
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
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xs,
      backgroundColor: theme.colors.background,
    },
    createButtonContainer: {
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
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
      Alert.alert('錯誤', '請輸入牌局名稱');
      return;
    }

    const validHosts = hosts.filter(host => host.trim() !== '');
    if (validHosts.length === 0) {
      Alert.alert('錯誤', '請至少輸入一個 Host 名稱');
      return;
    }

    if (smallBlind < 5 || bigBlind < 5) {
      Alert.alert('錯誤', '盲注最小金額為 $5');
      return;
    }

    try {
      // 創建新牌局
      createGame({
        name: gameName.trim(),
        hosts: validHosts,
        smallBlind,
        bigBlind,
        startTime: new Date(),
        status: 'active',
      });

      // 重置表單
      setGameName('');
      setHosts(['']);
      setSmallBlind(5);
      setBigBlind(10);
      setSmallBlindInput('5');
      setBigBlindInput('10');

      // 關閉 Modal 並導向「目前牌局」
      onClose();
      navigation.navigate('Game');
    } catch (error) {
      Alert.alert('錯誤', '建立牌局時發生錯誤，請重試。');
    }
  };

  const resetForm = () => {
    setGameName('');
    setHosts(['']);
    setSmallBlind(5);
    setBigBlind(10);
    setSmallBlindInput('5');
    setBigBlindInput('10');
  };

  return (
    <Modal
      visible={visible}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="新增牌局"
    >
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 牌局名稱 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>牌局名稱</Text>
          <TextInput
            style={styles.input}
            value={gameName}
            onChangeText={setGameName}
            placeholder="輸入牌局名稱"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        {/* Host 名稱 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Host 名稱</Text>
          {hosts.map((host, index) => (
            <View key={index} style={styles.hostContainer}>
              <View style={styles.hostRow}>
                <TextInput
                  style={[styles.input, styles.hostInput]}
                  value={host}
                  onChangeText={(value) => updateHost(index, value)}
                  placeholder={`Host ${index + 1} 名稱`}
                  placeholderTextColor={theme.colors.textSecondary}
                />
                {hosts.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeHostButton}
                    onPress={() => removeHost(index)}
                    activeOpacity={1}
                  >
                    <Text style={styles.removeHostText}>移除</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.addHostButton} onPress={addHost} activeOpacity={1}>
            <Text style={styles.addHostText}>+ 新增 Host</Text>
          </TouchableOpacity>
        </View>

        {/* 小盲/大盲 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>小盲 / 大盲</Text>
          <View style={styles.blindsContainer}>
            <View style={styles.blindGroup}>
              <Text style={[styles.label, { textAlign: 'center' }]}>小盲</Text>
              <View style={styles.blindRow}>
                <TouchableOpacity
                  style={styles.blindButton}
                  onPress={() => adjustBlind('small', -5)}
                  activeOpacity={1}
                >
                  <Text style={styles.blindButtonText}>-</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.blindInput}
                  value={smallBlindInput}
                  onChangeText={(value) => handleBlindInputChange('small', value)}
                  onBlur={() => handleBlindInputBlur('small')}
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
              <Text style={[styles.label, { textAlign: 'center' }]}>大盲</Text>
              <View style={styles.blindRow}>
                <TouchableOpacity
                  style={styles.blindButton}
                  onPress={() => adjustBlind('big', -5)}
                  activeOpacity={1}
                >
                  <Text style={styles.blindButtonText}>-</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.blindInput}
                  value={bigBlindInput}
                  onChangeText={(value) => handleBlindInputChange('big', value)}
                  onBlur={() => handleBlindInputBlur('big')}
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

        {/* 建立按鈕 */}
        <View style={styles.createButtonContainer}>
          <Button
            title="建立牌局"
            onPress={handleCreateGame}
            size="lg"
          />
        </View>
      </ScrollView>
    </Modal>
  );
};

export default NewGameModal;
