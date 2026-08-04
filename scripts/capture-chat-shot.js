const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const out = path.join(__dirname, '..', 'portfolio-shots');
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();

  await page.goto('https://mediq-cyan.vercel.app/sign-in', { waitUntil: 'networkidle' });
  await page.fill('input[name="email"]', 'patient@mediq.local');
  await page.fill('input[name="password"]', 'patient123');
  await Promise.all([
    page.waitForURL((u) => !u.pathname.includes('sign-in'), { timeout: 30000 }).catch(() => null),
    page.click('button[type="submit"]'),
  ]);

  await page.goto('https://mediq-cyan.vercel.app/chat', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  const ta = page.locator('textarea').first();
  await ta.fill('I have had a mild headache and low fever for two days. What should I do? Keep it brief.');
  await page.keyboard.press('Enter');

  // Wait up to ~2 min for assistant response (Render cold start)
  const deadline = Date.now() + 120000;
  let gotReply = false;
  while (Date.now() < deadline) {
    await page.waitForTimeout(3000);
    const body = await page.locator('body').innerText();
    if (
      body.includes('Hydrate') ||
      body.includes('self-care') ||
      body.includes('guidance') ||
      body.includes('Seek') ||
      body.includes('doctor') ||
      body.includes('rest')
    ) {
      // Ensure it's not only the intro greeting
      if (body.includes('mild headache') || body.includes('low fever')) {
        gotReply = true;
        break;
      }
    }
  }

  console.log('gotReply', gotReply);
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: path.join(out, '06-chat-conversation.png'),
    animations: 'disabled',
  });
  console.log('saved 06-chat-conversation.png');

  // Rebuild product grid collage with chat included
  const frame = await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 });
  const framePage = await frame.newPage();
  const toFileUrl = (p) => 'file:///' + p.replace(/\\/g, '/');
  await framePage.setContent(`<!DOCTYPE html>
  <html><head><style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{width:1600px;height:1000px;padding:48px;color:#fff;font-family:Segoe UI,system-ui,sans-serif;
      background:#0f766e;background-image:radial-gradient(circle at 10% 20%,rgba(255,255,255,.12),transparent 40%),radial-gradient(circle at 90% 80%,rgba(45,212,191,.25),transparent 40%)}
    h1{font-size:36px;font-weight:700;margin-bottom:8px}p{opacity:.85;margin-bottom:28px;font-size:16px}
    .grid{display:grid;grid-template-columns:1.2fr 1fr;gap:24px;height:calc(100% - 90px)}
    .panel{background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 25px 50px rgba(0,0,0,.2)}
    .panel img{width:100%;height:100%;object-fit:cover;object-position:top;display:block}
    .stack{display:grid;grid-template-rows:1fr 1fr;gap:24px}
  </style></head><body>
    <h1>Product walkthrough</h1>
    <p>Chat guidance → booking → patient & doctor portals</p>
    <div class="grid">
      <div class="panel"><img src="${toFileUrl(path.join(out, '06-chat-conversation.png'))}"/></div>
      <div class="stack">
        <div class="panel"><img src="${toFileUrl(path.join(out, '07-patient-portal.png'))}"/></div>
        <div class="panel"><img src="${toFileUrl(path.join(out, '09-doctor-portal.png'))}"/></div>
      </div>
    </div>
  </body></html>`, { waitUntil: 'load' });
  await framePage.waitForTimeout(1200);
  await framePage.screenshot({ path: path.join(out, '13-showcase-product-grid.png'), animations: 'disabled' });
  console.log('updated 13-showcase-product-grid.png');

  await frame.close();
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
