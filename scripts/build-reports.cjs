// Builds styled PDF reports (cover page + body) for Pulse 1.1.0.
// - Test Report: cover + body, with auto-extracted spec inventory injected.
// - Bug Report:  cover + body, with embedded screenshots.
// Self-contained Markdown -> HTML conversion (headings, tables, lists, blockquotes,
// images, links, bold/italic, inline code, code fences, hr, paragraphs).
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const ROOT = path.join(__dirname, '..');
const SPECS_DIR = path.join(ROOT, 'tests', 'e2e', 'specs');

/* ------------------------------------------------------------------ */
/* Markdown -> HTML                                                    */
/* ------------------------------------------------------------------ */
function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function inline(text) {
  let t = escapeHtml(text);
  t = t.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt, src) => `<img alt="${alt}" src="${src}">`);
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, txt, href) => `<a href="${href}">${txt}</a>`);
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/(^|[^*])\*([^*]+)\*([^*]|$)/g, '$1<em>$2</em>$3');
  t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
  return t;
}
function splitRow(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|')) s = s.slice(0, -1);
  return s.split('|').map((c) => c.trim());
}
function mdToHtml(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;
  let listType = null;
  function closeList() {
    if (listType) { out.push(`</${listType}>`); listType = null; }
  }
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') { closeList(); i++; continue; }

    // code fence
    if (/^```/.test(line.trim())) {
      closeList();
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i].trim())) { buf.push(lines[i]); i++; }
      i++;
      out.push(`<pre><code>${escapeHtml(buf.join('\n'))}</code></pre>`);
      continue;
    }
    if (/^---+\s*$/.test(line.trim())) { closeList(); out.push('<hr>'); i++; continue; }

    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      closeList();
      const level = h[1].length;
      const isBug = /^BUG-\d+/.test(h[2]);
      const cls = level === 1 ? ' class="h1page"' : isBug ? ' class="bug"' : '';
      out.push(`<h${level}${cls}>${inline(h[2])}</h${level}>`);
      i++;
      continue;
    }
    if (line.trim().startsWith('>')) {
      closeList();
      const buf = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        buf.push(lines[i].replace(/^\s*>\s?/, '')); i++;
      }
      out.push(`<blockquote>${inline(buf.join(' '))}</blockquote>`);
      continue;
    }
    if (line.includes('|') && i + 1 < lines.length && /^\s*\|?[\s:-]+\|[\s:|-]*$/.test(lines[i + 1])) {
      closeList();
      const header = splitRow(lines[i]);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim() !== '') {
        rows.push(splitRow(lines[i])); i++;
      }
      let tbl = '<table><thead><tr>' + header.map((c) => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>';
      for (const r of rows) tbl += '<tr>' + r.map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>';
      tbl += '</tbody></table>';
      out.push(tbl);
      continue;
    }
    const ol = line.match(/^\s*\d+\.\s+(.*)$/);
    if (ol) {
      if (listType !== 'ol') { closeList(); out.push('<ol>'); listType = 'ol'; }
      out.push(`<li>${inline(ol[1])}</li>`); i++; continue;
    }
    const ul = line.match(/^\s*[-*]\s+(.*)$/);
    if (ul) {
      if (listType !== 'ul') { closeList(); out.push('<ul>'); listType = 'ul'; }
      out.push(`<li>${inline(ul[1])}</li>`); i++; continue;
    }
    const img = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (img) { closeList(); out.push(`<p class="shot"><img alt="${img[1]}" src="${img[2]}"></p>`); i++; continue; }

    closeList();
    out.push(`<p>${inline(line)}</p>`);
    i++;
  }
  closeList();
  return out.join('\n');
}

/* ------------------------------------------------------------------ */
/* Spec inventory scan                                                 */
/* ------------------------------------------------------------------ */
function walk(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else if (/\.spec\.ts$/.test(name)) out.push(p);
  }
  return out;
}
function extractTitles(file) {
  const src = fs.readFileSync(file, 'utf8');
  const titles = [];
  const re = /(?:^|\s)(?:test|it)\s*\(\s*(['"`])([\s\S]*?)\1/g;
  let m;
  while ((m = re.exec(src))) {
    let t = m[2].replace(/\$\{[^}]+\}/g, '…').replace(/\s+/g, ' ').trim();
    titles.push(t);
  }
  return titles;
}
function buildInventory() {
  const files = walk(SPECS_DIR).sort();
  const groups = {};
  let total = 0;
  const perFile = [];
  for (const f of files) {
    const rel = path.relative(ROOT, f).replace(/\\/g, '/');
    const seg = path.relative(SPECS_DIR, f).replace(/\\/g, '/').split('/')[0];
    const titles = extractTitles(f);
    total += titles.length;
    groups[seg] = groups[seg] || { files: 0, tests: 0 };
    groups[seg].files += 1;
    groups[seg].tests += titles.length;
    perFile.push({ rel, titles });
  }
  // suite rows
  const projectsFor = (g) =>
    g === 'auth' ? 'anonymous (Chrome)' : g === 'quality' ? 'Chrome' : '4 desktop';
  const order = ['auth', 'core', 'ai', 'ai-engineer', 'operations', 'settings', 'shell', 'quality'];
  const label = {
    auth: 'Auth', core: 'Core', ai: 'AI & Intelligence', 'ai-engineer': 'AI Engineer',
    operations: 'Operations', settings: 'Settings', shell: 'Shell', quality: 'Quality',
  };
  const checks = {
    auth: 'Login, credentials, injection/XSS safety, route protection',
    core: 'Portfolio Dashboard, Asset Management, Overview Map',
    ai: 'AI Chat, Insights, Reports, Energy, Compliance',
    'ai-engineer': 'HVAC Optimization, Smart Commissioning',
    operations: 'Work Orders, Maintenance Calendar, Fault Detection',
    settings: 'Profile, Theme, Users, Roles, Permission Matrix, Workflow',
    shell: 'Navigation, UI consistency, responsive layout',
    quality: 'Rendering, performance budget, known-issue guard',
  };
  const seen = new Set();
  const rows = [];
  let n = 1;
  for (const g of order) {
    if (!groups[g]) continue;
    seen.add(g);
    rows.push(`| ${n++} | ${label[g]} | ${checks[g]} | ${groups[g].tests} | ${projectsFor(g)} |`);
  }
  for (const g of Object.keys(groups)) {
    if (seen.has(g)) continue;
    rows.push(`| ${n++} | ${g} | — | ${groups[g].tests} | 4 desktop |`);
  }

  // inventory markdown
  let inv = '';
  for (const { rel, titles } of perFile) {
    inv += `\n### \`${rel}\` — ${titles.length} tests\n\n`;
    inv += `| # | Test |\n|---|------|\n`;
    titles.forEach((t, idx) => { inv += `| ${idx + 1} | ${t} |\n`; });
  }
  return { suiteRows: rows.join('\n'), inventory: inv, total };
}

