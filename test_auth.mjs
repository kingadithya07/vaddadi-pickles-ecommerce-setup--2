import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sbkcxmymhvrorkiiocqi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNia2N4bXltaHZyb3JraWlvY3FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MTc2NjIsImV4cCI6MjA4NjI5MzY2Mn0.Oalz0xH-tlXrba2LzKMms8icq2YDvojBxEqrvawKGTM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  const randomEmail = `test${Math.floor(Math.random() * 1000000)}@example.com`;
  console.log('Trying to sign up with:', randomEmail);
  const { data, error } = await supabase.auth.signUp({
    email: randomEmail,
    password: 'Password123!',
    options: {
      data: {
        full_name: 'Test User',
        name: 'Test User',
        phone: '1234567890',
        role: 'customer',
        address: {}
      }
    }
  });

  if (error) {
    console.error('Sign up error:', error);
  } else {
    console.log('Sign up successful!');
    console.log('User ID:', data.user?.id);
    
    // Now try the profile insert
    if (data.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
            id: data.user.id,
            name: 'Test User',
            phone: '1234567890',
            role: 'customer',
            addresses: [],
            cart: [],
            updated_at: new Date().toISOString(),
        });
        if (profileError) {
            console.error('Profile insert error:', profileError);
        } else {
            console.log('Profile insert successful!');
        }
    }
  }
}

test();
