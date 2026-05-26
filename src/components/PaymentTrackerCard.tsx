import React from 'react'
import { View, Text, Animated } from 'react-native'

const PaymentTrackerCard: React.FC = () => {
  const progress = 0.65
  const width = `${Math.round(progress * 100)}%`

  return (
    <View className="rounded-xl p-6 bg-surface-container-low border border-outline-variant/20 shadow-sm">
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-xs text-primary uppercase">Payment Tracker</Text>
          <Text className="text-lg font-display text-text-charcoal mt-1">Kailash Mansarovar Yatra</Text>
        </View>
        <View className="bg-primary-container/10 px-3 py-1 rounded-full">
          <Text className="text-xs text-primary">Next: Oct 15, 2023</Text>
        </View>
      </View>

      <View className="mb-4">
        <View className="flex-row justify-between items-end mb-2">
          <Text className="text-base"><Text className="font-bold">65%</Text> Completed</Text>
          <Text className="text-sm text-text-charcoal/70">₹1,95,000 / ₹3,00,000</Text>
        </View>
        <View className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
          <Animated.View style={{ width }} className="bg-saffron-light h-full rounded-full" />
        </View>
      </View>

      <View className="flex-row justify-between gap-3">
        <View className="flex-1 p-3 rounded-lg bg-surface-container-low border border-outline-variant/10">
          <Text className="text-xs text-text-charcoal/70">Total Amount</Text>
          <Text className="text-lg font-display">₹3,00,000</Text>
        </View>
        <View className="flex-1 p-3 rounded-lg bg-surface-container-low border border-outline-variant/10">
          <Text className="text-xs text-text-charcoal/70">Paid Amount</Text>
          <Text className="text-lg font-display text-primary">₹1,95,000</Text>
        </View>
        <View className="flex-1 p-3 rounded-lg bg-primary/5 border border-primary/10">
          <Text className="text-xs text-primary">Next Installment</Text>
          <Text className="text-lg font-display text-primary">₹35,000</Text>
        </View>
      </View>
    </View>
  )
}

export default PaymentTrackerCard
