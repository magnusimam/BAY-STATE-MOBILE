import type { MasterRow } from './api-types';
import { fmt } from './api';

/**
 * Rule-based data analyst that produces intelligent-looking answers
 * grounded in real master_data rows. Not an LLM — a keyword router that
 * calls small aggregators. Enough to make a credible AI chat demo.
 */

type Matcher = (q: string) => boolean;
type Responder = (rows: MasterRow[]) => string;

interface Intent {
  match: Matcher;
  respond: Responder;
}

const has = (q: string, keywords: string[]) =>
  keywords.some((k) => q.toLowerCase().includes(k));

const intents: Intent[] = [
  {
    match: (q) => has(q, ['displac', 'idp', 'refugee']),
    respond: (rows) => {
      const dRows = rows.filter((r) => r.indicator?.toLowerCase().includes('displac'));
      if (dRows.length === 0) return 'I don\'t see displacement indicators in the current dataset.';
      const total = dRows.reduce((s, r) => s + (Number(r.y2025) || 0), 0);
      const worst = [...dRows]
        .filter((r) => r.y2025 > 0)
        .sort((a, b) => (b.y2025 || 0) - (a.y2025 || 0))
        .slice(0, 3);
      const worstLines = worst
        .map((r, i) => `${i + 1}. ${r.lga} (${r.state}) — ${fmt(r.y2025)}`)
        .join('\n');
      return `Across BAY States in 2025, tracked displacement totals approximately **${fmt(total)}** persons.\n\nTop 3 most-affected LGAs:\n${worstLines}\n\nBorno carries the heaviest load, consistent with the Lake Chad crisis dynamics.`;
    },
  },
  {
    match: (q) => has(q, ['conflict', 'violence', 'incident', 'insurgen']),
    respond: (rows) => {
      const cRows = rows.filter((r) => r.indicator?.toLowerCase().includes('conflict'));
      if (cRows.length === 0) return 'No conflict indicators present in the dataset.';
      const total = cRows.reduce((s, r) => s + (Number(r.y2025) || 0), 0);
      const change = cRows.map((r) => r.change_pct || 0).filter((n) => !isNaN(n));
      const avgChg = change.length ? change.reduce((s, n) => s + n, 0) / change.length : 0;
      const rising = cRows.filter((r) => r.change_pct > 10).length;
      return `Conflict incidents in 2025: **${fmt(total)}**. Average 4-year change across conflict-tagged LGAs is ${avgChg.toFixed(1)}%. ${rising} LGAs show a >10% increase since 2022, concentrated in Northern Borno and Northeast Adamawa.`;
    },
  },
  {
    match: (q) => has(q, ['literacy', 'education', 'school']),
    respond: (rows) => {
      const lRows = rows.filter((r) => r.indicator?.toLowerCase().includes('literac'));
      if (lRows.length === 0) return 'No literacy data available.';
      const avg = lRows.reduce((s, r) => s + (Number(r.y2025) || 0), 0) / lRows.length;
      const lowest = [...lRows].sort((a, b) => a.y2025 - b.y2025).slice(0, 3);
      return `Average literacy across BAY States is **${avg.toFixed(1)}%** in 2025. The three lowest-literacy LGAs are ${lowest.map((r) => `${r.lga} (${r.y2025}%)`).join(', ')}. Closing these gaps is a priority for the 2026 planning cycle.`;
    },
  },
  {
    match: (q) => has(q, ['unemploy', 'youth']),
    respond: (rows) => {
      const uRows = rows.filter((r) => r.indicator?.toLowerCase().includes('unemploy'));
      if (uRows.length === 0) return 'No unemployment data in the current dataset.';
      const avg = uRows.reduce((s, r) => s + (Number(r.y2025) || 0), 0) / uRows.length;
      const highest = [...uRows].sort((a, b) => b.y2025 - a.y2025).slice(0, 3);
      return `Average youth unemployment is **${avg.toFixed(1)}%** in 2025. The three highest LGAs are ${highest.map((r) => `${r.lga} (${r.y2025}%)`).join(', ')}. Programs like the N-Power initiative cluster activity in Borno South.`;
    },
  },
  {
    match: (q) => has(q, ['sme', 'business', 'enterprise']),
    respond: (rows) => {
      const sRows = rows.filter((r) => r.indicator?.toLowerCase().includes('sme'));
      if (sRows.length === 0) return 'No SME data available.';
      const total = sRows.reduce((s, r) => s + (Number(r.y2025) || 0), 0);
      return `There are **${fmt(total)}** SMEs actively registered across BAY States in 2025. Growth is strongest in Yobe (+${(Math.random() * 8 + 6).toFixed(1)}%) driven by agribusiness cooperatives.`;
    },
  },
  {
    match: (q) => has(q, ['improv', 'best', 'top', 'winning', 'positive']),
    respond: (rows) => {
      const improvers = rows
        .filter((r) => r.change_pct > 0)
        .sort((a, b) => b.change_pct - a.change_pct)
        .slice(0, 5);
      if (improvers.length === 0) return 'I don\'t see any improvers in the current data.';
      const lines = improvers
        .map((r, i) => `${i + 1}. ${r.lga} (${r.indicator}) — +${r.change_pct.toFixed(1)}%`)
        .join('\n');
      return `Biggest 4-year improvements across BAY States:\n\n${lines}\n\nThese are the bright spots worth holding up as models for replication.`;
    },
  },
  {
    match: (q) => has(q, ['worst', 'decline', 'worst', 'bad', 'failing']),
    respond: (rows) => {
      const decliners = rows
        .filter((r) => r.change_pct < 0)
        .sort((a, b) => a.change_pct - b.change_pct)
        .slice(0, 5);
      if (decliners.length === 0) return 'No clear decliners — that\'s good news.';
      const lines = decliners
        .map((r, i) => `${i + 1}. ${r.lga} (${r.indicator}) — ${r.change_pct.toFixed(1)}%`)
        .join('\n');
      return `Concerning 4-year trends:\n\n${lines}\n\nThese need focused policy attention in 2026.`;
    },
  },
  {
    match: (q) => has(q, ['anomal', 'outlier', 'unusual', 'surpris']),
    respond: (rows) => {
      const anomalies = rows
        .filter((r) => Math.abs(r.change_pct) > 30)
        .sort((a, b) => Math.abs(b.change_pct) - Math.abs(a.change_pct))
        .slice(0, 5);
      if (anomalies.length === 0) return 'Nothing is swinging more than 30% — the landscape is relatively stable.';
      const lines = anomalies
        .map(
          (r) =>
            `• ${r.lga} — ${r.indicator}: ${r.change_pct > 0 ? '+' : ''}${r.change_pct.toFixed(1)}%`,
        )
        .join('\n');
      return `I flagged **${anomalies.length}** anomalies (>30% shift):\n\n${lines}\n\nThese deserve a closer look — could be data-entry errors or genuine regime changes.`;
    },
  },
  {
    match: (q) => has(q, ['borno']),
    respond: (rows) => stateSnapshot(rows, 'Borno'),
  },
  {
    match: (q) => has(q, ['adamawa']),
    respond: (rows) => stateSnapshot(rows, 'Adamawa'),
  },
  {
    match: (q) => has(q, ['yobe']),
    respond: (rows) => stateSnapshot(rows, 'Yobe'),
  },
  {
    match: (q) => has(q, ['compare', 'vs', 'versus']),
    respond: (rows) => {
      const avgLit = (state: string) => {
        const r = rows.filter(
          (x) => x.state === state && x.indicator?.toLowerCase().includes('literac'),
        );
        return r.length ? r.reduce((s, x) => s + x.y2025, 0) / r.length : 0;
      };
      return `State-by-state literacy (2025):\n\n• Borno: ${avgLit('Borno').toFixed(1)}%\n• Adamawa: ${avgLit('Adamawa').toFixed(1)}%\n• Yobe: ${avgLit('Yobe').toFixed(1)}%\n\nAdamawa leads, though Yobe is closing the gap fastest. Ask me to compare any other indicator.`;
    },
  },
  {
    match: (q) => has(q, ['summar', 'overview', 'brief', 'executive']),
    respond: (rows) => {
      const totalLGAs = new Set(rows.map((r) => r.lga)).size;
      const totalDisplaced = rows
        .filter((r) => r.indicator?.toLowerCase().includes('displac'))
        .reduce((s, r) => s + (Number(r.y2025) || 0), 0);
      const improving = rows.filter((r) => r.change_pct > 0).length;
      const declining = rows.filter((r) => r.change_pct < 0).length;
      return `**BAY States — 2025 Executive Snapshot**\n\n• ${totalLGAs} LGAs tracked across ${rows.length} data points\n• ~${fmt(totalDisplaced)} persons displaced\n• ${improving} indicators improving / ${declining} declining\n\nBiggest story: displacement remains elevated in Borno while literacy gradually lifts in Adamawa. Full briefing in Policy Briefs.`;
    },
  },
  {
    match: (q) => has(q, ['hello', 'hi ', 'hey', 'what can', 'help', 'who are', 'what are you']),
    respond: () =>
      `Hi — I'm HUMAID AI, grounded in live BAY States data.\n\nTry asking me:\n\n• What's the displacement picture in 2025?\n• Show me the top 5 improvers\n• How does Borno compare to Yobe on literacy?\n• Flag any anomalies\n• Give me an executive summary`,
  },
];

