import { Text, StyleSheet, View } from "react-native";

export type CardData = {
  id: string;
  name: string;
  color: string;
};

export const CARD_WIDTH = 300;
export const CARD_GAP = 16;
export const ITEM_WIDTH = CARD_WIDTH + CARD_GAP;

export const SWIPE_THRESHOLD = 120;
export const VELOCITY_THRESHOLD = 800;

type CardProps = {
  item: CardData;
};

export default function Card({ item }: CardProps) {
  return (
    <View style={[styles.card, { backgroundColor: item.color }]}>
      <Text style={styles.title}>{item.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: 420,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#f8fafc",
  },
});
