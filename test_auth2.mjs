import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sbkcxmymhvrorkiiocqi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNia2N4bXltaHZyb3JraWlvY3FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MTc2NjIsImV4cCI6MjA4NjI5MzY2Mn0.Oalz0xH-tlXrba2LzKMms8icq2YDvojBxEqrvawKGTM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  const email = `test359028@example.com`; // the one I just created
  console.log('Trying to sign up with:', email);
  const { data, error } = await supabase.auth.signUp({
    email: email,
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
    console.error('Sign up error:', error.message);
  } else {
    console.log('Sign up successful!');
  }
}

test();
