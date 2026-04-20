import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Haptics from 'expo-haptics';
import { useSidebar } from '@/lib/sidebar-context';
import { textColor } from '@/constants/Tokens';

export function HamburgerButton() {
  const { open } = useSidebar();
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        open();
      }}
      hitSlop={12}
      style={({ pressed }) => [styles.btn, pressed && { opacity: 0.6 }]}
    >
      <FontAwesome name="bars" size={22} color={textColor.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
