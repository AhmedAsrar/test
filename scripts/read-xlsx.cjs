// Minimal XLSX reader (no deps): unzips via Node zlib by parsing the ZIP central
// directory, then extracts sharedStrings + each sheet's cell text. Good enough to
// dump a QA workbook to plain text for cross-referencing.
const fs = require('fs');
const zlib = require('zlib');

const file = process.argv[2];
const buf = fs.readFileSync(file);

// --- locate End Of Central Directory ---
let eocd = buf.length - 22;
while (eocd >= 0 && buf.readUInt32LE(eocd) !== 0x06054b50) eocd--;
const cdCount = buf.readUInt16LE(eocd + 10);
let cdOff = buf.readUInt32LE(eocd + 16);

const entries = {};
for (let i = 0; i < cdCount; i++) {
  if (buf.readUInt32LE(cdOff) !== 0x02014b50) break;
  const method = buf.readUInt16LE(cdOff + 10);
  const compSize = buf.readUInt32LE(cdOff + 20);
  const nameLen = buf.readUInt16LE(cdOff + 28);
  const extraLen = buf.readUInt16LE(cdOff + 30);
  const commentLen = buf.readUInt16LE(cdOff + 32);
  const lhOff = buf.readUInt32LE(cdOff + 42);
  const name = buf.toString('utf8', cdOff + 46, cdOff + 46 + nameLen);
  // parse local header to find data start
  const lhNameLen = buf.readUInt16LE(lhOff + 26);
  const lhExtraLen = buf.readUInt16LE(lhOff + 28);
  const dataStart = lhOff + 30 + lhNameLen + lhExtraLen;
  const raw = buf.subarray(dataStart, dataStart + compSize);
  let content;
  try {
    content = method === 0 ? raw : zlib.inflateRawSync(raw);
  } catch (e) {
    content = Buffer.from('');
  }
  entries[name] = content.toString('utf8');
  cdOff += 46 + nameLen + extraLen + commentLen;
}

const decode = (s) =>
  s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'");

// shared strings
const shared = [];
const ss = entries['xl/sharedStrings.xml'] || '';
for (const m of ss.matchAll(/<si>([\s\S]*?)<\/si>/g)) {
  const texts = [...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((x) => x[1]);
  shared.push(decode(texts.join('')));
}

// workbook sheet names
const wb = entries['xl/workbook.xml'] || '';
const sheetNames = [...wb.matchAll(/<sheet[^>]*name="([^"]+)"[^>]*r:id="(rId\d+)"/g)].map((m) => ({ name: m[1], rid: m[2] }));
const rels = entries['xl/_rels/workbook.xml.rels'] || '';
const ridToTarget = {};
for (const m of rels.matchAll(/<Relationship[^>]*Id="(rId\d+)"[^>]*Target="([^"]+)"/g)) ridToTarget[m[1]] = m[2];

const colToNum = (c) => { let n = 0; for (const ch of c) n = n * 26 + (ch.charCodeAt(0) - 64); return n; };

function dumpSheet(xml) {
  const rows = [];
  for (const rm of xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
    const cells = {};
    let maxCol = 0;
    for (const cm of rm[1].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
      const attrs = cm[1];
      const colRef = (attrs.match(/r="([A-Z]+)\d+"/) || [])[1];
      if (!colRef) continue;
      const col = colToNum(colRef);
      const t = (attrs.match(/t="([^"]*)"/) || [])[1];
      const body = cm[2];
      const vMatch = body.match(/<v>([\s\S]*?)<\/v>/);
      const isMatch = body.match(/<t[^>]*>([\s\S]*?)<\/t>/);
      let val = '';
      if (t === 's' && vMatch) val = shared[Number(vMatch[1])] ?? '';
      else if (t === 'inlineStr' && isMatch) val = decode(isMatch[1]);
      else if (vMatch) val = vMatch[1];
      cells[col] = (val || '').replace(/\s+/g, ' ').trim();
      maxCol = Math.max(maxCol, col);
    }
    const arr = [];
    for (let c = 1; c <= maxCol; c++) arr.push(cells[c] || '');
    rows.push(arr);
  }
  return rows;
}

let out = '';
// Iterate worksheet files directly (robust against rels attribute ordering).
const sheetFiles = Object.keys(entries)
  .filter((k) => /^xl\/worksheets\/sheet\d+\.xml$/.test(k))
  .sort((a, b) => Number(a.match(/(\d+)/)[1]) - Number(b.match(/(\d+)/)[1]));
sheetFiles.forEach((key, idx) => {
  const label = sheetNames[idx] ? sheetNames[idx].name : key;
  out += `\n===== SHEET: ${label} =====\n`;
  const rows = dumpSheet(entries[key] || '');
  rows.forEach((r, i) => { if (r.some((c) => c)) out += `R${i + 1}: ${r.join(' | ')}\n`; });
});
fs.writeFileSync(process.argv[3] || 'xlsx-dump.txt', out, 'utf8');
console.log('Sheets: ' + sheetFiles.join(', '));
console.log('Wrote ' + (out.length) + ' chars');
