import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useCollaboration } from '../context/CollaborationContext';
import Icon from './Icon';

interface CollaborationButtonProps {
  onPress?: () => void;
  gameId?: string;
}

const CollaborationButton: React.FC<CollaborationButtonProps> = ({ 
  onPress, 
  gameId 
}) => {
  const { theme } = useTheme();
  const { state: collabState } = useCollaboration();
  
  if (!theme || !theme.colors) {
    return null;
  }
  
  const styles = createStyles(theme);

  const handlePress = () => {
    if (onPress) onPress();
  };

  const hasMultipleEditors = (collabState.editors?.length || 0) > 0 || (collabState.activeUsers?.length || 0) > 0;

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      activeOpacity={1}
    >
      {hasMultipleEditors ? (
        <View style={{ width: 60 + 16, height: 60 }}>
          <Icon name="connect2" size={60} style={{ position: 'absolute', left: 0, top: 0 }} />
          <Icon name="connect2" size={60} style={{ position: 'absolute', left: 16, top: 0 }} />
        </View>
      ) : (
        <Icon 
          name="connect2" 
          size={60} 
        />
      )}
    </TouchableOpacity>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  button: {
    width: 70,
    height: 70,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
});

export default CollaborationButton;
