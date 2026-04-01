import { ArrowLeft, Calendar, CheckCircle2, Tag } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  useGetMarketByIdQuery,
  useProposeResponseMutation,
} from '../../services/marketplaceApi';
import type { MarketAnswer, MarketToken } from '../../types/market.types';
import { useToast } from '../ui/ToastProvider';
import { getMarketStatusMeta, RESOLVED_MARKET_STATUSES } from './marketStatus';

function flattenTokens(optionGroups: { tokens: MarketToken[] }[]) {
  return optionGroups.flatMap((group) => group.tokens);
}

export function MarketDetailsPage() {
  const { marketId = '' } = useParams();
  const { showError, showSuccess } = useToast();
  const [submittedAnswer, setSubmittedAnswer] = useState<MarketAnswer | null>(null);

  const { data, isLoading, isFetching, error } = useGetMarketByIdQuery(marketId, {
    skip: !marketId,
  });
  const [proposeResponse, { isLoading: isSubmitting }] = useProposeResponseMutation();

  const market = data?.data?.data;
  const outcomes = useMemo(
    () => (market ? flattenTokens(market.optionGroups) : []),
    [market]
  );
  const status = market ? getMarketStatusMeta(market.status) : null;
  const isResolved = market ? RESOLVED_MARKET_STATUSES.includes(market.status) : false;
  const visibleAnswer = submittedAnswer;

  const handleSubmit = async (answer: MarketAnswer) => {
    if (!marketId || isSubmitting || isResolved) {
      return;
    }

    try {
      await proposeResponse({ marketId, answer }).unwrap();
      setSubmittedAnswer(answer);
      showSuccess('Market resolved successfully');
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
          : 'Failed to resolve market';

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
              {visibleAnswer !== null && (
                <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Submitted answer: {visibleAnswer === 1 ? 'YES' : 'NO'}
                </span>
              )}
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

        <aside className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Oracle Response</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Submit the final oracle response for this market. Once submitted, the action should be treated as final.
          </p>

          <div className="mt-6 grid gap-3">
            <button
              type="button"
              onClick={() => handleSubmit(1)}
              disabled={isSubmitting || isResolved}
              className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {isSubmitting ? 'Submitting...' : 'YES'}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(0)}
              disabled={isSubmitting || isResolved}
              className="rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
            >
              {isSubmitting ? 'Submitting...' : 'NO'}
            </button>
          </div>

          {isResolved && (
            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              This market has already been resolved, so another oracle response cannot be submitted.
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}
