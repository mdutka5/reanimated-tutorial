import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
  SharedValue,
} from "react-native-reanimated";
import { Path, Svg } from "react-native-svg";

const AnimatedPath = Animated.createAnimatedComponent(Path);

const FOCAL = 400;
const ORBIT_SEGMENTS = 64;
const ORBIT_CANVAS = 1200;

function project3D(
  x: number,
  y: number,
  z: number,
  rotX: number,
  rotY: number,
  zoom: number,
) {
  "worklet";
  // rotate around Y axis (left/right drag)
  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  const x1 = x * cosY - z * sinY;
  const z1 = x * sinY + z * cosY;

  // rotate around X axis (up/down drag)
  const cosX = Math.cos(rotX);
  const sinX = Math.sin(rotX);
  const y2 = y * cosX - z1 * sinX;
  const z2 = y * sinX + z1 * cosX;

  // perspective projection
  const scale = (FOCAL / (FOCAL + z2)) * zoom;
  return {
    screenX: x1 * scale,
    screenY: y2 * scale,
    scale,
    depth: z2,
  };
}

function Orbit({
  orbitRadius,
  bob = 0,
  rotX,
  rotY,
  zoom,
}: {
  orbitRadius: number;
  bob?: number;
  rotX: SharedValue<number>;
  rotY: SharedValue<number>;
  zoom: SharedValue<number>;
}) {
  const animatedProps = useAnimatedProps(() => {
    let d = "";

    for (let i = 0; i <= ORBIT_SEGMENTS; i++) {
      const t = (i / ORBIT_SEGMENTS) * Math.PI * 2;
      // Same parametric path as Planet
      const x = orbitRadius * Math.cos(t);
      const z = orbitRadius * Math.sin(t);
      const y = bob * Math.sin(t) * 1.5;
      const { screenX, screenY } = project3D(
        x,
        y,
        z,
        rotX.value,
        rotY.value,
        zoom.value,
      );
      d += i === 0 ? `M ${screenX} ${screenY}` : ` L ${screenX} ${screenY}`;
    }

    return { d: d + " Z" };
  });

  return (
    <AnimatedPath
      animatedProps={animatedProps}
      stroke="rgba(255,255,255,0.18)"
      strokeWidth={1}
      fill="none"
    />
  );
}

function Planet({
  orbitRadius,
  speed,
  color,
  size,
  bob = 0,
  rotX,
  rotY,
  zoom,
}: {
  orbitRadius: number;
  speed: number;
  color: string;
  size: number;
  bob?: number;
  rotX: SharedValue<number>;
  rotY: SharedValue<number>;
  zoom: SharedValue<number>;
}) {
  const angle = useSharedValue(Math.random() * Math.PI * 2);

  useEffect(() => {
    angle.value = withRepeat(
      withTiming(angle.value + Math.PI * 2, {
        duration: speed,
        easing: Easing.linear,
      }),
      -1,
    );
  }, []);

  const style = useAnimatedStyle(() => {
    const x = orbitRadius * Math.cos(angle.value);
    const z = orbitRadius * Math.sin(angle.value);
    const y = bob * Math.sin(angle.value) * 1.5;
    const { screenX, screenY, scale, depth } = project3D(
      x,
      y,
      z,
      rotX.value,
      rotY.value,
      zoom.value,
    );

    return {
      zIndex: Math.round(-depth * 1000),
      transform: [{ translateX: screenX }, { translateY: screenY }, { scale }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.planet,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

export default function SolarSystem() {
  const rotX = useSharedValue(0.4);
  const rotY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const zoom = useSharedValue(0.8);

  const pinch = Gesture.Pinch().onUpdate((e) => {
    zoom.value = e.scale;
  });

  const pan = Gesture.Pan()
    .onStart(() => {
      startX.value = rotX.value;
      startY.value = rotY.value;
    })
    .onUpdate((e) => {
      rotX.value = startX.value - e.translationY * 0.01;
      rotY.value = startY.value + e.translationX * 0.01;
    });

  const planets = [
    { orbitRadius: 0, speed: 0, color: "#fbbf24", size: 80, bob: 0 }, // sun
    { orbitRadius: 60, speed: 4000, color: "#a78bfa", size: 16, bob: -6 },
    { orbitRadius: 80, speed: 12000, color: "#abdcba", size: 18, bob: 8 },
    { orbitRadius: 90, speed: 19000, color: "#34a399", size: 20, bob: -7 },
    { orbitRadius: 100, speed: 7000, color: "#60a5fa", size: 22, bob: 10 },
    { orbitRadius: 110, speed: 15000, color: "#90d119", size: 24, bob: 9 },
    { orbitRadius: 150, speed: 11000, color: "#f87171", size: 30, bob: -12 },
    { orbitRadius: 170, speed: 136000, color: "#198191", size: 31, bob: 11 },
    { orbitRadius: 200, speed: 11500, color: "#34d399", size: 45, bob: -14 },
    { orbitRadius: 120, speed: 7000, color: "#e879f9", size: 21, bob: 13 },
    { orbitRadius: 140, speed: 15000, color: "#fb923c", size: 25, bob: 9 },
    { orbitRadius: 190, speed: 11000, color: "#22d3ee", size: 36, bob: -11 },
    { orbitRadius: 130, speed: 136000, color: "#c084fc", size: 21, bob: 13 },
    { orbitRadius: 210, speed: 11500, color: "#aad14a", size: 39, bob: -19 },
  ];

  const half = ORBIT_CANVAS / 2;

  return (
    <GestureDetector gesture={Gesture.Simultaneous(pan, pinch)}>
      <View style={styles.container}>
        {/* Same centered absolute origin as planets; path coords == translateX/Y */}
        <Svg
          width={ORBIT_CANVAS}
          height={ORBIT_CANVAS}
          viewBox={`${-half} ${-half} ${ORBIT_CANVAS} ${ORBIT_CANVAS}`}
          style={styles.orbits}
          pointerEvents="none"
        >
          {planets
            .filter((p) => p.orbitRadius > 0)
            .map((p, i) => (
              <Orbit
                key={i}
                orbitRadius={p.orbitRadius}
                bob={p.bob}
                rotX={rotX}
                rotY={rotY}
                zoom={zoom}
              />
            ))}
        </Svg>
        {planets.map((p, i) => (
          <Planet key={i} {...p} rotX={rotX} rotY={rotY} zoom={zoom} />
        ))}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a1a",
    alignItems: "center",
    justifyContent: "center",
  },
  sun: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#fbbf24",
  },
  orbits: {
    position: "absolute",
  },
  planet: {
    position: "absolute",
  },
});
