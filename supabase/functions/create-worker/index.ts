import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing authorization" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const adminClient = createClient(supabaseUrl, supabaseServiceKey);

  const { data: { user }, error: authError } = await client.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: bossProfile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!bossProfile || bossProfile.role !== "boss") {
    return new Response(JSON.stringify({ error: "Only bosses can create workers" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await req.json();
  const { full_name, pin_code, phone } = body;

  if (!full_name || !pin_code) {
    return new Response(JSON.stringify({ error: "full_name and pin_code are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!/^\d{4}$/.test(pin_code)) {
    return new Response(JSON.stringify({ error: "pin_code must be exactly 4 digits" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const randomEmail = `worker_${Date.now()}@ponto-home.internal`;
  const randomPassword = crypto.randomUUID();

  const { data: authData, error: createAuthError } = await adminClient.auth.admin.createUser({
    email: randomEmail,
    password: randomPassword,
    email_confirm: true,
    user_metadata: {
      full_name,
      role: "worker",
    },
  });

  if (createAuthError || !authData.user) {
    return new Response(JSON.stringify({ error: createAuthError?.message || "Failed to create user" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { error: profileError } = await adminClient
    .from("profiles")
    .update({
      boss_id: user.id,
      pin_code,
      phone: phone || null,
    })
    .eq("id", authData.user.id);

  if (profileError) {
    await adminClient.auth.admin.deleteUser(authData.user.id);
    return new Response(JSON.stringify({ error: profileError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      worker_id: authData.user.id,
      full_name,
      pin_code,
    }),
    {
      status: 201,
      headers: { "Content-Type": "application/json" },
    }
  );
});
