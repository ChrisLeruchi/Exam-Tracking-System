import { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  FileText,
  TrendingUp,
  LockKeyhole,
} from "lucide-react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

export function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const { user } = useAuth();
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

  async function fetchStats() {
    if (!selectedCourseId) return;
    try {
      setLoading(true);
      setError("");

      // NOTE: /audit/logs is an ADMIN-only endpoint. Calling it for
      // LECTURER/EXAM_OFFICER roles returns 403, which previously broke the
      // whole dashboard (the failed Promise.all rejected). So only admins
      // fetch the audit feed; other roles get their activity from change log.
      const requests = [
        api.get(`/courses/${selectedCourseId}/results`),
        api.get(`/courses/${selectedCourseId}/changes`),
        api.get(`/flags`, { params: { resolved: 'false', courseId: selectedCourseId } }),
        user.role === 'ADMIN'
          ? api.get(`/audit/logs`)
          : Promise.resolve({ data: { logs: [] } }),
      ];

      // allSettled keeps the dashboard usable if one optional feed fails,
      // while still surfacing a real error when the core data can't load.
      const settled = await Promise.allSettled(requests);

      // The results feed is the core dashboard data — fail loudly if it errors.
      if (settled[0].status === 'rejected') {
        throw settled[0].reason;
      }

      const results = settled[0].value.data.results;
      const changesData = settled[1].status === 'fulfilled'
        ? settled[1].value.data
        : { changes: [], pagination: { total: 0 } };
      const flagsData = settled[2].status === 'fulfilled'
        ? settled[2].value.data
        : { pagination: { total: 0 } };
      const auditLogs = settled[3].status === 'fulfilled'
        ? settled[3].value.data.logs
        : [];

      const recentChanges = changesData.changes || [];
      const totalChanges = changesData.pagination?.total ?? 0;
      const flaggedChanges = flagsData.pagination?.total ?? 0;

      const activities = [];

      // Map audit logs to activities
      for (const a of auditLogs.slice(0, 20)) {
        activities.push({
          id: `audit-${a.id}`,
          type: 'audit',
          verb: a.action,
          user: a.user?.fullName || a.user?.username || 'System',
          details: a.details || null,
          timestamp: a.timestamp,
        })
      }

      // Map recent changes.
      // A change is only ever "flagged" (danger) while it is flagged AND
      // still unresolved. Once resolved — or if it was never flagged — it
      // should be treated as resolved, never as a tamper/danger state.
      for (const c of recentChanges) {
        const isActiveFlag = c.flagged && !c.resolved
        activities.push({
          id: `change-${c.id}`,
          type: 'change',
          verb: isActiveFlag ? 'flagged' : (c.resolved ? 'resolved' : 'changed'),
          isActiveFlag,
          user: c.changedBy,
          details: `${c.previousValue ?? '—'} → ${c.newValue ?? '—'} (${c.studentName})`,
          timestamp: c.timestamp,
        })
      }

      // Sort and take top 5
      activities.sort((a,b)=> new Date(b.timestamp) - new Date(a.timestamp))

      setStats({
        totalStudents: results.length,
        enteredResults: results.filter((r) => r.currentScore !== null).length,
        totalChanges,
        flaggedChanges,
        recentActivities: activities.slice(0,5),
      })
    } catch (err) {
      console.error("Failed to fetch stats:", err);
      setError("Failed to load dashboard data. Is the server running?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) fetchStats();
  }, [selectedCourseId]);

  if (loading) {
    return (
      <section className="flex flex-6 w-full min-w-0 overflow-hidden">
        <div className="right flex-6 flex flex-col w-full min-w-0 overflow-hidden items-center justify-center">
          <p className="text-text-muted">Loading dashboard...</p>
        </div>
      </section>
    );
  }

  if (error || !stats) {
    return (
      <section className="flex flex-6 w-full min-w-0 overflow-hidden">
        <div className="right flex-6 flex flex-col w-full min-w-0 overflow-hidden items-center justify-center">
          <p className="text-danger-400 px-4 text-center">{error || "No data available"}</p>
        </div>
      </section>
    );
  }

  const cards = [

    {
      label: "Total Students",
      value: stats.totalStudents,
      icon: <Users size={20} />,
      color: "text-accent-200",
      bg: "bg-accent-50",
    },
    {
      label: "Results Entered",
      value: `${stats.enteredResults} / ${stats.totalStudents}`,
      icon: <FileText size={20} />,
      color: "text-success-400",
      bg: "bg-success-50",
    },
    {
      label: "Total Changes",
      value: stats.totalChanges,
      icon: <TrendingUp size={20} />,
      color: "text-text-secondary",
      bg: "bg-surface-muted",
    },
    {
      label: "Flagged Changes",
      value: stats.flaggedChanges,
      icon: <ShieldAlert size={20} />,
      color: "text-danger-400",
      bg: "bg-danger-50",
    },
  ];

  return (
    <section className="flex flex-6 w-full min-w-0 overflow-hidden">
      <div className="right flex-6 flex flex-col w-full min-w-0 overflow-y-auto md:overflow-hidden">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 border-b border-border p-4">
          <div className="leading-tight min-w-0">
            <h2 className="font-semibold text-lg">Dashboard</h2>
            <p className="text-xs text-text-muted truncate">
              Welcome back, {user?.fullName} •{" "}
              <span className="capitalize">{user?.role.toLowerCase()}</span>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-text-muted min-w-0">
            <div className="min-w-0 truncate">
              {currentCourse ? `${currentCourse.code} • ${currentCourse.title}` : 'No course available'}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ShieldCheck size={16} className="text-success-400" />
              <span>System integrity: Verified</span>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-4">
          {cards.map((card, i) => (
            <div
              key={i}
              className="bg-surface-card border border-border rounded-lg p-3 sm:p-4 flex flex-col gap-3"
            >
              <div className={`flex items-center justify-center w-10 h-10 rounded-md ${card.bg} ${card.color}`}>
                {card.icon}
              </div>
              <div>
                <p className="text-xs text-text-muted">{card.label}</p>
                <p className="text-xl sm:text-2xl font-bold">{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="min-h-0 overflow-auto p-4 md:flex-1">
          <div className="bg-surface-card border border-border rounded-lg">
            <div className="flex items-center gap-2 p-4 border-b border-border">
              <LockKeyhole size={16} className="text-danger-400" />
              <h3 className="font-medium text-sm">Recent Activity</h3>
            </div>
            <div className="divide-y divide-border">
              {(!stats.recentActivities || stats.recentActivities.length === 0) ? (
                <p className="p-4 text-sm text-text-muted text-center">No recent activity</p>
              ) : (
                stats.recentActivities.map((act) => (
                  <div key={act.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 hover:bg-surface-muted/40 transition-colors">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${act.isActiveFlag ? 'bg-danger-400' : 'bg-success-400'}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{act.user}</p>
                        <p className="text-xs text-text-muted truncate">{act.verb} — {act.details}</p>
                      </div>
                    </div>
                    <div className="flex items-center shrink-0 pl-5 sm:pl-0">
                      <span className="text-xs text-text-muted">{new Date(act.timestamp).toLocaleDateString('en-GB', {day:'2-digit', month:'short'})}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
