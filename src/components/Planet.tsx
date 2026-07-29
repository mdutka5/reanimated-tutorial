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
  const angle = useSharedValue(0);
  const rotationAngle = useSharedValue(0);
  const angularVelocitySV = useSharedValue(angularVelocity);
  const rotationVelocitySV = useSharedValue(rotationalVelocity);

  useEffect(() => {
    angularVelocitySV.value = angularVelocity;
  }, [angularVelocity]);

  useEffect(() => {
    rotationVelocitySV.value = rotationalVelocity;
  }, [rotationalVelocity]);

  useFrameCallback((frameInfo: FrameInfo) => {
    const dt = (frameInfo.timeSincePreviousFrame ?? 16) / 1000;

    angle.value += angularVelocitySV.value * dt;
    if (angle.value >= 2 * Math.PI) angle.value -= 2 * Math.PI;

    rotationAngle.value += rotationVelocitySV.value * dt; // deg/s
    if (rotationAngle.value >= 360) rotationAngle.value -= 360;
  });

  const animatedMotion = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${angle.value}rad` },
      { translateX: radius },
      { rotate: `${-angle.value}rad` },
      { rotate: `${rotationAngle.value}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[styles.planet, animatedMotion, { width: size, height: size }]}
    >
      <View style={[styles.left, { backgroundColor: colors.left }]} />
      <View style={[styles.right, { backgroundColor: colors.right }]} />
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
