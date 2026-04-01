import { useState } from 'react';
import { Plus, Search, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGetMarketsQuery } from '../../services/marketplaceApi';
import type { Market } from '../../types/market.types';
import { MarketCard } from './MarketCard';
import { MarketForm } from './MarketForm';

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: '1', label: 'Pending' },
  { value: '2', label: 'Active' },
  { value: '3', label: 'Resolved' },
  { value: '4', label: 'Closed' },
];

export function MarketsView() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data, isLoading, isFetching } = useGetMarketsQuery({});
  const allMarkets: Market[] = data?.data?.data ?? [];
  const totalCount = data?.data?.count ?? 0;

  const filteredMarkets = allMarkets.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || String(m.status) === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleView = (market: Market) => {
    navigate(`/market/${market.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Markets</h2>
          <p className="text-gray-600 mt-1">
            {totalCount} {totalCount === 1 ? 'market' : 'markets'} total
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Market
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or category…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {STATUS_FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      {isLoading || isFetching ? (
        <div className="text-center py-16 text-gray-500">Loading markets…</div>
      ) : filteredMarkets.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
          <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {allMarkets.length === 0
              ? 'No markets yet. Create your first market!'
              : 'No markets match your filters.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredMarkets.map((market) => (
            <MarketCard key={market.id} market={market} onView={handleView} />
          ))}
        </div>
      )}

      {/* Create modal */}
      {showForm && <MarketForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
