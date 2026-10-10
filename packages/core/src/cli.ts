#!/usr/bin/env node
import { triageComplaint } from './triage.js';

function formatCLI(): void {
  const args = process.argv.slice(2);
  const input = args[0] || 'lift ma fasai gaya, ek vrudh chhe, 5 minute ma train chhe';

  console.log('\n======================================================');
  console.log(' TransitTriage — Rules-Only Brain (Phase 0 CLI)');
  console.log('======================================================');
  console.log(`Original Text   : "${input}"`);

  const result = triageComplaint(input);

  console.log(`Normalized Text : "${result.normalizedText}"`);
  console.log(`Script Detected : ${result.script}`);
  console.log(`Language Guess  : ${result.lang_guess}`);
  console.log(`Primary Dept    : ${result.primaryDepartment ?? 'none'}`);
  console.log(`All Dept Labels : [${result.departments.join(', ')}]`);
  console.log(`Safety Cost Flag: ${result.flaggedSafetyByCost ? 'YES (flagged)' : 'NO'}`);
  console.log(`Triage Lane     : ${result.lane.toUpperCase()} (${result.laneReason})`);
  console.log(`Negation Flagged: ${result.negationFlagged ? 'YES' : 'NO'}`);
  console.log('------------------------------------------------------');
  console.log(`Urgency Score   : ${result.urgency.score}/100 [Band: ${result.urgency.band.toUpperCase()}]`);
  console.log('Urgency Breakdown:');
  for (const item of result.urgency.breakdown) {
    const sign = item.points >= 0 ? `+${item.points}` : `${item.points}`;
    console.log(`  • [${item.category.toUpperCase().padEnd(8)}] ${sign.padStart(4)} pts : ${item.name} -> ${item.description}`);
  }

  console.log('------------------------------------------------------');
  console.log(`Matched Lexicon Terms (${result.matchedTerms.length}):`);
  if (result.matchedTerms.length === 0) {
    console.log('  (no matched terms)');
  } else {
    for (const match of result.matchedTerms) {
      const dangerTag = match.isDanger ? ` [DANGER FLOOR ${match.dangerFloor}]` : '';
      const negatedTag = match.isNegated ? ' [NEGATED]' : '';
      console.log(
        `  • "${match.matchedText}" -> dept: ${match.department}, subtopic: ${match.subtopic}, offsets: [${match.startIndex}:${match.endIndex}], form: ${match.form}${dangerTag}${negatedTag}`
      );
    }
  }
  console.log('======================================================\n');
}

formatCLI();
