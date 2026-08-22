import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminService } from '@/services/admin'
import { User } from '@/types'

interface UserWithStats extends User {
  totalMinutes: number
}

export function AdminDashboard() {
  const [users, setUsers] = useState<UserWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const navigate = useNavigate()

  // Form states
  const [formData, setFormData] = useState({ email: '', password: '', username: '' })
  const [editData, setEditData] = useState({ username: '', email: '' })

  // Check admin session
  useEffect(() => {
    const adminSession = localStorage.getItem('adminSession')
    if (!adminSession) {
      navigate('/admin/login')
      return
    }

    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await adminService.getAllUsers()
      setUsers(data)
    } catch (err) {
      setError('Fehler beim Laden der Benutzer')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      alert('Email und Passwort erforderlich')
      return
    }

    try {
      await adminService.createUser(formData.email, formData.password, formData.username || undefined)
      setFormData({ email: '', password: '', username: '' })
      setShowCreateForm(false)
      await loadUsers()
      alert('Benutzer erfolgreich erstellt!')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : JSON.stringify(err)
      console.error('Create user error:', err)
      alert('Fehler beim Erstellen:\n' + errorMsg)
    }
  }

  const handleUpdateUser = async (userId: string) => {
    try {
      await adminService.updateUser(userId, {
        username: editData.username,
        email: editData.email,
      })
      setEditingId(null)
      await loadUsers()
      alert('Benutzer aktualisiert!')
    } catch (err) {
      alert('Fehler beim Aktualisieren: ' + (err instanceof Error ? err.message : 'Unbekannter Fehler'))
    }
  }

  const handleDeleteUser = async (userId: string, username: string) => {
    if (window.confirm(`Benutzer "${username}" wirklich löschen? (Daten bleiben erhalten)`)) {
      try {
        await adminService.deleteUser(userId)
        await loadUsers()
        alert('Benutzer gelöscht!')
      } catch (err) {
        alert('Fehler beim Löschen: ' + (err instanceof Error ? err.message : 'Unbekannter Fehler'))
      }
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminSession')
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-longchamp-ivory dark:bg-longchamp-black">
      {/* Header */}
      <header className="bg-white dark:bg-longchamp-black border-b-2 border-longchamp-gold shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-longchamp-black dark:text-longchamp-ivory">
              🔐 Admin Dashboard
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg"
          >
            Abmelden
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Create User Section */}
        <div className="bg-white dark:bg-longchamp-black border-2 border-longchamp-gold rounded-lg p-6 mb-8">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-longchamp-gold hover:bg-longchamp-dark-gold text-longchamp-black font-bold py-2 px-4 rounded-lg mb-4"
          >
            {showCreateForm ? '✕ Abbrechen' : '+ Neuer Benutzer'}
          </button>

          {showCreateForm && (
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">E-Mail</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-longchamp-gold rounded-lg focus:outline-none dark:bg-longchamp-black dark:text-longchamp-ivory"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Passwort</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-longchamp-gold rounded-lg focus:outline-none dark:bg-longchamp-black dark:text-longchamp-ivory"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Benutzername (optional)</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-longchamp-gold rounded-lg focus:outline-none dark:bg-longchamp-black dark:text-longchamp-ivory"
                />
              </div>

              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg"
              >
                Benutzer erstellen
              </button>
            </form>
          )}
        </div>

        {/* Users List */}
        <div className="bg-white dark:bg-longchamp-black border-2 border-longchamp-gold rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-gray-600 dark:text-gray-400">
              Lädt Benutzer...
            </div>
          ) : users.length === 0 ? (
            <div className="p-6 text-center text-gray-600 dark:text-gray-400">
              Keine Benutzer vorhanden
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-longchamp-gold">
                    <th className="px-6 py-4 text-left font-bold">Benutzername</th>
                    <th className="px-6 py-4 text-left font-bold">E-Mail</th>
                    <th className="px-6 py-4 text-left font-bold">Nutzungszeit</th>
                    <th className="px-6 py-4 text-left font-bold">Erstellt am</th>
                    <th className="px-6 py-4 text-left font-bold">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900">
                      {editingId === user.id ? (
                        <>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={editData.username}
                              onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                              className="px-2 py-1 border border-longchamp-gold rounded dark:bg-longchamp-black dark:text-longchamp-ivory"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="email"
                              value={editData.email}
                              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                              className="px-2 py-1 border border-longchamp-gold rounded dark:bg-longchamp-black dark:text-longchamp-ivory"
                            />
                          </td>
                          <td className="px-6 py-4">{user.totalMinutes} min</td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {new Date(user.created_at).toLocaleDateString('de-DE')}
                          </td>
                          <td className="px-6 py-4 space-x-2">
                            <button
                              onClick={() => handleUpdateUser(user.id)}
                              className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded text-sm"
                            >
                              ✓ Speichern
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-3 rounded text-sm"
                            >
                              ✕ Abbrechen
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 font-medium text-longchamp-black dark:text-longchamp-ivory">
                            {user.username}
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                          <td className="px-6 py-4 font-semibold text-longchamp-gold">
                            {user.totalMinutes} min
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {new Date(user.created_at).toLocaleDateString('de-DE')}
                          </td>
                          <td className="px-6 py-4 space-x-2">
                            <button
                              onClick={() => {
                                setEditingId(user.id)
                                setEditData({ username: user.username, email: user.email || '' })
                              }}
                              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-sm"
                            >
                              ✎ Bearbeiten
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id, user.username)}
                              className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-sm"
                            >
                              🗑️ Löschen
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
