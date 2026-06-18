// Converts the Pulse bug report Markdown to a print-ready PDF using Playwright's Chromium.
// Self-contained Markdown -> HTML conversion scoped to the constructs used in the report
// (headings, tables, lists, blockquotes, images, links, bold, inline code, hr, paragraphs).
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const REPORT_DIR = path.join(__dirname, '..', 'QA', 'bug-report');
const MD_PATH = path.join(REPORT_DIR, 'Bug_Report_Pulse_1.1.0.md');
const HTML_PATH = path.join(REPORT_DIR, '_report.html');
const PDF_PATH = path.join(REPORT_DIR, 'Bug_Report_Pulse_1.1.0.pdf');

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Inline formatting: images, links, bold, inline code. (Escape first, then apply.)
function inline(text) {
  let t = escapeHtml(text);
  // images ![alt](src)
  t = t.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt, src) => `<img alt="${alt}" src="${src}">`);
  // links [text](href)
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, txt, href) => `<a href="${href}">${txt}</a>`);
  // bold **text**
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // emphasis *text* (avoid touching already-consumed bold)
  t = t.replace(/(^|[^*])\*([^*]+)\*([^*]|$)/g, '$1<em>$2</em>$3');
  // inline code `code`
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
  let listType = null; // 'ul' | 'ol'

  function closeList() {
    if (listType) {
      out.push(`</${listType}>`);
      listType = null;
    }
  }

  while (i < lines.length) {
    const line = lines[i];

    // blank line
    if (line.trim() === '') {
      closeList();
      i++;
      continue;
    }

    // horizontal rule
    if (/^---+\s*$/.test(line.trim())) {
      closeList();
      out.push('<hr>');
      i++;
      continue;
    }

    // headings
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

    // blockquote (consecutive > lines)
    if (line.trim().startsWith('>')) {
      closeList();
      const buf = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        buf.push(lines[i].replace(/^\s*>\s?/, ''));
        i++;
      }
      out.push(`<blockquote>${inline(buf.join(' '))}</blockquote>`);
      continue;
    }

    // table (header row followed by a separator row of dashes)
    if (line.includes('|') && i + 1 < lines.length && /^\s*\|?[\s:-]+\|[\s:|-]*$/.test(lines[i + 1])) {
      closeList();
      const header = splitRow(lines[i]);
      i += 2; // skip header + separator
      const rows = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim() !== '') {
        rows.push(splitRow(lines[i]));
        i++;
      }
      let tbl = '<table><thead><tr>';
      tbl += header.map((c) => `<th>${inline(c)}</th>`).join('');
      tbl += '</tr></thead><tbody>';
      for (const r of rows) {
        tbl += '<tr>' + r.map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>';
      }
      tbl += '</tbody></table>';
      out.push(tbl);
      continue;
    }

    // ordered list
    const ol = line.match(/^\s*\d+\.\s+(.*)$/);
    if (ol) {
      if (listType !== 'ol') {
        closeList();
        out.push('<ol>');
        listType = 'ol';
      }
      out.push(`<li>${inline(ol[1])}</li>`);
      i++;
      continue;
    }

    // unordered list
    const ul = line.match(/^\s*[-*]\s+(.*)$/);
    if (ul) {
      if (listType !== 'ul') {
        closeList();
        out.push('<ul>');
        listType = 'ul';
      }
      out.push(`<li>${inline(ul[1])}</li>`);
      i++;
      continue;
    }

    // standalone image paragraph
    const img = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (img) {
      closeList();
      out.push(`<p class="shot"><img alt="${img[1]}" src="${img[2]}"></p>`);
      i++;
      continue;
    }

    // paragraph
    closeList();
    out.push(`<p>${inline(line)}</p>`);
    i++;
  }
  closeList();
  return out.join('\n');
}

const css = `
  :root { --ink:#1f2430; --muted:#5b6472; --line:#d9dee7; --accent:#6c3cff; }
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: var(--ink); font-size: 11px; line-height: 1.5; margin: 0; }
  h1, h2, h3, h4 { line-height: 1.25; color: #141821; }
  h1 { font-size: 22px; border-bottom: 3px solid var(--accent); padding-bottom: 6px; margin: 0 0 14px; }
  h1.h1page { page-break-before: always; }
  h1.h1page:first-of-type { page-break-before: avoid; }
  h2 { font-size: 15px; margin: 22px 0 8px; padding-bottom: 4px; border-bottom: 1px solid var(--line); }
  h2.bug { page-break-before: always; color: var(--accent); }
  h3 { font-size: 12.5px; margin: 16px 0 6px; }
  p { margin: 6px 0; }
  a { color: var(--accent); text-decoration: none; }
  code { background: #f1f2f6; border: 1px solid #e3e6ec; border-radius: 3px; padding: 0 4px; font-family: 'Cascadia Code','Consolas',monospace; font-size: 10px; }
  blockquote { margin: 10px 0; padding: 8px 12px; background: #f6f4ff; border-left: 4px solid var(--accent); border-radius: 4px; color: #2c2740; }
  ul, ol { margin: 6px 0 6px 0; padding-left: 22px; }
  li { margin: 2px 0; }
  hr { border: none; border-top: 1px solid var(--line); margin: 16px 0; }
  table { border-collapse: collapse; width: 100%; margin: 10px 0; font-size: 10px; }
  th, td { border: 1px solid var(--line); padding: 5px 7px; text-align: left; vertical-align: top; }
  thead th { background: #2a2440; color: #fff; font-weight: 600; }
  tbody tr:nth-child(even) { background: #f7f8fb; }
  p.shot { margin: 10px 0 4px; page-break-inside: avoid; }
  p.shot img { max-width: 100%; border: 1px solid var(--line); border-radius: 6px; box-shadow: 0 1px 4px rgba(0,0,0,.12); }
  h2.bug, h2.bug + ul { page-break-after: avoid; }
`;

async function main() {
  const md = fs.readFileSync(MD_PATH, 'utf8');
  const bodyHtml = mdToHtml(md);
  const html = `<!doctype html><html><head><meta charset="utf-8"><base href="file:///${REPORT_DIR.replace(/\\/g, '/')}/"><style>${css}</style></head><body>${bodyHtml}</body></html>`;
  fs.writeFileSync(HTML_PATH, html, 'utf8');

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file:///' + HTML_PATH.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
  await page.pdf({
    path: PDF_PATH,
    format: 'A4',
    printBackground: true,
    margin: { top: '14mm', bottom: '16mm', left: '12mm', right: '12mm' },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate:
      '<div style="font-size:8px;color:#888;width:100%;padding:0 12mm;display:flex;justify-content:space-between;"><span>Pulse 1.1.0 — Test &amp; Defect Report</span><span>Page <span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
  });
  await browser.close();
  fs.unlinkSync(HTML_PATH);
  console.log('PDF written: ' + PDF_PATH);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
