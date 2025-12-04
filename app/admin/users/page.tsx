"use client";

import React, { useEffect, useState } from "react";
import { Mail, Trash2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";

type DbProfile = {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type UiUser = {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  scansCount: number;
  lastUpdated: string | null;
};

type ScanCountRow = {
  user_id: string;
  count: number;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeToday, setActiveToday] = useState(0);
  const [newThisWeek, setNewThisWeek] = useState(0);

  // delete dialog state
  const [userToDelete, setUserToDelete] = useState<UiUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setErrorMsg(null);

      const supabase = supabaseBrowser();

      // 1) load all normal users
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, email, role, created_at, updated_at")
        .eq("role", "user")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading users:", error);
        setErrorMsg("Failed to load users.");
        setLoading(false);
        return;
      }

      const rows = (data || []) as DbProfile[];

      // 2) stats: Active Today & New This Week
      const now = new Date();
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const sevenDaysAgo = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 7
      );

      let activeCount = 0;
      let newWeekCount = 0;

      for (const row of rows) {
        if (row.updated_at) {
          const updatedAt = new Date(row.updated_at);
          if (updatedAt >= startOfToday) {
            activeCount += 1;
          }
        }

        if (row.created_at) {
          const createdAt = new Date(row.created_at);
          if (createdAt >= sevenDaysAgo) {
            newWeekCount += 1;
          }
        }
      }

      setActiveToday(activeCount);
      setNewThisWeek(newWeekCount);

      // 3) get scan counts per user from scan_logs
        const userIds = rows.map((r) => r.id);
        let countsByUserId: Record<string, number> = {};

        if (userIds.length > 0) {
        const { data: scanLogsData, error: scanLogsError } = await supabase
            .from("scan_logs")
            .select("user_id")
            .in("user_id", userIds);

        if (scanLogsError) {
            console.error("Error loading scan logs for counts:", scanLogsError);
        } else {
            (scanLogsData || []).forEach((row: { user_id: string }) => {
            const uid = row.user_id;
            countsByUserId[uid] = (countsByUserId[uid] || 0) + 1;
            });
        }
        }


      // 4) map profiles + counts into UI type
      const mapped: UiUser[] = rows.map((row) => ({
        id: row.id,
        name: row.name || row.email || "Unknown User",
        email: row.email || "—",
        joinDate: row.created_at ? row.created_at.slice(0, 10) : "—",
        scansCount: countsByUserId[row.id] ?? 0,
        lastUpdated: row.updated_at,
      }));

      setUsers(mapped);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  // --------- Actions ---------

  const handleEmail = (user: UiUser) => {
    if (!user.email || user.email === "—") return;
    const subject = "Regarding your Detectify account";
    const mailto = `mailto:${encodeURIComponent(
      user.email
    )}?subject=${encodeURIComponent(subject)}`;
    window.location.href = mailto;
  };

  const openDeleteDialog = (user: UiUser) => {
    setUserToDelete(user);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    setDeleting(true);

    const supabase = supabaseBrowser();
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userToDelete.id);

    setDeleting(false);

    if (error) {
      console.error("Failed to delete user:", error);
      alert("Failed to delete user. Check console for details.");
      return;
    }

    setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
    setUserToDelete(null);
  };

  const handleExportCsv = () => {
    if (users.length === 0) return;

    const header = [
      "ID",
      "Name",
      "Email",
      "Joined",
      "TotalScans",
      "LastUpdated",
    ];

    const rows = users.map((u) => [
      u.id,
      u.name,
      u.email,
      u.joinDate,
      u.scansCount.toString(),
      u.lastUpdated ?? "",
    ]);

    const csvLines = [
      header.join(","),
      ...rows.map((r) =>
        r
          .map((field) => {
            const s = field.replace(/"/g, '""');
            return `"${s}"`;
          })
          .join(",")
      ),
    ];

    const blob = new Blob([csvLines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "users.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            User Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            View registered users and scan history.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="bg-white dark:bg-white text-gray-900 dark:text-black border border-gray-200 dark:border-none px-4 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-200 transition-colors shadow-sm"
        >
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        <div className="bg-white dark:bg-[#111] p-4 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm">
          <h4 className="text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
            Total Users
          </h4>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {users.length}
          </p>
        </div>

        <div className="bg-white dark:bg-[#111] p-4 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm">
          <h4 className="text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
            Active Today
          </h4>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-500 mt-1">
            {activeToday}
          </p>
        </div>

        <div className="bg-white dark:bg-[#111] p-4 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm">
          <h4 className="text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
            New (Week)
          </h4>
          <p className="text-2xl font-bold text-green-600 dark:text-green-500 mt-1">
            {newThisWeek}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            Loading...
          </div>
        ) : errorMsg ? (
          <div className="p-6 text-center text-red-500">{errorMsg}</div>
        ) : users.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No users found.
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User Info
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Scans
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-white/5">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {user.joinDate}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-mono">
                    {user.scansCount}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        title="Email"
                        onClick={() => handleEmail(user)}
                      >
                        <Mail size={16} />
                      </button>

                      <button
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors"
                        title="Delete"
                        onClick={() => openDeleteDialog(user)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete confirmation modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#050505] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Delete user?
                </h3>
                <p className="text-xs text-gray-400">
                  This will permanently remove{" "}
                  <span className="font-medium">{userToDelete.name}</span> and
                  their profile from Detectify. Scan logs will remain for audit
                  purposes.
                </p>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg px-4 py-3 text-xs text-gray-300 mb-5">
              <p className="font-medium text-gray-100">User details</p>
              <p>{userToDelete.email}</p>
              <p className="text-gray-400">
                Joined {userToDelete.joinDate} • {userToDelete.scansCount} scans
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm rounded-lg border border-white/10 text-gray-200 hover:bg-white/5 transition-colors"
                onClick={() => setUserToDelete(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium disabled:opacity-60"
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete user"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
