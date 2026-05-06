import type { MarketStatus } from '../../types/market.types';

export const MARKET_STATUS = {
  PENDING: 1,
  MARKET_CREATE_SUBMITTED: 2,
  MARKET_CREATED: 3,
  USDC_APPROVE_SUBMITTED: 4,
  USDC_APPROVED: 5,
  SPLIT_SUBMITTED: 6,
  SPLIT_CONFIRMED: 7,
  TOKEN_REGISTER_SUBMITTED: 8,
  PLACING_YES_LIQUIDITY_ORDERS: 9,
  PLACING_NO_LIQUIDITY_ORDERS: 10,
  ACTIVE: 11,
  FAILED: 12,
  RESOLVED: 13,
  PAIDOUT: 14,
  CANCELLED: 15,
} as const;

export const RESOLVED_MARKET_STATUSES: MarketStatus[] = [
  MARKET_STATUS.RESOLVED,
  MARKET_STATUS.PAIDOUT,
  MARKET_STATUS.CANCELLED,
];

const statusLabels: Record<number, { label: string; className: string }> = {
  [MARKET_STATUS.PENDING]: {
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-700',
  },

  [MARKET_STATUS.MARKET_CREATE_SUBMITTED]: {
    label: 'Creating Market',
    className: 'bg-blue-100 text-blue-700',
  },

  [MARKET_STATUS.MARKET_CREATED]: {
    label: 'Market Created',
    className: 'bg-indigo-100 text-indigo-700',
  },

  [MARKET_STATUS.USDC_APPROVE_SUBMITTED]: {
    label: 'Approving USDC',
    className: 'bg-blue-100 text-blue-700',
  },

  [MARKET_STATUS.USDC_APPROVED]: {
    label: 'USDC Approved',
    className: 'bg-indigo-100 text-indigo-700',
  },

  [MARKET_STATUS.SPLIT_SUBMITTED]: {
    label: 'Splitting Positions',
    className: 'bg-blue-100 text-blue-700',
  },

  [MARKET_STATUS.SPLIT_CONFIRMED]: {
    label: 'Positions Ready',
    className: 'bg-indigo-100 text-indigo-700',
  },

  [MARKET_STATUS.TOKEN_REGISTER_SUBMITTED]: {
    label: 'Registering Tokens',
    className: 'bg-blue-100 text-blue-700',
  },

  [MARKET_STATUS.ACTIVE]: {
    label: 'Active',
    className: 'bg-green-100 text-green-700',
  },

  [MARKET_STATUS.FAILED]: {
    label: 'Failed',
    className: 'bg-red-100 text-red-700',
  },

  [MARKET_STATUS.RESOLVED]: {
    label: 'Resolved',
    className: 'bg-purple-100 text-purple-700',
  },

  [MARKET_STATUS.PAIDOUT]: {
    label: 'Paid Out',
    className: 'bg-emerald-100 text-emerald-700',
  },

  [MARKET_STATUS.CANCELLED]: {
    label: 'Cancelled',
    className: 'bg-gray-100 text-gray-700',
  },
};

export function getMarketStatusMeta(status: number) {
  return (
    statusLabels[status] ?? {
      label: `Unknown (${status})`,
      className: 'bg-gray-100 text-gray-700',
    }
  );
}