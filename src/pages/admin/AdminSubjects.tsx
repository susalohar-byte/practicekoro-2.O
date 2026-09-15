import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/common/Button';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  FolderTree,
  X,
} from 'lucide-react';
import type { Subject } from '@/types';

export const AdminSubjects: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [iconName, setIconName] = useState('BookOpen');
  const [orderIndex, setOrderIndex] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState('');

  const loadData = async () => {
    try {
      setIsLoading(true);
      const allSubjects = await api.getAllAdminSubjects();
      setSubjects(allSubjects);
    } catch (err) {
      console.error('Error loading subjects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingSubject(null);
    setName('');
    setSlug('');
    setDescription('');
    setIconName('BookOpen');
    setOrderIndex(subjects.length + 1);
    setIsActive(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setName(subject.name);
    setSlug(subject.slug);
    setDescription(subject.description || '');
    setIconName(subject.iconName || 'BookOpen');
    setOrderIndex(subject.orderIndex);
    setIsActive(subject.isActive);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingSubject) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Subject name is required.');
      return;
    }

    setIsSaving(true);
    setFormError('');
    try {
      if (editingSubject) {
        await api.updateSubject(editingSubject.id, {
          name: name.trim(),
          slug: slug.trim() || undefined,
          description: description.trim() || undefined,
          iconName: iconName.trim(),
          orderIndex: Number(orderIndex),
          isActive,
        });
      } else {
        await api.createSubject({
          name: name.trim(),
          slug:
            slug.trim() ||
            name
              .trim()
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, ''),
          description: description.trim() || undefined,
          iconName: iconName.trim(),
          orderIndex: Number(orderIndex),
          isActive,
        });
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      console.error('Failed to save subject:', err);
      setFormError(err.message || 'Failed to save subject');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (subject: Subject) => {
    try {
      await api.updateSubject(subject.id, { isActive: !subject.isActive });
      await loadData();
    } catch (err: any) {
      console.error('Failed to toggle status:', err);
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleDeleteSubject = async (subject: Subject) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete subject "${subject.name}"?\n\nThis action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setIsLoading(true);
      await api.deleteSubject(subject.id);
      await loadData();
    } catch (err: any) {
      console.error('Failed to delete subject:', err);
      alert(err.message || 'Failed to delete subject');
      setIsLoading(false);
    }
  };

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <BookOpen className="w-6 h-6 text-emerald-400" />
              Subjects Management (Syllabus Domains)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {subjects.length} Subjects
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Subjects represent core syllabus domains (e.g. History, Math, Reasoning, General
            Science) and are universal across exams.
          </p>
        </div>

        <Button
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={openCreateModal}
        >
          Add New Subject
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search subjects..."
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
                <th className="p-4">Subject Name</th>
                <th className="p-4">Chapters</th>
                <th className="p-4">Order</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Loading subjects...
                  </td>
                </tr>
              ) : filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No subjects found for the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((sub) => {
                  return (
                    <tr key={sub.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">{sub.name}</p>
                            <p className="text-[11px] font-mono text-slate-500">{sub.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-1 text-slate-300 font-semibold">
                          <FolderTree className="w-3.5 h-3.5 text-blue-400" />
                          {sub.chaptersCount ?? 0} Chapters
                        </span>
                      </td>
                      <td className="p-4 font-bold text-indigo-400">#{sub.orderIndex}</td>
                      <td className="p-4">
                        {sub.isActive ? (
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
                            onClick={() => handleToggleActive(sub)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              sub.isActive
                                ? 'text-emerald-400 hover:text-amber-400 hover:bg-slate-800'
                                : 'text-slate-500 hover:text-emerald-400 hover:bg-slate-800'
                            }`}
                            title={sub.isActive ? 'Deactivate Subject' : 'Activate Subject'}
                          >
                            {sub.isActive ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => openEditModal(sub)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Edit Subject"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSubject(sub)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            title="Delete Subject"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
                <BookOpen className="w-4 h-4 text-emerald-400" />
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
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
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Indian History (ভারত ও বাংলার ইতিহাস)"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  placeholder="e.g. indian-history"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief syllabus coverage details"
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
                    <span className="text-xs font-bold text-slate-300">Active Subject</span>
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
                  className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : editingSubject ? 'Save Changes' : 'Create Subject'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
