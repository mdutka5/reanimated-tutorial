import { useEffect } from "react";
import { StyleSheet, Pressable, Text, useWindowDimensions } from "react-native";
import { ImageBackground } from "expo-image";
import {
  Blur,
  Canvas,
  LinearGradient,
  Paint,
  Path,
  Skia,
  notifyChange,
  vec,
} from "@shopify/react-native-skia";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnUI } from "react-native-worklets";

export default function SkiaScreen() {
  const { width, height } = useWindowDimensions();
  const path = useSharedValue(Skia.Path.Make());
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 2000 }), -1, true);
  }, [t]);

  const start = useDerivedValue(() => vec(0, t.value * height));
  const end = useDerivedValue(() => vec(width, t.value * height + 200));

  const pan = Gesture.Pan()
    .averageTouches(true)
    .maxPointers(1)
    .onBegin((e) => {
      path.value.moveTo(e.x, e.y);
      path.value.lineTo(e.x, e.y);
      notifyChange(path);
    })
    .onChange((e) => {
      path.value.lineTo(e.x, e.y);
      notifyChange(path);
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
            strokeWidth={4}
            strokeCap="round"
            strokeJoin="round"
          >
            <Paint
              style="stroke"
              strokeWidth={12}
              color="rgba(76,0,128,0.2)"
              strokeCap="round"
            >
              <Blur blur={6} />
            </Paint>
            <LinearGradient
              start={start}
              end={end}
              colors={["#fff", "#00c6ff", "#fff"]}
            />
          </Path>
        </Canvas>
      </GestureDetector>
      <Pressable
        style={styles.clearButton}
        onPress={() => {
          scheduleOnUI(() => {
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
  canvas: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
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
