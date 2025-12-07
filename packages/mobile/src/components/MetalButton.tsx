
import React from 'react';
import { Pressable, Text, StyleSheet, View, Animated, PressableProps } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const COLORS = {
  red: '#D90429',
  black: '#1A1A1A',
  white: '#F8F8F8',
  gray: '#333',
};

const SIZE_VARIANTS = {
  small: { height: 36, fontSize: 14, icon: 18, padding: 16 },
  medium: { height: 48, fontSize: 18, icon: 24, padding: 24 },
  large: { height: 60, fontSize: 22, icon: 32, padding: 32 },
};

type MetalButtonProps = PressableProps & {
  title: string;
  icon?: string;
  iconPosition?: 'left' | 'right';
  size?: 'small' | 'medium' | 'large';
  style?: any;
};

export const MetalButton: React.FC<MetalButtonProps> = ({
  title,
  onPress,
  icon,
  iconPosition = 'left',
  size = 'medium',
  style,
  ...props
}) => {
  const [pressed, setPressed] = React.useState(false);
  const anim = React.useRef(new Animated.Value(1)).current;
  const variant = SIZE_VARIANTS[size] || SIZE_VARIANTS.medium;

  const handlePressIn = () => {
    setPressed(true);
    Animated.spring(anim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();
  };
  const handlePressOut = () => {
    setPressed(false);
    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: anim }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: pressed ? COLORS.red : COLORS.black,
            borderColor: COLORS.red,
            height: variant.height,
            paddingHorizontal: variant.padding,
          },
        ]}
        {...props}
      >
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' && (
            <MaterialCommunityIcons
              name={icon}
              size={variant.icon}
              color={COLORS.white}
              style={{ marginRight: 8 }}
            />
          )}
          <Text style={[styles.text, { fontSize: variant.fontSize }]}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <MaterialCommunityIcons
              name={icon}
              size={variant.icon}
              color={COLORS.white}
              style={{ marginLeft: 8 }}
            />
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 2,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
    marginVertical: 8,
  },
  text: {
    color: COLORS.white,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    textShadowColor: COLORS.gray,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    textTransform: 'uppercase',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

// Usage example:
// <MetalButton title="Shred" icon="guitar-electric" size="large" onPress={() => {}} />
