"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  Brain,
  ArrowLeft,
  Shield,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { QuizCategory, QuizQuestion } from "@/lib/admin/types";

// ✅ ADD THIS
import ChatWidget from "@/components/ChatWidget";

export default function QuizPage() {
  const supabase = supabaseBrowser();

  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(
    null
  );
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const selectedCategory = selectedCategorySlug
    ? categories.find((c) => c.slug === selectedCategorySlug) ?? null
    : null;

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
    } else {
      setCategories((data || []) as QuizCategory[]);
    }
    setLoadingCategories(false);
  };

  const fetchQuestions = async (slug: string) => {
    setLoadingQuestions(true);
    setQuestionsError(null);

    const { data, error } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("category_slug", slug)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      setQuestionsError(error.message);
      setQuestions([]);
    } else {
      setQuestions((data || []) as QuizQuestion[]);
    }
    setLoadingQuestions(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategorySlug) {
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setScore(0);
      fetchQuestions(selectedCategorySlug);
    } else {
      setQuestions([]);
    }
  }, [selectedCategorySlug]);

  const currentQuiz = questions;
  const current = currentQuiz[currentQuestion];

  const handleAnswer = (answerIndex: number) => {
    if (!current) return;
    setSelectedAnswer(answerIndex);
    if (answerIndex === current.correct) {
      setScore((prev) => prev + 1);
    }
    setShowResult(true);
  };

  const handleNext = () => {
    if (!currentQuiz.length) return;

    if (currentQuestion < currentQuiz.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setScore(0);
      setSelectedCategorySlug(null);
    }
  };

  const isQuizComplete =
    currentQuiz.length > 0 &&
    currentQuestion === currentQuiz.length - 1 &&
    showResult;

  const handleBackToCategories = () => {
    setSelectedCategorySlug(null);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden transition-colors duration-300">
      {/* Background Accents */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-zinc-900 dark:via-black dark:to-zinc-900" />
      <div className="pointer-events-none absolute -top-24 -right-16 w-[28rem] h-[28rem] rounded-full bg-[#e78a53]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 w-[34rem] h-[34rem] rounded-full bg-[#e78a53]/5 blur-3xl" />

      {/* Header */}
      <header className="sticky top-4 z-50 mx-auto max-w-4xl px-4">
        <div className="flex items-center justify-between rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-sm border border-gray-200 dark:border-zinc-800 shadow-lg px-6 py-3 transition-colors">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">
              Detectify
            </span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <section className="relative pt-16 pb-24 sm:pb-32 z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full mb-4">
              <Brain className="h-5 w-5 text-orange-600 dark:text-orange-500" />
              <span className="text-sm font-medium text-orange-600 dark:text-orange-500">
                Test Your Knowledge
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-balance text-gray-900 dark:text-white sm:text-5xl mb-3">
              Deepfake Awareness Quiz
            </h1>
            <p className="text-base text-pretty text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Choose a category and test your understanding of deepfakes. Learn
              how to identify and protect yourself from manipulated media.
            </p>
          </motion.div>

          {/* Category selection */}
          {!selectedCategorySlug ? (
            <div className="max-w-6xl mx-auto">
              {loadingCategories && (
                <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-zinc-500 mb-6">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading quiz categories...
                </div>
              )}

              {categoryError && (
                <p className="text-center text-sm text-red-500 mb-4">
                  Failed to load categories: {categoryError}
                </p>
              )}

              {!loadingCategories && categories.length === 0 && (
                <p className="text-center text-sm text-gray-500 dark:text-zinc-500">
                  No quizzes available yet. Please check back later.
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category, index) => (
                  <motion.button
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    onClick={() => setSelectedCategorySlug(category.slug)}
                    className="group relative bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 text-left hover:border-orange-500/50 transition-all hover:shadow-xl dark:hover:shadow-orange-500/5"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`text-3xl w-14 h-14 rounded-xl bg-gradient-to-br ${
                          category.color || "from-orange-500 to-orange-600"
                        } flex items-center justify-center shadow-lg shadow-orange-500/10`}
                      >
                        {category.icon || "🎯"}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors">
                          {category.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-zinc-500 leading-relaxed">
                          {category.description ||
                            "Answer questions related to this topic."}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            /* Quiz view */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto"
            >
              <Button
                variant="ghost"
                onClick={handleBackToCategories}
                className="mb-6 text-gray-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Categories
              </Button>

              {loadingQuestions && (
                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-8 flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-zinc-500">
                    Loading questions...
                  </span>
                </div>
              )}

              {questionsError && !loadingQuestions && (
                <div className="bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/30 rounded-2xl p-8">
                  <p className="text-sm text-red-500">
                    Failed to load questions: {questionsError}
                  </p>
                </div>
              )}

              {!loadingQuestions && !questionsError && currentQuiz.length === 0 && (
                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No questions yet
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-zinc-500">
                    This category does not have any questions yet. Please try another quiz.
                  </p>
                </div>
              )}

              {!loadingQuestions &&
                !questionsError &&
                currentQuiz.length > 0 &&
                current && (
                  <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm transition-colors">
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-500 dark:text-zinc-500">
                          {selectedCategory ? selectedCategory.title : "Quiz"} •
                          Question {currentQuestion + 1} of {currentQuiz.length}
                        </span>
                        <span className="text-sm font-medium text-orange-600 dark:text-orange-500">
                          Score: {score}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-2 mt-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${((currentQuestion + 1) / currentQuiz.length) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 leading-snug">
                      {current.question}
                    </h3>

                    <div className="space-y-3 mb-6">
                      {current.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => !showResult && handleAnswer(index)}
                          disabled={showResult}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                            showResult
                              ? index === current.correct
                                ? "border-green-500 bg-green-50 dark:bg-green-500/10"
                                : selectedAnswer === index
                                ? "border-red-500 bg-red-50 dark:bg-red-500/10"
                                : "border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50"
                              : selectedAnswer === index
                              ? "border-orange-500 bg-orange-50 dark:bg-orange-500/10"
                              : "border-gray-100 dark:border-zinc-800 hover:border-orange-500/50 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-sm ${
                                showResult && index === current.correct
                                  ? "text-green-700 dark:text-green-500 font-medium"
                                  : "text-gray-700 dark:text-zinc-300"
                              }`}
                            >
                              {option}
                            </span>
                            {showResult && index === current.correct && (
                              <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                            )}
                            {showResult &&
                              selectedAnswer === index &&
                              index !== current.correct && (
                                <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                              )}
                          </div>
                        </button>
                      ))}
                    </div>

                    {showResult && current.explanation && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-xl p-4 mb-6"
                      >
                        <p className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed">
                          <strong className="text-orange-700 dark:text-orange-500">
                            Explanation:
                          </strong>{" "}
                          {current.explanation}
                        </p>
                      </motion.div>
                    )}

                    {showResult && (
                      <Button
                        onClick={handleNext}
                        className="w-full bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white"
                        size="lg"
                      >
                        {isQuizComplete
                          ? `Finish Quiz (Final Score: ${score}/${currentQuiz.length})`
                          : "Next Question"}
                      </Button>
                    )}
                  </div>
                )}
            </motion.div>
          )}
        </div>
      </section>

      {/* ✅ ADD THIS: Floating chatbot (does NOT affect layout) */}
      <ChatWidget
        context={{
          page: "quiz",
          category: selectedCategory?.title ?? null,
          categorySlug: selectedCategorySlug,
          questionIndex: currentQuestion + 1,
          totalQuestions: currentQuiz.length,
          score,
          showResult,
        }}
        title="Detectify Assistant"
      />
    </div>
  );
}
