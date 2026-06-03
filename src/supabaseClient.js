import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://wrcaqmaoipcsdexitdwd.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyY2FxbWFvaXBjc2RleGl0ZHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MzY3NjEsImV4cCI6MjA5NTQxMjc2MX0.1WRz5zOZmJXD1maR5SLggfC6UMczYPwMJ4nVBeV33L0'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
