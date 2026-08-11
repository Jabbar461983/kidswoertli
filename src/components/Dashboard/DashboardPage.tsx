import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function DashboardPage() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-longchamp-ivory dark:bg-longchamp-black">
      {/* Header */}
      <header className="bg-white dark:bg-longchamp-black border-b-2 border-longchamp-gold shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-longchamp-black dark:text-longchamp-ivory">
            KidsWörtli
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Willkommen, {user?.username}
            </span>
            {isAdmin && (
              <span className="bg-longchamp-gold text-longchamp-black px-3 py-1 rounded text-xs font-semibold">
                Admin
              </span>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
            >
              Abmelden
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card: Neue Karteikarten */}
          <div
            onClick={() => navigate('/capture')}
            className="bg-white dark:bg-longchamp-black border-2 border-longchamp-gold rounded-lg p-6 cursor-pointer hover:shadow-lg transition duration-200 transform hover:scale-105"
          >
            <div className="text-4xl mb-4">📷</div>
            <h2 className="text-xl font-bold mb-2 text-longchamp-black dark:text-longchamp-ivory">
              Neue Karteikarten
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Fotografiere eine Buchseite und erstelle Karteikarten
            </p>
          </div>

          {/* Card: Lernen */}
          <div
            onClick={() => navigate('/learn')}
            className="bg-white dark:bg-longchamp-black border-2 border-longchamp-gold rounded-lg p-6 cursor-pointer hover:shadow-lg transition duration-200 transform hover:scale-105"
          >
            <div className="text-4xl mb-4">📚</div>
            <h2 className="text-xl font-bold mb-2 text-longchamp-black dark:text-longchamp-ivory">
              Lernen
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Starte eine Lernrunde mit deinen Karteikarten
            </p>
          </div>

          {/* Card: Meine Sammlungen */}
          <div
            onClick={() => navigate('/collections')}
            className="bg-white dark:bg-longchamp-black border-2 border-longchamp-gold rounded-lg p-6 cursor-pointer hover:shadow-lg transition duration-200 transform hover:scale-105"
          >
            <div className="text-4xl mb-4">📖</div>
            <h2 className="text-xl font-bold mb-2 text-longchamp-black dark:text-longchamp-ivory">
              Meine Sammlungen
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Verwalte deine Lernmedien und Karteikarten
            </p>
          </div>

          {/* Admin Card */}
          {isAdmin && (
            <div
              onClick={() => navigate('/admin')}
              className="bg-white dark:bg-longchamp-black border-2 border-longchamp-gold rounded-lg p-6 cursor-pointer hover:shadow-lg transition duration-200 transform hover:scale-105"
            >
              <div className="text-4xl mb-4">⚙️</div>
              <h2 className="text-xl font-bold mb-2 text-longchamp-black dark:text-longchamp-ivory">
                Admin-Panel
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Verwalte Benutzer und deren Passwörter
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
