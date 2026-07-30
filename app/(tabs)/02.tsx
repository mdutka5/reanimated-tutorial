import { Button, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Path, Svg } from "react-native-svg";
import { useWindowDimensions } from "react-native";

const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function screen02() {
  const { width, height } = useWindowDimensions();
  const cx = useSharedValue(width / 2);
  const cy = useSharedValue(height / 2);
  const r = useSharedValue(100);

  const LINE = `M ${cx.value - 100} ${cy.value} L ${cx.value + 100} ${cy.value}`;
  //const CIRCLE = `M ${cx.value},${cy.value - r.value} A ${r.value},${r.value} 0 1,1 ${cx.value},${cy.value + r.value} A ${r.value},${r.value} 0 1,1 ${cx.value},${cy.value - r.value}`;
  //const CIRCLE = `M ${cx.value},${cy.value - r.value} A ${r.value},${r.value} 0 1,0 ${cx.value},${cy.value + r.value} A ${r.value},${r.value} 0 1,0 ${cx.value},${cy.value - r.value}`;
  //const CIRCLE = `M ${cx.value},${cy.value + r.value} A ${r.value},${r.value} 0 1,0 ${cx.value},${cy.value - r.value} A ${r.value},${r.value} 0 1,0 ${cx.value},${cy.value + r.value}`;
  const CIRCLE = `M ${cx.value},${cy.value + r.value} A ${r.value},${r.value} 0 1,1 ${cx.value},${cy.value - r.value} A ${r.value},${r.value} 0 1,1 ${cx.value},${cy.value + r.value}`;

  return (
    <View style={styles.container}>
      <AnimatedSvg
        width={width}
        height={height}
        style={StyleSheet.absoluteFill}
      >
        <AnimatedPath
          animatedProps={{
            animationName: {
              from: { d: LINE },
              to: { d: CIRCLE },
            },
            animationDuration: "2s",
            animationIterationCount: "infinite",
            animationDirection: "alternate",
            animationTimingFunction: "ease-in-out",
          }}
          stroke="red"
          strokeWidth={4}
        />
      </AnimatedSvg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "black",
  },
  buttonContainer: {
    marginBottom: 40,
  },
});
