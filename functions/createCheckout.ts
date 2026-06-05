import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

// Allowed origins for redirect URLs
const ALLOWED_ORIGINS = [
  'https://app.base44.com',
  'http://localhost:5173',
  'http://localhost:3000',
];

function isAllowedOrigin(origin) {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some(o => origin === o) ||
    /^https:\/\/[a-zA-Z0-9-]+\.base44\.com$/.test(origin) ||
    /^https?:\/\/localhost(:\d+)?$/.test(origin) ||
    /^https:\/\/[a-zA-Z0-9-]+\.modal\.host$/.test(origin);
}

Deno.serve(async (req) => {
  try {
    const { origin } = await req.json();

    if (!isAllowedOrigin(origin)) {
      console.error('Blocked disallowed origin:', origin);
      return Response.json({ error: 'Invalid origin' }, { status: 400 });
    }

    const priceId = Deno.env.get('STRIPE_PRICE_ID');
    if (!priceId) {
      console.error('STRIPE_PRICE_ID not configured');
      return Response.json({ error: 'Payment system not configured' }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${origin}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}?premium=cancelled`,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID")
      }
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});