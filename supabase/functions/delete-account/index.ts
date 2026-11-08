import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const CONFIRMATION = 'DELETE_MY_ACCOUNT';
const MAX_LAST_SIGN_IN_AGE_MS = 10 * 60 * 1000;

function allowedOrigin(origin: string | null): string | null {
  if (!origin) return null;
  if (
    origin === 'https://nokkhotro-hsc-2028.vercel.app' ||
    origin === 'https://appassets.androidplatform.net' ||
    /^https:\/\/nokkhotro-hsc-2028-[a-z0-9-]+\.vercel\.app$/i.test(origin) ||
    /^http:\/\/localhost:(?:4173|5173)$/i.test(origin)
  ) return origin;
  return '';
}

function responseHeaders(origin: string | null): HeadersInit {
  const headers: Record<string, string> = {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '600',
  };
  const allowed = allowedOrigin(origin);
  if (allowed) headers['Access-Control-Allow-Origin'] = allowed;
  return headers;
}

function json(
  status: number,
  body: Record<string, unknown>,
  origin: string | null,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: responseHeaders(origin),
  });
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get('Origin');
  if (allowedOrigin(origin) === '') {
    return json(403, { code: 'origin_not_allowed' }, origin);
  }
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: responseHeaders(origin) });
  }
  if (request.method !== 'POST') {
    return json(405, { code: 'method_not_allowed' }, origin);
  }

  const authorization = request.headers.get('Authorization') || '';
  const accessToken = authorization.replace(/^Bearer\s+/i, '').trim();
  if (!accessToken) return json(401, { code: 'not_authenticated' }, origin);

  let payload: { confirmation?: unknown };
  try {
    payload = await request.json();
  } catch {
    return json(400, { code: 'invalid_request' }, origin);
  }
  if (payload.confirmation !== CONFIRMATION) {
    return json(400, { code: 'confirmation_required' }, origin);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json(503, { code: 'service_unavailable' }, origin);
  }

  // Validate the token against Auth instead of trusting request JSON or merely
  // decoding JWT claims. The only deletion target is the resulting user.id.
  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: verified, error: verificationError } =
    await authClient.auth.getUser(accessToken);
  if (verificationError || !verified.user) {
    return json(401, { code: 'not_authenticated' }, origin);
  }

  // The web and in-app flows re-enter the current password immediately before
  // invoking this function. Enforce that freshness server-side as well.
  const lastSignIn = Date.parse(verified.user.last_sign_in_at || '');
  const signInAge = Date.now() - lastSignIn;
  if (
    !Number.isFinite(lastSignIn) ||
    signInAge < -60_000 ||
    signInAge > MAX_LAST_SIGN_IN_AGE_MS
  ) {
    return json(403, { code: 'reauthentication_required' }, origin);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // `false` requests a hard delete. The auth.users BEFORE DELETE trigger removes
  // all hsc28 rows in the same database transaction; its foreign keys also stop
  // a stale sibling tab from recreating account-owned rows afterward.
  const { error: deletionError } = await admin.auth.admin.deleteUser(
    verified.user.id,
    false,
  );
  if (deletionError) {
    return json(500, { code: 'deletion_failed' }, origin);
  }

  return json(200, { deleted: true }, origin);
});
