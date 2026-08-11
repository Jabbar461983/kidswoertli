import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

export const supabaseAuth = {
  async signUp(username: string, password: string, email?: string) {
    return supabase.auth.signUp({
      email: email || `${username}@kidswoertli.local`,
      password,
      options: {
        data: {
          username,
        },
      },
    })
  },

  async signIn(username: string, password: string) {
    const email = `${username}@kidswoertli.local`
    return supabase.auth.signInWithPassword({
      email,
      password,
    })
  },

  async signOut() {
    return supabase.auth.signOut()
  },

  async getSession() {
    return supabase.auth.getSession()
  },

  async resetPassword(username: string) {
    const email = `${username}@kidswoertli.local`
    return supabase.auth.resetPasswordForEmail(email)
  },
}
