// components/admin/quiz/QuestionManager.tsx

"use client";

import { useState, useEffect, FormEvent } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { QuizQuestion } from "@/lib/admin/types";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Loader2, Edit2, CheckCircle2 } from "lucide-react";

interface QuestionManagerProps {
  selectedCategorySlug: string | null;
  onQuestionCountChange?: (count: number) => void;
}

type QuestionFormState = {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
};

const initialQuestionState: QuestionFormState = {
  question: "",
  options: ["", "", "", ""],
  correct: 0,
  explanation: "",
};

export default function QuestionManager({
  selectedCategorySlug,
  onQuestionCountChange,
}: QuestionManagerProps) {
  const supabase = supabaseBrowser();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const [formState, setFormState] = useState<QuestionFormState>(
    initialQuestionState
  );
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(
    null
  );

  const [questionToDelete, setQuestionToDelete] = useState<QuizQuestion | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState(false);

  // ---------- load questions ----------

  const fetchQuestions = async (slug: string) => {
    setLoadingQuestions(true);

    const { data, error } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("category_slug", slug)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      alert("Failed to load questions: " + error.message);
      setLoadingQuestions(false);
      return;
    }

    const list = (data || []) as QuizQuestion[];
    setQuestions(list);
    setLoadingQuestions(false);

    if (onQuestionCountChange) {
      onQuestionCountChange(list.length);
    }
  };

  useEffect(() => {
    if (selectedCategorySlug) {
      fetchQuestions(selectedCategorySlug);
    } else {
      setQuestions([]);
      if (onQuestionCountChange) onQuestionCountChange(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategorySlug]);

  // ---------- form helpers ----------

  const resetForm = () => {
    setFormState(initialQuestionState);
    setEditingQuestion(null);
  };

  // ---------- create / update ----------

  const handleSubmitQuestion = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedCategorySlug) {
      alert("Select a category first.");
      return;
    }

    const trimmedQuestion = formState.question.trim();
    const trimmedOptions = formState.options.map((o) => o.trim());

    const nonEmptyOptions = trimmedOptions.filter((o) => o.length > 0);
    if (!trimmedQuestion || nonEmptyOptions.length < 2) {
      alert("Question and at least 2 options are required.");
      return;
    }

    if (
      formState.correct < 0 ||
      formState.correct >= trimmedOptions.length ||
      !trimmedOptions[formState.correct]
    ) {
      alert("Please select a valid correct option.");
      return;
    }

    setSubmitting(true);

    if (editingQuestion) {
      // UPDATE
      const { error } = await supabase
        .from("quiz_questions")
        .update({
          question: trimmedQuestion,
          options: trimmedOptions,
          correct: formState.correct,
          explanation: formState.explanation.trim() || null,
        })
        .eq("id", editingQuestion.id);

      setSubmitting(false);

      if (error) {
        console.error(error);
        alert("Failed to update question: " + error.message);
        return;
      }

      resetForm();
      await fetchQuestions(selectedCategorySlug);
    } else {
      // CREATE
      const { error } = await supabase.from("quiz_questions").insert({
        category_slug: selectedCategorySlug,
        question: trimmedQuestion,
        options: trimmedOptions,
        correct: formState.correct,
        explanation: formState.explanation.trim() || null,
      });

      setSubmitting(false);

      if (error) {
        console.error(error);
        alert("Failed to create question: " + error.message);
        return;
      }

      resetForm();
      await fetchQuestions(selectedCategorySlug);
    }
  };

  const handleEditQuestion = (q: QuizQuestion) => {
    setEditingQuestion(q);
    setFormState({
      question: q.question,
      options: q.options,
      correct: q.correct,
      explanation: q.explanation || "",
    });
  };

  const openDeleteQuestionDialog = (q: QuizQuestion) => {
    setQuestionToDelete(q);
  };

  const handleConfirmDeleteQuestion = async () => {
    if (!questionToDelete) return;

    setDeletingQuestion(true);

    const { error } = await supabase
      .from("quiz_questions")
      .delete()
      .eq("id", questionToDelete.id);

    setDeletingQuestion(false);

    if (error) {
      console.error(error);
      alert("Failed to delete question: " + error.message);
      return;
    }

    setQuestionToDelete(null);

    if (selectedCategorySlug) {
      await fetchQuestions(selectedCategorySlug);
    }
  };


  // ---------- option box UI helpers ----------

  const handleOptionChange = (idx: number, value: string) => {
    setFormState((prev) => {
      const nextOptions = [...prev.options];
      nextOptions[idx] = value;
      return { ...prev, options: nextOptions };
    });
  };

  const handleSetCorrect = (idx: number) => {
    setFormState((prev) => ({
      ...prev,
      correct: idx,
    }));
  };

  return (
    <div className="lg:col-span-2 space-y-4">
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Questions
            </h2>
            {selectedCategorySlug && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Category slug:{" "}
                <code className="text-[11px]">{selectedCategorySlug}</code>
              </p>
            )}
          </div>

          {editingQuestion && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5"
            >
              Cancel edit
            </button>
          )}
        </div>

        {!selectedCategorySlug && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select a category on the left to manage its questions.
          </p>
        )}

        {selectedCategorySlug && (
          <>
            {/* Create / Edit Question Form */}
            <form
              onSubmit={handleSubmitQuestion}
              className="border border-gray-200 dark:border-white/10 rounded-xl p-4 mb-6 space-y-3 bg-gray-50/60 dark:bg-white/5"
            >
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                {editingQuestion ? "Edit question" : "Add new question"}
              </h3>

              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                  Question
                </label>
                <textarea
                  className="w-full rounded-md bg-transparent border border-gray-200 dark:border-white/10 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/70"
                  rows={2}
                  value={formState.question}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      question: e.target.value,
                    }))
                  }
                  placeholder="Type the quiz question here..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                  Options
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {formState.options.map((opt, idx) => {
                    const isCorrect = formState.correct === idx;
                    return (
                      <div
                        key={idx}
                        className={`rounded-lg border px-3 py-2 text-sm flex items-start gap-2 cursor-pointer transition-colors ${
                          isCorrect
                            ? "border-green-500 bg-green-500/5"
                            : "border-gray-200 dark:border-white/10 hover:bg-gray-100/70 dark:hover:bg-white/5"
                        }`}
                        onClick={() => handleSetCorrect(idx)}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetCorrect(idx);
                          }}
                          className={`mt-1 rounded-full border w-5 h-5 flex items-center justify-center ${
                            isCorrect
                              ? "border-green-500 bg-green-500/20"
                              : "border-gray-300 dark:border-white/20"
                          }`}
                          title="Mark as correct answer"
                        >
                          {isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                              Option {idx + 1}
                            </span>
                            {isCorrect && (
                              <span className="text-[10px] font-semibold text-green-600 dark:text-green-400">
                                Correct answer
                              </span>
                            )}
                          </div>
                          <input
                            className="w-full bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400"
                            value={opt}
                            onChange={(e) =>
                              handleOptionChange(idx, e.target.value)
                            }
                            placeholder={`Enter option ${idx + 1}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  Click an option box to mark it as the correct answer.
                </p>
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                  Explanation (optional)
                </label>
                <textarea
                  className="w-full rounded-md bg-transparent border border-gray-200 dark:border-white/10 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/70"
                  rows={2}
                  value={formState.explanation}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      explanation: e.target.value,
                    }))
                  }
                  placeholder="Explain why this answer is correct (shown after the quiz)."
                />
              </div>

              <Button type="submit" className="mt-2" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : editingQuestion ? (
                  <>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Update Question
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </>
                )}
              </Button>
            </form>

            {/* Question List */}
            <div className="space-y-3">
              {loadingQuestions && (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading questions...
                </div>
              )}

              {!loadingQuestions &&
                questions.map((q, idx) => {
                  const isDeleting = deletingQuestionId === q.id;
                  return (
                    <div
                      key={q.id}
                      className="border border-gray-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-transparent"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <p className="font-medium text-sm text-gray-900 dark:text-white">
                          {idx + 1}. {q.question}
                        </p>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleEditQuestion(q)}
                            className="p-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            title="Edit question"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteQuestionDialog(q)}
                            className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                            title="Delete question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <ul className="text-sm space-y-1 mb-2">
                        {q.options.map((opt, i) => {
                          const isCorrect = i === q.correct;
                          return (
                            <li key={i}>
                              <div
                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs border ${
                                  isCorrect
                                    ? "border-green-500 bg-green-500/5 text-green-700 dark:text-green-300"
                                    : "border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300"
                                }`}
                              >
                                <span className="font-mono mr-2">
                                  {String.fromCharCode(65 + i)}.
                                </span>
                                <span>{opt}</span>
                                {isCorrect && (
                                  <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide">
                                    Correct
                                  </span>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>

                      {q.explanation && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-semibold">Explanation:</span>{" "}
                          {q.explanation}
                        </p>
                      )}
                    </div>
                  );
                })}

              {!loadingQuestions && questions.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No questions yet for this category.
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Delete Question Modal */}
      {questionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#050505] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Delete question?
                </h3>
                <p className="text-xs text-gray-400">
                  This will permanently remove this question from the category.
                </p>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg px-4 py-3 text-xs text-gray-300 mb-5">
              <p className="font-medium text-gray-100">Question preview</p>
              <p className="mt-1 line-clamp-3">{questionToDelete.question}</p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm rounded-lg border border-white/10 text-gray-200 hover:bg-white/5 transition-colors"
                onClick={() => setQuestionToDelete(null)}
                disabled={deletingQuestion}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium disabled:opacity-60"
                onClick={handleConfirmDeleteQuestion}
                disabled={deletingQuestion}
              >
                {deletingQuestion ? "Deleting..." : "Delete question"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
