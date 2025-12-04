// QuizPage.tsx

"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Brain, ArrowLeft, Shield, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { QuizCategory, QuizQuestion } from "@/lib/admin/types";

export default function QuizPage() {
  const supabase = supabaseBrowser();

  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
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

  // ---------- load data ----------

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedCategorySlug) {
      // reset quiz state when switching category
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setScore(0);
      fetchQuestions(selectedCategorySlug);
    } else {
      setQuestions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategorySlug]);

  const currentQuiz = questions;
  const current = currentQuiz[currentQuestion];

  // ---------- quiz logic ----------

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
      // quiz finished → reset and go back to categories
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
    <div className="min-h-screen bg-background">
      {/* Header - Sticky and fixed for space efficiency */}
      <header className="sticky top-4 z-50 mx-auto max-w-4xl px-4">
        <div className="flex items-center justify-between rounded-full bg-black/80 backdrop-blur-sm border border-zinc-800 shadow-lg px-6 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-white">Detectify</span>
          </Link>

          {/* Back button */}
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900" />
      <div className="pointer-events-none absolute -top-24 -right-16 w-[28rem] h-[28rem] rounded-full bg-[#e78a53]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 w-[34rem] h-[34rem] rounded-full bg-[#e78a53]/5 blur-3xl" />

      {/* REVISED PADDING: Reduced pt-16 and pb-24 for less vertical space */}
      <section className="relative pt-16 pb-24 sm:pb-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            // REVISED MARGIN: Reduced margin-bottom to move categories up
            className="text-center mb-10" // Reduced from mb-12
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full mb-4">
              <Brain className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium text-orange-500">
                Test Your Knowledge
              </span>
            </div>
            {/* REVISED FONT SIZE: Main Title (sm:text-5xl) */}
            <h1 className="text-4xl font-bold tracking-tight text-balance text-foreground sm:text-5xl mb-3">
              Deepfake Awareness Quiz
            </h1>
            {/* REVISED FONT SIZE: Subtitle (text-base) */}
            <p className="text-base text-pretty text-muted-foreground max-w-2xl mx-auto">
              Choose a category and test your understanding of deepfakes. Learn
              how to identify and protect yourself from manipulated media.
            </p>
          </motion.div>

          {/* ---------- Category selection ---------- */}
          {!selectedCategorySlug ? (
            <div className="max-w-6xl mx-auto">
              {loadingCategories && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-6">
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
                <p className="text-center text-sm text-muted-foreground">
                  No quizzes available yet. Please check back later.
                </p>
              )}

              {/* REVISED GAP: Reduced gap-6 to gap-4 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category, index) => (
                  <motion.button
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    onClick={() => setSelectedCategorySlug(category.slug)}
                    // REVISED PADDING: Reduced p-8 to p-6
                    className="group relative bg-card border border-border rounded-2xl p-6 text-left hover:border-orange-500/50 transition-all hover:shadow-xl"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        // REVISED SIZE: Reduced w-16 h-16 to w-14 h-14
                        className={`text-3xl w-14 h-14 rounded-xl bg-gradient-to-br ${
                          category.color || "from-orange-500 to-orange-600"
                        } flex items-center justify-center`}
                      >
                        {category.icon || "🎯"}
                      </div>
                      <div className="flex-1">
                        {/* REVISED FONT SIZE: Title (text-lg) */}
                        <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-orange-500 transition-colors">
                          {category.title}
                        </h3>
                        {/* REVISED FONT SIZE: Description (text-xs) */}
                        <p className="text-xs text-muted-foreground">
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
            // ---------- Quiz view ---------- //
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto"
            >
              <Button
                variant="ghost"
                onClick={handleBackToCategories}
                className="mb-6"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Categories
              </Button>

              {loadingQuestions && (
                <div className="bg-card border border-border rounded-2xl p-8 flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Loading questions...
                  </span>
                </div>
              )}

              {questionsError && !loadingQuestions && (
                <div className="bg-card border border-border rounded-2xl p-8">
                  <p className="text-sm text-red-500">
                    Failed to load questions: {questionsError}
                  </p>
                </div>
              )}

              {!loadingQuestions && !questionsError && currentQuiz.length === 0 && (
                <div className="bg-card border border-border rounded-2xl p-8">
                  <h3 className="text-lg font-semibold mb-2">No questions yet</h3>
                  <p className="text-sm text-muted-foreground">
                    This category does not have any questions yet. Please try
                    another quiz.
                  </p>
                </div>
              )}

              {!loadingQuestions &&
                !questionsError &&
                currentQuiz.length > 0 &&
                current && (
                  <div className="bg-card border border-border rounded-2xl p-8">
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-muted-foreground">
                          {selectedCategory ? selectedCategory.title : "Quiz"} •
                          Question {currentQuestion + 1} of{" "}
                          {currentQuiz.length}
                        </span>
                        <span className="text-sm font-medium text-orange-500">
                          Score: {score}
                        </span>
                      </div>
                      <div className="w-full bg-border rounded-full h-2 mt-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${
                              ((currentQuestion + 1) / currentQuiz.length) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* REVISED FONT SIZE: Question Text (text-lg) */}
                    <h3 className="text-lg font-bold text-foreground mb-6">
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
                                ? "border-green-500 bg-green-500/10"
                                : selectedAnswer === index
                                ? "border-red-500 bg-red-500/10"
                                : "border-border bg-background/50"
                              : selectedAnswer === index
                              ? "border-orange-500 bg-orange-500/10"
                              : "border-border hover:border-orange-500/50 hover:bg-background/50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-foreground">{option}</span>
                            {showResult && index === current.correct && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                            {showResult &&
                              selectedAnswer === index &&
                              index !== current.correct && (
                                <XCircle className="h-5 w-5 text-red-500" />
                              )}
                          </div>
                        </button>
                      ))}
                    </div>

                    {showResult && current.explanation && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-6"
                      >
                        <p className="text-sm text-foreground">
                          <strong>Explanation:</strong> {current.explanation}
                        </p>
                      </motion.div>
                    )}

                    {showResult && (
                      <Button onClick={handleNext} className="w-full" size="lg">
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
    </div>
  );
}