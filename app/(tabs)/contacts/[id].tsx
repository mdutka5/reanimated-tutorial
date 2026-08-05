import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, {
  SharedTransition,
  SharedTransitionBoundary,
} from "react-native-reanimated";
import { router, useIsFocused, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CONTACTS } from "../../../src/data/contacts";

const AVATAR_SIZE = 120;
const transition = SharedTransition.duration(550).springify();

export default function ContactDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const contact = CONTACTS.find((item) => item.id === id);

  if (!contact) {
    return (
      <View style={styles.container}>
        <Text style={styles.missing}>Contact not found</Text>
      </View>
    );
  }

  return (
    <SharedTransitionBoundary isActive={isFocused}>
      <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
        <Pressable
          style={styles.back}
          onPress={() => router.back()}
          hitSlop={8}
        >
          <Text style={styles.backText}>Contacts</Text>
        </Pressable>
        <Animated.Image
          source={{ uri: contact.imageUrl }}
          style={styles.avatar}
          sharedTransitionTag={`contact-${contact.id}`}
          sharedTransitionStyle={transition}
        />
        <Text style={styles.name}>{contact.name}</Text>
        <View style={styles.card}>
          <Text style={styles.label}>phone</Text>
          <Text style={styles.value}>{contact.phoneNumber}</Text>
        </View>
      </View>
    </SharedTransitionBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  back: {
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  backText: {
    fontSize: 17,
    color: "#007AFF",
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "#C7C7CC",
    marginBottom: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: "600",
    color: "#000",
    letterSpacing: -0.4,
    marginBottom: 28,
    textAlign: "center",
  },
  card: {
    alignSelf: "stretch",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  label: {
    fontSize: 13,
    color: "#8E8E93",
    marginBottom: 4,
    textTransform: "lowercase",
  },
  value: {
    fontSize: 17,
    color: "#007AFF",
  },
  missing: {
    marginTop: 40,
    fontSize: 17,
    color: "#8E8E93",
  },
});
