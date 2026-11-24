/* Supabase connection for cloud progress + sign-in. Leave empty to use the Claude account (inside claude.ai) or this device only.
 * url: Project Settings → API → Project URL. anonKey: the "anon public" key (made for browsers; row level security protects the data).
 * NEVER put the service_role key here. */
window.ATLAS_SUPABASE=window.ATLAS_SUPABASE||{
  url:'https://etgdzytpaihspegtlayz.supabase.co',
  anonKey:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0Z2R6eXRwYWloc3BlZ3RsYXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU0NzMxNTIsImV4cCI6MjExMTA0OTE1Mn0.Z1p8XPlkHuhA_RwOld42x50IVtIPRG1djPBRbL9lclI'
}; // tests may preset it
