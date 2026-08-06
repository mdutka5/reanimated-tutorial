import { StyleSheet, View } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useFrameCallback,
} from "react-native-reanimated";

export const BLADE_ANGLES = [0, 120, 240];
export const DEFAULT_BLADE_LENGTH = 70;
export const DEFAULT_BLADE_THICKNESS = 16;
export const DEFAULT_FAN_SPEED = 0.6;

type FanObstacleProps = {
  x: number;
  y: number;
  bladeLength?: number;
  bladeThickness?: number;
  /** Full rotations per second */
  speed?: number;
  /** Live angle in degrees — same value used for render and collision */
  angle: SharedValue<number>;
};

/** Circle vs the three fan blades at the current angle. */
export function hitsFan(
  cx: number,
  cy: number,
  radius: number,
  fanX: number,
  fanY: number,
  angleDeg: number,
  bladeLength: number = DEFAULT_BLADE_LENGTH,
  bladeThickness: number = DEFAULT_BLADE_THICKNESS,
) {
  "worklet";
  const hubAngle = (angleDeg * Math.PI) / 180;

  for (const bladeOffsetDeg of BLADE_ANGLES) {
    const bladeAngle = hubAngle + (bladeOffsetDeg * Math.PI) / 180;
    const dx = cx - fanX;
    const dy = cy - fanY;
    // Inverse of RN rotate (Y-down, positive = clockwise)
    const localX = dx * Math.cos(bladeAngle) + dy * Math.sin(bladeAngle);
    const localY = -dx * Math.sin(bladeAngle) + dy * Math.cos(bladeAngle);

    const halfT = bladeThickness / 2;
    const nearestX = Math.max(0, Math.min(localX, bladeLength));
    const nearestY = Math.max(-halfT, Math.min(localY, halfT));
    const ddx = localX - nearestX;
    const ddy = localY - nearestY;
    if (ddx * ddx + ddy * ddy < radius * radius) {
      return true;
    }
  }
  return false;
}

export default function FanObstacle({
  x,
  y,
  bladeLength = DEFAULT_BLADE_LENGTH,
  bladeThickness = DEFAULT_BLADE_THICKNESS,
  speed = DEFAULT_FAN_SPEED,
  angle,
}: FanObstacleProps) {
  const size = bladeLength * 2;

  useFrameCallback(({ timeSincePreviousFrame }) => {
    if (timeSincePreviousFrame == null) {
      return;
    }
    angle.value -= speed * 360 * (timeSincePreviousFrame / 1000);
  });

  const hubStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${angle.value}deg` }],
  }));

  return (
    <Animated.View
      style={[
        styles.hub,
        {
          left: x - bladeLength,
          top: y - bladeLength,
          width: size,
          height: size,
        },
        hubStyle,
      ]}
    >
      {BLADE_ANGLES.map((bladeAngle) => (
        <View
          key={bladeAngle}
          style={[
            styles.bladeArm,
            {
              left: bladeLength,
              top: bladeLength,
              transform: [{ rotate: `${bladeAngle}deg` }],
            },
          ]}
        >
          <View
            style={[
              styles.blade,
              {
                width: bladeLength,
                height: bladeThickness,
                marginTop: -bladeThickness / 2,
              },
            ]}
          />
        </View>
      ))}
      <View
        style={[
          styles.cap,
          {
            left: bladeLength - bladeThickness / 2,
            top: bladeLength - bladeThickness / 2,
            width: bladeThickness,
            height: bladeThickness,
            borderRadius: bladeThickness / 2,
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  hub: {
    position: "absolute",
    zIndex: 500,
  },
  bladeArm: {
    position: "absolute",
    width: 0,
    height: 0,
  },
  blade: {
    backgroundColor: "#E8A317",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#B87A0A",
  },
  cap: {
    position: "absolute",
    backgroundColor: "#3A322C",
    borderWidth: 2,
    borderColor: "#D4A84B",
  },
});
