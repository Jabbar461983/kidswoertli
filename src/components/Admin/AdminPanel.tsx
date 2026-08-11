import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { supabaseAuth } from '@/services/supabase'

export function AdminPanel() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  if (!user) {
    navigate('/login')
    return null
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-longchamp-ivory dark:bg-longchamp-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔐</div>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            Zugriff verweigert
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-longchamp-gold hover:bg-longchamp-dark-gold text-longchamp-black font-bold py-2 px-4 rounded-lg"
          >
            ← Zurück zum Dashboard
          </button>
        </div>
      </div>
    )
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim()) {
      setMessage({ type: 'error', text: 'Bitte gib einen Benutzernamen ein' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      await supabaseAuth.resetPassword(username)
      setMessage({
        type: 'success',
        text: `Passwort-Reset-E-Mail wurde an ${username}@kidswoertli.local gesendet`,
      })
      setUsername('')
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Fehler beim Senden der Passwort-Reset-E-Mail',
      })
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-longchamp-ivory dark:bg-longchamp-black">
      {/* Header */}
      <header className="bg-white dark:bg-longchamp-black border-b-2 border-longchamp-gold shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-longchamp-black dark:text-longchamp-ivory">
              ⚙️ Admin-Panel
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Verwalte Benutzer und deren Passwörter
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
          >
            ← Zurück
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-longchamp-black border-2 border-longchamp-gold rounded-lg p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-longchamp-black dark:text-longchamp-ivory mb-4">
              🔑 Passwort zurücksetzen
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Sende einem Benutzer einen Passwort-Reset-Link per E-Mail. Der Benutzer kann
              dann ein neues Passwort setzen.
            </p>
          </div>

          {message && (
            <div
              className={`rounded-lg p-4 ${
                message.type === 'success'
                  ? 'bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-200'
                  : 'bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Benutzername
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="z.B. 'schüler1'"
                className="w-full px-4 py-3 border-2 border-longchamp-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-longchamp-gold dark:bg-longchamp-black dark:text-longchamp-ivory"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-longchamp-gold hover:bg-longchamp-dark-gold disabled:opacity-50 text-longchamp-black font-bold py-3 px-4 rounded-lg"
            >
              {loading ? 'Wird gesendet...' : '📧 Passwort-Reset-Link senden'}
            </button>
          </form>

          {/* Information Box */}
          <div className="bg-blue-100 dark:bg-blue-900 border border-blue-400 dark:border-blue-700 text-blue-700 dark:text-blue-200 px-4 py-3 rounded-lg">
            <p className="text-sm">
              <strong>Hinweis:</strong> Die E-Mail wird an{' '}
              <code className="bg-blue-200 dark:bg-blue-800 px-2 py-1 rounded">
                {username || 'benutzername'}@kidswoertli.local
              </code>{' '}
              gesendet.
            </p>
          </div>
        </div>

        {/* Admin Info */}
        <div className="mt-12 bg-white dark:bg-longchamp-black border-2 border-longchamp-gold rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-bold text-longchamp-black dark:text-longchamp-ivory">
            ℹ️ Admin-Informationen
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>
              <strong>Dein Benutzername:</strong> {user.username}
            </p>
            <p>
              <strong>Admin-Status:</strong> {isAdmin ? '✓ Aktiviert' : '✗ Nicht aktiviert'}
            </p>
            <p className="mt-4">
              Um weitere Administratoren zu erstellen oder andere Admin-Aufgaben durchzuführen,
              kontaktiere den Systemadministrator.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
