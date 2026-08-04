const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = 'https://mediq-cyan.vercel.app';
const OUT = path.join(__dirname, '..', 'portfolio-shots');

function dataUri(file) {
  const buf = fs.readFileSync(file);
  return `data:image/png;base64,${buf.toString('base64')}`;
}

async function shot(page, name, fullPage = false) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage, animations: 'disabled' });
  console.log('saved', name, fs.statSync(file).size);
}

/** Playwright drops Set-Cookie on some 307 redirects; inject session manually. */
async function login(page, email, password) {
  await page.goto(`${BASE}/sign-in`, { waitUntil: 'load' });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);

  const [response] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/api/auth/sign-in') && r.request().method() === 'POST'),
    page.click('button[type="submit"]'),
  ]);
  await page.waitForTimeout(800);

  let cookies = await page.context().cookies(BASE);
  if (!cookies.some((c) => c.name === 'mediq_session')) {
    const setCookies = await response.headerValues('set-cookie');
    const raw = setCookies.find((c) => c.startsWith('mediq_session='));
    if (!raw) throw new Error('Login failed — no Set-Cookie on sign-in response');
    const value = raw.split(';')[0].slice('mediq_session='.length);
    await page.context().addCookies([
      {
        name: 'mediq_session',
        value,
        domain: 'mediq-cyan.vercel.app',
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'Lax',
        expires: Math.floor(Date.now() / 1000) + 7 * 24 * 3600,
      },
    ]);
  }

  cookies = await page.context().cookies(BASE);
  const ok = cookies.some((c) => c.name === 'mediq_session');
  console.log('login', email, ok ? 'OK' : 'FAILED', 'url=', page.url());
  if (!ok) throw new Error('Login failed — no mediq_session cookie');
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  // Production may still prefetch GET /sign-out and wipe the session until redeployed.
  await page.route('**/sign-out**', async (route) => {
    if (route.request().method() === 'GET') {
      return route.abort();
    }
    return route.continue();
  });

  // Landing
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForTimeout(1000);
  await shot(page, '01-landing-hero');
  await shot(page, '02-landing-full', true);

  // Sign-in clean (no error banner)
  await page.goto(`${BASE}/sign-in`, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  await shot(page, '03-sign-in');

  // Patient flow
  await login(page, 'patient@mediq.local', 'patient123');

  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForTimeout(1000);
  await shot(page, '04-home-signed-in');

  await page.goto(`${BASE}/chat`, { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  if (page.url().includes('sign-in')) throw new Error('Chat redirected to sign-in');
  await shot(page, '05-chat-intro');

  const ta = page.locator('textarea').first();
  await ta.click();
  await ta.fill('I have had a mild headache and low fever for two days. What should I do? Keep it brief.');
  await page.keyboard.press('Enter');

  // Wait for reply (Render cold start)
  let replied = false;
  for (let i = 0; i < 50; i++) {
    await page.waitForTimeout(3000);
    const text = await page.locator('body').innerText();
    if (
      text.includes('mild headache') &&
      (text.includes('Hydrate') ||
        text.includes('rest') ||
        text.includes('guidance') ||
        text.includes('fever') ||
        text.includes('doctor') ||
        text.includes('Seek') ||
        text.includes('compress') ||
        text.includes('Quiet'))
    ) {
      // Need more than just user message + intro
      const hasAssistantCare =
        text.includes('Hydrate') ||
        text.includes('self-care') ||
        text.includes('Seek') ||
        text.includes('guidance') ||
        text.includes('compress') ||
        text.includes('dimly');
      if (hasAssistantCare || i > 12) {
        replied = hasAssistantCare;
        console.log('chat wait iter', i, 'replied', replied);
        if (hasAssistantCare) break;
      }
    }
  }
  await page.waitForTimeout(2000);
  await shot(page, '06-chat-conversation');

  await page.goto(`${BASE}/patient`, { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  if (page.url().includes('sign-in')) throw new Error('Patient redirected to sign-in');
  await shot(page, '07-patient-portal');
  await shot(page, '08-patient-portal-full', true);

  // Doctor flow in fresh context (clean session)
  await context.clearCookies();
  await login(page, 'doctor@mediq.local', 'doctor123');
  await page.goto(`${BASE}/doctor`, { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  if (page.url().includes('sign-in')) throw new Error('Doctor redirected to sign-in');
  await shot(page, '09-doctor-portal');
  await shot(page, '10-doctor-portal-full', true);

  // Mobile landing
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  const mobile = await mobileCtx.newPage();
  await mobile.goto(BASE, { waitUntil: 'load' });
  await mobile.waitForTimeout(1000);
  await shot(mobile, '11-landing-mobile');
  await mobileCtx.close();

  // Showcase cover with embedded images
  const frame = await browser.newContext({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 2,
  });
  const fp = await frame.newPage();
  await fp.setContent(`<!DOCTYPE html><html><head><style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{width:1600px;height:1000px;font-family:Segoe UI,system-ui,sans-serif;
      background:linear-gradient(145deg,#f4faf9 0%,#e7f5f2 45%,#dff3ef 100%);
      padding:48px;position:relative}
    .brand{font-size:42px;font-weight:700;color:#0f766e;letter-spacing:-.03em}
    .tag{margin-top:8px;font-size:16px;color:#64748b;max-width:480px;line-height:1.45}
    .laptop{position:absolute;left:48px;top:150px;width:980px;background:#0f172a;border-radius:18px;
      padding:14px 14px 28px;box-shadow:0 40px 80px rgba(15,23,42,.22)}
    .bar{height:12px;display:flex;gap:6px;margin-bottom:12px;padding-left:4px}
    .bar i{width:10px;height:10px;border-radius:50%;display:block;background:#334155}
    .bar i:nth-child(1){background:#f87171}.bar i:nth-child(2){background:#fbbf24}.bar i:nth-child(3){background:#34d399}
    .laptop img{width:100%;border-radius:8px;display:block}
    .phone{position:absolute;right:70px;top:170px;width:280px;background:#0f172a;border-radius:36px;
      padding:14px 12px 18px;box-shadow:0 30px 60px rgba(15,23,42,.28)}
    .notch{width:90px;height:18px;background:#020617;border-radius:12px;margin:0 auto 10px}
    .phone img{width:100%;border-radius:22px;display:block}
    .chip{position:absolute;right:80px;bottom:60px;background:#fff;border:1px solid #d9e6e3;border-radius:14px;
      padding:14px 18px;box-shadow:0 12px 30px rgba(15,23,42,.08);width:280px}
    .chip strong{display:block;color:#0f172a;font-size:14px;margin-bottom:4px}
    .chip span{color:#64748b;font-size:12px;line-height:1.4}
  </style></head><body>
    <div class="brand">MedIQ</div>
    <div class="tag">AI healthcare assistant — triage, lab clarity, doctor booking in one flow.</div>
    <div class="laptop"><div class="bar"><i></i><i></i><i></i></div>
      <img src="${dataUri(path.join(OUT, '01-landing-hero.png'))}"/></div>
    <div class="phone"><div class="notch"></div>
      <img src="${dataUri(path.join(OUT, '11-landing-mobile.png'))}"/></div>
    <div class="chip"><strong>Live product demo</strong>
      <span>Next.js · Gemini · Supabase · Vercel + Render</span></div>
  </body></html>`, { waitUntil: 'load' });
  await fp.waitForTimeout(800);
  await shot(fp, '12-showcase-cover');

  await fp.setContent(`<!DOCTYPE html><html><head><style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{width:1600px;height:1000px;padding:48px;color:#fff;font-family:Segoe UI,system-ui,sans-serif;
      background:#0f766e;background-image:radial-gradient(circle at 10% 20%,rgba(255,255,255,.12),transparent 40%),
      radial-gradient(circle at 90% 80%,rgba(45,212,191,.25),transparent 40%)}
    h1{font-size:36px;font-weight:700;margin-bottom:8px}
    p{opacity:.85;margin-bottom:28px;font-size:16px}
    .grid{display:grid;grid-template-columns:1.2fr 1fr;gap:24px;height:calc(100% - 90px)}
    .panel{background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 25px 50px rgba(0,0,0,.2)}
    .panel img{width:100%;height:100%;object-fit:cover;object-position:top;display:block}
    .stack{display:grid;grid-template-rows:1fr 1fr;gap:24px}
  </style></head><body>
    <h1>Product walkthrough</h1>
    <p>Chat guidance → patient portal → doctor queue</p>
    <div class="grid">
      <div class="panel"><img src="${dataUri(path.join(OUT, '06-chat-conversation.png'))}"/></div>
      <div class="stack">
        <div class="panel"><img src="${dataUri(path.join(OUT, '07-patient-portal.png'))}"/></div>
        <div class="panel"><img src="${dataUri(path.join(OUT, '09-doctor-portal.png'))}"/></div>
      </div>
    </div>
  </body></html>`, { waitUntil: 'load' });
  await fp.waitForTimeout(800);
  await shot(fp, '13-showcase-product-grid');

  // LinkedIn / Behance banner 1200x630
  const banner = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 });
  const bp = await banner.newPage();
  await bp.setContent(`<!DOCTYPE html><html><head><style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{width:1200px;height:630px;display:flex;font-family:Segoe UI,system-ui,sans-serif;
      background:linear-gradient(120deg,#f8fffd,#e8f7f4 55%,#d9f3ee)}
    .left{width:42%;padding:56px 40px;display:flex;flex-direction:column;justify-content:center}
    .left h1{font-size:56px;color:#0f766e;letter-spacing:-.03em}
    .left p{margin-top:14px;font-size:18px;color:#475569;line-height:1.45}
    .left .stack{margin-top:22px;font-size:13px;color:#0d9488;font-weight:600}
    .right{flex:1;padding:36px 36px 36px 0;display:flex;align-items:center}
    .frame{background:#0f172a;border-radius:16px;padding:12px;box-shadow:0 30px 60px rgba(15,23,42,.2);width:100%}
    .frame img{width:100%;border-radius:8px;display:block}
  </style></head><body>
    <div class="left">
      <h1>MedIQ</h1>
      <p>AI healthcare assistant for symptom guidance, lab clarity, and doctor booking.</p>
      <div class="stack">Next.js · Gemini · Supabase · Live demo</div>
    </div>
    <div class="right"><div class="frame">
      <img src="${dataUri(path.join(OUT, '01-landing-hero.png'))}"/>
    </div></div>
  </body></html>`, { waitUntil: 'load' });
  await bp.waitForTimeout(600);
  await shot(bp, '14-linkedin-banner');

  await banner.close();
  await frame.close();
  await context.close();
  await browser.close();
  console.log('ALL DONE ->', OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
