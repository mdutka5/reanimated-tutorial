import { Text, StyleSheet, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export type CardData = {
  id: string;
  name: string;
  color: string;
  bgColor: string;
};

export const CARD_WIDTH = 300;
export const CARD_GAP = 16;
export const ITEM_WIDTH = CARD_WIDTH + CARD_GAP;

export const SWIPE_THRESHOLD = 120;
export const VELOCITY_THRESHOLD = 800;

type CardProps = {
  item: CardData;
  dismissible?: boolean;
  onDismiss?: (id: string) => void;
};

export default function Card({
  item,
  dismissible = false,
  onDismiss,
}: CardProps) {
  const { height } = useWindowDimensions();
  const translateY = useSharedValue(0);
  const hasDismissed = useSharedValue(false);

  const dismiss = () => onDismiss?.(item.id);

  const dismissPan = Gesture.Pan()
    .enabled(dismissible)
    .activeOffsetY([-12, 12])
    .failOffsetX([-24, 24])
    .onUpdate((e) => {
      if (hasDismissed.value) return;
      // Only allow upward drag
      translateY.value = Math.min(0, e.translationY);
    })
    .onEnd((e) => {
      if (hasDismissed.value) return;

      const shouldDismiss =
        translateY.value < -SWIPE_THRESHOLD ||
        e.velocityY < -VELOCITY_THRESHOLD;

      if (shouldDismiss && onDismiss) {
        hasDismissed.value = true;
        translateY.value = withTiming(
          -height,
          { duration: 280 },
          (finished) => {
            if (finished) {
              runOnJS(dismiss)();
            }
          },
        );
      } else {
        translateY.value = withSpring(0);
      }
    });

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: 1 + translateY.value / height,
  }));

  return (
    <GestureDetector gesture={dismissPan}>
      <Animated.View
        style={[styles.card, { backgroundColor: item.color }, style]}
      >
        <Text style={styles.title}>{item.name}</Text>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: 420,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#f8fafc",
  },
});
