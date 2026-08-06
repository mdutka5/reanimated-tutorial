import { View, StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
  useAnimatedSensor,
  useSharedValue,
  useAnimatedStyle,
  useFrameCallback,
  SensorType,
  clamp,
  makeMutable,
} from "react-native-reanimated";
import FanObstacle, {
  DEFAULT_BLADE_LENGTH,
  DEFAULT_BLADE_THICKNESS,
  DEFAULT_FAN_SPEED,
  hitsFan,
} from "../../src/components/FanObstacle";

const THEME = {
  void: "#1C1410",
  path: "#E4D2B6",
  pathEdge: "#C4A882",
  pathShadow: "rgba(0, 0, 0, 0.35)",
  goal: "#3D8B6E",
  goalEdge: "#2A6B52",
  ball: "#E85D4C",
  ballHighlight: "#F5A899",
  ballShadow: "rgba(0, 0, 0, 0.45)",
};

const BALL_SIZE = 50;
const ACCELERATION = 5000;
const DAMPING = 0.99;
const BOUNCE = 0.45;

const FANS = [
  {
    x: 290,
    y: 380,
    bladeLength: DEFAULT_BLADE_LENGTH + 10,
    bladeThickness: DEFAULT_BLADE_THICKNESS,
    speed: DEFAULT_FAN_SPEED * 0.5,
  },
  {
    x: 290,
    y: 640,
    bladeLength: DEFAULT_BLADE_LENGTH + 10,
    bladeThickness: DEFAULT_BLADE_THICKNESS,
    speed: DEFAULT_FAN_SPEED * 0.5,
  },
];

const FAN_ANGLES = FANS.map(() => makeMutable(0));

const PATH_SIZE = 100;

const PATH = [
  { x: 0, y: 0, width: PATH_SIZE * 5, height: PATH_SIZE },
  { x: 0, y: 800, width: PATH_SIZE * 5, height: PATH_SIZE * 2 },
  { x: 50, y: 650, width: PATH_SIZE, height: PATH_SIZE * 1.5 },
  { x: 150, y: 650, width: PATH_SIZE * 2.5, height: PATH_SIZE },
  { x: 300, y: 300, width: PATH_SIZE, height: PATH_SIZE * 3.5 },
  { x: 50, y: 300, width: PATH_SIZE * 2.5, height: PATH_SIZE * 0.7 },
  { x: 50, y: 200, width: PATH_SIZE * 0.7, height: PATH_SIZE },
  { x: 120, y: 200, width: PATH_SIZE * 1.3, height: PATH_SIZE * 0.7 },
  { x: 190, y: 100, width: PATH_SIZE * 0.6, height: PATH_SIZE },
];

const BOTTOM_PATH = PATH[1];
const START_X = BOTTOM_PATH.x + BOTTOM_PATH.width / 2 - BALL_SIZE / 2;
const START_Y = BOTTOM_PATH.y + BOTTOM_PATH.height / 2 - BALL_SIZE / 2;

const BALL_RADIUS = BALL_SIZE / 2;
const EDGE_SAMPLES = 12;

function pointOnPath(px: number, py: number) {
  "worklet";
  for (const path of PATH) {
    if (
      px >= path.x &&
      px <= path.x + path.width &&
      py >= path.y &&
      py <= path.y + path.height
    ) {
      return true;
    }
  }
  return false;
}

/** True only if the whole ball (center + rim) stays on walkable tiles. */
function isBallOnPath(cx: number, cy: number) {
  "worklet";
  if (!pointOnPath(cx, cy)) {
    return false;
  }
  for (let i = 0; i < EDGE_SAMPLES; i++) {
    const angle = (i / EDGE_SAMPLES) * Math.PI * 2;
    const px = cx + Math.cos(angle) * BALL_RADIUS;
    const py = cy + Math.sin(angle) * BALL_RADIUS;
    if (!pointOnPath(px, py)) {
      return false;
    }
  }
  return true;
}

