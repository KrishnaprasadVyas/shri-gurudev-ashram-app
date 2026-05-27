import React from 'react'
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useNavigation } from '@react-navigation/native'
import { TravelStackParamList } from '../../navigators/TravelStackNavigator'
import { SafeAreaView } from 'react-native-safe-area-context'

const trips = [
  {
    title: 'Haridwar',
    date: 'OCT 12 - OCT 18',
    description:
      'The Gateway to God. Experience the divine energy of the evening Aarti and sacred dips in the purifying waters of the Ganges.',
    image:
      'https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=1200&auto=format&fit=crop',
  },
  {
    title: 'Kedarnath',
    date: 'NOV 05 - NOV 12',
    description:
      'A trek to the soul. High in the Himalayas, find solitude and inner strength in one of the holiest shrines of Lord Shiva.',
    image:
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1200&auto=format&fit=crop',
  },
  {
    title: 'Dwarka',
    date: 'DEC 01 - DEC 07',
    description:
      'The Kingdom of Krishna. Walk the shores where mythology meets the ocean.',
    image:
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=1200&auto=format&fit=crop',
  },
  {
    title: 'Rishikesh',
    date: 'JAN 15 - JAN 22',
    description:
      'Yoga Capital of the World. Find balance through meditation and mindfulness.',
    image:
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=1200&auto=format&fit=crop',
  },
]

type TravelNav = NativeStackNavigationProp<TravelStackParamList, 'TravelList'>

export default function TravelScreen() {
  const navigation = useNavigation<TravelNav>()

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?img=47' }} style={styles.profileImage} />
            <Text style={styles.logo}>Ashram</Text>
          </View>

          <Text style={styles.notification}>🔔</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Spiritual Journeys</Text>
          <Text style={styles.heroText}>
            Embark on a transformative pilgrimage to India’s most sacred sites. Find peace, clarity, and connection in the footsteps of ancient wisdom.
          </Text>
        </View>

        {trips.map((trip, index) => (
          <View key={index} style={styles.card}>
            <Image source={{ uri: trip.image }} style={styles.cardImage} />

            <View style={styles.cardContent}>
              <Text style={styles.cardDate}>{trip.date}</Text>
              <Text style={styles.cardTitle}>{trip.title}</Text>
              <Text style={styles.cardDescription}>{trip.description}</Text>

              <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('TravelRegistration')}>
                <Text style={styles.buttonText}>Register Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF9F4',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notification: {
    fontSize: 24,
  },
  profileImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
  },
  logo: {
    fontSize: 28,
    fontWeight: '700',
    color: '#8D4B00',
  },
  hero: {
    marginTop: 40,
    marginBottom: 30,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#1B1C19',
    marginBottom: 14,
  },
  heroText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#554336',
  },
  card: {
    backgroundColor: '#F5F3EE',
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 4,
  },
  cardImage: {
    width: '100%',
    height: 220,
  },
  cardContent: {
    padding: 20,
  },
  cardDate: {
    fontSize: 13,
    color: '#7A6A58',
    marginBottom: 10,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#8D4B00',
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 15,
    lineHeight: 24,
    color: '#554336',
    marginBottom: 22,
  },
  button: {
    backgroundColor: '#8D4B00',
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
})
