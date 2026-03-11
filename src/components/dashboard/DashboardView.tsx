import { TrendingUp, BarChart3, CheckCircle, Clock, Folder } from 'lucide-react';
import { useGetMarketsQuery } from '../../services/marketplaceApi';
import { useGetCategoriesQuery } from '../../services/categoriesApi';

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-sm text-gray-500 mt-1">{sub}</p>}
        </div>
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}

export function DashboardView() {
  const { data: marketsData, isLoading: marketsLoading } = useGetMarketsQuery({});
  const { data: catData, isLoading: catLoading } = useGetCategoriesQuery({});

  const markets = marketsData?.data?.data ?? [];
  const totalMarkets = marketsData?.data?.count ?? 0;
  const totalCategories = catData?.data?.count ?? 0;

  // Status codes: 1=Active, 2=Pending, 3=Resolved, 4=Closed
  const activeMarkets   = markets.filter((m) => m.status === 1).length;
  const resolvedMarkets = markets.filter((m) => m.status === 3).length;

  // Expiring soon (within 7 days, not yet resolved/closed)
  const soon = new Date();
  soon.setDate(soon.getDate() + 7);
  const expiringSoon = markets.filter(
    (m) => m.status === 1 && new Date(m.resolutionTime) <= soon
  ).length;

  const recentMarkets = markets.slice(0, 5);
  const isLoading = marketsLoading || catLoading;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-600 mt-1">Monitor your prediction market platform</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading dashboard…</div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={<TrendingUp className="w-6 h-6 text-blue-600" />}
              label="Total Markets"
              value={totalMarkets}
            />
            <StatCard
              icon={<BarChart3 className="w-6 h-6 text-green-600" />}
              label="Active Markets"
              value={activeMarkets}
              sub={`${totalMarkets > 0 ? Math.round((activeMarkets / totalMarkets) * 100) : 0}% of total`}
            />
            <StatCard
              icon={<CheckCircle className="w-6 h-6 text-purple-600" />}
              label="Resolved"
              value={resolvedMarkets}
            />
            <StatCard
              icon={<Folder className="w-6 h-6 text-orange-600" />}
              label="Categories"
              value={totalCategories}
            />
          </div>

          {expiringSoon > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <p className="text-sm text-yellow-800 font-medium">
                {expiringSoon} active {expiringSoon === 1 ? 'market' : 'markets'} expiring within 7 days
              </p>
            </div>
          )}

          {/* Recent markets */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Markets</h3>
            </div>
            {recentMarkets.length === 0 ? (
              <div className="px-6 py-10 text-center text-gray-400">No markets yet.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentMarkets.map((market) => (
                  <div key={market.id} className="px-6 py-4 flex items-center gap-4">
                    {market.displayImageUrl ? (
                      <img src={market.displayImageUrl} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{market.title}</p>
                      <p className="text-sm text-gray-500">{market.category.name}</p>
                    </div>
                    <p className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(market.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
