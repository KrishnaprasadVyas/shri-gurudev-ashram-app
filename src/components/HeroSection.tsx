import React from 'react'
import { View, Text, ImageBackground, Pressable } from 'react-native'
import { Image } from 'expo-image'
import { BlurView } from 'expo-blur'

const HeroSection: React.FC = () => {
  return (
    <ImageBackground
      source={{ uri: 'https://picsum.photos/1200/800' }}
      className="w-full h-56 rounded-2xl overflow-hidden"
      resizeMode="cover"
    >
      <BlurView intensity={60} className="flex-1 p-4 justify-end">
        <View className="bg-white/30 rounded-xl p-4 glass-card">
          <Text className="text-xl font-display text-text-charcoal">Namaste, Aryan</Text>
          <Text className="text-sm text-text-charcoal/80 mt-1">Your spiritual journey continues.</Text>
          <View className="mt-3 flex-row items-center justify-between">
            <Pressable className="bg-saffron-light px-4 py-2 rounded-full">
              <Text className="text-white font-medium">Donate</Text>
            </Pressable>
            <Text className="text-sm text-text-charcoal/70">Next: Oct 15, 2023</Text>
          </View>
        </View>
      </BlurView>
    </ImageBackground>
  )
}

export default HeroSection
