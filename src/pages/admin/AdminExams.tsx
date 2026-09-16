import { getErrorMessage } from '@/lib/errors';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/services/api';
import { Button } from '@/components/common/Button';
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Network,
  X,
} from 'lucide-react';
import type { Exam } from '@/types';

export const AdminExams: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('West Bengal Police');
  const [description, setDescription] = useState('');
  const [iconName, setIconName] = useState('Shield');
  const [orderIndex, setOrderIndex] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState('');

  const loadExams = async () => {
    try {
      setIsLoading(true);
      const data = await api.getAllAdminExams();
      setExams(data);
    } catch (err) {
      console.error('Error loading exams:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  const openCreateModal = () => {
    setEditingExam(null);
    setTitle('');
    setSlug('');
    setCategory('West Bengal Police');
    setDescription('');
    setIconName('Shield');
    setOrderIndex(exams.length + 1);
    setIsActive(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (exam: Exam) => {
    setEditingExam(exam);
    setTitle(exam.title);
    setSlug(exam.slug);
    setCategory(exam.category);
    setDescription(exam.description || '');
    setIconName(exam.iconName || 'Shield');
    setOrderIndex(exam.orderIndex);
    setIsActive(exam.isActive);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingExam) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Exam title is required.');
      return;
    }

    try {
      setIsSaving(true);
      setFormError('');
      if (editingExam) {
        await api.updateExam(editingExam.id, {
          title: title.trim(),
          slug: slug.trim() || undefined,
          category: category.trim(),
          description: description.trim() || undefined,
          iconName: iconName.trim(),
          orderIndex: Number(orderIndex),
          isActive,
        });
      } else {
        await api.createExam({
          title: title.trim(),
          slug:
            slug.trim() ||
            title
              .trim()
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, ''),
          category: category.trim(),
          description: description.trim() || undefined,
          iconName: iconName.trim(),
          orderIndex: Number(orderIndex),
          isActive,
        });
      }
      setIsModalOpen(false);
      await loadExams();
    } catch (err) {
      setFormError(getErrorMessage(err, 'Failed to save exam'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (exam: Exam) => {
    try {
      await api.updateExam(exam.id, { isActive: !exam.isActive });
      await loadExams();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleDeleteExam = async (exam: Exam) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete exam "${exam.title}"?\n\nWarning: This action will remove this exam from the system.`
    );
    if (!confirmed) return;

    try {
      setIsLoading(true);
      await api.deleteExam(exam.id);
      await loadExams();
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to delete exam'));
      setIsLoading(false);
    }
  };

  const filteredExams = exams.filter(
    (e) =>
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Tabs: Manage Exams & Syllabus Mapping */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
        <Link
          to="/admin/exams"
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
        >
          <Shield className="w-3.5 h-3.5" />
          Exams List ({exams.length})
        </Link>
        <Link
          to="/admin/exam-topics"
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800/80"
        >
          <Network className="w-3.5 h-3.5" />
          Syllabus & Topics Mapping
        </Link>
      </div>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Shield className="w-6 h-6 text-indigo-400" />
              Competitive Exams Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {exams.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage competitive exam categories. Configure Full Mock Tests and PYQs per target exam.
            Topic Tests are universal across all exams.
          </p>
        </div>

        <Button
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={openCreateModal}
        >
          Add Target Exam
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search exams by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Exam Title</th>
                <th className="p-4">Slug / ID</th>
                <th className="p-4">Category</th>
                <th className="p-4">Order</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Loading competitive exams...
                  </td>
                </tr>
              ) : filteredExams.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No competitive exams found.
                  </td>
                </tr>
              ) : (
                filteredExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                          <Shield className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{exam.title}</p>
                          {exam.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-1">
                              {exam.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-400">{exam.slug}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800 text-slate-300">
                        {exam.category}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-indigo-400">#{exam.orderIndex}</td>
                    <td className="p-4">
                      {exam.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                          <XCircle className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleActive(exam)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            exam.isActive
                              ? 'text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'text-slate-400 hover:text-slate-200 bg-slate-800/60 border-slate-700 hover:bg-slate-800'
                          }`}
                          title={exam.isActive ? 'Deactivate Exam' : 'Activate Exam'}
                        >
                          {exam.isActive ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => openEditModal(exam)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
                          title="Edit Exam"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExam(exam)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors"
                          title="Delete Exam"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-400" />
                {editingExam ? 'Edit Competitive Exam' : 'Add Target Exam'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Exam Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WBP Constable 2025"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  URL Slug / ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. wbp-constable"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Exam Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="West Bengal Police">West Bengal Police</option>
                  <option value="State Civil Services">State Civil Services (WBCS)</option>
                  <option value="State Govt.">State Govt. (WBPSC)</option>
                  <option value="Staff Selection">Staff Selection Commission (SSC)</option>
                  <option value="Railways">Railways (RRB)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief exam overview for student cards"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={orderIndex}
                    onChange={(e) => setOrderIndex(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-bold text-slate-300">Active on Platform</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="border-slate-700 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSaving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold"
                >
                  {isSaving ? 'Saving...' : editingExam ? 'Save Changes' : 'Create Exam'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
