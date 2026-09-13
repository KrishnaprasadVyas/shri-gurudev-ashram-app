import donationApi from '../api/donationAxiosClient'
import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'
import { Alert, Linking, Platform } from 'react-native'
import { getDonationToken } from './auth'

export const getDonationHeads = async () => {
  try {
    const { data } = await donationApi.get('/api/public/donation-heads')
    return data
  } catch {
    return { success: false, data: [] }
  }
}

export const createDonation = async (body: unknown) => {
  const { data } = await donationApi.post('/api/donations/create', body)
  return data
}

export const createDonationOrder = async (id: string) => {
  const { data } = await donationApi.post('/api/donations/create-order', { donationId: id })
  return data
}

export const verifyDonationPayment = async (body: { donationId?: string; razorpayOrderId?: string; razorpayPaymentId: string; razorpaySignature: string }) => {
  const { data } = await donationApi.post('/api/donations/verify-payment', body)
  return data
}

export const getDonationStatus = async (id: string) => {
  try {
    const { data } = await donationApi.get(`/api/donations/${id}/status`)
    return data
  } catch {
    return { data: null }
  }
}

export const getDonationHistory = async () => {
  try {
    const { data } = await donationApi.get('/api/donations/history')
    return data
  } catch {
    return { data: [] }
  }
}

export const getCollectorDashboard = async () => {
  try {
    const { data } = await donationApi.get('/api/collector/dashboard')
    return data
  } catch {
    return { data: {} }
  }
}

export const applyCollector = async (body: FormData) => {
  const { data } = await donationApi.post('/api/collector/apply', body)
  return data
}

export const reapplyCollector = async (body: FormData) => {
  const { data } = await donationApi.post('/api/collector/reapply', body)
  return data
}

export const getCollectorStatus = async () => {
  try {
    const { data } = await donationApi.get('/api/collector/status')
    return data
  } catch {
    return { data: null }
  }
}

export const getLeaderboard = async () => {
  try {
    const { data } = await donationApi.get('/api/collector/leaderboard')
    return data
  } catch {
    return { leaderboard: [] }
  }
}

export const getRecentDonations = async () => {
  try {
    const { data } = await donationApi.get('/api/public/donations/recent')
    return data
  } catch {
    return []
  }
}

export const getTopDonors = async () => {
  try {
    const { data } = await donationApi.get('/api/public/donations/top')
    return data
  } catch {
    return []
  }
}

export const downloadDonationReceipt = async (params: {
  donationId: string
  receiptUrl?: string
  receiptNumber?: string
  receiptToken?: string
}) => {
  const { donationId, receiptUrl, receiptNumber, receiptToken } = params
  try {
    const baseUrl = donationApi.defaults.baseURL || ''
    let fullUrl = ''

    if (receiptUrl && (receiptUrl.startsWith('http://') || receiptUrl.startsWith('https://'))) {
      fullUrl = receiptUrl
    } else if (receiptUrl && receiptUrl.startsWith('/')) {
      fullUrl = `${baseUrl}${receiptUrl}`
    } else {
      fullUrl = `${baseUrl}/api/donations/${donationId}/receipt${receiptToken ? `?token=${receiptToken}` : ''}`
    }

    if (Platform.OS === 'web') {
      await Linking.openURL(fullUrl)
      return
    }

    const token = await getDonationToken()
    const filename = `Donation_Receipt_${receiptNumber || donationId}.pdf`
    const targetUri = `${FileSystem.cacheDirectory}${filename}`

    const headers: Record<string, string> = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const downloadRes = await FileSystem.downloadAsync(fullUrl, targetUri, { headers })

    if (downloadRes.status !== 200) {
      Alert.alert('Receipt Pending', 'Your 80G tax receipt is being generated. Please refresh in a moment.')
      return
    }

    const isAvailable = await Sharing.isAvailableAsync()
    if (isAvailable) {
      await Sharing.shareAsync(downloadRes.uri, {
        UTI: 'com.adobe.pdf',
        mimeType: 'application/pdf',
        dialogTitle: 'Ashram Donation Receipt',
      })
    } else {
      Alert.alert('Success', `Receipt saved to device cache as ${filename}`)
    }
  } catch (error) {
    console.error('Error downloading receipt:', error)
    Alert.alert('Download Error', 'Unable to download receipt at this time. Please check your connection and try again.')
  }
}

export const collectCashDonation = async (body: {
  donor: {
    name: string
    mobile: string
    idNumber: string
    address?: string
    anonymousDisplay?: boolean
  }
  donationHead: {
    id?: string
    key?: string
    name?: string
  }
  amount: number
  notes?: string
}) => {
  const { data } = await donationApi.post('/api/collector/collect-cash', body)
  return data
}


