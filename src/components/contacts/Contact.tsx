import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, { SharedTransition } from "react-native-reanimated";
import { router } from "expo-router";

const AVATAR_SIZE = 40;

export default function Contact({
  id,
  TRANSITION_TAG,
  imageUrl,
  name,
  phoneNumber,
}: {
  id: string;
  TRANSITION_TAG: string;
  imageUrl: string;
  name: string;
  phoneNumber: string;
}) {
  return (
    <Pressable
      style={styles.row}
      onPress={() => {
        router.push(`/contacts/${id}`);
      }}
    >
      <Animated.Image
        source={{ uri: imageUrl }}
        style={styles.avatar}
        sharedTransitionTag={TRANSITION_TAG}
      />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.phone} numberOfLines={1}>
          {phoneNumber}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    gap: 12,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "#C7C7CC",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#C6C6C8",
  },
  name: {
    fontSize: 17,
    fontWeight: "400",
    color: "#000",
    letterSpacing: -0.4,
  },
  phone: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: "400",
    color: "#8E8E93",
    letterSpacing: -0.2,
  },
});
