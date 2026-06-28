// ─── Seva Type ───────────────────────────────────────────────────────────────
export type SevaType = 'annadan' | 'yajman';

// ─── Fixed Amounts (Phase 1) ─────────────────────────────────────────────────
// Change these values here to update across the entire app.
export const ANNADAN_AMOUNT = 2100;
export const YAJMAN_AMOUNT  = 5100; // Confirm with Ashram before release

// ─── Display Labels ───────────────────────────────────────────────────────────
export const SEVA_LABELS: Record<SevaType, { title: string; subtitle: string; icon: string; color: string }> = {
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

// ─── Booking Reference Generators ────────────────────────────────────────────
export function generateAnnadanReference(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `ANN-${year}-${rand}`;
}

export function generateYajmanReference(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `YAJ-${year}-${rand}`;
}

export function generateSevaReference(type: SevaType): string {
  return type === 'annadan' ? generateAnnadanReference() : generateYajmanReference();
}

export function generateTransactionId(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(10000000 + Math.random() * 90000000);
  return `TXN-${year}-${rand}`;
}

// ─── Amount by type ───────────────────────────────────────────────────────────
export function getSevaAmount(type: SevaType): number {
  return type === 'annadan' ? ANNADAN_AMOUNT : YAJMAN_AMOUNT;
}
