import { useRef } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
  SharedValue,
} from "react-native-reanimated";
import { BlurView, BlurTargetView } from "expo-blur";
import {
  useWindowDimensions,
  Text,
  Image,
  StyleSheet,
  View,
} from "react-native";

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const SWIPE_THRESHOLD = 120;
const VELOCITY_THRESHOLD = 800;

const TYPE_COLORS: Record<string, string> = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#E0B400",
  grass: "#7AC74C",
  ice: "#6BB3B0",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#D4A84B",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#8A8AA3",
  fairy: "#D685AD",
};

export function colorForType(type: string): string {
  return TYPE_COLORS[type] ?? TYPE_COLORS.normal;
}

export type CardData = {
  id: string;
  name: string;
  imageUrl: string;
  color: string;
  type: string;
};

export type SwipeDirection = 1 | -1;

type CardProps = {
  item: CardData;
  isTop: boolean;
  stackTranslateX: SharedValue<number>;
  onSwiped: (id: string, direction: SwipeDirection) => void;
};

export default function PokeCard({
  item,
  isTop,
  stackTranslateX,
  onSwiped,
}: CardProps) {
  const { width } = useWindowDimensions();
  const blurTargetRef = useRef<View>(null);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const hasDismissed = useSharedValue(false);
  const nameRevealed = useSharedValue(0);

  const dismiss = (direction: SwipeDirection) => onSwiped(item.id, direction);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (hasDismissed.value) return;
      translateX.value = e.translationX;
      translateY.value = e.translationY;
      stackTranslateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (hasDismissed.value) return;

      const shouldDismiss =
        Math.abs(translateX.value) > SWIPE_THRESHOLD ||
        Math.abs(e.velocityX) > VELOCITY_THRESHOLD;

      if (shouldDismiss) {
        hasDismissed.value = true;
        const direction: SwipeDirection =
          translateX.value + e.velocityX > 0 ? 1 : -1;
        stackTranslateX.value = withTiming(direction * SWIPE_THRESHOLD, {
          duration: 220,
        });
        translateX.value = withTiming(
          direction * width * 1.5,
          { duration: 220 },
          (finished) => {
            if (finished) {
              runOnJS(dismiss)(direction);
            }
          },
        );
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        stackTranslateX.value = withSpring(0);
      }
    });

  const revealName = Gesture.Tap().onEnd(() => {
    if (nameRevealed.value === 1) return;
    nameRevealed.value = withTiming(1, { duration: 220 });
  });

  const topStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      {
        rotate: `${interpolate(
          translateX.value,
          [-width / 2, 0, width / 2],
          [-15, 0, 15],
          Extrapolation.CLAMP,
        )}deg`,
      },
    ],
  }));

  const nextStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          Math.abs(stackTranslateX.value),
          [0, SWIPE_THRESHOLD],
          [0.95, 1],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const nopeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const nameBlurProps = useAnimatedProps(() => ({
    intensity: interpolate(
      nameRevealed.value,
      [0, 1],
      [80, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const name = (
    <View style={styles.nameWrap}>
      <BlurTargetView ref={blurTargetRef}>
        <Text style={styles.title}>{item.name}</Text>
      </BlurTargetView>
      <AnimatedBlurView
        animatedProps={nameBlurProps}
        tint="light"
        style={styles.nameBlur}
        pointerEvents="none"
        blurTarget={blurTargetRef}
        blurMethod="dimezisBlurView"
      />
    </View>
  );

  const content = (
    <Animated.View
      style={[
        styles.card,
        { backgroundColor: item.color },
        isTop ? topStyle : nextStyle,
      ]}
    >
      {isTop && (
        <>
          <Animated.View style={[styles.stamp, styles.likeStamp, likeStyle]}>
            <Text style={[styles.stampText, styles.likeText]}>YES</Text>
          </Animated.View>
          <Animated.View style={[styles.stamp, styles.nopeStamp, nopeStyle]}>
            <Text style={[styles.stampText, styles.nopeText]}>NOPE</Text>
          </Animated.View>
        </>
      )}
      <Image source={{ uri: item.imageUrl }} style={styles.sprite} />
      {name}
      <Text style={styles.subtitle}>
        #{item.id.padStart(3, "0")} · {item.type}
      </Text>
    </Animated.View>
  );

  if (!isTop) {
    return content;
  }

  return (
    <GestureDetector gesture={Gesture.Exclusive(pan, revealName)}>
      {content}
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 300,
    height: 420,
    borderRadius: 24,
    padding: 28,
    justifyContent: "flex-end",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  sprite: {
    width: 220,
    height: 220,
    marginBottom: 16,
  },
  nameWrap: {
    alignItems: "center",
    overflow: "hidden",
  },
  nameBlur: {
    ...StyleSheet.absoluteFill,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#f8fafc",
    letterSpacing: -0.5,
    textAlign: "center",
    textTransform: "capitalize",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(248, 250, 252, 0.9)",
    marginTop: 6,
    textTransform: "capitalize",
  },
  stamp: {
    position: "absolute",
    top: 32,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 3,
    borderRadius: 8,
    zIndex: 2,
  },
  likeStamp: {
    left: 24,
    borderColor: "#4ade80",
    transform: [{ rotate: "-12deg" }],
  },
  nopeStamp: {
    right: 24,
    borderColor: "#f87171",
    transform: [{ rotate: "12deg" }],
  },
  stampText: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 2,
  },
  likeText: {
    color: "#4ade80",
  },
  nopeText: {
    color: "#f87171",
  },
});
