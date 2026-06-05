import Stripe from 'npm:stripe@14.21.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  const sig = req.headers.get('stripe-signature');
  const body = await req.text();

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, Deno.env.get("STRIPE_WEBHOOK_SECRET"));
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const sessionId = session.id;

    try {
      const base44 = createClientFromRequest(req);
      // Store verified premium session ID in AppMeta
      const existing = await base44.asServiceRole.entities.AppMeta.filter({ key: `premium_session_${sessionId}` });
      if (!existing.length) {
        await base44.asServiceRole.entities.AppMeta.create({
          key: `premium_session_${sessionId}`,
          value: 'true'
        });
      }
      console.log('Premium session stored:', sessionId);
    } catch (e) {
      console.error('Failed to store premium session:', e.message);
    }
  }

  return Response.json({ received: true });
});