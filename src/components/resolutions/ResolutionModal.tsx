import { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import type { MarketAnswer, MarketDetail, MarketToken } from '../../types/market.types';
import { useProposeResponseMutation } from '../../services/marketplaceApi';
import { useToast } from '../ui/ToastProvider';

interface ResolutionModalProps {
  market: MarketDetail;
  onClose: () => void;
}

export function ResolutionModal({ market, onClose }: ResolutionModalProps) {
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [proposeResponse] = useProposeResponseMutation();
  const { showSuccess, showError } = useToast();

  const allTokens: MarketToken[] = market.optionGroups.flatMap((g) => g.tokens);

  const getAnswer = (tokenId: string): MarketAnswer => {
    const token = allTokens.find((t) => t.id === tokenId);
    return (token?.title?.toLowerCase() === 'yes' ? 1 : 0) as MarketAnswer;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedToken) {
      alert('Please select a winning outcome.');
      return;
    }
    if (!confirm('Resolve this market? This action cannot be undone.')) return;

    try {
      await proposeResponse({ marketId: market.id, answer: getAnswer(selectedToken) }).unwrap();
      showSuccess('Market resolved successfully');
      onClose();
    } catch (err) {
      const message =
        typeof err === 'object' &&
        err !== null &&
        'data' in err &&
        typeof (err as { data: unknown }).data === 'object' &&
        (err as { data: unknown }).data !== null &&
        'message' in (err as { data: { message: unknown } }).data &&
        typeof (err as { data: { message: unknown } }).data.message === 'string'
          ? (err as { data: { message: string } }).data.message
          : 'Failed to resolve market';
      showError(message);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Resolve Market</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <h4 className="font-semibold text-gray-900">{market.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{market.description}</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Select Winning Outcome</p>
            <div className="space-y-2">
              {allTokens.map((token) => (
                <label
                  key={token.id}
                  className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedToken === token.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="outcome"
                    value={token.id}
                    checked={selectedToken === token.id}
                    onChange={(e) => setSelectedToken(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{token.title}</p>
                    <p className="text-xs text-gray-500">Volume: {token.volume.toLocaleString()}</p>
                  </div>
                </label>
              ))}
              {allTokens.length === 0 && (
                <p className="text-sm text-gray-400">No outcomes found for this market.</p>
              )}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800">
            <strong>Warning:</strong> Resolution is permanent.
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Resolve Market
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
