import type { MarketStatus } from '../../types/market.types';

export const RESOLVED_MARKET_STATUSES: MarketStatus[] = [4, 5];

const statusLabels: Record<number, { label: string; className: string }> = {
  1: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700' },
  2: { label: 'Created', className: 'bg-gray-100 text-gray-700' },
  3: { label: 'Active', className: 'bg-green-100 text-green-700' },
  4: { label: 'Resolved', className: 'bg-purple-100 text-purple-700' },
  5: { label: 'Closed', className: 'bg-gray-100 text-gray-700' },
};

export function getMarketStatusMeta(status: number) {
  return (
    statusLabels[status] ?? {
      label: String(status),
      className: 'bg-gray-100 text-gray-700',
    }
  );
}
