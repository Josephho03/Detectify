// app/admin/quiz/page.tsx

"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { QuizCategory } from "@/lib/admin/types";
import CategoryManager from "@/components/admin/quiz/CategoryManager";
import QuestionManager from "@/components/admin/quiz/QuestionManager";

export default function AdminQuizPage() {
  const supabase = supabaseBrowser();

  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);

  // Optional: keep track of question count for selected category (for future stats if needed)
  const [selectedCategoryQuestionCount, setSelectedCategoryQuestionCount] = useState<number>(0);

  // ---------- load categories ----------

  const fetchCategories = async () => {
    setLoadingCategories(true);
    setCategoryError(null);

    const { data, error } = await supabase
      .from("quiz_categories")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      setCategoryError(error.message);
      setLoadingCategories(false);
      return;
    }

    const fetchedCategories = (data || []) as QuizCategory[];
    setCategories(fetchedCategories);

    // If currently selected slug is missing or null, select the first category
    if (
      !selectedCategorySlug ||
      !fetchedCategories.some((cat) => cat.slug === selectedCategorySlug)
    ) {
      setSelectedCategorySlug(
        fetchedCategories.length > 0 ? fetchedCategories[0].slug : null
      );
    }

    setLoadingCategories(false);
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectCategory = (slug: string) => {
    setSelectedCategorySlug(slug);
  };

  return (
    <div className="space-y-6">
      {/* Header (similar structure to AdminUsersPage) */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            Quiz Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Create categories and manage quiz questions for Detectify.
          </p>
        </div>
      </div>

      {/* Main layout: categories left, questions right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CategoryManager
          categories={categories}
          loadingCategories={loadingCategories}
          categoryError={categoryError}
          selectedCategorySlug={selectedCategorySlug}
          setSelectedCategorySlug={handleSelectCategory}
          fetchCategories={fetchCategories}
        />

        <QuestionManager
          selectedCategorySlug={selectedCategorySlug}
          onQuestionCountChange={setSelectedCategoryQuestionCount}
        />
      </div>
    </div>
  );
}
