import { ArrowLeft, Calendar, CheckCircle2, Clock, ShieldAlert, Tag } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  RESOLUTION_ACTION,
  useGetMarketByIdQuery,
  useGetOracleTimelineQuery,
  useProposeResponseMutation,
} from '../../services/marketplaceApi';
import type { MarketAnswer, MarketToken } from '../../types/market.types';
import { useToast } from '../ui/ToastProvider';
import { getMarketStatusMeta, RESOLVED_MARKET_STATUSES } from './marketStatus';

function flattenTokens(optionGroups: { tokens: MarketToken[] }[]) {
  return optionGroups.flatMap((group) => group.tokens);
}

/** Human-readable label for each RESOLUTION_ACTION value. */
const ACTION_LABELS: Record<number, string> = {
  [RESOLUTION_ACTION.PROPOSE]:            'Proposed',
  [RESOLUTION_ACTION.DISPUTE]:            'Disputed',
  [RESOLUTION_ACTION.DISPUTE_SETTLEMENT]: 'Dispute Settled',
  [RESOLUTION_ACTION.SETTLE]:             'Final Settlement',
};

export function MarketDetailsPage() {
  const { marketId = '' } = useParams();
  const { showError, showSuccess } = useToast();

  const { data, isLoading, isFetching, error } = useGetMarketByIdQuery(marketId, {
    skip: !marketId,
  });

  // ── Oracle timeline ──────────────────────────────────────────────────────────
  const { data: timelineData, isLoading: timelineLoading } = useGetOracleTimelineQuery(marketId, {
    skip: !marketId,
  });

  const timeline = timelineData?.data ?? [];
  const latestEntry = timeline.length > 0 ? timeline[timeline.length - 1] : null;
  const latestAction = latestEntry?.action ?? null;

  // ── What should the admin do next? ──────────────────────────────────────────
  // State machine based on the LATEST oracle timeline action:
  //
  //   null  → can PROPOSE (no initial answer yet)
  //   1     → PROPOSED — awaiting dispute window; no admin action needed
  //   2     → DISPUTED — admin must SETTLE (re-call propose-response, server records as action 3)
  //   3     → DISPUTE_SETTLEMENT — finalized after dispute
  //   4     → SETTLE — fully settled; nothing left to do
  const canPropose       = latestAction === null;
  const isProposed       = latestAction === RESOLUTION_ACTION.PROPOSE;
  const canSettle        = latestAction === RESOLUTION_ACTION.DISPUTE;
  const isOracleFinished = latestAction === RESOLUTION_ACTION.DISPUTE_SETTLEMENT
                        || latestAction === RESOLUTION_ACTION.SETTLE;

  const [proposeResponse, { isLoading: isSubmitting }] = useProposeResponseMutation();

  const market = data?.data?.data;
  const outcomes = useMemo(
    () => (market ? flattenTokens(market.optionGroups) : []),
    [market]
  );
  const status = market ? getMarketStatusMeta(market.status) : null;
  const isResolved = market ? RESOLVED_MARKET_STATUSES.includes(market.status) : false;

  const handleSubmit = async (answer: MarketAnswer) => {
    if (!marketId || isSubmitting) return;
    if (!canPropose && !canSettle) return;   // guard: no action allowed right now

    const actionLabel = canPropose ? 'Propose' : 'Settle Dispute';
    if (!confirm(`${actionLabel}: Submit answer "${answer === 1 ? 'YES' : 'NO'}" to the oracle?`)) return;

    try {
      await proposeResponse({ marketId, answer }).unwrap();
      showSuccess(canPropose ? 'Answer proposed successfully.' : 'Dispute settled successfully.');
    } catch (submitError) {
      const errorMessage =
        typeof submitError === 'object' &&
        submitError !== null &&
        'data' in submitError &&
        typeof submitError.data === 'object' &&
        submitError.data !== null &&
        'message' in submitError.data &&
        typeof submitError.data.message === 'string'
          ? submitError.data.message
          : 'Failed to submit oracle response';
      showError(errorMessage);
    }
  };

  if (!marketId) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        Market id is missing from the route.
      </div>
    );
  }

  if (!market && (isLoading || isFetching)) {
    return <div className="py-16 text-center text-gray-500">Loading market details...</div>;
  }

  if (error || !market) {
    return (
      <div className="space-y-4">
        <Link
          to="/markets"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to markets
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          Unable to load this market right now.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/markets"
        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to markets
      </Link>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status?.className}`}>
                {status?.label}
              </span>
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900">{market.title}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
                {market.description || 'No description available for this market.'}
              </p>
            </div>
          </div>

          {market.displayImageUrl && (
            <img
              src={market.displayImageUrl}
              alt={market.title}
              className="h-28 w-28 rounded-2xl object-cover"
            />
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-500">
          <span className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
            <Tag className="h-4 w-4" />
            {market.category.name}
          </span>
          <span className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
            <Calendar className="h-4 w-4" />
            Resolves {new Date(market.resolutionTime).toLocaleString()}
          </span>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        {/* ── Left: Outcomes ── */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Outcomes</h2>
            <div className="mt-4 space-y-3">
              {outcomes.length > 0 ? (
                outcomes.map((token) => (
                  <div
                    key={token.id}
                    className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{token.title}</p>
                      <p className="text-sm text-gray-500">Outcome id: {token.id}</p>
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      Volume {token.volume.toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No outcomes are available for this market yet.</p>
              )}
            </div>
          </div>

          {/* ── Oracle Timeline ── */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Oracle Timeline</h2>
            {timelineLoading ? (
              <p className="mt-3 text-sm text-gray-400">Loading timeline…</p>
            ) : timeline.length === 0 ? (
              <p className="mt-3 text-sm text-gray-400 italic">No oracle actions recorded yet.</p>
            ) : (
              <ol className="mt-4 relative border-l border-gray-200 pl-5 space-y-4">
                {timeline.map((entry, i) => {
                  const isLast = i === timeline.length - 1;
                  const bg =
                    entry.action === RESOLUTION_ACTION.DISPUTE
                      ? 'bg-red-500'
                      : entry.action === RESOLUTION_ACTION.SETTLE || entry.action === RESOLUTION_ACTION.DISPUTE_SETTLEMENT
                      ? 'bg-green-500'
                      : 'bg-blue-500';
                  return (
                    <li key={entry.id} className="relative">
                      <div className={`absolute -left-[1.35rem] top-1 h-3 w-3 rounded-full border-2 border-white ${bg}`} />
                      <div className={`rounded-xl border p-3 text-sm ${isLast ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-gray-50'}`}>
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-semibold text-gray-800">
                            {ACTION_LABELS[entry.action] ?? `Action ${entry.action}`}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(entry.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {entry.response !== null && (
                          <p className="mt-1 text-gray-600">
                            Answer: <span className="font-medium">{entry.response === 1 ? 'YES' : 'NO'}</span>
                          </p>
                        )}
                        {entry.bondAmount && (
                          <p className="text-xs text-gray-400">
                            Bond: {(Number(entry.bondAmount) / 1_000_000).toFixed(2)} USDC
                          </p>
                        )}
                        {entry.proposerAddress && (
                          <p className="text-xs text-gray-400 truncate">Proposer: {entry.proposerAddress}</p>
                        )}
                        {entry.disputerAddress && (
                          <p className="text-xs text-red-400 truncate">Disputer: {entry.disputerAddress}</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>

        {/* ── Right: Oracle Response Panel ── */}
        <aside className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm h-fit">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            {canSettle
              ? <><ShieldAlert className="h-5 w-5 text-red-500" /> Settle Dispute</>
              : canPropose
              ? <><CheckCircle2 className="h-5 w-5 text-blue-500" /> Propose Answer</>
              : isProposed
              ? <><Clock className="h-5 w-5 text-yellow-500" /> Answer Proposed</>
              : <><Clock className="h-5 w-5 text-green-500" /> Oracle Finalized</>
            }
          </h2>

          {/* ── State: PROPOSE — initial answer not set yet ── */}
          {canPropose && (
            <p className="mt-2 text-sm leading-6 text-gray-600">
              No answer has been proposed yet. Submit YES or NO to propose the oracle response.
              This will be recorded as action <code className="font-mono">PROPOSE (1)</code>.
            </p>
          )}

          {/* ── State: PROPOSED (action=1) — waiting for dispute window to pass ── */}
          {isProposed && latestEntry && (
            <div className="mt-3 space-y-3">
              <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                <strong>Answer proposed.</strong> The dispute window is open. If a user raises a
                dispute, the "Settle Dispute" buttons will appear here. No action needed right now.
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                <p className="font-medium mb-1">Proposed Answer</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${
                  latestEntry.response === 1 ? 'bg-emerald-500' : 'bg-rose-500'
                }`}>
                  {latestEntry.response === 1 ? 'YES' : latestEntry.response === 0 ? 'NO' : 'Unknown'}
                </span>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(latestEntry.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* ── State: DISPUTE (action=2) — dispute raised, admin must settle ── */}
          {canSettle && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <strong>Dispute is active.</strong> A user has challenged the proposed answer.
              Re-submit the correct answer to settle the dispute. This will be recorded as action{' '}
              <code className="font-mono">DISPUTE_SETTLEMENT (3)</code>.
            </div>
          )}

          {/* ── State: Finalized (action=3 or 4) ── */}
          {isOracleFinished && (
            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              This market's oracle process is complete. No further submissions are allowed.
            </div>
          )}

          {/* ── Action Buttons — only shown when admin needs to act ── */}
          {(canPropose || canSettle) && (
            <div className="mt-6 grid gap-3">
              <button
                type="button"
                onClick={() => handleSubmit(1)}
                disabled={isSubmitting}
                className={`rounded-xl px-4 py-3 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed ${
                  canSettle
                    ? 'bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300'
                    : 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300'
                }`}
              >
                {isSubmitting ? 'Submitting…' : canSettle ? 'Settle: YES' : 'YES'}
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(0)}
                disabled={isSubmitting}
                className={`rounded-xl px-4 py-3 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed ${
                  canSettle
                    ? 'bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300'
                    : 'bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300'
                }`}
              >
                {isSubmitting ? 'Submitting…' : canSettle ? 'Settle: NO' : 'NO'}
              </button>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}
