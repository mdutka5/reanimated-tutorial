import { StyleSheet } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Rect,
} from "react-native-svg";

type LightLayerProps = {
  color: string;
  index: number;
  scrollX: SharedValue<number>;
  width: number;
  ITEM_WIDTH: number;
  LIGHT_HEIGHT: number;
  bottom?: boolean;
};

export default function LightLayer({
  color,
  index,
  scrollX,
  width,
  ITEM_WIDTH,
  LIGHT_HEIGHT,
  bottom = true,
}: LightLayerProps) {
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollX.value,
      [(index - 1) * ITEM_WIDTH, index * ITEM_WIDTH, (index + 1) * ITEM_WIDTH],
      [0, 1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const gradientId = `cardLight-${bottom ? "bottom" : "top"}-${index}`;

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, style]}
      pointerEvents="none"
    >
      <Svg width={width} height={LIGHT_HEIGHT}>
        <Defs>
          <RadialGradient
            id={gradientId}
            cx="50%" // center X
            cy={bottom ? "100%" : "0%"} // sit on bottom or top edge
            rx="70%" // horizontal spread
            ry="55%" // vertical spread — taller = more “spotlight”
          >
            <Stop offset="0" stopColor={color} stopOpacity="0.75" />
            <Stop offset="0.45" stopColor={color} stopOpacity="0.3" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect
          x="0"
          y="0"
          width={width}
          height={LIGHT_HEIGHT}
          fill={`url(#${gradientId})`}
        />
      </Svg>
    </Animated.View>
  );
}
