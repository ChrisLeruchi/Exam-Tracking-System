import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  X,
  Key,
  UserCheck,
  UserX,
  Shield,
} from "lucide-react";
import api from "../api/axios.js";

function formatDate(iso) {
  if (!iso) return "Never";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const roleColors = {
  ADMIN: "bg-accent-50 text-accent-600 border-accent-200",
  LECTURER: "bg-success-50 text-success-600 border-success-200",
  EXAM_OFFICER: "bg-surface-muted text-text-secondary border-border",
};

export function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [resetModal, setResetModal] = useState(null);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    fullName: "",
    role: "LECTURER",
    email: "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  async function fetchUsers() {
    try {
      setLoading(true);
      const params = {};
      if (roleFilter !== "all") params.role = roleFilter;

      const res = await api.get("/users", { params });
      setUsers(res.data.users);
    } catch (err) {
      setError("Failed to load users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  async function handleCreateUser() {
    if (!newUser.username || !newUser.password || !newUser.fullName) {
      setError("All required fields must be filled");
      return;
    }
    setActionLoading(true);
    try {
      await api.post("/users", newUser);
      setShowCreateModal(false);
      setNewUser({ username: "", password: "", fullName: "", role: "LECTURER", email: "" });
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create user");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleToggleActive(user) {
    const action = user.isActive ? "deactivate" : "activate";
    try {
      await api.patch(`/users/${user.id}/${action}`);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${action} user`);
    }
  }

  async function handleResetPassword() {
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setActionLoading(true);
    try {
      await api.patch(`/users/${resetModal.id}/reset-password`, { newPassword });
      setResetModal(null);
      setNewPassword("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading && users.length === 0) {
    return (
      <section className="flex flex-6 w-full min-w-0 overflow-hidden">
        <div className="right flex-6 flex flex-col w-full min-w-0 overflow-hidden items-center justify-center">
          <p className="text-text-muted">Loading users...</p>
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
              <Shield size={18} className="text-accent-200" />
              <h2 className="font-semibold text-lg">Administrator</h2>
            </div>
            <p className="text-xs text-text-muted">
              User management and system administration
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 bg-accent-200 text-white rounded-md text-sm px-3 py-2 hover:bg-accent-400 transition-colors"
          >
            <UserPlus size={16} /> Add user
          </button>
        </header>

        {/* Filter */}
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-text-muted" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="appearance-none bg-surface-card border border-border rounded-md text-sm px-3 pr-8 py-2 focus:outline-none focus:border-accent-200 transition-colors cursor-pointer"
            >
              <option value="all">All roles</option>
              <option value="ADMIN">Admin</option>
              <option value="LECTURER">Lecturer</option>
              <option value="EXAM_OFFICER">Exam officer</option>
            </select>
          </div>
        </div>

        {error && <p className="text-danger-400 text-sm p-4">{error}</p>}

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-surface-card">
              <tr className="text-left text-text-secondary border-b border-border">
                <th className="p-3 font-medium">User</th>
                <th className="p-3 font-medium">Role</th>
                <th className="p-3 font-medium text-center">Status</th>
                <th className="p-3 font-medium whitespace-nowrap">Last login</th>
                <th className="p-3 font-medium text-center">Results</th>
                <th className="p-3 font-medium text-center">Changes</th>
                <th className="p-3 font-medium text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-border/50 hover:bg-surface-muted/40 transition-colors"
                >
                  <td className="p-3 whitespace-nowrap">
                    <div className="font-medium">{u.fullName}</div>
                    <div className="text-xs text-text-muted">@{u.username}</div>
                    {u.email && <div className="text-xs text-text-muted">{u.email}</div>}
                  </td>
                  <td className="p-3">
                    <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium border ${roleColors[u.role] || "bg-surface-muted text-text-muted border-border"}`}>
                      {u.role.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {u.isActive ? (
                      <span className="inline-block px-2 py-0.5 rounded-md text-xs bg-success-50 text-success-600 border border-success-200">
                        Active
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded-md text-xs bg-danger-50 text-danger-600 border border-danger-200">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-xs text-text-secondary whitespace-nowrap">
                    {formatDate(u.lastLogin)}
                  </td>
                  <td className="p-3 text-center text-sm">{u.resultsCreated}</td>
                  <td className="p-3 text-center text-sm">{u.changesMade}</td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => setResetModal(u)}
                        title="Reset password"
                        className="p-1.5 rounded-md hover:bg-surface-muted transition-colors"
                      >
                        <Key size={14} className="text-text-muted" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(u)}
                        title={u.isActive ? "Deactivate" : "Activate"}
                        className="p-1.5 rounded-md hover:bg-surface-muted transition-colors"
                      >
                        {u.isActive ? (
                          <UserX size={14} className="text-danger-400" />
                        ) : (
                          <UserCheck size={14} className="text-success-600" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-text-muted text-sm">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface-card rounded-lg p-6 w-[500px] max-w-[90vw]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Create New User</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-text-muted hover:text-text-primary"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm text-text-muted mb-1 block">Full name *</label>
                <input
                  type="text"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  className="w-full bg-surface-card border border-border rounded-md text-sm px-3 py-2 focus:outline-none focus:border-accent-200"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="text-sm text-text-muted mb-1 block">Username *</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full bg-surface-card border border-border rounded-md text-sm px-3 py-2 focus:outline-none focus:border-accent-200"
                  placeholder="jdoe"
                />
              </div>

              <div>
                <label className="text-sm text-text-muted mb-1 block">Password *</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full bg-surface-card border border-border rounded-md text-sm px-3 py-2 focus:outline-none focus:border-accent-200"
                  placeholder="At least 6 characters"
                />
              </div>

              <div>
                <label className="text-sm text-text-muted mb-1 block">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full bg-surface-card border border-border rounded-md text-sm px-3 py-2 focus:outline-none focus:border-accent-200"
                  placeholder="jdoe@institution.edu"
                />
              </div>

              <div>
                <label className="text-sm text-text-muted mb-1 block">Role *</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full bg-surface-card border border-border rounded-md text-sm px-3 py-2 focus:outline-none focus:border-accent-200 cursor-pointer"
                >
                  <option value="LECTURER">Lecturer</option>
                  <option value="EXAM_OFFICER">Exam Officer</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="border border-border rounded-md text-sm px-4 py-2 hover:bg-surface-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                disabled={actionLoading}
                className="bg-accent-200 text-white rounded-md text-sm px-4 py-2 hover:bg-accent-400 transition-colors disabled:opacity-50"
              >
                {actionLoading ? "Creating..." : "Create user"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface-card rounded-lg p-6 w-[400px] max-w-[90vw]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Reset Password</h3>
              <button
                onClick={() => { setResetModal(null); setNewPassword(""); }}
                className="text-text-muted hover:text-text-primary"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-text-muted mb-3">
              Reset password for <span className="font-medium text-text-primary">{resetModal.fullName}</span> (@{resetModal.username})
            </p>

            <div>
              <label className="text-sm text-text-muted mb-1 block">New password *</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-surface-card border border-border rounded-md text-sm px-3 py-2 focus:outline-none focus:border-accent-200"
                placeholder="At least 6 characters"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => { setResetModal(null); setNewPassword(""); }}
                className="border border-border rounded-md text-sm px-4 py-2 hover:bg-surface-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                disabled={!newPassword || newPassword.length < 6 || actionLoading}
                className="bg-accent-200 text-white rounded-md text-sm px-4 py-2 hover:bg-accent-400 transition-colors disabled:opacity-50"
              >
                {actionLoading ? "Resetting..." : "Reset password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}