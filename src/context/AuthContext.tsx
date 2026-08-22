import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { User, AuthContextType } from '@/types'
import { supabase, supabaseAuth } from '@/services/supabase'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await supabaseAuth.getSession()

        if (data.session?.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.session.user.id)
            .single()

          if (userData) {
            setUser(userData)
          }
        }
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        if (session?.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (userData) {
            setUser(userData)
          }
        } else {
          setUser(null)
        }
      }
    )

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  const login = async (username: string, password: string) => {
    try {
      await supabaseAuth.signIn(username, password)
    } catch (error) {
      throw error
    }
  }

  const register = async (username: string, password: string, email?: string) => {
    try {
      const finalEmail = email || `${username}@kidswoertli.local`

      const { data, error } = await supabaseAuth.signUp(username, password, finalEmail)
      if (error) throw new Error(error.message || 'Registrierung fehlgeschlagen')

      if (data.user) {
        const { error: insertError } = await supabase.from('users').insert({
          id: data.user.id,
          username,
          email: finalEmail,
        })

        if (insertError) {
          throw new Error(insertError.message || 'Fehler beim Speichern des Benutzernamens')
        }
      } else {
        throw new Error('Registrierung fehlgeschlagen')
      }
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    await supabaseAuth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAdmin: user?.is_admin ?? false,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
