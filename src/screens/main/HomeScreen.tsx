import React from 'react'
import { SafeAreaView, ScrollView, View, Text } from 'react-native'

import HeroSection from '../../components/HeroSection'
import PaymentTrackerCard from '../../components/PaymentTrackerCard'
import TripCard from '../../components/TripCard'
import ActivityFeed from '../../components/ActivityFeed'

const HomeScreen: React.FC = () => {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 48 }}
        className="px-6 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <HeroSection />

        <View className="mt-6">
          <PaymentTrackerCard />
        </View>

        <View className="mt-8">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-2xl font-bold text-black">
              My Trips
            </Text>

            <Text className="text-sm text-orange-500">
              View All
            </Text>
          </View>

          <TripCard
            title="Varanasi Spiritual Walk"
            dateRange="Nov 12 - Nov 18"
            image="https://picsum.photos/800/600"
            status="CONFIRMED"
          />

          <TripCard
            title="Rishikesh Yoga Retreat"
            dateRange="June 05 - June 15"
            image="https://picsum.photos/801/600"
            status="PAST TRIP"
          />
        </View>

        <View className="mt-8">
          <ActivityFeed />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default HomeScreen