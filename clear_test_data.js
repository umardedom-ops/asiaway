const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearData() {
  const tables = [
    'payments',
    'expenses',
    'tasks',
    'bot_drafts',
    'bookings',
    'leads',
    'clients'
  ];

  console.log("Starting to clear test data...");

  for (const table of tables) {
    try {
      // Due to RLS or foreign key constraints, we delete where id is not null.
      // This will delete all rows.
      const { data, error } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Dummy condition to delete all

      if (error) {
        console.error(`Error clearing ${table}:`, error.message);
      } else {
        console.log(`Successfully cleared table: ${table}`);
      }
    } catch (e) {
      console.error(`Exception while clearing ${table}:`, e.message);
    }
  }
  
  // Also reset apartment statuses to clean and available, but keeping the apartments
  console.log("Resetting apartment statuses...");
  const { error: aptError } = await supabase
    .from('apartments')
    .update({ 
      cleaning_status: 'clean',
      lease_last_paid_period: null
    })
    .neq('id', '00000000-0000-0000-0000-000000000000');
    
  if (aptError) {
    console.error("Error resetting apartments:", aptError.message);
  } else {
    console.log("Successfully reset apartment statuses.");
  }

  console.log("Test data cleared successfully.");
}

clearData();
