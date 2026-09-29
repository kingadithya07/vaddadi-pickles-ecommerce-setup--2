import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function test() {
  console.log("Fetching feedback...");
  const { data: fetch, error: fetchErr } = await supabase.from('site_feedback').select('*').limit(1);
  if (fetchErr) {
    console.error("Fetch err:", fetchErr);
    return;
  }
  if (!fetch || fetch.length === 0) {
    console.log("No feedback found to update");
    return;
  }
  
  const fb = fetch[0];
  console.log("Found:", fb.id, fb.status);
  
  console.log("Updating...");
  const { data: upd, error: updErr } = await supabase.from('site_feedback').update({ status: 'read' }).eq('id', fb.id).select();
  if (updErr) {
    console.error("Update error:", updErr);
  } else {
    console.log("Update success. Rows affected:", upd?.length);
    console.log("Data:", upd);
  }
}
test();
