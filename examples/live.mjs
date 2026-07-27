// ════════════════════════════════════════════════════════════════
// The live gate — is the mesh actually ALIVE, and do the gates honestly catch a dead node?
//   1. A healthy mesh runs LIVE — every node in the attractor band, within budget, entangled by LIGHT.
//   2. The gates bite: a STARVED node (tiny budget) halts (governed, not melted); a NAIVE node dead-orbits
//      (attractor flatline). The mesh reports them as not-live — it never fakes liveness.
// Run:  node examples/live.mjs   (requires the sibling estate organs)
// ════════════════════════════════════════════════════════════════

import { LiveMesh, LiveNode } from '../sididy-mesh.mjs';

console.log('sididy-mesh · LIVE GATE\n');

// 1 · a healthy 3-node mesh
const mesh = new LiveMesh({ nodes: 3, rigs: 12, budget: 600, ceiling: 6 });
const r = mesh.run(200);
console.log('  healthy mesh (3 nodes · 200 cycles):');
for (const s of r.perNode)
  console.log(`    node ${s.id}: ${String(s.alive).toUpperCase().padEnd(10)} stored ${String(s.stored).padStart(3)} · coverage ${s.coverage}/12 · spent ${s.spent}/600`);
console.log(`    → entangled signature ${r.bound.hash}  ·  ${r.liveCount}/${r.nodes} live  ·  ${r.totalStored} folds remembered`);
console.log(`    LIVE: ${r.live ? '✓ yes' : '✗ no'}`);
console.log('');

// 2 · the gates bite — a mesh with one starved node and one naive node
const mixed = new LiveMesh({ nodes: 3, rigs: 12, budget: 600, ceiling: 6, strategies: ['wisp', 'wisp', 'naive'] });
mixed.nodes[1].gov.budget = 40;          // starve node 1 — it should halt (governed), not melt
const r2 = mixed.run(200);
console.log('  gated mesh (healthy · starved · naive):');
for (const s of r2.perNode)
  console.log(`    node ${s.id}: ${String(s.alive).toUpperCase().padEnd(10)} ${s.halted ? 'HALTED (budget)' : 'running'} · stored ${s.stored} · ${mixed.nodes[s.id].isLive() ? 'LIVE' : 'not-live'}`);
console.log(`    → ${r2.liveCount}/${r2.nodes} live · mesh LIVE: ${r2.live ? 'yes' : 'no (honest — a dead node is not hidden)'}`);
console.log('');

const pass = r.live && r.liveCount === 3 && r.totalStored > 0 && !r2.live && r2.liveCount === 1;
console.log(pass
  ? '✓ PASS — the mesh is a LIVE MESH: three complete nodes run together (each a wisp folding into its own\n' +
    '  dodeca-memory, κ-gated, liveness-watched, budget-governed), bound by LIGHT into one entangled signature.\n' +
    '  And the gates are honest — the starved node halts, the naive node flatlines, and the mesh says so.'
  : '✗ the mesh did not come up live cleanly, or the gates did not catch the dead nodes — fix before wiring more.');
