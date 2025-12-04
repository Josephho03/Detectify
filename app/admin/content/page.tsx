"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NewsArticle } from "@/lib/admin/types";
import { supabaseBrowser } from "@/lib/supabase/client";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  ExternalLink,
} from "lucide-react";

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

export default function AdminContentPage() {
  const router = useRouter();

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(
    null
  );

  const [formData, setFormData] = useState<Omit<NewsArticle, "id" | "date">>({
    title: "",
    category: "",
    excerpt: "",
    content: "",
    author: "",
    readTime: "",
    image: "",
    link: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Check auth + role and load articles
  useEffect(() => {
    const supabase = supabaseBrowser();

    const init = async () => {
      setLoading(true);
      setError(null);

      // 1. Require login
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login?redirectedFrom=/admin/content");
        return;
      }

      // 2. Require admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profile?.role !== "admin") {
        router.replace("/");
        return;
      }

      // 3. Load existing news
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setError("Failed to load articles.");
      } else if (data) {
        setArticles(data.map(mapRowToArticle));
      }

      setLoading(false);
    };

    init();
  }, [router]);

  const handleOpenCreate = () => {
    setEditingArticle(null);
    setFormData({
      title: "",
      category: "",
      excerpt: "",
      content: "",
      author: "",
      readTime: "",
      image: "",
      link: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (article: NewsArticle) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      category: article.category,
      excerpt: article.excerpt,
      content: article.content,
      author: article.author,
      readTime: article.readTime,
      image: article.image,
      link: article.link,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;

    const supabase = supabaseBrowser();
    const { error } = await supabase.from("news").delete().eq("id", id);

    if (error) {
      console.error(error);
      alert("Failed to delete article.");
      return;
    }

    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = supabaseBrowser();

    try {
      if (editingArticle) {
        // UPDATE
        const { data, error } = await supabase
          .from("news")
          .update({
            title: formData.title,
            category: formData.category,
            excerpt: formData.excerpt,
            content: formData.content,
            author: formData.author,
            read_time: formData.readTime,
            image: formData.image,
            link: formData.link || null,
          })
          .eq("id", editingArticle.id)
          .select()
          .single<NewsRow>();

        if (error || !data) {
          console.error(error);
          alert("Failed to update article.");
        } else {
          const updated = mapRowToArticle(data);
          setArticles((prev) =>
            prev.map((a) => (a.id === updated.id ? updated : a))
          );
        }
      } else {
        // INSERT
        const { data, error } = await supabase
          .from("news")
          .insert({
            title: formData.title,
            category: formData.category,
            excerpt: formData.excerpt,
            content: formData.content,
            author: formData.author,
            read_time: formData.readTime,
            image: formData.image,
            link: formData.link || null,
          })
          .select()
          .single<NewsRow>();

        if (error || !data) {
          console.error(error);
          alert("Failed to publish article.");
        } else {
          const created = mapRowToArticle(data);
          setArticles((prev) => [created, ...prev]);
        }
      }

      setIsModalOpen(false);
      setEditingArticle(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            News Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage articles, updates, and educational content.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} />
          Add New Article
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-xl">
          <p className="text-gray-500">Loading articles...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {articles.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 p-6 rounded-xl flex flex-col md:flex-row items-start gap-6 group hover:border-orange-500/30 transition-all shadow-sm dark:shadow-none"
            >
              <div className="w-full md:w-48 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden relative">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded backdrop-blur-md">
                  {item.category}
                </div>
              </div>

              <div className="flex-1 w-full">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
                    {item.title}
                  </h3>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-transparent transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 bg-gray-50 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 border border-gray-200 dark:border-transparent transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 mb-3 line-clamp-2">
                  {item.excerpt}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-500 border-t border-gray-100 dark:border-white/5 pt-3 mt-1">
                  <span className="flex items-center gap-1">
                    By{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {item.author}
                    </span>
                  </span>
                  <span className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                  <span>{item.date}</span>
                  <span className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                  <span>{item.readTime}</span>
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-orange-600 dark:text-orange-500 flex items-center gap-1 hover:underline"
                    >
                      View Link <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
          {articles.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-xl border-dashed">
              <p className="text-gray-500">No articles found.</p>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center sticky top-0 bg-white dark:bg-[#111] z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingArticle ? "Edit Article" : "New Article"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Title
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-white/10 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter article headline"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    required
                    className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-white/10 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    <option value="">Select...</option>
                    <option value="Research">Research</option>
                    <option value="Security">Security</option>
                    <option value="Policy">Policy</option>
                    <option value="Education">Education</option>
                    <option value="Industry">Industry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Author Name
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-white/10 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors"
                    value={formData.author}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                    placeholder="e.g. Dr. Jane Doe"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Read Time
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-white/10 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors"
                    value={formData.readTime}
                    onChange={(e) =>
                      setFormData({ ...formData, readTime: e.target.value })
                    }
                    placeholder="e.g. 5 min read"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    External Link (Optional)
                  </label>
                  <input
                    type="text"
                    className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-white/10 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors"
                    value={formData.link}
                    onChange={(e) =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Cover Image URL
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-white/10 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    placeholder="https://..."
                  />
                  {formData.image && (
                    <div className="mt-2 h-32 w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-full h-full object-cover opacity-80"
                      />
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Excerpt (Short Summary)
                  </label>
                  <textarea
                    required
                    className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-white/10 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 h-20 resize-none transition-colors"
                    value={formData.excerpt}
                    onChange={(e) =>
                      setFormData({ ...formData, excerpt: e.target.value })
                    }
                    placeholder="Brief overview shown in the card..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Full Content
                  </label>
                  <textarea
                    required
                    className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-white/10 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 h-40 resize-y transition-colors"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    placeholder="Full article content..."
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-200 dark:border-white/10 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-white rounded-lg flex items-center gap-2 transition-colors shadow-md"
                >
                  <Save size={18} />
                  {saving
                    ? "Saving..."
                    : editingArticle
                    ? "Update Article"
                    : "Publish Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
