"use client";

import React, { useEffect, useState } from "react";
import { ScanLog, ScanResult, MediaType } from "@/lib/admin/types";
import {
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";

type DbScanLog = {
  id: string;
  user_id: string;
  media_type: "IMAGE" | "VIDEO";
  result: "REAL" | "FAKE" | "SUSPICIOUS";
  confidence: number;
  created_at: string;
};

type DbProfile = {
  id: string;
  name: string | null;
  email: string | null;
};

export default function AdminScansPage() {
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // search + filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [resultMenuOpen, setResultMenuOpen] = useState(false);
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const [filterResult, setFilterResult] = useState<"ALL" | ScanResult>("ALL");
  const [filterMediaType, setFilterMediaType] = useState<"ALL" | MediaType>(
    "ALL"
  );

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setErrorMsg(null);

      const supabase = supabaseBrowser();

      const { data: scanData, error: scanError } = await supabase
        .from("scan_logs")
        .select("id, user_id, media_type, result, confidence, created_at")
        .order("created_at", { ascending: false })
        .limit(200);

      if (scanError) {
        console.error("scan_logs error:", scanError);
        setErrorMsg("Failed to load scan logs.");
        setLoading(false);
        return;
      }

      const rows = (scanData || []) as DbScanLog[];
      if (rows.length === 0) {
        setLogs([]);
        setLoading(false);
        return;
      }

      const userIds = Array.from(new Set(rows.map((r) => r.user_id)));

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, name, email")
        .in("id", userIds);

      if (profileError) {
        console.error("profiles error:", profileError);
      }

      const profilesById: Record<string, DbProfile> = {};
      (profileData || []).forEach((p) => {
        profilesById[p.id] = p as DbProfile;
      });

      const mapped: ScanLog[] = rows.map((row) => {
        const profile = profilesById[row.user_id];
        const userName =
          profile?.name || profile?.email || row.user_id.slice(0, 8);
        const userEmail = profile?.email ?? null;

        const type =
          row.media_type === "VIDEO" ? MediaType.VIDEO : MediaType.IMAGE;

        let resultEnum: ScanResult;
        if (row.result === "FAKE") resultEnum = ScanResult.FAKE;
        else if (row.result === "REAL") resultEnum = ScanResult.REAL;
        else resultEnum = ScanResult.SUSPICIOUS;

        return {
          id: row.id,
          userName,
          userEmail,
          type,
          result: resultEnum,
          confidence: Number(row.confidence),
          timestamp: new Date(row.created_at).toLocaleString(),
        };
      });

      setLogs(mapped);
      setLoading(false);
    };

    fetchLogs();
  }, []);

  // derived filtered list
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredLogs = logs.filter((log) => {
    if (filterResult !== "ALL" && log.result !== filterResult) return false;
    if (filterMediaType !== "ALL" && log.type !== filterMediaType) return false;

    if (!normalizedSearch) return true;

    const haystack = [
      log.userName,
      log.userEmail ?? "",
      log.id,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedSearch);
  });

  const resultLabel =
    filterResult === "ALL"
      ? "All"
      : filterResult === ScanResult.REAL
      ? "Real"
      : filterResult === ScanResult.FAKE
      ? "Fake"
      : "Suspicious";

  const typeLabel =
    filterMediaType === "ALL"
      ? "All"
      : filterMediaType === MediaType.IMAGE
      ? "Image"
      : "Video";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Scan Logs
        </h1>

        <div className="flex flex-wrap gap-3 items-center">
          {/* Search box */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Search name, email or ID"
              className="pl-10 pr-4 py-2 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all w-64 shadow-sm dark:shadow-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {/* Result filter pill */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setResultMenuOpen((o) => !o)}
                    className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-lg text-xs text-gray-600 dark:text-gray-300 shadow-sm dark:shadow-none hover:border-orange-500/70 hover:text-gray-900 dark:hover:text-white"
                >
                    <Filter size={14} className="text-gray-500" />
                    <span className="uppercase tracking-wide text-[10px] text-gray-500">
                    Result
                    </span>
                    <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                    {resultLabel}
                    </span>
                </button>

                {resultMenuOpen && (
                    <div className="absolute right-0 mt-2 w-40 rounded-lg bg-[#050505] border border-white/10 shadow-xl z-20 overflow-hidden">
                    {[
                        { label: "All", value: "ALL" as const },
                        { label: "Real", value: ScanResult.REAL as const },
                        { label: "Fake", value: ScanResult.FAKE as const },
                        { label: "Suspicious", value: ScanResult.SUSPICIOUS as const },
                    ].map((opt) => (
                        <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                            setFilterResult(opt.value);
                            setResultMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs ${
                            filterResult === opt.value
                            ? "bg-orange-500/20 text-orange-300"
                            : "text-gray-300 hover:bg-white/5"
                        }`}
                        >
                        {opt.label}
                        </button>
                    ))}
                    </div>
                )}
            </div>

            {/* Type filter pill */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setTypeMenuOpen((o) => !o)}
                    className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-lg text-xs text-gray-600 dark:text-gray-300 shadow-sm dark:shadow-none hover:border-orange-500/70 hover:text-gray-900 dark:hover:text-white"
                >
                    <Filter size={14} className="text-gray-500" />
                    <span className="uppercase tracking-wide text-[10px] text-gray-500">
                    Type
                    </span>
                    <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                    {typeLabel}
                    </span>
                </button>

                {typeMenuOpen && (
                    <div className="absolute right-0 mt-2 w-40 rounded-lg bg-[#050505] border border-white/10 shadow-xl z-20 overflow-hidden">
                    {[
                        { label: "All", value: "ALL" as const },
                        { label: "Image", value: MediaType.IMAGE as const },
                        { label: "Video", value: MediaType.VIDEO as const },
                    ].map((opt) => (
                        <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                            setFilterMediaType(opt.value);
                            setTypeMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs ${
                            filterMediaType === opt.value
                            ? "bg-orange-500/20 text-orange-300"
                            : "text-gray-300 hover:bg-white/5"
                        }`}
                        >
                        {opt.label}
                        </button>
                    ))}
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden shadow-sm dark:shadow-none">
        {loading ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            Loading...
          </div>
        ) : errorMsg ? (
          <div className="p-6 text-center text-red-500">{errorMsg}</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No scan logs found.
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Result
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/5">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-300">
                    <div>{log.userName}</div>
                    {log.userEmail && (
                      <div className="text-xs text-gray-500 font-normal">
                        {log.userEmail}
                      </div>
                    )}
                    <div className="text-[11px] text-gray-500 font-mono">
                      #{log.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 capitalize">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        log.type === MediaType.VIDEO
                          ? "bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400"
                      }`}
                    >
                      {log.type.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            log.confidence > 90
                              ? "bg-orange-500"
                              : "bg-yellow-500"
                          }`}
                          style={{ width: `${log.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {log.confidence}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        log.result === ScanResult.FAKE
                          ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 border-red-200 dark:border-red-500/20"
                          : log.result === ScanResult.REAL
                          ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-500 border-green-200 dark:border-green-500/20"
                          : "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-200 dark:border-yellow-500/20"
                      }`}
                    >
                      {log.result === ScanResult.FAKE && <XCircle size={12} />}
                      {log.result === ScanResult.REAL && (
                        <CheckCircle size={12} />
                      )}
                      {log.result === ScanResult.SUSPICIOUS && (
                        <AlertTriangle size={12} />
                      )}
                      {log.result}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {log.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
