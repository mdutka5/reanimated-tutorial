import { Stack } from "expo-router";

export default function ContactsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Contact",
          headerShown: false,
          headerBackTitle: "Contacts",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: "#F2F2F7" },
        }}
      />
    </Stack>
  );
}
