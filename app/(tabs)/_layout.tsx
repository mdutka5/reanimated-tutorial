import { Platform } from "react-native";
import { NativeTabs } from "expo-router/unstable-native-tabs";

const hideOnAndroid = Platform.OS === "android";

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>01</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="02">
        <NativeTabs.Trigger.Label>02</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="03">
        <NativeTabs.Trigger.Label>03</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="04">
        <NativeTabs.Trigger.Label>04</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="05" hidden={hideOnAndroid}>
        <NativeTabs.Trigger.Label>05</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="06" hidden={hideOnAndroid}>
        <NativeTabs.Trigger.Label>06</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="07" hidden={hideOnAndroid}>
        <NativeTabs.Trigger.Label>07</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="contacts">
        <NativeTabs.Trigger.Label>Contacts</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="skia">
        <NativeTabs.Trigger.Label>Skia</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="sensors">
        <NativeTabs.Trigger.Label>sensors</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