/* ------------------------------------------------------------------ */
/* Styling + cover                                                     */
/* ------------------------------------------------------------------ */
const css = `
  :root { --ink:#1f2430; --muted:#5b6472; --line:#d9dee7; --accent:#6c3cff; --navy:#16315c; }
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: var(--ink); font-size: 11px; line-height: 1.5; margin: 0; }
  h1, h2, h3, h4 { line-height: 1.25; color: #141821; }
  h1 { font-size: 21px; border-bottom: 3px solid var(--accent); padding-bottom: 6px; margin: 0 0 14px; }
  h1.h1page { page-break-before: always; }
  h2 { font-size: 15px; margin: 20px 0 8px; padding-bottom: 4px; border-bottom: 1px solid var(--line); }
  h2.bug { page-break-before: always; color: var(--accent); }
  h3 { font-size: 12.5px; margin: 15px 0 6px; color: var(--navy); }
  p { margin: 6px 0; }
  a { color: var(--accent); text-decoration: none; }
  code { background: #f1f2f6; border: 1px solid #e3e6ec; border-radius: 3px; padding: 0 4px; font-family: 'Cascadia Code','Consolas',monospace; font-size: 10px; }
  pre { background: #1e2330; color: #e7e9f0; border-radius: 6px; padding: 10px 12px; overflow-x: auto; }
  pre code { background: none; border: none; color: inherit; padding: 0; font-size: 9.5px; line-height: 1.5; }
  blockquote { margin: 10px 0; padding: 8px 12px; background: #f6f4ff; border-left: 4px solid var(--accent); border-radius: 4px; color: #2c2740; }
  ul, ol { margin: 6px 0; padding-left: 22px; }
  li { margin: 2px 0; }
  hr { border: none; border-top: 1px solid var(--line); margin: 16px 0; }
  table { border-collapse: collapse; width: 100%; margin: 10px 0; font-size: 10px; }
  th, td { border: 1px solid var(--line); padding: 5px 7px; text-align: left; vertical-align: top; }
  thead th { background: #2a2440; color: #fff; font-weight: 600; }
  tbody tr:nth-child(even) { background: #f7f8fb; }
  p.shot { margin: 10px 0 4px; page-break-inside: avoid; }
  p.shot img { max-width: 100%; border: 1px solid var(--line); border-radius: 6px; box-shadow: 0 1px 4px rgba(0,0,0,.12); }
  h2.bug, h2.bug + ul { page-break-after: avoid; }
  /* cover */
  .cover { height: 247mm; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; page-break-after: always; }
  .cover .brand { font-size: 40px; font-weight: 800; color: var(--navy); letter-spacing: -0.5px; }
  .cover .sub { font-size: 15px; color: var(--muted); margin-top: 6px; }
  .cover .badge { margin: 34px 0 10px; padding: 16px 30px; border-radius: 10px; font-size: 20px; font-weight: 800; color: #fff; }
  .cover .badge.green { background: #1f8f4e; }
  .cover .badge.amber { background: #c9821a; }
  .cover .badge.navy  { background: var(--navy); }
  .cover .strip { font-size: 11.5px; color: #444; margin-top: 4px; }
  .cover .meta { margin-top: 26px; font-size: 11px; color: var(--muted); line-height: 1.7; }
`;

