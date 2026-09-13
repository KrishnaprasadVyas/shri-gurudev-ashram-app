import React, { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { getDonationHistory, downloadDonationReceipt } from '../src/services/donation'
import { formatDateIST } from '../src/utils/date'

const C = {
  bg: '#FAF6F0',
  card: '#FFFFFF',
  cardBorder: '#F0E7DD',
  saffron: '#B8860B',
  saffronDark: '#8B6914',
  saffronLight: '#FFF5E1',
  orange: '#E65C00',
  text: '#2B231B',
  textSoft: '#7E7162',
  textMuted: '#9E9080',
  success: '#3D7A4A',
  pending: '#B8860B',
  error: '#D32F2F',
}

type DonationItem = {
  _id: string
  donationHead?: {
    name?: string | Record<string, string>
  }
  amount: number
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | string
  createdAt: string
  receiptNumber?: string
  receiptUrl?: string
}

function getCauseName(head?: any): string {
  if (!head) return 'General Seva'
  if (typeof head === 'string') return head
  if (typeof head.name === 'string') return head.name
  return head.name?.en || head.name?.hi || Object.values(head.name || {})[0] || 'General Seva'
}

export default function DonationHistoryScreen() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'PENDING' | 'FAILED'>('ALL')

  const { data: donations = [], isLoading, refetch, isRefetching } = useQuery<DonationItem[]>({
    queryKey: ['my-donations-history'],
    queryFn: async () => {
      const res = await getDonationHistory()
      return Array.isArray(res) ? res : res.data || []
    },
  })

  const totalDonated = donations
    .filter((d) => d.status === 'SUCCESS')
    .reduce((sum, d) => sum + (d.amount || 0), 0)

  const filteredDonations = donations.filter((d) => {
    const cause = getCauseName(d.donationHead).toLowerCase()
    const receipt = (d.receiptNumber || '').toLowerCase()
    const id = (d._id || '').toLowerCase()
    const query = searchQuery.toLowerCase().trim()

    const matchesSearch = !query || cause.includes(query) || receipt.includes(query) || id.includes(query)
    const matchesFilter = statusFilter === 'ALL' || d.status === statusFilter

    return matchesSearch && matchesFilter
  })

  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const handleDownloadReceipt = async (item: DonationItem) => {
    if (downloadingId) return
    setDownloadingId(item._id)
    try {
      await downloadDonationReceipt({
        donationId: item._id,
        receiptUrl: item.receiptUrl,
        receiptNumber: item.receiptNumber,
      })
    } finally {
      setDownloadingId(null)
    }
  }

  const renderStatusBadge = (status: string) => {
    let color = C.pending
    let bg = C.saffronLight
    let label = 'PENDING'

    if (status === 'SUCCESS') {
      color = C.success
      bg = '#E8F5E9'
      label = 'SUCCESS'
    } else if (status === 'FAILED') {
      color = C.error
      bg = '#FFEBEE'
      label = 'FAILED'
    }

    return (
      <View style={[styles.badge, { backgroundColor: bg }]}>
        <Text style={[styles.badgeText, { color }]}>{label}</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={C.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Donation History</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Contributions</Text>
          <Text style={styles.summaryValue}>₹{totalDonated.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Successful Donations</Text>
          <Text style={styles.summaryValue}>{donations.filter((d) => d.status === 'SUCCESS').length}</Text>
        </View>
      </View>

      {/* Search & Filter */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={20} color={C.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search cause or receipt #"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={C.textMuted}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={18} color={C.textMuted} />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.filterRow}>
          {(['ALL', 'SUCCESS', 'PENDING', 'FAILED'] as const).map((st) => (
            <Pressable
              key={st}
              style={[styles.filterChip, statusFilter === st && styles.filterChipActive]}
              onPress={() => setStatusFilter(st)}
            >
              <Text style={[styles.filterChipText, statusFilter === st && styles.filterChipTextActive]}>
                {st}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* History List */}
      {isLoading ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={C.orange} />
        </View>
      ) : (
        <FlatList
          data={filteredDonations}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.orange} />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <MaterialIcons name="volunteer-activism" size={48} color={C.textMuted} />
              <Text style={styles.emptyTitle}>No Donations Found</Text>
              <Text style={styles.emptyText}>
                {searchQuery || statusFilter !== 'ALL'
                  ? 'Try adjusting your search or filter options.'
                  : 'You have not made any donations yet.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.causeTitle} numberOfLines={1}>
                    {getCauseName(item.donationHead)}
                  </Text>
                  <Text style={styles.dateText}>{formatDateIST(item.createdAt)}</Text>
                </View>
                {renderStatusBadge(item.status)}
              </View>

              <View style={styles.divider} />

              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.amountLabel}>Amount Offered</Text>
                  <Text style={styles.amountValue}>₹{item.amount.toLocaleString('en-IN')}</Text>
                </View>

                {item.status === 'SUCCESS' ? (
                  <Pressable
                    style={[styles.receiptBtn, downloadingId === item._id && { opacity: 0.7 }]}
                    onPress={() => handleDownloadReceipt(item)}
                    disabled={downloadingId === item._id}
                  >
                    {downloadingId === item._id ? (
                      <ActivityIndicator size="small" color={C.orange} />
                    ) : (
                      <>
                        <MaterialIcons name="receipt" size={16} color={C.orange} />
                        <Text style={styles.receiptBtnText}>80G Receipt</Text>
                      </>
                    )}
                  </Pressable>
                ) : null}
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderBottomColor: C.cardBorder,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  summaryLabel: {
    fontSize: 12,
    color: C.textSoft,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
    color: C.orange,
    marginTop: 4,
  },
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: C.text,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  filterChipActive: {
    backgroundColor: C.orange,
    borderColor: C.orange,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.textSoft,
  },
  filterChipTextActive: {
    color: '#FFF',
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
    gap: 12,
  },
  card: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  causeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },
  dateText: {
    fontSize: 12,
    color: C.textMuted,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: C.cardBorder,
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 11,
    color: C.textMuted,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '800',
    color: C.text,
  },
  receiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.saffronLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  receiptBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.orange,
  },
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },
  emptyText: {
    fontSize: 13,
    color: C.textMuted,
    textAlign: 'center',
  },
})
