import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  useFrameCallback,
  FrameInfo,
} from "react-native-reanimated";
import type { CSSAnimationKeyframes } from "react-native-reanimated";

type PlanetProps = {
  radius: number;
  rotationalVelocity: number;
  angularVelocity: number;
  colors: { left: string; right: string };
  size: number;
};

export default function Planet({
  radius,
  rotationalVelocity,
  angularVelocity,
  colors,
  size,
}: PlanetProps) {
  const orbitDurationMs = ((2 * Math.PI) / Math.abs(angularVelocity)) * 1000;
  const spinDurationMs = (360 / Math.abs(rotationalVelocity)) * 1000;

  const orbitSun: CSSAnimationKeyframes = {
    "0%": {
      transform: [{ rotate: "0deg" }, { translateX: radius }],
    },
    "100%": {
      transform: [{ rotate: "360deg" }, { translateX: radius }],
    },
  };

  const spin: CSSAnimationKeyframes = {
    "0%": { transform: [{ rotate: "0deg" }] },
    "100%": { transform: [{ rotate: "360deg" }] },
  };

  return (
    <Animated.View
      style={[
        styles.planet,
        { width: size, height: size },
        {
          animationName: orbitSun,
          animationDuration: orbitDurationMs,
          animationIterationCount: "infinite",
          animationTimingFunction: "linear",
          animationDirection: "normal",
        },
      ]}
    >
      <Animated.View
        style={[
          styles.planet,
          { width: size, height: size },
          rotationalVelocity !== 0 && {
            animationName: spin,
            animationDuration: spinDurationMs,
            animationIterationCount: "infinite",
            animationTimingFunction: "linear",
            animationDirection: rotationalVelocity < 0 ? "reverse" : "normal",
          },
        ]}
      >
        <View style={[styles.left, { backgroundColor: colors.left }]} />
        <View style={[styles.right, { backgroundColor: colors.right }]} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  planet: {
    borderRadius: 50,
    position: "absolute",
    flexDirection: "row",
    overflow: "hidden",
  },
  left: {
    flex: 1,
  },
  right: {
    flex: 1,
  },
});
