// components/admin/quiz/CategoryManager.tsx

"use client";

import { useState, FormEvent } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { QuizCategory } from "@/lib/admin/types";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Loader2, Edit2, X } from "lucide-react";

const ICON_OPTIONS = ["🎭", "🔍", "🛡️", "⚖️", "⚠️", "📢", "📊", "🧠"];

const COLOR_OPTIONS = [
  { label: "Orange", value: "from-orange-500 to-orange-600" },
  { label: "Red", value: "from-red-500 to-red-600" },
  { label: "Yellow", value: "from-yellow-500 to-yellow-600" },
  { label: "Green", value: "from-green-500 to-green-600" },
  { label: "Purple", value: "from-purple-500 to-purple-600" },
  { label: "Blue", value: "from-blue-500 to-blue-600" },
];

interface CategoryManagerProps {
  categories: QuizCategory[];
  loadingCategories: boolean;
  categoryError: string | null;
  selectedCategorySlug: string | null;
  setSelectedCategorySlug: (slug: string) => void;
  fetchCategories: () => Promise<void>;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

type CategoryFormState = {
  title: string;
  description: string;
  icon: string;
  color: string;
};

const initialNewCategoryState: CategoryFormState = {
  title: "",
  description: "",
  icon: ICON_OPTIONS[0],
  color: COLOR_OPTIONS[0].value,
};

export default function CategoryManager({
  categories,
  loadingCategories,
  categoryError,
  selectedCategorySlug,
  setSelectedCategorySlug,
  fetchCategories,
}: CategoryManagerProps) {
  const supabase = supabaseBrowser();

  const [newCategory, setNewCategory] = useState<CategoryFormState>(
    initialNewCategoryState
  );
  const [editingCategory, setEditingCategory] = useState<QuizCategory | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const [categoryToDelete, setCategoryToDelete] = useState<QuizCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState(false);
  
  const handleEditCategory = (category: QuizCategory) => {
    setEditingCategory(category);
    setNewCategory({
      title: category.title,
      description: category.description || "",
      icon: category.icon || ICON_OPTIONS[0],
      color: category.color || COLOR_OPTIONS[0].value,
    });
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setNewCategory(initialNewCategoryState);
  };

  const handleSubmitCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!newCategory.title.trim()) {
      alert("Title is required.");
      return;
    }

    setSubmitting(true);

