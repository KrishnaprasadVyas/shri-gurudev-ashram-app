// ─── Seva Type ───────────────────────────────────────────────────────────────
export type SevaType = 'annadan' | 'yajman';

export const SEVA_LABELS: Record<string, { title: string; subtitle: string; icon: string; color: string }> = {
  annadan: {
    title: 'Annadan',
    subtitle: 'Mahaprasad Seva',
    icon: 'rice-bowl',
    color: '#E65C00',
  },
  yajman: {
    title: 'Guruji Aarti Seva',
    subtitle: 'Yajman Booking',
    icon: 'local-fire-department',
    color: '#B97512',
  },
};

const DEFAULT_SEVA_LABEL = {
  title: 'Special Seva',
  subtitle: 'Ashram Seva',
  icon: 'spa', // generic spiritual/wellness icon
  color: '#8B5A00', // standard ashram brown/gold
};

export function getSevaLabel(type: string) {
  return SEVA_LABELS[type] || { ...DEFAULT_SEVA_LABEL, title: type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') };
}

export function generateTransactionId(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `TXN-${timestamp}-${randomStr}`
}
