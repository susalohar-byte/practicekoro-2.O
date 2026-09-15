// supabase/functions/verify-payment/index.ts
// PracticeKoro 2.0 - Server-Side Payment Verification Edge Function
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

interface PaymentVerificationPayload {
  orderId: string;
  paymentId: string;
  signature: string;
  planId: string;
}

/**
 * Timing-safe HMAC-SHA256 signature verification
 */
async function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const rawPayload = `${orderId}|${paymentId}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(rawPayload));
    const calculatedHex = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    if (calculatedHex.length !== signature.length) {
      return false;
    }

    let diff = 0;
    for (let i = 0; i < calculatedHex.length; i++) {
      diff |= calculatedHex.charCodeAt(i) ^ signature.charCodeAt(i);
    }
    return diff === 0;
  } catch (err) {
    console.error('Signature verification error:', err);
    return false;
  }
}

Deno.serve(async (req: Request) => {
  // 1. CORS headers — restrict to configured origins when ALLOWED_ORIGINS is set
  // (comma-separated list, e.g. "https://practicekoro.online,https://www.practicekoro.online").
  // With no allow-list configured this keeps the previous permissive behavior.
  const allowedOrigins = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  const requestOrigin = req.headers.get('Origin');
  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    Vary: 'Origin',
  };
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    corsHeaders['Access-Control-Allow-Origin'] = requestOrigin;
  } else if (allowedOrigins.length === 0) {
    corsHeaders['Access-Control-Allow-Origin'] = '*';
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 2. Validate user auth token
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
    console.error('Server misconfiguration: Supabase environment keys missing');
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Verify caller user identity
  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 3. Resolve key secret - strictly FAIL CLOSED
  const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
  if (!keySecret) {
    console.error('Server misconfiguration: RAZORPAY_KEY_SECRET is not set');
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 4. Parse request payload
  let payload: PaymentVerificationPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Malformed JSON payload' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { orderId, paymentId, signature, planId } = payload;
  if (!orderId || !paymentId || !signature || !planId) {
    return new Response(JSON.stringify({ error: 'Missing required verification fields' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 5. Cryptographic signature verification
  const isValid = await verifyRazorpaySignature(orderId, paymentId, signature, keySecret);
  if (!isValid) {
    console.warn('Invalid Razorpay payment signature attempt rejected');
    return new Response(JSON.stringify({ error: 'Invalid payment signature' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 6. Invoke server RPC to activate subscription
  const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
  const { data: rpcResult, error: rpcError } = await serviceClient.rpc('verify_razorpay_payment', {
    p_order_id: orderId,
    p_payment_id: paymentId,
    p_signature: signature,
    p_plan_id: planId,
  });

  if (rpcError) {
    console.error('Payment verification RPC rejected. Error code:', rpcError.code);
    return new Response(JSON.stringify({ error: 'Payment verification failed' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({
      success: true,
      subscriptionId: rpcResult.subscription_id,
      status: rpcResult.status,
      startsAt: rpcResult.starts_at,
      expiresAt: rpcResult.expires_at,
      isRenewal: rpcResult.is_renewal,
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
