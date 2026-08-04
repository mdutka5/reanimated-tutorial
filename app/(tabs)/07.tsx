import { useCallback, useMemo, useState } from "react";
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

const INITIAL_DATA: CardData[] = [
  { id: "1", name: "1", color: "#ef4444", bgColor: "#531313" },
  { id: "2", name: "2", color: "#3b82f6", bgColor: "#14265a" },
  { id: "3", name: "3", color: "#22c55e", bgColor: "#0d361d" },
  { id: "4", name: "4", color: "#f97316", bgColor: "#511d0c" },
  { id: "5", name: "5", color: "#a855f7", bgColor: "#391258" },
  { id: "6", name: "6", color: "#14b8a6", bgColor: "#0b3d3a" },
  { id: "7", name: "7", color: "#ec4899", bgColor: "#660f32" },
  { id: "8", name: "8", color: "#92400e", bgColor: "#2d1102" },
  { id: "9", name: "9", color: "#6b7280", bgColor: "#242a35" },
  { id: "10", name: "10", color: "#1e3a8a", bgColor: "#0f1837" },
];

const LIGHT_HEIGHT = 320;

export default function Screen07() {
  const { width } = useWindowDimensions();
  const listRef = useAnimatedRef<Animated.FlatList<CardData>>();
  const scrollX = useSharedValue(0);
  const startX = useSharedValue(0);
  const [data, setData] = useState(INITIAL_DATA);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollInput = useMemo(
    () => data.map((_, i) => i * ITEM_WIDTH),
    [data],
  );
  const bgColors = useMemo(() => data.map((item) => item.bgColor), [data]);

  const maxOffset = Math.max(data.length - 1, 0) * ITEM_WIDTH;
  const sidePad = (width - CARD_WIDTH) / 2;

  useAnimatedReaction(
    () => scrollX.value,
    (value) => {
      scrollTo(listRef, value, 0, false);
    },
  );

  const backgroundStyle = useAnimatedStyle(() => {
    if (bgColors.length === 0) {
      return { backgroundColor: "#0f172a" };
    }
    if (bgColors.length === 1) {
      return { backgroundColor: bgColors[0] };
    }
    return {
      backgroundColor: interpolateColor(scrollX.value, scrollInput, bgColors),
    };
  });

  const handleDismiss = useCallback(
    (id: string) => {
      setData((prev) => {
        const index = prev.findIndex((card) => card.id === id);
        if (index === -1) return prev;

        const next = prev.filter((card) => card.id !== id);
        const newIndex = Math.min(index, Math.max(next.length - 1, 0));

        setCurrentIndex(newIndex);
        scrollX.value = newIndex * ITEM_WIDTH;

        return next;
      });
    },
    [scrollX],
  );

  const pan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-24, 24])
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

      targetIndex = Math.min(Math.max(targetIndex, 0), data.length - 1);

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
    ({ item, index }) => (
      <View style={styles.item}>
        <Card
          item={item}
          dismissible={index === currentIndex}
          onDismiss={handleDismiss}
        />
      </View>
    ),
    [currentIndex, handleDismiss],
  );

  return (
    <Animated.View style={[styles.container, backgroundStyle]}>
      <View style={styles.bottomLight} pointerEvents="none">
        {data.map((item, index) => (
          <LightLayer
            key={item.id}
            color={item.color}
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
        {data.map((item, index) => (
          <LightLayer
            key={item.id}
            color={item.color}
            index={index}
            scrollX={scrollX}
            width={width}
            ITEM_WIDTH={ITEM_WIDTH}
            LIGHT_HEIGHT={LIGHT_HEIGHT}
            bottom={false}
          />
        ))}
      </View>
      <Text style={styles.title}>
        {data.length === 0
          ? "All cards dismissed"
          : `Swipe cards · ${currentIndex + 1}`}
      </Text>
      {data.length > 0 && (
        <View style={styles.listArea}>
          <GestureDetector gesture={pan}>
            <Animated.View>
              <Animated.FlatList
                ref={listRef}
                horizontal
                scrollEnabled={false}
                data={data}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                extraData={currentIndex}
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
            tabsCount={data.length}
            currentIndex={currentIndex}
          />
        </View>
      )}
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
