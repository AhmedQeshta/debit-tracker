import { View, StyleSheet, TouchableWithoutFeedback } from 'react-native';

interface PositionedMenuProps
{
  visible: boolean;
  onClose: () => void;
  position: { top: number; right: number };
  children: React.ReactNode;
}

export const PositionedMenu = ({ visible, onClose, position, children }: PositionedMenuProps) =>
{
  if (!visible) return null;

  return (
    <View style={styles.rootContainer} pointerEvents="box-none">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <View
            style={[styles.menuWrapper, { top: position.top, right: position.right }]}
            pointerEvents="box-none">
            <View style={styles.menuContent} pointerEvents="auto">
              {children}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 9999,
    elevation: 9999,
  },
  menuWrapper: {
    position: 'absolute',
    zIndex: 10000,
    elevation: 10000,
  },
  menuContent: {
    // Content styles are handled by children
  },
});

