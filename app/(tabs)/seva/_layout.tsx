import { Stack } from 'expo-router'
import { usePathname } from 'expo-router'

export default function SevaLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="annadan/index" />
      <Stack.Screen name="annadan/details" />
      <Stack.Screen name="annadan/review" />
      <Stack.Screen name="yajman/index" />
      <Stack.Screen name="yajman/details" />
      <Stack.Screen name="yajman/review" />
    </Stack>
  )
}