export default function Sensors() {
  const { width, height } = useWindowDimensions();
  const rotation = useAnimatedSensor(SensorType.ROTATION);

  const ballX = useSharedValue(START_X);
  const ballY = useSharedValue(START_Y);
  const velocityX = useSharedValue(0);
  const velocityY = useSharedValue(0);

  const maxX = width - BALL_SIZE;
  const maxY = height - BALL_SIZE;

  const animatedStyle = useAnimatedStyle(() => ({
    left: ballX.value,
    top: ballY.value,
  }));

  useFrameCallback(({ timeSincePreviousFrame }) => {
    if (timeSincePreviousFrame == null) {
      return;
    }

    const dt = timeSincePreviousFrame / 1000;
    const { roll, pitch } = rotation.sensor.value;

    velocityX.value += roll * ACCELERATION * dt;
    velocityY.value += pitch * ACCELERATION * dt;
    velocityX.value *= DAMPING;
    velocityY.value *= DAMPING;

    let nextX = ballX.value + velocityX.value * dt;
    let nextY = ballY.value + velocityY.value * dt;

    if (nextX > maxX || nextX < 0) {
      velocityX.value *= -BOUNCE;
      nextX = clamp(nextX, 0, maxX);
    }
    if (nextY > maxY || nextY < 0) {
      velocityY.value *= -BOUNCE;
      nextY = clamp(nextY, 0, maxY);
    }

    const cx = nextX + BALL_RADIUS;
    const cy = nextY + BALL_RADIUS;

    let touchedFan = false;
    for (let i = 0; i < FANS.length; i++) {
      const fan = FANS[i];
      if (
        hitsFan(
          cx,
          cy,
          BALL_RADIUS,
          fan.x,
          fan.y,
          FAN_ANGLES[i].value,
          fan.bladeLength,
          fan.bladeThickness,
        )
      ) {
        touchedFan = true;
        break;
      }
    }

    if (!isBallOnPath(cx, cy) || touchedFan) {
      ballX.value = START_X;
      ballY.value = START_Y;
      velocityX.value = 0;
      velocityY.value = 0;
      return;
    }

    ballX.value = nextX;
    ballY.value = nextY;
  });

  return (
    <View style={styles.container}>
      {PATH.map((path, index) => {
        const isGoal = index === 0;
        return (
          <View
            key={path.x + path.y + path.width + path.height}
            style={[
              styles.pathTile,
              {
                width: path.width,
                height: path.height,
                left: path.x,
                top: path.y,
                backgroundColor: isGoal ? THEME.goal : THEME.path,
                borderColor: isGoal ? THEME.goalEdge : THEME.pathEdge,
              },
            ]}
          />
        );
      })}
      {FANS.map((fan, index) => (
        <FanObstacle
          key={`${fan.x}-${fan.y}-${index}`}
          x={fan.x}
          y={fan.y}
          bladeLength={fan.bladeLength}
          bladeThickness={fan.bladeThickness}
          speed={fan.speed}
          angle={FAN_ANGLES[index]}
        />
      ))}
      <Animated.View style={[styles.ball, animatedStyle]}>
        <View style={styles.ballHighlight} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    flex: 1,
    backgroundColor: THEME.void,
  },
  pathTile: {
    position: "absolute",
    borderWidth: 2,
    borderRadius: 10,
    shadowColor: THEME.pathShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  ball: {
    position: "absolute",
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    backgroundColor: THEME.ball,
    zIndex: 1000,
    shadowColor: THEME.ballShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 8,
    borderWidth: 2,
    borderColor: "#C4483A",
  },
  ballHighlight: {
    position: "absolute",
    top: 8,
    left: 10,
    width: 14,
    height: 10,
    borderRadius: 8,
    backgroundColor: THEME.ballHighlight,
    opacity: 0.85,
  },
});
