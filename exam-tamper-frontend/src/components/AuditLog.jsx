import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  ScrollText,
  Download,
  ShieldCheck,
} from "lucide-react";
import api from "../api/axios.js";

function formatTimestamp(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${date} · ${time}`;
}

const actionColors = {
  login: "bg-success-50 text-success-600 border-success-200",
  login_failed: "bg-danger-50 text-danger-600 border-danger-200",
  create: "bg-accent-50 text-accent-600 border-accent-200",
  update: "bg-accent-50 text-accent-600 border-accent-200",
  publish: "bg-success-50 text-success-600 border-success-200",
  flag_resolve: "bg-surface-muted text-text-secondary border-border",
  deactivate: "bg-danger-50 text-danger-600 border-danger-200",
  activate: "bg-success-50 text-success-600 border-success-200",
  password_reset: "bg-danger-50 text-danger-600 border-danger-200",
};

export function AuditLog() {
  const [query, setQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  async function fetchLogs() {
    try {
      setLoading(true);
      const params = { page };
      if (actionFilter !== "all") params.action = actionFilter;
      if (entityFilter !== "all") params.entityType = entityFilter;

      const res = await api.get("/audit/logs", { params });
      setLogs(res.data.logs);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      setError("Failed to load audit logs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, entityFilter]);

  async function handleVerify() {
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await api.get("/audit/verify");
      setVerifyResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to verify integrity");
    } finally {
      setVerifying(false);
    }
  }

  async function exportCSV() {
    try {
      // Fetch ALL audit logs (not just the current page) for a complete export
      const params = {};
      if (actionFilter !== "all") params.action = actionFilter;
      if (entityFilter !== "all") params.entityType = entityFilter;

      const res = await api.get("/audit/logs", { params: { ...params, page: 1, limit: 10000 } });
      const allLogs = res.data.logs || [];

      const headers = ["Timestamp", "User", "Role", "Action", "Entity", "Entity ID", "IP Address"];
      const rows = allLogs.map((l) => [
        new Date(l.timestamp).toLocaleString(),
        l.user?.fullName || "—",
        l.user?.role || "—",
        l.action,
        l.entityType,
        l.entityId,
        l.ipAddress || "—",
      ]);

      const csv = [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to export audit logs");
      console.error(err);
    }
  }

  const filtered = logs.filter((l) => {
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return (
      l.user?.fullName?.toLowerCase().includes(q) ||
      l.user?.username?.toLowerCase().includes(q) ||
      l.action?.toLowerCase().includes(q) ||
      l.entityType?.toLowerCase().includes(q)
    );
  });

  if (loading && logs.length === 0) {
    return (
      <section className="flex flex-6 w-full min-w-0 overflow-hidden">
        <div className="right flex-6 flex flex-col w-full min-w-0 overflow-hidden items-center justify-center">
          <p className="text-text-muted">Loading audit logs...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-6 w-full min-w-0 overflow-hidden">
      <div className="right flex-6 flex flex-col w-full min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 border-b border-border p-4">
          <div className="leading-tight">
            <div className="flex items-center gap-2">
              <ScrollText size={18} className="text-accent-200" />
              <h2 className="font-semibold text-lg">Audit Log</h2>
            </div>
            <p className="text-xs text-text-muted">
              Permanent system activity log — entries cannot be edited or removed
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="flex items-center gap-1.5 border border-border rounded-md text-sm px-3 py-2 hover:bg-surface-muted transition-colors disabled:opacity-50"
            >
              <ShieldCheck size={16} /> {verifying ? "Verifying..." : "Verify Integrity"}
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 border border-border rounded-md text-sm px-3 py-2 hover:bg-surface-muted transition-colors"
            >
              <Download size={16} /> Export
            </button>
          </div>
        </header>

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 p-4 border-b border-border">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full">
            <div className="relative w-full max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by user, action, or entity"
                className="w-full bg-surface-card border border-border rounded-md text-sm pl-9 pr-3 py-2 placeholder:text-text-muted focus:outline-none focus:border-accent-200 transition-colors"
              />
            </div>

            <div className="relative">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <select
                value={actionFilter}
                onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                className="appearance-none bg-surface-card border border-border rounded-md text-sm pl-9 pr-8 py-2 focus:outline-none focus:border-accent-200 transition-colors cursor-pointer"
              >
                <option value="all">All actions</option>
                <option value="login">Login</option>
                <option value="login_failed">Failed login</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="publish">Publish</option>
                <option value="flag_resolve">Flag resolve</option>
                <option value="deactivate">Deactivate</option>
                <option value="activate">Activate</option>
                <option value="password_reset">Password reset</option>
              </select>
              <ChevronDown size={16} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>

            <div className="relative">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <select
                value={entityFilter}
                onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
                className="appearance-none bg-surface-card border border-border rounded-md text-sm pl-9 pr-8 py-2 focus:outline-none focus:border-accent-200 transition-colors cursor-pointer"
              >
                <option value="all">All entities</option>
                <option value="result">Result</option>
                <option value="user">User</option>
                <option value="course">Course</option>
                <option value="student">Student</option>
                <option value="publication">Publication</option>
                <option value="flag">Flag</option>
              </select>
              <ChevronDown size={16} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>
          </div>
        </div>

        {error && <p className="text-danger-400 text-sm p-4">{error}</p>}

        {verifyResult && (
          <div className={`p-4 border-b border-border ${verifyResult.verified ? "bg-success-50" : "bg-danger-50"}`}>
            <p className={`text-sm font-medium ${verifyResult.verified ? "text-success-600" : "text-danger-600"}`}>
              {verifyResult.verified ? "✅ Hash chain intact — no tampering detected" : `⚠️ ${verifyResult.breaks?.length || 0} hash break(s) detected — possible tampering!`}
            </p>
            <p className="text-xs text-text-muted mt-1">
              {verifyResult.totalVersions} version(s) checked in the hash chain
            </p>
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-surface-card">
              <tr className="text-left text-text-secondary border-b border-border">
                <th className="p-3 font-medium whitespace-nowrap">Timestamp</th>
                <th className="p-3 font-medium">User</th>
                <th className="p-3 font-medium">Action</th>
                <th className="p-3 font-medium">Entity</th>
                <th className="p-3 font-medium">Details</th>
                <th className="p-3 font-medium">IP Address</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-border/50 hover:bg-surface-muted/40 transition-colors"
                >
                  <td className="p-3 text-xs text-text-secondary whitespace-nowrap">
                    {formatTimestamp(log.timestamp)}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="font-medium">{log.user?.fullName || "Unknown"}</div>
                    <div className="text-xs text-text-muted capitalize">
                      {log.user?.role?.toLowerCase() || "—"}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium border ${actionColors[log.action] || "bg-surface-muted text-text-muted border-border"}`}>
                      {log.action.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-text-secondary whitespace-nowrap">
                    {log.entityType} #{log.entityId}
                  </td>
                  <td className="p-3 text-xs text-text-muted max-w-xs truncate">
                    {log.newValue ? JSON.stringify(log.newValue) : "—"}
                  </td>
                  <td className="p-3 text-xs text-text-muted whitespace-nowrap">
                    {log.ipAddress || "—"}
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-muted text-sm">
                    {query.trim() ? `No entries found for "${query}"` : "No audit log entries"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 border-t border-border">
            <p className="text-xs text-text-muted">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="border border-border rounded-md text-sm px-3 py-1.5 hover:bg-surface-muted transition-colors disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="border border-border rounded-md text-sm px-3 py-1.5 hover:bg-surface-muted transition-colors disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}