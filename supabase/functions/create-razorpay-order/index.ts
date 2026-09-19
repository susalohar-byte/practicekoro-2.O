// supabase/functions/create-razorpay-order/index.ts
// PracticeKoro 2.0 - Server-Side Razorpay Order Creation via Orders API
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

interface CreateOrderPayload {
  planId: string;
}

Deno.serve(async (req: Request) => {
  // 1. CORS headers
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
    return new Response(JSON.stringify({ error: 'Unauthorized: Authentication required' }), {
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
    return new Response(JSON.stringify({ error: 'Unauthorized: Invalid session' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

  // 3. Parse request payload
  let payload: CreateOrderPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!payload.planId) {
    return new Response(JSON.stringify({ error: 'Missing planId parameter' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 4. Retrieve authoritative plan details from database
  const { data: plan, error: planError } = await serviceClient
    .from('subscription_plans')
    .select('id, title, price, currency, duration_days, is_active')
    .eq('id', payload.planId)
    .single();

  if (planError || !plan) {
    return new Response(JSON.stringify({ error: 'Subscription plan not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!plan.is_active) {
    return new Response(JSON.stringify({ error: 'This subscription plan is currently inactive' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const priceNum = Number(plan.price);
  if (priceNum <= 0) {
    return new Response(JSON.stringify({ error: 'Free plans do not require payment processing' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 5. Retrieve Razorpay credentials from payment_gateways or environment
  let keyId = Deno.env.get('RAZORPAY_KEY_ID');
  let keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

  if (!keyId || !keySecret) {
    try {
      const { data: gwData } = await serviceClient
        .from('payment_gateways')
        .select('key_id, key_secret, is_active')
        .eq('gateway', 'razorpay')
        .eq('is_active', true)
        .maybeSingle();

      if (gwData) {
        keyId = keyId || gwData.key_id;
        keySecret = keySecret || gwData.key_secret;
      }
    } catch (gwErr) {
      console.warn('Error reading gateway configuration from database:', gwErr);
    }
  }

  if (!keyId || !keySecret || keyId === 'rzp_test_practicekoro_key' || !keySecret.trim()) {
    console.error('Razorpay gateway credentials not properly configured');
    return new Response(
      JSON.stringify({
        error:
          'Payment gateway not configured. Please enter your valid Razorpay Key ID and Key Secret in Admin Settings.',
      }),
      {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // 6. Call Razorpay Orders API to create an authoritative order
  const amountInPaise = Math.round(priceNum * 100);
  const authHeaderBasic = 'Basic ' + btoa(`${keyId.trim()}:${keySecret.trim()}`);
  const receiptId = `pk_${user.id.slice(0, 8)}_${Date.now()}`.slice(0, 40);

  let rzpOrder: { id: string; amount: number; currency: string };
  try {
    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: authHeaderBasic,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: plan.currency || 'INR',
        receipt: receiptId,
        notes: {
          user_id: user.id,
          plan_id: plan.id,
          platform: 'PracticeKoro',
        },
      }),
    });

    const rzpData = await rzpRes.json();

    if (!rzpRes.ok) {
      console.error('Razorpay API error response:', rzpData);
      const desc = rzpData?.error?.description || 'Could not initiate order with payment gateway';
      return new Response(JSON.stringify({ error: `Razorpay: ${desc}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    rzpOrder = rzpData;
  } catch (apiErr) {
    console.error('Failed to communicate with Razorpay API:', apiErr);
    return new Response(
      JSON.stringify({ error: 'Network error communicating with payment gateway' }),
      {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // 7. Persist pending order in public.payments table
  const { data: paymentRow, error: paymentInsertError } = await serviceClient
    .from('payments')
    .insert({
      user_id: user.id,
      plan_id: plan.id,
      amount: plan.price,
      currency: plan.currency || 'INR',
      gateway: 'razorpay',
      order_id: rzpOrder.id,
      razorpay_order_id: rzpOrder.id,
      status: 'pending',
    })
    .select('id')
    .single();

  if (paymentInsertError) {
    console.error('Failed to record pending payment in database:', paymentInsertError);
    // Still return order details so checkout can proceed, webhook/verification will reconcile
  }

  return new Response(
    JSON.stringify({
      order_id: rzpOrder.id,
      payment_id: paymentRow?.id || rzpOrder.id,
      plan_id: plan.id,
      plan_title: plan.title,
      amount: plan.price,
      currency: plan.currency || 'INR',
      duration_days: plan.duration_days,
      key_id: keyId.trim(),
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
});
