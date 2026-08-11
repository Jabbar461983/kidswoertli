import { supabase } from './supabase'

export const storageService = {
  async uploadImage(userId: string, file: Blob, filename: string): Promise<string> {
    const path = `${userId}/${filename}`

    const { error } = await supabase.storage
      .from('card-images')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) throw error

    const { data } = supabase.storage.from('card-images').getPublicUrl(path)
    return data.publicUrl
  },

  async deleteImage(userId: string, filename: string): Promise<void> {
    const path = `${userId}/${filename}`

    const { error } = await supabase.storage
      .from('card-images')
      .remove([path])

    if (error) throw error
  },

  async getImageUrl(userId: string, filename: string): Promise<string> {
    const path = `${userId}/${filename}`
    const { data } = supabase.storage.from('card-images').getPublicUrl(path)
    return data.publicUrl
  },
}
