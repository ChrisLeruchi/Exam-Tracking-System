import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  ArrowRight,
  ShieldAlert,
  LockKeyhole,
} from "lucide-react";
import api from "../api/axios.js";

function formatTimestamp(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${date} · ${time}`;
}

export function ChangeHistory() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [changes, setChanges] = useState([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [flaggedTotal, setFlaggedTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const currentCourse = courses.find((c) => c.id === selectedCourseId) || courses[0] || null;

  async function fetchCourses() {
    try {
      const res = await api.get("/courses");
      const courseList = res.data.courses;
      setCourses(courseList);
      if (courseList.length > 0 && !selectedCourseId) {
        setSelectedCourseId(courseList[0].id);
      }
      if (courseList.length === 0) {
        setLoading(false);
      }
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      setLoading(false);
    }
  }

  async function fetchChanges() {
    if (!selectedCourseId) return;
    try {
      setLoading(true);
      const res = await api.get(`/courses/${selectedCourseId}/changes`);
      setChanges(res.data.changes || []);
      setTotalEntries(res.data.pagination?.total || 0);
      // fetch active flagged count for this course
      const flagsRes = await api.get('/flags', { params: { resolved: 'false', courseId: selectedCourseId } });
      setFlaggedTotal(flagsRes.data.pagination?.total || 0);
    } catch (err) {
      setError("Failed to load change history");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) fetchChanges();
  }, [selectedCourseId]);

  const filtered = [...changes]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .filter((h) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        h.studentName.toLowerCase().includes(q) ||
        h.matNo.toLowerCase().includes(q) ||
        h.changedBy.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "flagged" && h.flagged && !h.resolved) ||
        (statusFilter === "resolved" && (h.resolved || !h.flagged));

      const matchesRole =
        roleFilter === "all" ||
        (roleFilter === "unknown" && !h.changedByRole) ||
        h.changedByRole === roleFilter;

      return matchesQuery && matchesStatus && matchesRole;
    });

  const flaggedCount = flaggedTotal || changes.filter((h) => h.flagged).length;
  const editors = new Set(changes.map((h) => h.changedBy)).size;

  if (loading) {
    return (
      <section className="flex flex-6 w-full min-w-0 overflow-hidden">
        <div className="right flex-6 flex flex-col w-full min-w-0 overflow-hidden items-center justify-center">
          <p className="text-text-muted">Loading change history...</p>
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
              <LockKeyhole size={18} className="text-danger-400" />
              <h2 className="font-semibold text-lg">Change history</h2>
            </div>
            <p className="text-xs text-text-muted">
              {currentCourse ? `${currentCourse.code}: ${currentCourse.title}` : "No course available"} &bull; Permanent audit
              log — entries cannot be edited or removed
            </p>
          </div>

          <div className="flex items-center gap-2">
            {courses.length > 1 && (
              <select
                value={selectedCourseId || ""}
                onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                className="bg-surface-card border border-border rounded-md text-sm px-3 py-1.5 focus:outline-none focus:border-accent-200 transition-colors cursor-pointer"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.title}
                  </option>
                ))}
              </select>
            )}
          </div>
        </header>

        {/* Stats */}
        <div className="flex gap-2 p-4 border-b border-border">
          <div className="bg-surface-card flex-1 p-2 rounded-sm flex flex-col gap-2">
            <span className="text-text-muted text-sm">Total entries</span>
            <h2 className="font-bold text-xl">{totalEntries}</h2>
          </div>
          <div className="bg-danger-50 flex-1 p-2 rounded-sm flex flex-col gap-2">
            <span className="text-danger-400 text-sm flex items-center gap-1">
              <ShieldAlert size={14} /> Flagged
            </span>
            <h2 className="font-bold text-xl text-danger-400">{flaggedCount}</h2>
          </div>
          <div className="bg-surface-card flex-1 p-2 rounded-sm flex flex-col gap-2">
            <span className="text-text-muted text-sm">Unique editors</span>
            <h2 className="font-bold text-xl">{editors}</h2>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 p-4 border-b border-border">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full">
            <div className="relative w-full max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, matric no., or editor"
                className="w-full bg-surface-card border border-border rounded-md text-sm pl-9 pr-3 py-2 placeholder:text-text-muted focus:outline-none focus:border-accent-200 transition-colors"
              />
            </div>

            <div className="relative">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-surface-card border border-border rounded-md text-sm pl-9 pr-8 py-2 focus:outline-none focus:border-accent-200 transition-colors cursor-pointer"
              >
                <option value="all">All statuses</option>
                <option value="flagged">Flagged only</option>
                <option value="resolved">Resolved / Approved</option>
              </select>
              <ChevronDown size={16} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>

            <div className="relative">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="appearance-none bg-surface-card border border-border rounded-md text-sm pl-9 pr-8 py-2 focus:outline-none focus:border-accent-200 transition-colors cursor-pointer"
              >
                <option value="all">All roles</option>
                <option value="admin">Admin</option>
                <option value="lecturer">Lecturer</option>
                <option value="exam_officer">Exam Officer</option>
                <option value="unknown">Unknown</option>
              </select>
              <ChevronDown size={16} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>
          </div>
        </div>

        {error && <p className="text-danger-400 text-sm p-4">{error}</p>}

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-surface-card">
              <tr className="text-left text-text-secondary border-b border-border">
                <th className="p-3 font-medium whitespace-nowrap">Date & time</th>
                <th className="p-3 font-medium">Student</th>
                <th className="p-3 font-medium text-center">Change</th>
                <th className="p-3 font-medium">Editor</th>
                <th className="p-3 font-medium text-center">Status</th>
                <th className="p-3 font-medium">Reason</th>
              </tr>
            </thead>

            <tbody className="cursor-pointer">
              {filtered.map((h) => (
                <tr
                  key={h.id}
                  className={
                    h.flagged && !h.resolved
                      ? "border-b border-border/50 bg-danger-50/30 hover:bg-danger-200/40 transition-colors"
                      : "border-b border-border/50 hover:bg-surface-muted/40 transition-colors"
                  }
                >
                  <td className="p-3 text-xs text-text-secondary whitespace-nowrap">{formatTimestamp(h.timestamp)}</td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="font-medium">{h.studentName}</div>
                    <div className="text-xs text-text-muted">{h.matNo}</div>
                  </td>
                  <td className="p-3 text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="text-text-muted">{h.previousValue ?? "—"}</span>
                      <ArrowRight size={14} className="text-text-muted" />
                      <span className="font-semibold">{h.newValue ?? "—"}</span>
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs">{h.changedBy}</span>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    {h.flagged && !h.resolved ? (
                      <span className="inline-block px-2 py-0.5 rounded-md text-xs bg-danger-50 text-danger-600 border border-danger-200">Flagged</span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded-md text-xs bg-success-50 text-success-600 border border-success-200">Resolved</span>
                    )}
                  </td>
                  <td className="p-3 text-xs text-text-muted">{h.flagReason ?? "—"}</td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-muted text-sm">{query.trim() ? `No entries found for "${query}"` : "No entries match the selected filters"}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