    if (editingCategory) {
      // UPDATE existing category
      const { error } = await supabase
        .from("quiz_categories")
        .update({
          title: newCategory.title.trim(),
          // slug is hidden and not editable; keep existing value
          description: newCategory.description.trim() || null,
          icon: newCategory.icon || null,
          color: newCategory.color || null,
        })
        .eq("id", editingCategory.id);

      setSubmitting(false);

      if (error) {
        console.error(error);
        alert("Failed to update category: " + error.message);
        return;
      }

      handleCancelEdit();
      await fetchCategories();
    } else {
      // CREATE new category (slug auto-generated)
      const slug = slugify(newCategory.title);
      if (!slug) {
        setSubmitting(false);
        alert("Unable to generate a slug. Please use a different title.");
        return;
      }

      const { error } = await supabase.from("quiz_categories").insert({
        title: newCategory.title.trim(),
        slug,
        description: newCategory.description.trim() || null,
        icon: newCategory.icon || null,
        color: newCategory.color || null,
      });

      setSubmitting(false);

      if (error) {
        console.error(error);
        alert("Failed to create category: " + error.message);
        return;
      }

      setNewCategory(initialNewCategoryState);
      await fetchCategories();
      setSelectedCategorySlug(slug);
    }
  };

  const openDeleteCategoryDialog = (category: QuizCategory) => {
    setCategoryToDelete(category);
  };

  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    setDeletingCategory(true);

    const { error } = await supabase
      .from("quiz_categories")
      .delete()
      .eq("slug", categoryToDelete.slug);

    setDeletingCategory(false);

    if (error) {
      console.error(error);
      alert("Failed to delete category: " + error.message);
      return;
    }

    // If we were editing this category, cancel edit
    if (editingCategory && editingCategory.slug === categoryToDelete.slug) {
      handleCancelEdit();
    }

    setCategoryToDelete(null);
    await fetchCategories();
  };

  return (
    <div className="lg:col-span-1 space-y-4">
      {/* Create / Edit Category Card */}
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingCategory ? "Edit Category" : "Create Category"}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Slug is generated automatically for the database.
            </p>
          </div>

          {editingCategory && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="inline-flex items-center px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-white/10 text-red-500 hover:bg-red-500/10"
            >
              <X className="w-3 h-3 mr-1" />
              Cancel
            </button>
          )}
        </div>

        <form onSubmit={handleSubmitCategory} className="space-y-3">
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
              Title
            </label>
            <input
              className="w-full rounded-md bg-transparent border border-gray-200 dark:border-white/10 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/70"
              value={newCategory.title}
              onChange={(e) =>
                setNewCategory((c) => ({
                  ...c,
                  title: e.target.value,
                }))
              }
              required
              placeholder="e.g. Deepfake Detection Basics"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              className="w-full rounded-md bg-transparent border border-gray-200 dark:border-white/10 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/70"
              rows={3}
              value={newCategory.description}
              onChange={(e) =>
                setNewCategory((c) => ({
                  ...c,
                  description: e.target.value,
                }))
              }
              placeholder="Short description for this quiz category."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                Icon
              </label>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map((icon) => {
                  const active = newCategory.icon === icon;
                  return (
                    <button
                      key={icon}
                      type="button"
                      onClick={() =>
                        setNewCategory((c) => ({ ...c, icon }))
                      }
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-lg border text-gray-900 dark:text-white transition-colors ${
                        active
                          ? "border-orange-500 bg-orange-500/10"
                          : "border-gray-200 dark:border-white/10 hover:bg-gray-100/70 dark:hover:bg-white/5"
                      }`}
                    >
                      {icon}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                Color theme
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((opt) => {
                    const active = newCategory.color === opt.value;

                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setNewCategory((c) => ({ ...c, color: opt.value }))
                        }
                        className={`relative px-3 py-2 rounded-lg text-xs font-medium border flex-1 min-w-[90px] max-w-[140px] text-left transition-all
                          ${
                            active
                              ? "border-orange-500 ring-2 ring-orange-400/60 bg-orange-500/5"
                              : "border-gray-200 dark:border-white/10 hover:bg-gray-100/60 dark:hover:bg-white/5"
                          }`}
                      >
                        {/* gradient preview bar */}
                        <div
                          className={`h-6 rounded-md mb-1 bg-gradient-to-r ${opt.value}`}
                        />
                        <span className="text-gray-800 dark:text-gray-100">
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  Used as Tailwind gradient class for quiz cards.
                </p>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full mt-2"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : editingCategory ? (
              <>
                <Edit2 className="w-4 h-4 mr-2" />
                Update Category
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Category
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Category List */}
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Categories
          </h2>
          {loadingCategories && (
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          )}
        </div>

        {categoryError && (
          <p className="text-sm text-red-500 mb-2">
            Failed to load categories: {categoryError}
          </p>
        )}

        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
          {categories.map((cat) => {
            const isSelected = selectedCategorySlug === cat.slug;
            const isDeleting = deletingSlug === cat.slug;

            return (
              <div
                key={cat.id}
                className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-colors ${
                  isSelected
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedCategorySlug(cat.slug)}
                  className="flex items-center gap-3 flex-grow text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-base">
                    {cat.icon || "📚"}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {cat.title}
                    </div>
                    {cat.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                        {cat.description}
                      </div>
                    )}
                  </div>
                </button>

                <div className="flex items-center gap-1 ml-2">
                  {/* Edit Button - larger hit area */}
                  <button
                    type="button"
                    onClick={() => handleEditCategory(cat)}
                    className="p-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    title="Edit category"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Delete Button - larger hit area */}
                  <button
                    type="button"
                    onClick={() => openDeleteCategoryDialog(cat)}
                    className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    title="Delete category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {!loadingCategories && categories.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No categories yet. Create one above.
            </p>
          )}
        </div>
      </div>

      {/* Delete Category Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#050505] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Delete category?
                </h3>
                <p className="text-xs text-gray-400">
                  This will permanently remove{" "}
                  <span className="font-medium">{categoryToDelete.title}</span> and
                  all its questions from Detectify.
                </p>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg px-4 py-3 text-xs text-gray-300 mb-5">
              <p className="font-medium text-gray-100">Category details</p>
              <p>Slug: {categoryToDelete.slug}</p>
              {categoryToDelete.description && (
                <p className="text-gray-400 mt-1 line-clamp-2">
                  {categoryToDelete.description}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm rounded-lg border border-white/10 text-gray-200 hover:bg-white/5 transition-colors"
                onClick={() => setCategoryToDelete(null)}
                disabled={deletingCategory}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium disabled:opacity-60"
                onClick={handleConfirmDeleteCategory}
                disabled={deletingCategory}
              >
                {deletingCategory ? "Deleting..." : "Delete category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
