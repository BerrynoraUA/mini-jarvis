import "./global.css";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-canvas px-8">
      <Text className="font-display text-4xl text-ink">Mini Jarvis</Text>
      <Text className="mt-3 text-base text-muted-fg">
        A calmer way to work.
      </Text>
      <View className="mt-8 flex-row gap-2">
        <View className="rounded-full bg-terracotta px-4 py-2">
          <Text className="text-sm text-canvas">terracotta</Text>
        </View>
        <View className="rounded-full bg-sage px-4 py-2">
          <Text className="text-sm text-canvas">sage</Text>
        </View>
        <View className="rounded-full bg-sky px-4 py-2">
          <Text className="text-sm text-ink">sky</Text>
        </View>
      </View>
      <StatusBar style="dark" />
    </View>
  );
}
