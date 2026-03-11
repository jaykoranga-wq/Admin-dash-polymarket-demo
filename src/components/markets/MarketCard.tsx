import { TrendingUp, Calendar, Tag } from 'lucide-react';
import type { Market } from '../../types/market.types';

interface MarketCardProps {
  market: Market;
  onView: (market: Market) => void;
}

const statusLabels: Record<number, { label: string; className: string }> = {
  1: { label: 'Active',   className: 'bg-green-100 text-green-700' },
  2: { label: 'Pending',  className: 'bg-yellow-100 text-yellow-700' },
  3: { label: 'Resolved', className: 'bg-purple-100 text-purple-700' },
  4: { label: 'Closed',   className: 'bg-gray-100 text-gray-700' },
};

export function MarketCard({ market, onView }: MarketCardProps) {
  const status = statusLabels[market.status] ?? { label: String(market.status), className: 'bg-gray-100 text-gray-700' };
  const resolutionDate = new Date(market.resolutionTime);
  const isExpired = resolutionDate < new Date();

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onView(market)}
    >
      <div className="flex items-start gap-4">
        {market.displayImageUrl ? (
          <img
            src={market.displayImageUrl}
            alt={market.title}
            className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-gray-100"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-7 h-7 text-blue-400" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 text-base leading-snug line-clamp-2">
              {market.title}
            </h3>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${status.className}`}>
              {status.label}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              {market.category.name}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span className={isExpired ? 'text-red-600 font-medium' : ''}>
                Resolves {resolutionDate.toLocaleDateString()}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
