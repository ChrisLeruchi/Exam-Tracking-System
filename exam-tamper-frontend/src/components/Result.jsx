import { Plus, Search, ArrowUpDown, Save, Filter, ChevronDown, CheckCircle, X, Download } from "lucide-react";
import { useState, useEffect } from "react";
import api from "../api/axios.js";

const gradeStyles = {
  A: "bg-success-50 text-success-600 border-success-200",
  B: "bg-accent-50 text-accent-600 border-accent-200",
  C: "bg-danger-50 text-danger-600 border-danger-200",
};

export function Results() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [results, setResults] = useState([]);
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const currentCourse = courses.find((c) => c.id === selectedCourseId) || courses[0] || null;
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newResultStudentId, setNewResultStudentId] = useState(null);
  const [newResultScore, setNewResultScore] = useState("");
  const [creatingResult, setCreatingResult] = useState(false);
  const [createError, setCreateError] = useState("");

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

  async function handlePublish() {
    if (!confirm("Are you sure? After publishing, any changes will be flagged.")) return

    try {
      await api.post(`/courses/${selectedCourseId}/publish`)
      await fetchResults()
      alert("Results published successfully!")
    } catch (err) {
      setError(err.response?.data?.error || "Failed to publish results")
    }
  }

  // Fetch courses on mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Fetch results and roster when course changes
  useEffect(() => {
    if (selectedCourseId) {
      fetchResults();
      fetchRoster();
    }
  }, [selectedCourseId]);

  async function fetchResults() {
    if (!selectedCourseId) return;
    try {
      setLoading(true);
      const res = await api.get(`/courses/${selectedCourseId}/results`);
      setResults(res.data.results);
      // Initialize pendingChanges with current scores
      const initial = {};
      res.data.results.forEach((r) => {
        initial[r.id] = r.currentScore;
      });
      setPendingChanges(initial);
    } catch (err) {
      setError("Failed to load results");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRoster() {
    if (!selectedCourseId) return;
    try {
      const res = await api.get(`/courses/${selectedCourseId}/roster`);
      setRoster(res.data.roster);
      setNewResultStudentId(res.data.roster[0]?.studentId || null);
    } catch (err) {
      console.error('Failed to load roster:', err);
    }
  }

  const computeGrade = (score) => {
    if (score === null || score === undefined || score === "") return null;
    if (score >= 70) return "A";
    if (score >= 60) return "B";
    if (score >= 50) return "C";
    if (score >= 45) return "D";
    return "F";
  };

  const handleScoreChange = (id, value) => {
    setPendingChanges((prev) => ({ ...prev, [id]: value === "" ? null : Number(value) }));
  };

  // Save all changed scores to the API
  async function handleSave() {
    setSaving(true);
    setError("");

    try {
      // Find all results where the score has changed
      const updates = results.filter(
        (r) => pendingChanges[r.id] !== r.currentScore
      );

      if (updates.length === 0) {
        alert("No changes to save.");
        return;
      }

      // Send all updates in parallel
      await Promise.all(
        updates.map((result) =>
          api.put(`/courses/${selectedCourseId}/results/${result.id}`, {
            score: pendingChanges[result.id],
          })
        )
      );

      // Refresh the results from the server
      await fetchResults();
      alert(`${updates.length} result(s) saved successfully!`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save results");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  function exportCSV() {
    if (results.length === 0) {
      alert("No results to export");
      return;
    }

    const headers = ["Matric No", "Full Name", "Score", "Grade", "Status"];
    const rows = results.map((r) => [
      r.student.matNo,
      r.student.fullName,
      r.currentScore ?? "",
      r.currentGrade ?? "",
      r.currentScore !== null && r.currentScore !== undefined ? "Entered" : "Pending",
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentCourse?.code || "results"}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleCreateResult() {
    setCreatingResult(true);
    setCreateError("");

    if (!newResultStudentId) {
      setCreateError('Select a student to create a result');
      setCreatingResult(false);
      return;
    }

    const scoreValue = newResultScore === '' ? null : Number(newResultScore);
    if (newResultScore !== '' && (isNaN(scoreValue) || scoreValue < 0 || scoreValue > 100)) {
      setCreateError('Score must be a number between 0 and 100');
      setCreatingResult(false);
      return;
    }

    try {
      await api.post(`/courses/${selectedCourseId}/results`, {
        studentId: newResultStudentId,
        score: scoreValue,
      });
      setShowCreateModal(false);
      setNewResultScore("");
      await fetchResults();
      await fetchRoster();
    } catch (err) {
      setCreateError(err.response?.data?.error || 'Failed to create result');
      console.error(err);
    } finally {
      setCreatingResult(false);
    }
  }

  const filtered = results.filter((r) => {
    const q = query.trim().toLowerCase();
    const matchesQuery =
      r.student.fullName.toLowerCase().includes(q) ||
      r.student.matNo.toLowerCase().includes(q);

    const score = pendingChanges[r.id];
    const grade = computeGrade(score);
    const isEntered = score !== null && score !== undefined && score !== "";
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "entered" && isEntered) ||
      (statusFilter === "not-entered" && !isEntered);

    const matchesGrade = gradeFilter === "all" || grade === gradeFilter;

    return matchesQuery && matchesStatus && matchesGrade;
  });

  const enteredCount = results.filter(
    (r) => r.currentScore !== null && r.currentScore !== undefined
  ).length;

  if (loading) {
    return (
      <section className="flex flex-6 w-full min-w-0 overflow-hidden">
        <div className="right flex-6 flex flex-col w-full min-w-0 overflow-hidden items-center justify-center">
          <p className="text-text-muted">Loading results...</p>
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
            <h2 className="font-semibold text-lg">Results</h2>
            <p className="text-xs text-text-muted">
              {currentCourse ? `${currentCourse.code}: ${currentCourse.title}` : "No course available"} &bull; {enteredCount} /{" "}
              {results.length} entered
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
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

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 bg-accent-200 text-sm font-medium px-3 py-1.5 rounded-md hover:bg-accent-400 transition-colors"
            >
              <Plus size={16} />  Add new result
            </button>

            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 border border-border text-sm font-medium px-3 py-1.5 rounded-md hover:bg-surface-muted transition-colors"
            >
              <Download size={16} /> Export
            </button>

            <button
              onClick={handlePublish}
              className="flex items-center gap-1.5 border border-border text-sm font-medium px-3 py-1.5 rounded-md hover:bg-surface-muted transition-colors"
            >
              <CheckCircle size={16} /> Publish results
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
                placeholder="Search by name or matric no."
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
                <option value="all">Entered + Not entered</option>
                <option value="entered">Entered</option>
                <option value="not-entered">Not entered</option>
              </select>
              <ChevronDown size={16} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>

            <div className="relative">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="appearance-none bg-surface-card border border-border rounded-md text-sm pl-9 pr-8 py-2 focus:outline-none focus:border-accent-200 transition-colors cursor-pointer"
              >
                <option value="all">All grades</option>
                <option value="A">Grade A</option>
                <option value="B">Grade B</option>
                <option value="C">Grade C</option>
                <option value="D">Grade D</option>
                <option value="F">Grade F</option>
              </select>
              <ChevronDown size={16} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 border border-border rounded-md text-sm px-3 py-2 hover:bg-surface-muted transition-colors disabled:opacity-50"
          >
            <Save size={16} /> {saving ? "Saving..." : "Save changes"}
          </button>
        </div>

        {error && <p className="text-danger-400 text-sm p-4">{error}</p>}

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-surface-card">
              <tr className="text-left text-text-secondary border-b border-border">
                <th className="p-3 font-medium w-12 text-center">#</th>
                <th className="p-3 font-medium">
                  <span className="flex items-center gap-1 cursor-pointer hover:text-text-primary">
                    Matric no <ArrowUpDown size={13} />
                  </span>
                </th>
                <th className="p-3 font-medium">
                  <span className="flex items-center gap-1 cursor-pointer hover:text-text-primary">
                    Name <ArrowUpDown size={13} />
                  </span>
                </th>
                <th className="p-3 font-medium text-right w-32">Score</th>
                <th className="p-3 font-medium text-center w-24">Grade</th>
                <th className="p-3 font-medium text-center w-32">Status</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((result, index) => {
                const score = pendingChanges[result.id];
                const grade = computeGrade(score);
                const isMissing = score === null || score === undefined || score === "";
                const hasChanged = score !== result.currentScore;

                return (
                  <tr
                    key={result.id}
                    className={`border-b border-border/50 hover:bg-surface-muted/40 transition-colors ${hasChanged ? "bg-accent-50/30" : ""}`}
                  >
                    <td className="p-3 text-center text-text-muted">{index + 1}</td>
                    <td className="p-3 text-xs text-text-secondary whitespace-nowrap">
                      {result.student.matNo}
                    </td>
                    <td className="p-3 whitespace-nowrap">{result.student.fullName}</td>
                    <td className="p-3 text-right">
                      <input
                        type="number"
                        value={score ?? ""}
                        onChange={(e) => handleScoreChange(result.id, e.target.value)}
                        placeholder="—"
                        className="w-20 bg-transparent border border-border rounded-md text-right px-2 py-1 focus:outline-none focus:border-accent-200 transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </td>
                    <td className="p-3 text-center">
                      {grade ? (
                        <span className={`inline-block min-w-8 px-2 py-0.5 rounded-md text-xs font-semibold border ${gradeStyles[grade] ?? "bg-surface-muted text-text-muted border-border"}`}>
                          {grade}
                        </span>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {isMissing ? (
                        <span className="inline-block px-2 py-0.5 rounded-md text-xs bg-danger-50 text-danger-600 border border-danger-200">
                          Pending
                        </span>
                      ) : hasChanged ? (
                        <span className="inline-block px-2 py-0.5 rounded-md text-xs bg-accent-50 text-accent-600 border border-accent-200">
                          Unsaved
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-md text-xs bg-success-50 text-success-600 border border-success-200">
                          Entered
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-muted text-sm">
                    {query.trim() ? `No students found for "${query}"` : "No students match the selected filters"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-surface-card rounded-xl shadow-lg overflow-hidden">
            <div className="flex items-center justify-between border-b border-border p-4">
              <div>
                <h3 className="text-lg font-semibold">Create new result</h3>
                <p className="text-xs text-text-muted">Select an enrolled student and enter the score.</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-text-muted hover:text-text-primary">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs text-text-muted mb-2">Student</label>
                <select
                  value={newResultStudentId || ""}
                  onChange={(e) => setNewResultStudentId(Number(e.target.value))}
                  className="w-full bg-surface-card border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-200"
                >
                  {roster.filter((item) => !item.result).length === 0 ? (
                    <option value="">No enrolled student available</option>
                  ) : (
                    roster
                      .filter((item) => !item.result)
                      .map((item) => (
                        <option key={item.studentId} value={item.studentId}>
                          {item.matNo} — {item.fullName}
                        </option>
                      ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs text-text-muted mb-2">Score (0–100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newResultScore}
                  onChange={(e) => setNewResultScore(e.target.value)}
                  className="w-full bg-surface-card border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-200"
                  placeholder="Leave empty if score is not yet entered"
                />
              </div>

              {createError && <p className="text-danger-400 text-sm">{createError}</p>}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-md border border-border px-4 py-2 text-sm hover:bg-surface-muted"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={creatingResult}
                  onClick={handleCreateResult}
                  className="rounded-md bg-accent-200 px-4 py-2 text-sm text-white hover:bg-accent-400 disabled:opacity-50"
                >
                  {creatingResult ? 'Creating...' : 'Create result'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
