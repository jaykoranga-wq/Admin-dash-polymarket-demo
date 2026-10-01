import { useState, FormEvent } from 'react';
import { X, ImageIcon } from 'lucide-react';
import { useCreateMarketMutation } from '../../services/marketplaceApi';
import { useGetCategoriesQuery } from '../../services/categoriesApi';

interface MarketFormProps {
  onClose: () => void;
}

export function MarketForm({ onClose }: MarketFormProps) {
  const [formData, setFormData] = useState({
    categoryId: '',
    title: '',
    description: '',
    resolutionTime: '',
    displayImageUrl: '',
  });
  const [formError, setFormError] = useState('');

  const { data: catData } = useGetCategoriesQuery({});
  const categories = catData?.data?.data ?? [];

  const [createMarket, { isLoading }] = useCreateMarketMutation();

  const isResolutionTimeInvalid =
    formData.resolutionTime !== '' &&
    new Date(formData.resolutionTime).getTime() < Date.now() + 30 * 60 * 1000;

  const set = (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    const { categoryId, title, description, resolutionTime, displayImageUrl } = formData;
    if (!categoryId || !title || !description || !resolutionTime) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (new Date(resolutionTime).getTime() < Date.now() + 30 * 60 * 1000) {
      setFormError('Resolution time must be at least 30 minutes in the future.');
      return;
    }

    try {
      await createMarket({
        categoryId,
        title: title.trim(),
        description: description.trim(),
        resolutionTime: new Date(resolutionTime).toISOString(),
        displayImageUrl: displayImageUrl.trim(),
      }).unwrap();
      onClose();
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'data' in err
          ? (err as { data?: { message?: string } }).data?.message
          : undefined;
      setFormError(msg ?? 'Failed to create market. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Create New Market</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={set('title')}
              placeholder="What will be resolved?"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={set('description')}
              rows={3}
              placeholder="Describe the market and resolution criteria…"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Category + Resolution Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.categoryId}
                onChange={set('categoryId')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Resolution Date &amp; Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.resolutionTime}
                onChange={set('resolutionTime')}
                min={new Date(Date.now() + 30 * 60 * 1000 - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent ${
                  isResolutionTimeInvalid
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                required
              />
              {isResolutionTimeInvalid && (
                <p className="mt-1.5 text-sm text-red-600">
                  Must be at least 30 minutes in the future.
                </p>
              )}
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Display Image URL <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="flex gap-3 items-start">
              <input
                type="url"
                value={formData.displayImageUrl}
                onChange={set('displayImageUrl')}
                placeholder="https://…"
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {formData.displayImageUrl && (
                <img
                  src={formData.displayImageUrl}
                  alt="preview"
                  className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
              {!formData.displayImageUrl && (
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                  <ImageIcon className="w-5 h-5 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {formError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              {formError}
            </p>
          )}

          {/* Footer */}
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button
              type="submit"
              disabled={isLoading || isResolutionTimeInvalid}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Creating…' : 'Create Market'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
