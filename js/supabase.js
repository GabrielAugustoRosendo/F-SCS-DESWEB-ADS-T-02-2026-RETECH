const SUPABASE_URL = "https://zkyyzrlwyhtrlqpviyih.supabase.co";
const SUPABASE_KEY = "sb_publishable_2kqgFCyQVKrxZWTCo0EIsg_lUQ3G9M7";

window.retechDB = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);