function coverHtml(cfg) {
  const strip = cfg.strip ? `<div class="strip">${escapeHtml(cfg.strip)}</div>` : '';
  const meta = (cfg.meta || []).map((l) => inline(l)).join('<br>');
  return `<section class="cover">
    <div class="brand">${escapeHtml(cfg.brand)}</div>
    <div class="sub">${escapeHtml(cfg.sub)}</div>
    <div class="badge ${cfg.badgeColor}">${escapeHtml(cfg.badge)}</div>
    ${strip}
    <div class="meta">${meta}</div>
  </section>`;
}

/* ------------------------------------------------------------------ */
/* Build                                                               */
/* ------------------------------------------------------------------ */
async function build(browser, cfg) {
  let md = fs.readFileSync(cfg.md, 'utf8');
  if (cfg.replace) for (const [k, v] of Object.entries(cfg.replace)) md = md.split(k).join(v);
  const body = mdToHtml(md);
  const baseDir = path.dirname(cfg.md).replace(/\\/g, '/');
  const html = `<!doctype html><html><head><meta charset="utf-8">` +
    `<base href="file:///${baseDir}/"><style>${css}</style></head>` +
    `<body>${coverHtml(cfg)}${body}</body></html>`;
  const htmlPath = cfg.pdf.replace(/\.pdf$/, '._build.html');
  fs.writeFileSync(htmlPath, html, 'utf8');

  const page = await browser.newPage();
  await page.goto('file:///' + htmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
  await page.pdf({
    path: cfg.pdf,
    format: 'A4',
    printBackground: true,
    margin: { top: '14mm', bottom: '16mm', left: '12mm', right: '12mm' },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate:
      `<div style="font-size:8px;color:#888;width:100%;padding:0 12mm;display:flex;justify-content:space-between;">` +
      `<span>${cfg.footer}</span><span>Page <span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
  });
  await page.close();
  fs.unlinkSync(htmlPath);
  console.log('PDF written: ' + cfg.pdf);
}

async function main() {
  const inv = buildInventory();
  const reports = [
    {
      md: path.join(ROOT, 'QA', 'test-report', 'Test_Report_Pulse_1.1.0.md'),
      pdf: path.join(ROOT, 'QA', 'test-report', 'Test_Report_Pulse_1.1.0.pdf'),
      brand: 'Pulse 1.1.0',
      sub: 'QA Automation & Test Report',
      badge: 'CROSS-BROWSER SUITE — 628 / 637 PASSED',
      badgeColor: 'green',
      strip: '4 flaky (recovered) · 1 data-timing fail · 4 skipped · 22 defects logged separately',
      meta: [
        '**Application:** Pulse 1.1.0 — https://test.alt-pulse.com',
        '**Build:** v1.1.0_TEST · **Browsers:** Chrome, Edge, Firefox, Brave',
        '**Framework:** Playwright + live Playwright MCP · **Date:** 2026-06-18',
      ],
      footer: 'Pulse 1.1.0 — QA Automation & Test Report',
      replace: {
        '{{SUITE_ROWS}}': inv.suiteRows,
        '{{INVENTORY}}': inv.inventory,
        '{{UNIQUE_COUNT}}': String(inv.total),
      },
    },
    {
      md: path.join(ROOT, 'QA', 'bug-report', 'Bug_Report_Pulse_1.1.0.md'),
      pdf: path.join(ROOT, 'QA', 'bug-report', 'Bug_Report_Pulse_1.1.0.pdf'),
      brand: 'Pulse 1.1.0',
      sub: 'Defect / Bug Report',
      badge: '22 DEFECTS · 6 HIGH · 8 MEDIUM · 8 LOW',
      badgeColor: 'amber',
      strip: 'Cross-browser execution + UI audit + live exploratory & RBAC findings, with screenshots',
      meta: [
        '**Application:** Pulse 1.1.0 — https://test.alt-pulse.com',
        '**Build:** v1.1.0_TEST · **Browsers:** Chrome, Edge, Firefox, Brave',
        '**Framework:** Playwright + live Playwright MCP · **Date:** 2026-06-18',
      ],
      footer: 'Pulse 1.1.0 — Defect / Bug Report',
    },
  ];

  const browser = await chromium.launch();
  for (const cfg of reports) await build(browser, cfg);
  await browser.close();
  console.log('Inventory: ' + inv.total + ' unique automated test cases.');
}

main().catch((e) => { console.error(e); process.exit(1); });
