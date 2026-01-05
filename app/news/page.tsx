"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  ArrowLeft,
  TrendingUp,
  Clock,
  User,
  Shield,
  X,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { NewsArticle } from "@/lib/admin/types";

type NewsRow = {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  author: string;
  read_time: string;
  image: string;
  link: string | null;
  created_at: string;
};

export default function NewsPage() {
  const [allNews, setAllNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 👇 for the popup window
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(
    null
  );

  const mapRowToArticle = (row: NewsRow): NewsArticle => {
    const date = new Date(row.created_at).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    return {
      id: row.id,
      title: row.title,
      category: row.category,
      excerpt: row.excerpt,
      content: row.content,
      author: row.author,
      readTime: row.read_time,
      image: row.image,
      link: row.link ?? "",
      date,
    };
  };

  useEffect(() => {
    const supabase = supabaseBrowser();

    const load = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setError("Failed to load news.");
      } else if (data) {
        setAllNews(data.map(mapRowToArticle));
      }

      setLoading(false);
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300 relative overflow-hidden">
       {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-zinc-900 dark:via-black dark:to-zinc-900 transition-colors duration-300" />
      <div className="pointer-events-none absolute -top-24 -right-16 w-[28rem] h-[28rem] rounded-full bg-[#e78a53]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 w-[34rem] h-[34rem] rounded-full bg-[#e78a53]/5 blur-3xl" />

      {/* Header */}
      <header className="sticky top-4 z-50 mx-auto max-w-4xl px-4">
        <div className="flex items-center justify-between rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-gray-200 dark:border-zinc-800 shadow-lg px-6 py-3 transition-colors duration-300">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md shadow-orange-500/20">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">Detectify</span>
          </Link>

          {/* Back button */}
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <section className="relative py-24 sm:py-32 z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full mb-4">
              <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-500" />
              <span className="text-sm font-medium text-orange-600 dark:text-orange-500">
                Latest Updates
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-balance text-gray-900 dark:text-white sm:text-6xl mb-4">
              Deepfake News &amp; Updates
            </h1>
            <p className="text-lg text-pretty text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Stay informed about the latest developments in deepfake technology,
              detection methods, and security measures.
            </p>
          </motion.div>

          {error && (
            <div className="text-center text-sm text-red-500 dark:text-red-400 mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center text-gray-500 dark:text-zinc-500">
              Loading articles...
            </div>
          ) : allNews.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-zinc-500">
              No news articles yet.
            </div>
          ) : (
            <div className="max-w-6xl mx-auto space-y-8">
              {allNews.map((item, index) => (
                <motion.article
                  id={item.id}  
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group"
                >
                  <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Image */}
                      <div className="md:col-span-1 aspect-video md:aspect-square overflow-hidden bg-gray-100 dark:bg-zinc-800">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Summary content */}
                      <div className="md:col-span-2 p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-4 mb-3 flex-wrap">
                            <span className="px-3 py-1 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700 text-xs font-medium rounded-full">
                              {item.category}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-zinc-500">
                              <Calendar className="h-3 w-3" />
                              {item.date}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-zinc-500">
                              <User className="h-3 w-3" />
                              {item.author}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-zinc-500">
                              <Clock className="h-3 w-3" />
                              {item.readTime}
                            </div>
                          </div>

                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors">
                            {item.title}
                          </h2>

                          <p className="text-sm text-pretty text-gray-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                            {item.excerpt}
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          className="w-fit mt-4 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:text-orange-500 dark:hover:text-orange-400 dark:hover:bg-orange-500/10 p-0 hover:bg-transparent"
                          onClick={() => setSelectedArticle(item)}
                        >
                          Read Full Article →
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 🔍 Full article modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-800 sticky top-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md z-10">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white line-clamp-1 mr-4">
                {selectedArticle.title}
              </h2>
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 pb-6 pt-4 space-y-4">
              {/* Image */}
              <div className="w-full aspect-video rounded-xl overflow-hidden mb-4 bg-gray-100 dark:bg-zinc-800">
                <img
                  src={selectedArticle.image || "/placeholder.svg"}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-zinc-500 mb-2">
                <span className="px-3 py-1 bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-500 rounded-full text-[11px] font-medium border border-orange-200 dark:border-orange-500/20">
                  {selectedArticle.category}
                </span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {selectedArticle.date}
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {selectedArticle.author}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {selectedArticle.readTime}
                </div>
              </div>

              {/* External link */}
              {selectedArticle.link && (
                <a
                  href={selectedArticle.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 underline break-all"
                >
                  {selectedArticle.link}
                </a>
              )}

              {/* Content with line breaks / HTML */}
              <div
                className="mt-2 text-sm text-gray-600 dark:text-zinc-300 leading-relaxed space-y-4 article-content"
                dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}