// D:\FYP\Detectify\components\news.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  ArrowRight,
  TrendingUp,
  X,
  ExternalLink,
  Clock,
  User,
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

export function News() {
  const [newsItems, setNewsItems] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // modal state
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const supabase = supabaseBrowser();

    const load = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(4); // latest 4 only

      if (error) {
        console.error(error);
        setError("Failed to load latest news.");
      } else if (data) {
        setNewsItems(data.map(mapRowToArticle));
      }

      setLoading(false);
    };

    load();
  }, []);

  const openArticle = (article: NewsArticle) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const closeArticle = () => {
    setIsModalOpen(false);
  };

  return (
    <section
      id="news"
      className="relative py-24 sm:py-32 bg-gradient-to-b from-transparent via-orange-950/5 to-transparent"
    >
      <div className="container mx-auto px-4">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full mb-4">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium text-orange-500">
              Latest Updates
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-balance text-foreground sm:text-5xl mb-4">
            Deepfake News &amp; Updates
          </h2>
          <p className="text-lg text-pretty text-muted-foreground max-w-2xl mx-auto">
            Stay informed about the latest developments in deepfake technology,
            detection methods, and security measures.
          </p>
        </motion.div>

        {/* Error / loading / empty states */}
        {error && (
          <div className="text-center text-sm text-red-400 mb-8">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-muted-foreground mb-12">
            Loading latest articles...
          </div>
        ) : newsItems.length === 0 ? (
          <div className="text-center text-muted-foreground mb-12">
            No news articles yet. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
            {newsItems.map((item, index) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group cursor-pointer"
                onClick={() => openArticle(item)}
              >
                <div className="bg-card border border-border rounded-2xl overflow-hidden h-full hover:border-primary/50 transition-all duration-300">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                        {item.category}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {item.date}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-pretty text-muted-foreground mb-4">
                      {item.excerpt}
                    </p>

                    {/* READ MORE – opens modal (same onClick as card) */}
                    <button
                      type="button"
                      className="flex items-center gap-2 text-primary font-medium text-sm"
                    >
                      Read more
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* Link to full news page */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link href="/news">
            <Button
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
            More News
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* MODAL FOR FULL ARTICLE */}
      {isModalOpen && selectedArticle && (
        <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-[#050505] border border-zinc-800 rounded-3xl shadow-2xl">
            {/* Close button */}
            <button
              type="button"
              onClick={closeArticle}
              className="absolute right-4 top-4 z-10 rounded-full bg-black/60 border border-zinc-700 p-1.5 text-zinc-400 hover:text-white hover:bg-black/80"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
              {/* Image */}
              <div className="md:col-span-1">
                <div className="h-full w-full overflow-hidden rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none">
                  <img
                    src={selectedArticle.image || "/placeholder.svg"}
                    alt={selectedArticle.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              {/* Text */}
              <div className="md:col-span-2 p-6 sm:p-8 space-y-4">
                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 text-[11px] font-semibold tracking-wide uppercase">
                    {selectedArticle.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {selectedArticle.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {selectedArticle.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {selectedArticle.readTime}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                  {selectedArticle.title}
                </h2>

                {/* External link (clickable URL) */}
                {selectedArticle.link && (
                  <a
                    href={selectedArticle.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-orange-400 hover:text-orange-300 underline-offset-4 hover:underline"
                  >
                    {selectedArticle.link}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}

                {/* Content rendered as HTML (supports <br/>, <ul>, <strong>, etc.) */}
                <div
                  className="mt-2 text-sm leading-relaxed text-zinc-200 prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                />

                {/* Button row */}
                <div className="pt-4 flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeArticle}
                    className="border-zinc-700 text-zinc-200 hover:bg-zinc-800"
                  >
                    Close
                  </Button>

                  {selectedArticle.link && (
                    <a
                      href={selectedArticle.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                        Read Full Article
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
