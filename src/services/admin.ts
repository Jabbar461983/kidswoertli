import { supabase, supabaseAuth } from './supabase'
import { User } from '@/types'

export const adminService = {
  // Verify admin credentials (hardcoded for now)
  verifyAdmin(username: string, password: string): boolean {
    return username === 'Admin' && password === 'admin'
  },

  // Get all users with usage statistics
  async getAllUsers() {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Get usage stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const { data: sessions, error: sessionsError } = await supabase
          .from('learning_sessions')
          .select('created_at, updated_at')
          .eq('user_id', user.id)

        if (sessionsError) {
          return { ...user, totalMinutes: 0 }
        }

        // Calculate total minutes from sessions
        const totalMinutes = sessions.reduce((sum, session) => {
          const start = new Date(session.created_at).getTime()
          const end = new Date(session.updated_at).getTime()
          const minutes = Math.round((end - start) / 1000 / 60)
          return sum + Math.max(0, minutes)
        }, 0)

        return { ...user, totalMinutes }
      })
    )

    return usersWithStats
  },

  // Create new user
  async createUser(email: string, password: string, username?: string) {
    try {
      const finalUsername = username || email.split('@')[0]

      // Create auth user
      const { data, error } = await supabaseAuth.signUp(email, password, finalUsername)
      if (error) throw error

      if (data.user) {
        // Create user record
        const { error: insertError } = await supabase.from('users').insert({
          id: data.user.id,
          username: finalUsername,
          email: email,
          is_admin: false,
        })

        if (insertError) throw insertError
        return data.user
      }
    } catch (error) {
      throw error
    }
  },

  // Update user
  async updateUser(userId: string, updates: { username?: string; email?: string }) {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)

    if (error) throw error
  },

  // Delete user (soft delete - keep data)
  async deleteUser(userId: string) {
    // In a real app, you might want to mark user as deleted
    // For now, we'll just delete the auth user via Supabase dashboard
    // The user record stays for data integrity
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (error) throw error
  },

  // Get user sessions and calculate minutes
  async getUserSessions(userId: string) {
    const { data, error } = await supabase
      .from('learning_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },
}
