import { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  ListRenderItem,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  interpolateColor,
  runOnJS,
  scrollTo,
  useAnimatedRef,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Card, {
  CardData,
  CARD_WIDTH,
  ITEM_WIDTH,
  SWIPE_THRESHOLD,
  VELOCITY_THRESHOLD,
} from "../../src/components/Card";
import HorizontalScrollTabs from "../../src/components/HorizontalScrollTabs";
import LightLayer from "../../src/components/LightLayer";

const DATA: CardData[] = [
  { id: "1", name: "1", color: "#ef4444" },
  { id: "2", name: "2", color: "#3b82f6" },
  { id: "3", name: "3", color: "#22c55e" },
  { id: "4", name: "4", color: "#f97316" },
  { id: "5", name: "5", color: "#a855f7" },
  { id: "6", name: "6", color: "#14b8a6" },
  { id: "7", name: "7", color: "#ec4899" },
  { id: "8", name: "8", color: "#92400e" },
  { id: "9", name: "9", color: "#6b7280" },
  { id: "10", name: "10", color: "#1e3a8a" },
];

const LIGHT_HEIGHT = 320;

const SCROLL_INPUT = DATA.map((_, i) => i * ITEM_WIDTH);
const CARD_COLORS = DATA.map((item) => item.color);
const BG_COLORS = [
  "#531313", // darker red
  "#14265a", // darker blue
  "#0d361d", // darker green
  "#511d0c", // darker orange/brown
  "#391258", // darker purple
  "#0b3d3a", // darker teal
  "#660f32", // darker pink
  "#2d1102", // darker brown
  "#242a35", // darker gray
  "#0f1837", // darker navy
];

export default function Screen07() {
  const { width } = useWindowDimensions();
  const listRef = useAnimatedRef<Animated.FlatList<CardData>>();
  const scrollX = useSharedValue(0);
  const startX = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const maxOffset = (DATA.length - 1) * ITEM_WIDTH;
  const sidePad = (width - CARD_WIDTH) / 2;

  useAnimatedReaction(
    () => scrollX.value,
    (value) => {
      scrollTo(listRef, value, 0, false);
    },
  );

  const backgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(scrollX.value, SCROLL_INPUT, BG_COLORS),
  }));

  const pan = Gesture.Pan()
    .onBegin(() => {
      startX.value = scrollX.value;
    })
    .onUpdate((e) => {
      scrollX.value = Math.min(
        Math.max(startX.value - e.translationX, 0),
        maxOffset,
      );
    })
    .onEnd((e) => {
      const startIndex = Math.round(startX.value / ITEM_WIDTH);
      const shouldSwipe =
        Math.abs(e.translationX) > SWIPE_THRESHOLD ||
        Math.abs(e.velocityX) > VELOCITY_THRESHOLD;

      let targetIndex = startIndex;
      if (shouldSwipe) {
        targetIndex =
          e.translationX + e.velocityX > 0 ? startIndex - 1 : startIndex + 1;
      }

      targetIndex = Math.min(Math.max(targetIndex, 0), DATA.length - 1);

      scrollX.value = withTiming(
        targetIndex * ITEM_WIDTH,
        { duration: 440, easing: Easing.out(Easing.cubic) },
        (finished) => {
          if (finished) {
            runOnJS(setCurrentIndex)(targetIndex);
          }
        },
      );
    });

  const renderItem: ListRenderItem<CardData> = useCallback(
    ({ item }) => (
      <View style={styles.item}>
        <Card item={item} />
      </View>
    ),
    [],
  );

  return (
    <Animated.View style={[styles.container, backgroundStyle]}>
      <View style={styles.bottomLight} pointerEvents="none">
        {CARD_COLORS.map((color, index) => (
          <LightLayer
            key={DATA[index].id}
            color={color}
            index={index}
            scrollX={scrollX}
            width={width}
            ITEM_WIDTH={ITEM_WIDTH}
            LIGHT_HEIGHT={LIGHT_HEIGHT}
            bottom
          />
        ))}
      </View>
      <View style={styles.topLight} pointerEvents="none">
        {CARD_COLORS.map((color, index) => (
          <LightLayer
            key={DATA[index].id}
            color={color}
            index={index}
            scrollX={scrollX}
            width={width}
            ITEM_WIDTH={ITEM_WIDTH}
            LIGHT_HEIGHT={LIGHT_HEIGHT}
            bottom={false}
          />
        ))}
      </View>
      <Text style={styles.title}>Swipe cards · {currentIndex + 1}</Text>
      <View style={styles.listArea}>
        <GestureDetector gesture={pan}>
          <Animated.View>
            <Animated.FlatList
              ref={listRef}
              horizontal
              scrollEnabled={false}
              data={DATA}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              getItemLayout={(_, index) => ({
                length: ITEM_WIDTH,
                offset: ITEM_WIDTH * index,
                index,
              })}
              contentContainerStyle={{ paddingHorizontal: sidePad }}
              showsHorizontalScrollIndicator={false}
            />
          </Animated.View>
        </GestureDetector>
        <HorizontalScrollTabs
          tabsCount={DATA.length}
          currentIndex={currentIndex}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listArea: {
    flex: 1,
    justifyContent: "center",
  },
  bottomLight: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: LIGHT_HEIGHT,
  },
  topLight: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: LIGHT_HEIGHT,
  },
  title: {
    position: "absolute",
    top: 120,
    left: 0,
    right: 0,
    zIndex: 1,
    fontSize: 24,
    fontWeight: "700",
    color: "#f8fafc",
    textAlign: "center",
  },
  item: {
    width: ITEM_WIDTH,
  },
});
