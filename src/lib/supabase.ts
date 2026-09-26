import { createClient } from '@supabase/supabase-js';

// Using environment variables to keep credentials hidden from GitHub
// Hardcoding credentials so the live site works without environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sbkcxmymhvrorkiiocqi.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNia2N4bXltaHZyb3JraWlvY3FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MTc2NjIsImV4cCI6MjA4NjI5MzY2Mn0.Oalz0xH-tlXrba2LzKMms8icq2YDvojBxEqrvawKGTM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
