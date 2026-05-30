import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  'https://iovcouywtafwdahnrjay.supabase.co'

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvdmNvdXl3dGFmd2RhaG5yamF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NTg3MDUsImV4cCI6MjA5NTQzNDcwNX0.OR3h_zNfULYJesRIkNt9bvdlyy-6VSxg8PbLypxHGZ0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
