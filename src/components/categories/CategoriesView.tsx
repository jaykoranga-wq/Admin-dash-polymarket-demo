import { useState, FormEvent } from 'react';
import { Plus, Trash2, Pencil, Folder } from 'lucide-react';
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoriesMutation,
} from '../../services/categoriesApi';

export function CategoriesView() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [formError, setFormError] = useState('');

  // ── RTK Query hooks ──────────────────────────────────────────────────────
  const { data, isLoading, isFetching } = useGetCategoriesQuery({});
  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation();
  const [deleteCategories, { isLoading: deleting }] = useDeleteCategoriesMutation();

  const categories = data?.data?.data ?? [];
  const totalCount = data?.data?.count ?? 0;
  const isBusy = creating || updating || deleting;

  // ── Helpers ───────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingId(null);
    setName('');
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setName(currentName);
    setFormError('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setName('');
    setFormError('');
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Mutations ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    const trimmed = name.trim();
    if (!trimmed) {
      setFormError('Name is required.');
      return;
    }

    try {
      if (editingId) {
        await updateCategory({ id: editingId, name: trimmed }).unwrap();
      } else {
        await createCategory({ name: trimmed }).unwrap();
      }
      closeForm();
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'data' in err
          ? (err as { data?: { message?: string } }).data?.message
          : undefined;
      setFormError(msg ?? 'Something went wrong. Please try again.');
    }
  };

  const handleDeleteSelected = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} category(s)? This cannot be undone.`)) return;
    try {
      await deleteCategories({ categoryIds: Array.from(selected) }).unwrap();
      setSelected(new Set());
    } catch {
      alert('Failed to delete. Please try again.');
    }
  };

  const handleDeleteSingle = async (id: string) => {
    if (!confirm('Delete this category? This cannot be undone.')) return;
    try {
      await deleteCategories({ categoryIds: [id] }).unwrap();
      setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
    } catch {
      alert('Failed to delete. Please try again.');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
          <p className="text-gray-600 mt-1">
            {totalCount} {totalCount === 1 ? 'category' : 'categories'} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selected.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete ({selected.size})
            </button>
          )}
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Category
          </button>
        </div>
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Category' : 'New Category'}
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
              required
            />
            <button
              type="submit"
              disabled={isBusy}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isBusy ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </form>
          {formError && (
            <p className="text-sm text-red-600 mt-2">{formError}</p>
          )}
        </div>
      )}

      {/* Loading / empty / list */}
      {isLoading || isFetching ? (
        <div className="text-center py-16 text-gray-500">Loading categories…</div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
          <Folder className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No categories yet. Create your first one!</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.size === categories.length && categories.length > 0}
                    onChange={(e) =>
                      setSelected(e.target.checked ? new Set(categories.map((c) => c.id)) : new Set())
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((category) => (
                <tr
                  key={category.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    selected.has(category.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(category.id)}
                      onChange={() => toggleSelect(category.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{category.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(category.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(category.id, category.name)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSingle(category.id)}
                        disabled={deleting}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
