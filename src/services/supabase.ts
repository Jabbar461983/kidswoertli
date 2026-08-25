import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

export const supabaseAuth = {
  async signUp(email: string, password: string, username?: string) {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || email.split('@')[0],
        },
      },
    })
  },

  async signIn(email: string, password: string) {
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

  async getUser() {
    return supabase.auth.getUser()
  },
}
