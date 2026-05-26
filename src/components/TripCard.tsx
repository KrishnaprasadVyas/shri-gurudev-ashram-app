import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { Image } from 'expo-image'

type Props = {
  title: string
  dateRange: string
  image: string
  status?: string
}

const TripCard: React.FC<Props> = ({ title, dateRange, image, status }) => {
  return (
    <Pressable className="mb-4 rounded-xl overflow-hidden shadow-sm bg-white">
      <View className="h-44 w-full bg-gray-200">
        <Image source={{ uri: image }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        {status ? (
          <View className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full">
            <Text className="text-xs text-primary">{status}</Text>
          </View>
        ) : null}
      </View>
      <View className="p-4">
        <Text className="text-lg font-display text-text-charcoal mb-1">{title}</Text>
        <View className="flex-row items-center gap-3 text-secondary">
          <Text className="text-sm text-text-charcoal/70">{dateRange}</Text>
        </View>
      </View>
    </Pressable>
  )
}

export default TripCard
