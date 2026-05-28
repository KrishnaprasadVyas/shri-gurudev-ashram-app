import { BookingRecord, CollectorTask, NotificationItem } from '../types/travel';

// export const travelPackages: TravelPackage[] = [
//   {
//     id: '1',
//     title: 'Kedarnath Yatra',
//     price: '₹18,000',
//     duration: '6 Days / 5 Nights',
//     description: 'A high-altitude yatra with guided darshan, serene stays, and sacred mountain mornings.',
//   },
//   {
//     id: '2',
//     title: 'Haridwar Yatra',
//     price: '₹15,000',
//     duration: '4 Days / 3 Nights',
//     description: 'Temple aarti, Ganga serenity, and a warm spiritual stay designed for peaceful devotion.',
//   },
//   {
//     id: '3',
//     title: 'Dwarka Yatra',
//     price: '₹16,500',
//     duration: '5 Days / 4 Nights',
//     description: 'A sacred coastal journey with temple visits, premium comfort, and calm ocean-side retreating.',
//   },
//   {
//     id: '4',
//     title: 'Rishikesh Yatra',
//     price: '₹14,000',
//     duration: '4 Days / 3 Nights',
//     description: 'Meditation, Ganga aarti, and an atmosphere of stillness shaped for inner renewal.',
//   },
// ];

export const bookingHistory: BookingRecord[] = [
  {
    id: 'b1',
    bookingId: 'BK-000245',
    packageName: 'Haridwar Yatra',
    status: 'Pending',
    travelDate: '12 Jun 2026',
    amount: '₹15,000',
  },
  {
    id: 'b2',
    bookingId: 'BK-000198',
    packageName: 'Dwarka Yatra',
    status: 'Verified',
    travelDate: '01 Jul 2026',
    amount: '₹16,500',
  },
  {
    id: 'b3',
    bookingId: 'BK-000181',
    packageName: 'Kedarnath Yatra',
    status: 'Rejected',
    travelDate: '22 Jul 2026',
    amount: '₹18,000',
  },
];

export const notifications: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Payment under review',
    message: 'Your Goa booking proof is waiting for admin verification.',
    time: '10 min ago',
  },
  {
    id: 'n2',
    title: 'Travel reminder',
    message: 'Your Kerala booking is scheduled for next week.',
    time: '2 hours ago',
  },
  {
    id: 'n3',
    title: 'Document upload needed',
    message: 'Please upload an ID document for your Himalayan trip.',
    time: '1 day ago',
  },
];

export const collectorTasks: CollectorTask[] = [
  {
    id: 'c1',
    title: 'Verify payment proof',
    description: 'Review new booking uploads and verify transaction details.',
    status: 'Open',
  },
  {
    id: 'c2',
    title: 'Document review',
    description: 'Check uploaded identity documents for completed bookings.',
    status: 'In Review',
  },
];