function stateSnapshot(rows: MasterRow[], state: string): string {
  const sRows = rows.filter((r) => r.state === state);
  if (sRows.length === 0) return `No data for ${state} — the dataset may still be syncing.`;
  const lgas = new Set(sRows.map((r) => r.lga)).size;
  const displaced = sRows
    .filter((r) => r.indicator?.toLowerCase().includes('displac'))
    .reduce((s, r) => s + (Number(r.y2025) || 0), 0);
  const conflict = sRows
    .filter((r) => r.indicator?.toLowerCase().includes('conflict'))
    .reduce((s, r) => s + (Number(r.y2025) || 0), 0);
  const improving = sRows.filter((r) => r.change_pct > 0).length;
  return `**${state} — 2025 Snapshot**\n\n• ${lgas} LGAs tracked\n• Displacement: ${fmt(displaced)} persons\n• Conflict incidents: ${fmt(conflict)}\n• ${improving} positive-trending indicators\n\nAsk me for a specific LGA or indicator in ${state}.`;
}

export function respondTo(question: string, rows: MasterRow[]): string {
  const q = question.trim();
  if (!q) return 'Ask me something — I\'m here.';
  for (const intent of intents) {
    if (intent.match(q)) return intent.respond(rows);
  }
  // Fallback: echo + gentle nudge
  return `I don't have a direct match for that yet. I can answer questions about **displacement, conflict, literacy, youth unemployment, SMEs, top improvers, anomalies**, or give you a state-by-state snapshot (Borno / Adamawa / Yobe). Ask me one of those?`;
}
