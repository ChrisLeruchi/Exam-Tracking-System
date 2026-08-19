import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Save,
  X,
  GraduationCap,
  Edit2,
} from "lucide-react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

export function StudentManagement() {
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    matNo: "",
    fullName: "",
    department: "",
    level: "",
  });
  const [saving, setSaving] = useState(false);

  const { user } = useAuth();
  const canEdit = user?.role === "ADMIN" || user?.role === "EXAM_OFFICER";

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    try {
      setLoading(true);
      const res = await api.get("/students");
      setStudents(res.data.students);
    } catch (err) {
      setError("Failed to load students");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = students.filter((s) => {
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return (
      s.fullName.toLowerCase().includes(q) ||
      s.matNo.toLowerCase().includes(q)
    );
  });

  function openAddForm() {
    setEditingId(null);
    setFormData({ matNo: "", fullName: "", department: "", level: "" });
    setShowForm(true);
  }

  function openEditForm(student) {
    setEditingId(student.id);
    setFormData({
      matNo: student.matNo,
      fullName: student.fullName,
      department: student.department,
      level: student.level,
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setFormData({ matNo: "", fullName: "", department: "", level: "" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (editingId) {
        await api.put(`/students/${editingId}`, formData);
      } else {
        await api.post("/students", formData);
      }

      await fetchStudents();
      closeForm();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save student");
    } finally {
      setSaving(false);
    }
  }

  if (loading && students.length === 0) {
    return (
      <section className="flex flex-6 w-full min-w-0 overflow-hidden">
        <div className="right flex-6 flex flex-col w-full min-w-0 overflow-hidden items-center justify-center">
          <p className="text-text-muted">Loading students...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-6 w-full min-w-0 overflow-hidden">
      <div className="right flex-6 flex flex-col w-full min-w-0 overflow-hidden">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 border-b border-border p-4">
          <div className="leading-tight">
            <div className="flex items-center gap-2">
              <GraduationCap size={18} className="text-accent-200" />
              <h2 className="font-semibold text-lg">Student Management</h2>
            </div>
            <p className="text-xs text-text-muted">
              {students.length} students registered
            </p>
          </div>

          {canEdit && (
            <button
              onClick={openAddForm}
              className="flex items-center gap-1.5 bg-accent-200 text-sm font-medium px-3 py-1.5 rounded-md hover:bg-accent-400 transition-colors text-white"
            >
              <Plus size={16} /> Add Student
            </button>
          )}
        </header>

        <div className="p-4 border-b border-border">
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
        </div>

        {error && <p className="text-danger-400 text-sm p-4">{error}</p>}

        {showForm && (
          <div className="border-b border-border bg-surface-muted p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-sm">
                {editingId ? "Edit Student" : "Add New Student"}
              </h3>
              <button onClick={closeForm} className="text-text-muted hover:text-text-primary">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="text-xs text-text-muted mb-1">Matric Number</label>
                <input
                  type="text"
                  value={formData.matNo}
                  onChange={(e) => setFormData({ ...formData, matNo: e.target.value })}
                  disabled={editingId !== null}
                  className="bg-surface-card border border-border rounded-md text-sm px-3 py-2 focus:outline-none focus:border-accent-200 disabled:opacity-50"
                  placeholder="e.g. De.2021/0001"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-text-muted mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="bg-surface-card border border-border rounded-md text-sm px-3 py-2 focus:outline-none focus:border-accent-200"
                  placeholder="e.g. John Doe"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-text-muted mb-1">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="bg-surface-card border border-border rounded-md text-sm px-3 py-2 focus:outline-none focus:border-accent-200"
                  placeholder="e.g. Computer Engineering"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-text-muted mb-1">Level</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="bg-surface-card border border-border rounded-md text-sm px-3 py-2 focus:outline-none focus:border-accent-200"
                >
                  <option value="100">100 Level</option>
                  <option value="200">200 Level</option>
                  <option value="300">300 Level</option>
                  <option value="400">400 Level</option>
                  <option value="500">500 Level</option>
                </select>
              </div>

              <div className="col-span-2 flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="border border-border rounded-md text-sm px-3 py-1.5 hover:bg-surface-card transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 bg-accent-200 text-white rounded-md text-sm px-3 py-1.5 hover:bg-accent-400 transition-colors disabled:opacity-50"
                >
                  <Save size={16} /> {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-surface-card">
              <tr className="text-left text-text-secondary border-b border-border">
                <th className="p-3 font-medium w-12 text-center">#</th>
                <th className="p-3 font-medium">Matric No</th>
                <th className="p-3 font-medium">Full Name</th>
                <th className="p-3 font-medium">Department</th>
                <th className="p-3 font-medium text-center w-20">Level</th>
                <th className="p-3 font-medium text-center w-24">Results</th>
                {canEdit && <th className="p-3 font-medium text-center w-20">Actions</th>}
              </tr>
            </thead>

            <tbody>
              {filtered.map((student, index) => (
                <tr
                  key={student.id}
                  className="border-b border-border/50 hover:bg-surface-muted/40 transition-colors"
                >
                  <td className="p-3 text-center text-text-muted">{index + 1}</td>
                  <td className="p-3 text-xs text-text-secondary whitespace-nowrap">
                    {student.matNo}
                  </td>
                  <td className="p-3 whitespace-nowrap font-medium">
                    {student.fullName}
                  </td>
                  <td className="p-3 text-text-secondary">{student.department}</td>
                  <td className="p-3 text-center text-text-secondary">
                    {student.level}
                  </td>
                  <td className="p-3 text-center">
                    <span className="inline-block px-2 py-0.5 rounded-md text-xs bg-surface-muted text-text-secondary">
                      {student.resultsCount}
                    </span>
                  </td>
                  {canEdit && (
                    <td className="p-3 text-center">
                      <button
                        onClick={() => openEditForm(student)}
                        className="text-text-muted hover:text-accent-200 transition-colors"
                        title="Edit student"
                      >
                        <Edit2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={canEdit ? 7 : 6} className="p-8 text-center text-text-muted text-sm">
                    {query ? `No students found for "${query}"` : "No students registered yet"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}