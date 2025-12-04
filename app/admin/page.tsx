"use client";

import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Activity, ShieldX, Users, ImageIcon, Video } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";

type TimeRange = "24h" | "7d" | "30d";

type DashboardPoint = {
  name: string; // label on X axis
  imageScans: number;
  videoScans: number;
};

type DbScanLog = {
  id: string;
  user_id: string;
  media_type: "IMAGE" | "VIDEO";
  result: "REAL" | "FAKE" | "SUSPICIOUS";
  created_at: string;
};

const StatCard: React.FC<{
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
}> = ({ title, value, subtitle, icon }) => (
  <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-xl p-6 relative overflow-hidden group hover:border-orange-500/30 transition-all duration-300 shadow-sm dark:shadow-none">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-gray-100 dark:bg-white/5 rounded-lg text-orange-600 dark:text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
        {icon}
      </div>
    </div>
    <div className="relative z-10">
      <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
        {title}
      </h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {subtitle}
        </p>
      )}
    </div>
  </div>
);

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");

  // totals across ALL time
  const [totalScansAll, setTotalScansAll] = useState(0);
  const [deepfakesAll, setDeepfakesAll] = useState(0);
  const [activeUsersAll, setActiveUsersAll] = useState(0);
  const [loadingTotals, setLoadingTotals] = useState(true);

  // chart data for selected range
  const [chartData, setChartData] = useState<DashboardPoint[]>([]);
  const [showImage, setShowImage] = useState(true);
  const [showVideo, setShowVideo] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const rangeLabel =
    timeRange === "24h"
      ? "last 24 hours"
      : timeRange === "7d"
      ? "last 7 days"
      : "last 30 days";

  // 1) Load global totals (no time filter)
  useEffect(() => {
    const fetchTotals = async () => {
      try {
        setLoadingTotals(true);
        const supabase = supabaseBrowser();

        const { data, error } = await supabase
          .from("scan_logs")
          .select("id, user_id, result, created_at, media_type");

        if (error) {
          console.error("Error loading totals:", error);
          setLoadingTotals(false);
          return;
        }

        const scans = (data || []) as DbScanLog[];

        const total = scans.length;
        const deepfakeCount = scans.filter((s) => s.result === "FAKE").length;
        const distinctUsers = new Set(scans.map((s) => s.user_id)).size;

        setTotalScansAll(total);
        setDeepfakesAll(deepfakeCount);
        setActiveUsersAll(distinctUsers);
        setLoadingTotals(false);
      } catch (err) {
        console.error("Unexpected totals error:", err);
        setLoadingTotals(false);
      }
    };

    fetchTotals();
  }, []);

  // 2) Load chart data for selected time range
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoadingChart(true);
        setErrorMsg(null);

        const supabase = supabaseBrowser();

        const now = new Date();
        let since: Date;
        if (timeRange === "24h") {
          since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        } else if (timeRange === "7d") {
          since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else {
          since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        const { data: scanData, error: scanError } = await supabase
          .from("scan_logs")
          .select("id, user_id, media_type, result, created_at")
          .gte("created_at", since.toISOString())
          .order("created_at", { ascending: true });

        if (scanError) {
          console.error("Error loading dashboard scan logs:", scanError);
          setErrorMsg("Failed to load dashboard data.");
          setLoadingChart(false);
          return;
        }

        const scans = (scanData || []) as DbScanLog[];

        let buckets: DashboardPoint[] = [];

        if (timeRange === "24h") {
          // fixed 6 buckets over 24h
          buckets = [
            { name: "00–04", imageScans: 0, videoScans: 0 },
            { name: "04–08", imageScans: 0, videoScans: 0 },
            { name: "08–12", imageScans: 0, videoScans: 0 },
            { name: "12–16", imageScans: 0, videoScans: 0 },
            { name: "16–20", imageScans: 0, videoScans: 0 },
            { name: "20–24", imageScans: 0, videoScans: 0 },
          ];

          const findBucketIndex = (hour: number) => {
            if (hour < 4) return 0;
            if (hour < 8) return 1;
            if (hour < 12) return 2;
            if (hour < 16) return 3;
            if (hour < 20) return 4;
            return 5;
          };

          scans.forEach((s) => {
            const d = new Date(s.created_at);
            const hour = d.getHours();
            const idx = findBucketIndex(hour);
            if (s.media_type === "IMAGE") {
              buckets[idx].imageScans += 1;
            } else {
              buckets[idx].videoScans += 1;
            }
          });
        } else {
          // group by calendar day for 7d / 30d
          scans.forEach((s) => {
            const d = new Date(s.created_at);
            const label = d.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            });

            let bucket = buckets[buckets.length - 1];
            if (!bucket || bucket.name !== label) {
              bucket = { name: label, imageScans: 0, videoScans: 0 };
              buckets.push(bucket);
            }

            if (s.media_type === "IMAGE") {
              bucket.imageScans += 1;
            } else {
              bucket.videoScans += 1;
            }
          });
        }

        setChartData(buckets);
        setLoadingChart(false);
      } catch (err) {
        console.error("Unexpected dashboard error:", err);
        setErrorMsg("Failed to load dashboard data.");
        setLoadingChart(false);
      }
    };

    fetchDashboardData();
  }, [timeRange]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Overview of Detectify usage. Chart shows{" "}
            {rangeLabel}.
          </p>
        </div>
      </div>

      {/* Stat cards – GLOBAL TOTALS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Scans"
          value={loadingTotals ? "…" : totalScansAll.toString()}
          subtitle="All image and video scans recorded"
          icon={<Activity size={24} />}
        />
        <StatCard
          title="Total Deepfakes Detected"
          value={loadingTotals ? "…" : deepfakesAll.toString()}
          subtitle="Scans flagged as FAKE"
          icon={<ShieldX size={24} />}
        />
        <StatCard
          title="Active Users"
          value={loadingTotals ? "…" : activeUsersAll.toString()}
          subtitle="Unique users who have run at least one scan"
          icon={<Users size={24} />}
        />
      </div>

      {/* Chart + controls */}
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-xl p-6 shadow-sm dark:shadow-none">
        <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Model Usage: Image vs Video
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Distribution of scans in the {rangeLabel}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Time range selector */}
            <div className="inline-flex items-center rounded-full border border-gray-200 dark:border-white/10 bg-gray-50/60 dark:bg-black/40 p-1 text-xs">
              {(["24h", "7d", "30d"] as TimeRange[]).map((range) => {
                const active = timeRange === range;
                const label =
                  range === "24h"
                    ? "24h"
                    : range === "7d"
                    ? "7 days"
                    : "30 days";
                return (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 rounded-full font-medium transition-colors ${
                      active
                        ? "bg-orange-500 text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Series toggles */}
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowImage((v) => !v)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] ${
                  showImage
                    ? "border-orange-500/60 text-orange-500 bg-orange-500/10"
                    : "border-gray-500/40 text-gray-500 hover:bg-white/5"
                }`}
              >
                <ImageIcon className="h-3 w-3" />
                Image
              </button>
              <button
                type="button"
                onClick={() => setShowVideo((v) => !v)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] ${
                  showVideo
                    ? "border-blue-500/60 text-blue-500 bg-blue-500/10"
                    : "border-gray-500/40 text-gray-500 hover:bg-white/5"
                }`}
              >
                <Video className="h-3 w-3" />
                Video
              </button>
            </div>
          </div>
        </div>

        {errorMsg ? (
          <div className="text-center text-red-500 py-10">{errorMsg}</div>
        ) : loadingChart ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-10">
            Loading chart…
          </div>
        ) : chartData.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-10">
            No scans found in the selected range.
          </div>
        ) : (
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorImage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorVideo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  stroke="#888"
                  tick={{ fill: "#888" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#888"
                  tick={{ fill: "#888" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#333"
                  vertical={false}
                  opacity={0.2}
                />
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
                {showImage && (
                  <Area
                    type="monotone"
                    name="Image Model"
                    dataKey="imageScans"
                    stroke="#ea580c"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorImage)"
                  />
                )}
                {showVideo && (
                  <Area
                    type="monotone"
                    name="Video Model"
                    dataKey="videoScans"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorVideo)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
