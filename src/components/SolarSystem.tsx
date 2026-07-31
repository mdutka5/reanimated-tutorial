import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import Planet from "./Planet";

export default function SolarSystem() {
  return (
    <View>
      <Planet
        radius={0}
        rotationalVelocity={5}
        angularVelocity={0}
        colors={{ left: "#FFD700", right: "#FF8C00" }}
        size={60}
      />

      {/* Mercury */}
      <Planet
        radius={40}
        rotationalVelocity={20}
        angularVelocity={3.0}
        colors={{ left: "#8c8c8c", right: "#5a5a5a" }}
        size={6}
      />

      {/* Venus */}
      <Planet
        radius={55}
        rotationalVelocity={-15} // retrograde spin, like the real Venus
        angularVelocity={2.2}
        colors={{ left: "#e0c16c", right: "#c9a856" }}
        size={10}
      />

      {/* Earth */}
      <Planet
        radius={70}
        rotationalVelocity={100}
        angularVelocity={1.6}
        colors={{ left: "#2b6cb0", right: "#2f855a" }}
        size={10}
      />

      {/* Mars */}
      <Planet
        radius={85}
        rotationalVelocity={95}
        angularVelocity={1.1}
        colors={{ left: "#c1440e", right: "#8b2f0e" }}
        size={8}
      />

      {/* Jupiter */}
      <Planet
        radius={115}
        rotationalVelocity={250}
        angularVelocity={0.6}
        colors={{ left: "#d9a066", right: "#b57b4a" }}
        size={26}
      />

      {/* Saturn */}
      <Planet
        radius={145}
        rotationalVelocity={230}
        angularVelocity={0.4}
        colors={{ left: "#e6c98a", right: "#d1b16f" }}
        size={22}
      />

      {/* Uranus */}
      <Planet
        radius={175}
        rotationalVelocity={150}
        angularVelocity={0.25}
        colors={{ left: "#7fdbdb", right: "#5fb8b8" }}
        size={16}
      />

      {/* Neptune */}
      <Planet
        radius={205}
        rotationalVelocity={160}
        angularVelocity={0.15}
        colors={{ left: "#3b5bdb", right: "#2c46a8" }}
        size={15}
      />
    </View>
  );
}
