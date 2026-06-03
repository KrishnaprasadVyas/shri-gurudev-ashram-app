export type TravelPackage = {
  id: string;
  title: string;
  price: string;
  priceAmount?: number;
  duration: string;
  description: string;
};

export type BookingStatus = 'payment_pending' | 'paid' | 'cancelled' | 'completed';

export type Booking = {
  id: string;
  bookingReference: string;
  packageId: string;
  userId: string;
  travelerCount: number;
  specialNotes: string | null;
  totalAmount: number;
  status: BookingStatus;
  createdAt?: string;
};

export type CreateBookingInput = {
  packageId: string;
  travelerCount: number;
  specialNotes?: string;
};

export type BookingRecord = {
  id: string;
  bookingId: string;
  packageName: string;
  status: 'Payment Pending' | 'Paid' | 'Cancelled' | 'Completed';
  travelDate: string;
  amount: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
};

export type CollectorTask = {
  id: string;
  title: string;
  description: string;
  status: 'Open' | 'In Review' | 'Approved';
};
