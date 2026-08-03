import { View, Text, StyleSheet, TextInput, Pressable } from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from "react-native-keyboard-controller";

export default function screen05() {
  return (
    <View style={styles.screen}>
      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        bottomOffset={120}
        showsVerticalScrollIndicator={false}
        mode="layout"
      >
        <View style={styles.gap} />
        <View style={styles.card}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>
            Fill in your details to get started
          </Text>

          <Text style={styles.label}>Full name</Text>
          <TextInput
            style={styles.input}
            placeholder="Alex Rivera"
            placeholderTextColor="#94a3b8"
            autoCapitalize="words"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.gap} />
        <View style={styles.card}>
          <Text style={styles.title}>Security</Text>
          <Text style={styles.subtitle}>
            Choose a password for your account
          </Text>

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="At least 8 characters"
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.label}>Confirm password</Text>
          <TextInput
            style={styles.input}
            placeholder="Repeat your password"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.gap} />
        <View style={[styles.card, { marginBottom: 80 }]}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>
            Optional — you can skip this later
          </Text>

          <Text style={styles.label}>Company</Text>
          <TextInput
            style={styles.input}
            placeholder="Acme Inc."
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.label}>Job title</Text>
          <TextInput
            style={styles.input}
            placeholder="Product designer"
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="A short intro about yourself"
            placeholderTextColor="#94a3b8"
            multiline
          />
        </View>
      </KeyboardAwareScrollView>

      <KeyboardStickyView offset={{ opened: 0, closed: -80 }}>
        <View style={styles.footer}>
          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.buttonSecondary,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.buttonSecondaryText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.buttonPrimary,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.buttonPrimaryText}>Create account</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardStickyView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    paddingBottom: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#334155",
    backgroundColor: "#0f172a",
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: "#334155",
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#f8fafc",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#94a3b8",
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#cbd5e1",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#475569",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: "#f1f5f9",
    backgroundColor: "#0f172a",
    marginBottom: 8,
  },
  textArea: {
    height: 96,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonPrimary: {
    backgroundColor: "#0d9488",
  },
  buttonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#475569",
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonPrimaryText: {
    color: "#f0fdfa",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonSecondaryText: {
    color: "#cbd5e1",
    fontSize: 16,
    fontWeight: "600",
  },
  gap: {
    height: 12,
  },
});
