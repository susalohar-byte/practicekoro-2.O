// supabase/functions/razorpay-webhook/index.ts
// PracticeKoro 2.0 - Razorpay Webhook & Payment Reconciliation Edge Function
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

interface RazorpayWebhookPayload {
  entity: string;
  account_id?: string;
  event: string;
  contains?: string[];
  payload: {
    payment?: {
      entity: {
        id: string;
        order_id: string;
        amount: number; // in paise
        currency: string;
        status: string;
        method?: string;
        email?: string;
        contact?: string;
        created_at?: number;
      };
    };
    order?: {
      entity: {
        id: string;
        amount: number;
        currency: string;
        status: string;
        receipt?: string;
      };
    };
  };
  created_at?: number;
}

/**
 * Timing-safe HMAC-SHA256 signature verification
 */
async function verifyRazorpaySignature(
  rawBody: string,
  signatureHeader: string,
  secret: string
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
    const calculatedHex = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (calculatedHex.length !== signatureHeader.length) {
      return false;
    }

    // Timing-safe comparison
    let diff = 0;
    for (let i = 0; i < calculatedHex.length; i++) {
      diff |= calculatedHex.charCodeAt(i) ^ signatureHeader.charCodeAt(i);
    }
    return diff === 0;
  } catch (err) {
    console.error("Signature verification error:", err);
    return false;
  }
}

Deno.serve(async (req: Request) => {
  // 1. Only allow POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2. Extract Razorpay signature header
  const signature = req.headers.get("x-razorpay-signature");
  if (!signature) {
    return new Response(
      JSON.stringify({ error: "Missing x-razorpay-signature header" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // 3. Read raw body text for HMAC signature verification
  const rawBody = await req.text();
  if (!rawBody) {
    return new Response(
      JSON.stringify({ error: "Empty request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // 4. Resolve webhook secret
  const webhookSecret =
    Deno.env.get("RAZORPAY_WEBHOOK_SECRET") || "whsec_practicekoro_test_2026";

  // 5. Cryptographic signature check
  const isValid = await verifyRazorpaySignature(rawBody, signature, webhookSecret);
  if (!isValid) {
    console.warn("Invalid Razorpay webhook signature attempt rejected");
    return new Response(
      JSON.stringify({ error: "Invalid webhook signature" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // 6. Parse validated JSON payload
  let data: RazorpayWebhookPayload;
  try {
    data = JSON.parse(rawBody);
  } catch {
    return new Response(
      JSON.stringify({ error: "Malformed JSON payload" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const event = data.event;
  console.log(`Processing valid Razorpay webhook event: ${event}`);

  // 7. Filter relevant payment events: payment.captured or order.paid
  if (event !== "payment.captured" && event !== "order.paid") {
    return new Response(
      JSON.stringify({
        status: "ignored",
        message: `Event ${event} does not require reconciliation`,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  const paymentEntity = data.payload?.payment?.entity;
  const orderEntity = data.payload?.order?.entity;

  const paymentId = paymentEntity?.id;
  const orderId = paymentEntity?.order_id || orderEntity?.id;
  const amountPaise = paymentEntity?.amount || orderEntity?.amount;
  const currency = paymentEntity?.currency || orderEntity?.currency || "INR";

  if (!orderId || !paymentId) {
    return new Response(
      JSON.stringify({
        error: "Missing required order_id or payment_id in webhook payload",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Convert paise to INR (29900 paise = 299.00 INR)
  const amountInr = amountPaise ? amountPaise / 100 : 299.00;

  // 8. Reconcile with authoritative PostgreSQL database
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Supabase environment configuration missing in Edge Function");
    return new Response(
      JSON.stringify({ error: "Server misconfiguration" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: rpcResult, error: rpcError } = await supabase.rpc(
    "reconcile_razorpay_webhook",
    {
      p_order_id: orderId,
      p_payment_id: paymentId,
      p_amount: amountInr,
      p_currency: currency,
      p_event_id: data.account_id || `event_${Date.now()}`,
    }
  );

  if (rpcError) {
    console.error("Reconciliation RPC error:", rpcError);
    // Return 400 for business logic rejection (e.g. unknown order or mismatched amounts)
    return new Response(
      JSON.stringify({
        error: "Reconciliation failed",
        details: rpcError.message,
        code: rpcError.code,
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  console.log("Reconciliation result:", rpcResult);

  return new Response(
    JSON.stringify({
      status: "success",
      event,
      reconciliation: rpcResult,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
