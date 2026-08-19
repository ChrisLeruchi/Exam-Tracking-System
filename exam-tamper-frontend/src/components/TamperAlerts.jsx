import { useState, useEffect } from "react";
import {
  ShieldAlert,
  CheckCircle,
  X,
  Filter,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

function formatTimestamp(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${date} · ${time}`;
}

export function TamperAlerts() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resolvedFilter, setResolvedFilter] = useState("false");
  const [resolveModal, setResolveModal] = useState(null);
  const [resolution, setResolution] = useState("");
  const [resolving, setResolving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  async function fetchFlags() {
    try {
      setLoading(true);
      const params = {};
      if (resolvedFilter !== "all") params.resolved = resolvedFilter;

      const res = await api.get("/flags", { params });
      setFlags(res.data.flags);
      // Notify other parts of the app (side menu) about updated flag totals
      try {
        const total = res.data?.pagination?.total ?? res.data.flags?.length ?? 0
        window.dispatchEvent(new CustomEvent('flags-updated', { detail: { total } }))
      } catch (e) {
        // ignore
      }
    } catch (err) {
      setError("Failed to load tamper alerts");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFlags();
  }, [resolvedFilter]);

  async function handleResolve() {
    if (!resolution.trim()) return;
    setResolving(true);
    try {
      await api.patch(`/flags/${resolveModal.id}/resolve`, { resolution });
      setResolveModal(null);
      setResolution("");
      await fetchFlags();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to resolve flag");
    } finally {
      setResolving(false);
    }
  }

  if (loading && flags.length === 0) {
    return (
      <section className="flex flex-6 w-full min-w-0 overflow-hidden">
        <div className="right flex-6 flex flex-col w-full min-w-0 overflow-hidden items-center justify-center">
          <p className="text-text-muted">Loading tamper alerts...</p>
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
              <ShieldAlert size={18} className="text-danger-400" />
              <h2 className="font-semibold text-lg">Tamper Alerts</h2>
            </div>
            <p className="text-xs text-text-muted">
              Flagged modifications detected by the tamper detection engine
            </p>
          </div>

          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <select
              value={resolvedFilter}
              onChange={(e) => setResolvedFilter(e.target.value)}
              className="appearance-none bg-surface-card border border-border rounded-md text-sm pl-9 pr-8 py-2 focus:outline-none focus:border-accent-200 transition-colors cursor-pointer"
            >
              <option value="false">Unresolved</option>
              <option value="true">Resolved</option>
              <option value="all">All alerts</option>
            </select>
            <ChevronDown size={16} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          </div>
        </header>

        {/* Stats */}
        <div className="flex gap-2 p-4 border-b border-border">
          <div className="bg-danger-50 flex-1 p-2 rounded-sm flex flex-col gap-2">
            <span className="text-danger-400 text-sm flex items-center gap-1">
              <ShieldAlert size={14} /> Total alerts
            </span>
            <h2 className="font-bold text-xl text-danger-400">{flags.length}</h2>
          </div>
          <div className="bg-surface-card flex-1 p-2 rounded-sm flex flex-col gap-2">
            <span className="text-text-muted text-sm flex items-center gap-1">
              <CheckCircle size={14} /> Resolved
            </span>
            <h2 className="font-bold text-xl">{flags.filter(f => f.resolved).length}</h2>
          </div>
          <div className="bg-surface-card flex-1 p-2 rounded-sm flex flex-col gap-2">
            <span className="text-text-muted text-sm">Unresolved</span>
            <h2 className="font-bold text-xl">{flags.filter(f => !f.resolved).length}</h2>
          </div>
        </div>

        {error && <p className="text-danger-400 text-sm p-4">{error}</p>}

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-surface-card">
              <tr className="text-left text-text-secondary border-b border-border">
                <th className="p-3 font-medium whitespace-nowrap">Detected</th>
                <th className="p-3 font-medium">Student</th>
                <th className="p-3 font-medium text-center">Change</th>
                <th className="p-3 font-medium">Editor</th>
                <th className="p-3 font-medium">Reason</th>
                <th className="p-3 font-medium text-center">Status</th>
                {isAdmin && <th className="p-3 font-medium text-center">Action</th>}
              </tr>
            </thead>

            <tbody>
              {flags.map((flag) => (
                <tr
                  key={flag.id}
                  className={
                    flag.resolved
                      ? "border-b border-border/50 bg-success-50/20 hover:bg-success-50/40 transition-colors"
                      : "border-b border-border/50 bg-danger-50/30 hover:bg-danger-50/50 transition-colors"
                  }
                >
                  <td className="p-3 text-xs text-text-secondary whitespace-nowrap">
                    {formatTimestamp(flag.timestamp)}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="font-medium">{flag.studentName}</div>
                    <div className="text-xs text-text-muted">{flag.matNo}</div>
                  </td>
                  <td className="p-3 text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="text-text-muted">{flag.previousValue ?? "—"}</span>
                      <ArrowRight size={14} className="text-text-muted" />
                      <span className="font-semibold">{flag.newValue ?? "—"}</span>
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="text-sm">{flag.changedBy}</div>
                    <div className="text-xs text-text-muted capitalize">{flag.changedByRole?.toLowerCase()}</div>
                  </td>
                  <td className="p-3 text-xs text-text-muted">
                    {flag.flagReason ?? "—"}
                  </td>
                  <td className="p-3 text-center">
                    {flag.resolved ? (
                      <div className="flex flex-col items-center gap-1">
                        <span className="inline-block px-2 py-0.5 rounded-md text-xs bg-success-50 text-success-600 border border-success-200">
                          Resolved
                        </span>
                        <span className="text-xs text-text-muted">
                          by {flag.resolvedBy}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded-md text-xs bg-danger-50 text-danger-600 border border-danger-200">
                        Open
                      </span>
                    )}
                  </td>
                  {isAdmin && (
                    <td className="p-3 text-center">
                      {!flag.resolved && (
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => { setResolveModal(flag); setResolution(''); }}
                            className="text-xs border border-border rounded-md px-2 py-1 hover:bg-surface-muted transition-colors"
                          >
                            Resolve
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}

              {flags.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="p-8 text-center text-text-muted text-sm">
                    No tamper alerts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolve Modal */}
      {resolveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface-card rounded-lg p-6 w-[500px] max-w-[90vw]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Resolve Tamper Alert</h3>
              <button
                onClick={() => { setResolveModal(null); setResolution(""); }}
                className="text-text-muted hover:text-text-primary"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <div className="bg-surface-muted rounded-md p-3 text-sm">
                <p><span className="text-text-muted">Student:</span> {resolveModal.studentName} ({resolveModal.matNo})</p>
                <p><span className="text-text-muted">Change:</span> {resolveModal.previousValue} → {resolveModal.newValue}</p>
                <p><span className="text-text-muted">Editor:</span> {resolveModal.changedBy}</p>
                <p><span className="text-text-muted">Reason:</span> {resolveModal.flagReason}</p>
              </div>

              <div>
                <label className="text-sm text-text-muted mb-1 block">
                  Resolution explanation *
                </label>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Explain why this flag is acceptable (e.g., 'Authorized correction approved by HOD')"
                  className="w-full bg-surface-card border border-border rounded-md text-sm px-3 py-2 focus:outline-none focus:border-accent-200 min-h-[100px] resize-y"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setResolveModal(null); setResolution(""); }}
                className="border border-border rounded-md text-sm px-4 py-2 hover:bg-surface-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                disabled={!resolution.trim() || resolving || rejecting}
                className="bg-accent-200 text-white rounded-md text-sm px-4 py-2 hover:bg-accent-400 transition-colors disabled:opacity-50"
              >
                {resolving ? "Approving..." : "Approve"}
              </button>
              <button
                onClick={async () => {
                  if (!window.confirm('Reject this change and revert to the previous value?')) return;
                  setRejecting(true);
                  try {
                    await api.patch(`/flags/${resolveModal.id}/reject`, { resolution: resolution || 'rejected change' });
                    setResolveModal(null);
                    setResolution("");
                    await fetchFlags();
                  } catch (err) {
                    setError(err.response?.data?.error || 'Failed to reject flag');
                  } finally {
                    setRejecting(false);
                  }
                }}
                disabled={rejecting || resolving}
                className="border border-danger-200 text-danger-600 bg-white rounded-md text-sm px-4 py-2 hover:bg-danger-50 transition-colors disabled:opacity-50"
              >
                {rejecting ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}