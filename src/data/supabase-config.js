/* Supabase connection for cloud progress + sign-in. Leave empty to use the Claude account (inside claude.ai) or this device only.
 * url: Project Settings → API → Project URL. anonKey: the "anon public" key (made for browsers; row level security protects the data).
 * NEVER put the service_role key here. */
window.ATLAS_SUPABASE=window.ATLAS_SUPABASE||{url:'',anonKey:''}; // tests may preset it
