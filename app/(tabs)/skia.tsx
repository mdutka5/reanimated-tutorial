import { useEffect } from "react";
import { StyleSheet, Pressable, Text, useWindowDimensions } from "react-native";
import { ImageBackground } from "expo-image";
import {
  Blur,
  Canvas,
  Circle,
  Path,
  Skia,
  SweepGradient,
  notifyChange,
  vec,
} from "@shopify/react-native-skia";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnUI } from "react-native-worklets";

const COLORS = ["cyan", "magenta", "yellow", "cyan"];

type Point = { x: number; y: number };

function pointAtProgress(points: Point[], length: number, t: number): Point {
  "worklet";
  if (points.length === 0) return { x: -9999, y: -9999 };
  if (t <= 0 || length <= 0) return points[0];
  if (t >= 1) return points[points.length - 1];

  const target = t * length;
  let acc = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    const seg = Math.hypot(dx, dy);
    if (acc + seg >= target) {
      const p = seg === 0 ? 0 : (target - acc) / seg;
      return { x: points[i - 1].x + dx * p, y: points[i - 1].y + dy * p };
    }
    acc += seg;
  }
  return points[points.length - 1];
}

export default function SkiaScreen() {
  const { width, height } = useWindowDimensions();
  const path = useSharedValue(Skia.Path.Make());
  const points = useSharedValue<Point[]>([]);
  const pathLength = useSharedValue(0);
  const progress = useSharedValue(0);
  const released = useSharedValue(false);
  const rotation = useSharedValue(0);
  const center = vec(width / 2, height / 2);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 2000, easing: Easing.linear }),
      -1,
      true,
    );
  }, [rotation]);

  const transform = useDerivedValue(() => [{ rotate: rotation.value }]);
  const snakeStart = useDerivedValue(() => Math.max(0, progress.value - 0.12));
  const sketchOpacity = useDerivedValue(() => 0.7 * (1 - progress.value));

  const head = useDerivedValue(() => {
    const pts = points.value;
    if (!released.value || pts.length === 0) return { x: -9999, y: -9999 };
    return pointAtProgress(pts, pathLength.value, progress.value);
  });
  const headX = useDerivedValue(() => head.value.x);
  const headY = useDerivedValue(() => head.value.y);

  const pan = Gesture.Pan()
    .averageTouches(true)
    .maxPointers(1)
    .onBegin((e) => {
      released.value = false;
      progress.value = 0;
      pathLength.value = 0;
      points.value = [{ x: e.x, y: e.y }];
      path.value = Skia.Path.Make();
      path.value.moveTo(e.x, e.y);
      path.value.lineTo(e.x, e.y);
      notifyChange(path);
    })
    .onChange((e) => {
      const last = points.value[points.value.length - 1];
      if (last) {
        pathLength.value += Math.hypot(e.x - last.x, e.y - last.y);
      }
      points.value = [...points.value, { x: e.x, y: e.y }];
      path.value.lineTo(e.x, e.y);
      notifyChange(path);
    })
    .onEnd(() => {
      released.value = true;
      progress.value = 0;
      progress.value = withTiming(1, {
        duration: 2000,
        easing: Easing.bezier(0.22, 1, 0.36, 1),
      });
    });

  return (
    <ImageBackground
      source={require("../../assets/background.png")}
      style={styles.background}
      contentFit="cover"
    >
      <GestureDetector gesture={pan}>
        <Canvas style={styles.canvas}>
          <Path
            path={path}
            style="stroke"
            strokeWidth={3}
            strokeCap="round"
            strokeJoin="round"
            color="rgba(0,0,0,0.85)"
            opacity={sketchOpacity}
          />

          <Path
            path={path}
            style="stroke"
            strokeWidth={4}
            strokeCap="round"
            strokeJoin="round"
            start={0}
            end={progress}
          >
            <Blur blur={10} />
            <SweepGradient
              c={center}
              origin={center}
              colors={COLORS}
              transform={transform}
            />
          </Path>
          <Path
            path={path}
            style="stroke"
            strokeWidth={4}
            strokeCap="round"
            strokeJoin="round"
            start={0}
            end={progress}
          >
            <SweepGradient
              c={center}
              origin={center}
              colors={COLORS}
              transform={transform}
            />
          </Path>

          <Path
            path={path}
            style="stroke"
            strokeWidth={7}
            strokeCap="round"
            strokeJoin="round"
            start={snakeStart}
            end={progress}
          >
            <SweepGradient
              c={center}
              origin={center}
              colors={COLORS}
              transform={transform}
            />
          </Path>

          <Circle cx={headX} cy={headY} r={14}>
            <Blur blur={10} />
            <SweepGradient
              c={center}
              origin={center}
              colors={COLORS}
              transform={transform}
            />
          </Circle>
          <Circle cx={headX} cy={headY} r={5} color="white" />
        </Canvas>
      </GestureDetector>
      <Pressable
        style={styles.clearButton}
        onPress={() => {
          scheduleOnUI(() => {
            released.value = false;
            progress.value = 0;
            pathLength.value = 0;
            points.value = [];
            path.value = Skia.Path.Make();
          });
        }}
      >
        <Text style={styles.clearButtonText}>Clear</Text>
      </Pressable>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  canvas: { flex: 1 },
  background: { flex: 1 },
  clearButton: {
    position: "absolute",
    top: 56,
    right: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 10,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
