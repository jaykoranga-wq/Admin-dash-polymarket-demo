import { TrendingUp, Calendar, Tag } from 'lucide-react';
import type { Market } from '../../types/market.types';
import { getMarketStatusMeta } from './marketStatus';

interface MarketCardProps {
  market: Market;
  onView: (market: Market) => void;
}

export function MarketCard({ market, onView }: MarketCardProps) {
  const status = getMarketStatusMeta(market.status);
  const resolutionDate = new Date(market.resolutionTime);
  const isExpired = resolutionDate < new Date();

  return (
    <button
      type="button"
      className="w-full cursor-pointer rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm transition-shadow hover:shadow-md"
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
    </button>
  );
}
