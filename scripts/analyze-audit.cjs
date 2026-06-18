const fs = require('node:fs');
const r = JSON.parse(fs.readFileSync('QA/bug-report/audit.json', 'utf8'));
for (const e of r) {
  const lines = [];
  for (const vp of ['desktop', 'mobile']) {
    const d = e[vp].diag;
    if (!d) { lines.push(`  ${vp}: ERROR ${e[vp].error || ''}`); continue; }
    const sig = [];
    if (d.horizontalOverflowPx > 8) sig.push(`overflowX=${d.horizontalOverflowPx}px`);
    if (d.overflowingElements?.length) sig.push(`spill=${d.overflowingElements.length}`);
    if (d.brokenImages?.length) sig.push(`brokenImg=${d.brokenImages.length}`);
    if (d.rawPlaceholders?.length) sig.push(`placeholders=[${d.rawPlaceholders.join(',')}]`);
    if (d.zeroStateMarkers?.length) sig.push(`zeroState=[${d.zeroStateMarkers.join(' | ')}]`);
    if (d.buttonOverlaps?.length) sig.push(`btnOverlap=${d.buttonOverlaps.length}`);
    if (d.h1Count > 1) sig.push(`h1Count=${d.h1Count}`);
    if (d.bodyTextLen < 120) sig.push(`thinContent=${d.bodyTextLen}`);
    lines.push(`  ${vp}: ${sig.length ? sig.join('  ') : 'clean'}`);
  }
  if (e.consoleErrors?.length) lines.push(`  console: ${e.consoleErrors.length} -> ${e.consoleErrors[0]}`);
  console.log(`\n${e.name}  (${e.route})  final=${e.finalUrl?.replace('https://test.alt-pulse.com','')}`);
  console.log(lines.join('\n'));
}
