import { View, StyleSheet } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
  withDecay,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const BOX_W = 200;
const BOX_H = 600;
const BALL = 50;
const MAX_X = BOX_W - BALL;
const MAX_Y = BOX_H - BALL;
const X_CLAMP: [number, number] = [0, MAX_X];
const Y_CLAMP: [number, number] = [0, MAX_Y];
const MIN_BOUNCE_VELOCITY = 50;
const RESTITUTION = 0.7;
const BOUND_EPSILON = 0.5;

function useImpactVelocity(sv: SharedValue<number>, clamp: [number, number]) {
  const velocity = useSharedValue(0);
  const previous = useSharedValue(0);

  useFrameCallback(({ timeSincePreviousFrame }) => {
    const value = sv.value;
    const isFree =
      value > clamp[0] + BOUND_EPSILON && value < clamp[1] - BOUND_EPSILON;

    if (timeSincePreviousFrame && isFree) {
      velocity.value =
        ((value - previous.value) / timeSincePreviousFrame) * 1000;
    }

    previous.value = value;
  });

  return velocity;
}

function decayWithBounce(
  sv: SharedValue<number>,
  impactVelocity: SharedValue<number>,
  velocity: number,
  clamp: [number, number],
) {
  "worklet";
  sv.value = withDecay(
    { velocity, clamp, rubberBandEffect: false },
    (finished) => {
      if (!finished) return;

      const hitMin = Math.abs(sv.value - clamp[0]) < BOUND_EPSILON;
      const hitMax = Math.abs(sv.value - clamp[1]) < BOUND_EPSILON;
      if (!hitMin && !hitMax) return;

      const speed = Math.abs(impactVelocity.value) * RESTITUTION;
      if (speed < MIN_BOUNCE_VELOCITY) return;

      decayWithBounce(sv, impactVelocity, hitMin ? speed : -speed, clamp);
    },
  );
}

export default function screen03() {
  const ballX = useSharedValue(0);
  const ballY = useSharedValue(0);
  const impactVelocityX = useImpactVelocity(ballX, X_CLAMP);
  const impactVelocityY = useImpactVelocity(ballY, Y_CLAMP);

  const pan = Gesture.Pan()
    .onBegin(() => {
      impactVelocityX.value = 0;
      impactVelocityY.value = 0;
    })
    .onChange((event) => {
      ballX.value = Math.min(Math.max(ballX.value + event.changeX, 0), MAX_X);
      ballY.value = Math.min(Math.max(ballY.value + event.changeY, 0), MAX_Y);
    })
    .onFinalize((event) => {
      decayWithBounce(ballX, impactVelocityX, event.velocityX, X_CLAMP);
      decayWithBounce(ballY, impactVelocityY, event.velocityY, Y_CLAMP);
    });

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: ballX.value }, { translateY: ballY.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.gameBox}>
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.ball, animatedStyles]} />
        </GestureDetector>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  gameBox: {
    width: BOX_W,
    height: BOX_H,
    borderWidth: 1,
    borderColor: "black",
  },
  ball: {
    width: BALL,
    height: BALL,
    borderRadius: BALL,
    backgroundColor: "red",
  },
});
