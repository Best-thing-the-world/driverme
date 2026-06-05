import Stripe from 'npm:stripe@14.21.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const { sessionId } = await req.json();

    if (!sessionId || typeof sessionId !== 'string' || !sessionId.startsWith('cs_')) {
      return Response.json({ verified: false, error: 'Invalid session ID' }, { status: 400 });
    }

    // Verify with Stripe directly
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return Response.json({ verified: false });
    }

    // Also check our stored webhook record as double-verification
    const base44 = createClientFromRequest(req);
    const stored = await base44.asServiceRole.entities.AppMeta.filter({ key: `premium_session_${sessionId}` });

    const verified = session.payment_status === 'paid' && stored.length > 0;
    return Response.json({ verified });

  } catch (error) {
    console.error('verifyPremium error:', error.message);
    return Response.json({ verified: false, error: error.message }, { status: 500 });
  }
});