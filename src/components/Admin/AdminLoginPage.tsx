import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminService } from '@/services/admin'

export function AdminLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (adminService.verifyAdmin(username, password)) {
        // Store admin session in localStorage
        localStorage.setItem('adminSession', JSON.stringify({ username, timestamp: Date.now() }))
        navigate('/admin/dashboard')
      } else {
        setError('Benutzername oder Passwort falsch')
      }
    } catch (err) {
      setError('Ein Fehler ist aufgetreten')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-longchamp-ivory dark:bg-longchamp-black">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-longchamp-black border-2 border-longchamp-gold rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-longchamp-black dark:text-longchamp-ivory mb-2">
            🔐 Admin
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Verwaltungszugriff
          </p>

          {error && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2">
                Benutzername
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border-2 border-longchamp-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-longchamp-gold dark:bg-longchamp-black dark:text-longchamp-ivory"
                placeholder="Admin"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Passwort
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border-2 border-longchamp-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-longchamp-gold dark:bg-longchamp-black dark:text-longchamp-ivory"
                placeholder="Passwort"
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-longchamp-gold hover:bg-longchamp-dark-gold text-longchamp-black font-bold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Authentifizierung...' : 'Anmelden'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
