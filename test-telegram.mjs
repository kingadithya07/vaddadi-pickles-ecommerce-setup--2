import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbkcxmymhvrorkiiocqi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNia2N4bXltaHZyb3JraWlvY3FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MTc2NjIsImV4cCI6MjA4NjI5MzY2Mn0.Oalz0xH-tlXrba2LzKMms8icq2YDvojBxEqrvawKGTM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testFunction() {
  console.log('Sending test request to telegram-notify Edge Function...');
  
  const sampleOrder = {
    id: 'TEST-123456',
    userName: 'John Doe',
    userPhone: '9876543210',
    userEmail: 'john.doe@example.com',
    finalAmount: 1499,
    paymentMethod: 'UPI',
    transactionId: 'TXN0987654321',
    address: {
      street: '123 Test Street, Apt 4',
      city: 'Visakhapatnam',
      state: 'Andhra Pradesh',
      pincode: '530068'
    },
    items: [
      {
        product: { name: 'Mango Pickle' },
        variant: { weight: '500g' },
        quantity: 2,
        noGarlic: false
      },
      {
        product: { name: 'Gongura Pickle' },
        variant: { weight: '250g' },
        quantity: 1,
        noGarlic: true
      }
    ]
  };

  try {
    const { data, error } = await supabase.functions.invoke('telegram-notify', {
      body: { order: sampleOrder }
    });

    if (error) {
      console.error('❌ Edge Function Error:');
      console.error(error);
      return;
    }

    console.log('✅ Edge Function responded successfully!');
    console.log('Response data:', data);
  } catch (err) {
    console.error('❌ Network or invocation error:', err);
  }
}

testFunction();
