import { View, StyleSheet } from "react-native";

export default function HorizontalScrollTabs({
  tabsCount,
  currentIndex,
}: {
  tabsCount: number;
  currentIndex: number;
}) {
  return (
    <View style={styles.container}>
      {Array.from({ length: tabsCount }, (_, i: number) => (
        <View
          key={i}
          style={[styles.tab, currentIndex === i ? styles.currentTab : {}]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tab: {
    width: 15,
    height: 5,
    backgroundColor: "gray",
  },
  currentTab: {
    backgroundColor: "white",
  },
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 24,
  },
});
