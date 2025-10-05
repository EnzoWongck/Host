import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useCollaboration } from '../context/CollaborationContext';
import Icon from './Icon';

interface CollaborationIndicatorProps {
  onPress?: () => void;
}

const CollaborationIndicator: React.FC<CollaborationIndicatorProps> = ({ onPress }) => {
  const theme = useTheme();
  const { state } = useCollaboration();

  const getStatusColor = () => {
    switch (state.connectionStatus) {
      case 'connected':
        return theme.colors.success;
      case 'connecting':
        return theme.colors.warning;
      case 'disconnected':
        return theme.colors.text + '60';
      case 'error':
        return theme.colors.error;
      default:
        return theme.colors.text + '60';
    }
  };

  const getStatusText = () => {
    switch (state.connectionStatus) {
      case 'connected':
        return `協作中 (${state.activeUsers.length + 1}人)`;
      case 'connecting':
        return '連接中...';
      case 'disconnected':
        return '離線';
      case 'error':
        return '連接錯誤';
      default:
        return '未知狀態';
    }
  };

  const getStatusIcon = () => {
    switch (state.connectionStatus) {
      case 'connected':
        return 'wifi';
      case 'connecting':
        return 'refresh';
      case 'disconnected':
        return 'wifi-off';
      case 'error':
        return 'alert-circle';
      default:
        return 'help-circle';
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      activeOpacity={1}
    >
      <View style={styles.content}>
        <View style={styles.statusRow}>
          <Icon 
            name={getStatusIcon()} 
            size={16} 
            color={getStatusColor()}
            style={styles.statusIcon}
          />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>
        
        {state.lastSyncTime && (
          <Text style={[styles.syncTime, { color: theme.colors.text + '80' }]}>
            同步: {new Date(state.lastSyncTime).toLocaleTimeString('zh-TW', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        )}
        
        {state.activeUsers.length > 0 && (
          <View style={styles.activeUsers}>
            <Text style={[styles.activeUsersText, { color: theme.colors.text + '80' }]}>
              在線用戶: {state.activeUsers.join(', ')}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  content: {
    flexDirection: 'column',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: theme.spacing.xs,
  },
  statusText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  syncTime: {
    fontSize: theme.fontSize.xs,
    marginTop: theme.spacing.xs,
  },
  activeUsers: {
    marginTop: theme.spacing.xs,
  },
  activeUsersText: {
    fontSize: theme.fontSize.xs,
  },
});

export default CollaborationIndicator;





