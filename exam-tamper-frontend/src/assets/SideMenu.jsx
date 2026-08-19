
import { useState, useEffect } from "react"
import { LogOut, ShieldCheck, KeyRound, X, Menu } from "lucide-react"

import { useAuth } from "../context/AuthContext.jsx"
import { useNavigate, NavLink } from "react-router-dom"
import api from "../api/axios.js"

export function SideMenu({ navigators }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    // Close the drawer with the Escape key.
    function onKeyDown(e) {
      if (e.key === "Escape") setMenuOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    if (menuOpen) {
      const prevOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => { document.body.style.overflow = prevOverflow }
    }
  }, [menuOpen])

  function handleLogout() {
    logout()
    navigate("/")
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      return
    }

    setSaving(true)
    try {
      await api.patch("/auth/change-password", { currentPassword, newPassword })
      setSuccess("Password changed successfully!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setTimeout(() => {
        setShowPasswordForm(false)
        setSuccess("")
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.error || "Failed to change password")
    } finally {
      setSaving(false)
    }
  }

  function renderLinks(onNavigate) {
    return (
      <div className="flex flex-col">
        {navigators.map((navigator) => (
          <NavLink
            to={navigator.path}
            key={navigator.id}
            onClick={onNavigate}
            className={({ isActive }) =>
              isActive
                ? "flex items-center gap-2 px-4 py-3 text-sm text-accent-200 bg-accent-50 transition-all duration-200 ease-in-out"
                : "flex items-center gap-2 px-4 py-3 text-sm text-text-primary hover:bg-surface-muted transition-all duration-200 ease-in-out"
            }
          >
            {navigator.icon} {navigator.name}
            {navigator.badge ? (
              <span className="ml-auto inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs bg-danger-50 text-danger-400 border border-danger-200">
                {navigator.badge}
              </span>
            ) : null}
          </NavLink>
        ))}
      </div>
    )
  }

  function renderAccount() {
    return (
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-2 mb-3 px-2">
          <div className="w-8 h-8 rounded-full bg-accent-200 text-white flex items-center justify-center text-sm font-medium">
            {user?.fullName?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.fullName}</p>
            <p className="text-xs text-text-muted capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </div>
        {showPasswordForm ? (
          <form onSubmit={handleChangePassword} className="mb-3 rounded-md border border-border bg-surface-muted p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-text-secondary">Change password</p>
              <button
                type="button"
                onClick={() => { setShowPasswordForm(false); setError(""); setSuccess(""); }}
                className="text-text-muted hover:text-text-primary"
              >
                <X size={14} />
              </button>
            </div>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              required
              className="w-full bg-surface-card border border-border rounded-md text-sm px-2 py-1.5 focus:outline-none focus:border-accent-200"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min 6 chars)"
              required
              className="w-full bg-surface-card border border-border rounded-md text-sm px-2 py-1.5 focus:outline-none focus:border-accent-200"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              className="w-full bg-surface-card border border-border rounded-md text-sm px-2 py-1.5 focus:outline-none focus:border-accent-200"
            />
            {error && <p className="text-xs text-danger-400">{error}</p>}
            {success && <p className="text-xs text-success-400">{success}</p>}
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-accent-200 text-white rounded-md text-xs px-3 py-1.5 hover:bg-accent-400 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save password"}
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-text-muted hover:text-accent-200 hover:bg-accent-50 rounded-md transition-colors mb-1"
          >
            <KeyRound size={16} /> Change password
          </button>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-text-muted hover:text-danger-400 hover:bg-danger-50 rounded-md transition-colors"
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-surface-card border-b border-border shrink-0">
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open navigation menu"
          className="flex items-center gap-2 text-left cursor-pointer"
        >
          <Menu size={20} className="text-accent-200" />
          <span className="leading-tight font-sans text-base">Result tracking system</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-accent-200 text-white flex items-center justify-center text-sm font-medium">
            {user?.fullName?.charAt(0) || "U"}
          </span>
        </div>
      </div>

      {/* Mobile slide-in drawer */}
      <div
        className={`fixed inset-0 z-50 md:hidden overflow-hidden transition-opacity duration-300 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        <div
          className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${menuOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
        <aside
          className={`absolute inset-y-0 left-0 w-72 max-w-[85%] bg-surface-card shadow-2xl flex flex-col overflow-y-auto transform transition-transform duration-300 ease-in-out ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
            <header className="flex items-center justify-between p-4 shrink-0">
              <div className="flex items-center gap-1">
                <span><ShieldCheck size={22} className="text-accent-200" /></span>
                <h2 className="leading-tight font-sans text-base">Result tracking system</h2>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close navigation menu"
                className="text-text-muted hover:text-text-primary cursor-pointer"
              >
                <X size={20} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto">
              {renderLinks(() => setMenuOpen(false))}
            </div>

            <div className="shrink-0">
              {renderAccount()}
            </div>
          </aside>
        </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex left flex-2 flex-col bg-surface-card h-full justify-between overflow-y-auto">
        <div className="flex flex-col gap-5">
        <header className="flex items-center gap-1 p-4">
          <span><ShieldCheck size={22} className="text-accent-200" /></span>
          <h2 className="leading-tight font-sans text-base">Result tracking system</h2>
        </header>

        <div className="flex flex-col">
          {renderLinks(undefined)}
        </div>
      </div>

      {renderAccount()}
      </div>
    </>
  )
}