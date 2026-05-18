import { createClient } from "@supabase/supabase-js";

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // Since we cannot easily log in via Google in a script,
  // we will use the admin key to fetch just to test the query shape.
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await adminSupabase
    .from("orders")
    .select(`
      id, daily_code, reference_number, status, total_amount_lkr,
      pickup_time, scheduled_slot, note, customer_name, created_at, shop_id,
      shops!inner(name, emoji, banner_url),
      order_items(id, item_title, item_image_url, quantity, unit_price_lkr, notes, dining)
    `)
    .eq("user_id", "13b74cdc-ea89-42ff-9d50-ea0fd90becc2")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Query Error:", error);
  } else {
    console.log("Returned Data Count:", data.length);
    if (data.length > 0) {
      console.log("First Order Shops Shape:", Array.isArray(data[0].shops) ? "Array" : "Object", data[0].shops);
      console.log("First Order Items Shape:", Array.isArray(data[0].order_items) ? "Array" : "Object");
    }
  }
}

main();
