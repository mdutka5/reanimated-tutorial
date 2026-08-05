import { View, Text, StyleSheet, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsFocused } from "expo-router";
import Contact from "../../../src/components/contacts/Contact";
import { CONTACTS } from "../../../src/data/contacts";
import {
  SharedTransition,
  SharedTransitionBoundary,
} from "react-native-reanimated";

export default function Contacts() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  return (
    <SharedTransitionBoundary isActive={isFocused}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.title}>Contacts</Text>
        <FlatList
          data={CONTACTS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Contact
              id={item.id}
              TRANSITION_TAG={`contact-${item.id}`}
              imageUrl={item.imageUrl}
              name={item.name}
              phoneNumber={item.phoneNumber}
            />
          )}
        />
      </View>
    </SharedTransitionBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#000",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
});
