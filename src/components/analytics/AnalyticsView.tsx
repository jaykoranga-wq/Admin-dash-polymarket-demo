import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Activity } from 'lucide-react';

interface MarketWithStats {
  id: string;
  title: string;
  status: string;
  total_volume: number;
  current_liquidity: number;
  market_type: string;
  created_at: string;
}

export function AnalyticsView() {
  const [topMarkets, setTopMarkets] = useState<MarketWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    // TODO: replace with RTK Query API call once data endpoints are wired up
    setTopMarkets([]);
    setLoading(false);
  };

  if (loading) {
    return <div className="text-center py-12">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics & Insights</h2>
        <p className="text-gray-600 mt-1">Track performance and market trends</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Markets by Volume</h3>
        <div className="space-y-4">
          {topMarkets.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No market data available</p>
          ) : (
            topMarkets.map((market, index) => (
              <div
                key={market.id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{market.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span className="capitalize">{market.market_type.replace('_', ' ')}</span>
                    <span>•</span>
                    <span className="capitalize">{market.status}</span>
                    <span>•</span>
                    <span>{new Date(market.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-green-600 font-semibold">
                    <DollarSign className="w-4 h-4" />
                    {market.total_volume.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-600">Total Volume</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-blue-600 font-semibold">
                    <Activity className="w-4 h-4" />
                    {market.current_liquidity.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-600">Liquidity</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Status Distribution</h3>
          <div className="space-y-3">
            {['active', 'draft', 'closed', 'resolved', 'paused', 'cancelled'].map((status) => {
              const count = topMarkets.filter((m) => m.status === status).length;
              const percentage = topMarkets.length > 0 ? (count / topMarkets.length) * 100 : 0;

              return (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize text-gray-700">{status}</span>
                    <span className="font-medium text-gray-900">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Type Distribution</h3>
          <div className="space-y-3">
            {['binary', 'multiple_choice', 'scalar'].map((type) => {
              const count = topMarkets.filter((m) => m.market_type === type).length;
              const percentage = topMarkets.length > 0 ? (count / topMarkets.length) * 100 : 0;

              return (
                <div key={type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize text-gray-700">{type.replace('_', ' ')}</span>
                    <span className="font-medium text-gray-900">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Insights</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Monitor market performance and trading activity in real-time</li>
              <li>• Track volume trends to identify popular markets</li>
              <li>• Analyze liquidity distribution across markets</li>
              <li>• Use data to optimize market creation strategies</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
