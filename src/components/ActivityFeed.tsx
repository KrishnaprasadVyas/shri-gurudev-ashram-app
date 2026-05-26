import React from 'react'
import { View, Text, FlatList } from 'react-native'

const DATA = [
  { id: '1', title: 'Donation of ₹5,001 to Temple Restoration Fund', time: '2 hours ago' },
  { id: '2', title: 'Payment received for Kailash Yatra', time: 'Yesterday, 4:30 PM' },
  { id: '3', title: 'Packing list updated for Varanasi Walk', time: '3 days ago' },
]

const ActivityFeed: React.FC = () => {
  return (
    <View className="rounded-xl p-4 bg-white border border-outline-variant/10 shadow-sm">
      <Text className="text-lg font-display text-text-charcoal mb-4">Recent Activity</Text>
      <FlatList
        data={DATA}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View className="flex-row gap-3 mb-3">
            <View className="w-10 h-10 rounded-full bg-saffron-light/10 items-center justify-center">
              <Text className="text-saffron-light">★</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base text-text-charcoal">{item.title}</Text>
              <Text className="text-xs text-text-charcoal/60 mt-1">{item.time}</Text>
            </View>
          </View>
        )}
      />
    </View>
  )
}

export default ActivityFeed
