import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const results = [];
    const startTime = Date.now();

    // Test 1: Stripe Checkout Creation
    try {
      const checkoutRes = await fetch(`${Deno.env.get('BASE44_APP_URL')}/api/functions/createCheckout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Origin': 'https://test.local' },
        body: JSON.stringify({ origin: 'https://test.local' })
      });
      const checkoutData = await checkoutRes.json();
      results.push({
        test: 'Stripe Checkout',
        status: checkoutRes.status === 200 && checkoutData.url ? 'PASS' : 'FAIL',
        duration: Date.now() - startTime
      });
    } catch (e) {
      results.push({ test: 'Stripe Checkout', status: 'ERROR', error: e.message });
    }

    // Test 2: Track Stats (Read)
    try {
      const stats = await base44.asServiceRole.entities.TrackStat.list();
      results.push({
        test: 'Track Stats Read',
        status: Array.isArray(stats) ? 'PASS' : 'FAIL',
        count: stats.length,
        duration: Date.now() - startTime
      });
    } catch (e) {
      results.push({ test: 'Track Stats Read', status: 'ERROR', error: e.message });
    }

    // Test 3: App Meta (Read)
    try {
      const meta = await base44.asServiceRole.entities.AppMeta.list();
      results.push({
        test: 'App Meta Read',
        status: Array.isArray(meta) ? 'PASS' : 'FAIL',
        count: meta.length,
        duration: Date.now() - startTime
      });
    } catch (e) {
      results.push({ test: 'App Meta Read', status: 'ERROR', error: e.message });
    }

    // Test 4: Track Comments (Read)
    try {
      const comments = await base44.asServiceRole.entities.TrackComment.list();
      results.push({
        test: 'Track Comments Read',
        status: Array.isArray(comments) ? 'PASS' : 'FAIL',
        count: comments.length,
        duration: Date.now() - startTime
      });
    } catch (e) {
      results.push({ test: 'Track Comments Read', status: 'ERROR', error: e.message });
    }

    // Summary
    const passed = results.filter(r => r.status === 'PASS').length;
    const totalTests = results.length;
    const passRate = ((passed / totalTests) * 100).toFixed(1);

    const summary = {
      timestamp: new Date().toISOString(),
      totalTests,
      passed,
      failed: totalTests - passed,
      passRate: `${passRate}%`,
      duration: `${Date.now() - startTime}ms`,
      results
    };

    console.log(`[TEST SUITE] ${passed}/${totalTests} tests passed (${passRate}%)`);

    return Response.json(summary, { status: 200 });
  } catch (error) {
    console.error('[TEST SUITE ERROR]', error.message);
    return Response.json(
      { error: error.message, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
});