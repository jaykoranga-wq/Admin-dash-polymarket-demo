import { useState } from 'react';
import { CheckCircle, AlertTriangle, Search } from 'lucide-react';
import { useGetMarketsQuery } from '../../services/marketplaceApi';
import type { Market } from '../../types/market.types';

// Resolutions view shows markets in non-active states (pending resolution or already resolved)
const STATUS_FILTERS = [
  { value: 'all',      label: 'All' },
  { value: '2',        label: 'Pending' },
  { value: '3',        label: 'Resolved' },
  { value: '4',        label: 'Closed' },
];

export function ResolutionsView() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm]     = useState('');

  const { data, isLoading, isFetching } = useGetMarketsQuery({});
  const allMarkets: Market[] = data?.data?.data ?? [];

  const filteredMarkets = allMarkets.filter((m) => {
    const matchesStatus = filterStatus === 'all' || String(m.status) === filterStatus;
    const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Market Resolutions</h2>
        <p className="text-gray-600 mt-1">Review and resolve prediction markets</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search markets…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilterStatus(f.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === f.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading || isFetching ? (
        <div className="text-center py-12 text-gray-500">Loading markets…</div>
      ) : filteredMarkets.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
          <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No markets match the selected filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Market</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Resolution Time</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMarkets.map((market) => {
                const isResolved = market.status === 3;
                const isPending  = market.status === 2;
                return (
                  <tr key={market.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{market.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{market.category.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(market.resolutionTime).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        isResolved
                          ? 'bg-green-100 text-green-700'
                          : isPending
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {isResolved && <CheckCircle className="w-3 h-3" />}
                        {isPending  && <AlertTriangle className="w-3 h-3" />}
                        {isResolved ? 'Resolved' : isPending ? 'Pending' : `Status ${market.status}`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
