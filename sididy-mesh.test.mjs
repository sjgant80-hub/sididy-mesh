import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LiveNode, LiveMesh, GATES } from './sididy-mesh.mjs';
import { speaksLight, refract } from '../falllight/light.mjs';
import { CLASS } from '../attractor/attractor.mjs';

test('a LiveNode runs the whole node — dances, stores, and comes up ALIVE (attractor)', async () => {
  const n = new LiveNode({ id: 0, budget: 600 });
  for (let i = 0; i < 80; i++) n.step();
  assert.equal(n.alive, CLASS.ATTRACTOR, 'the node self-classifies as alive');
  assert.ok(n.isLive());
  assert.ok(n.mem.size > 0, 'stable folds are remembered');
  assert.ok(new Set(n.wisp.trail).size >= 9, 'the wisp danced across the rigs');
});

test('the RESOURCE gate halts a starved node (governed, not melted) — spend never exceeds budget', () => {
  const n = new LiveNode({ id: 1, budget: 30 });
  for (let i = 0; i < 200; i++) n.step();
  assert.equal(n.halted, true);
  assert.ok(n.gov.spent <= 30, `spent ${n.gov.spent} ≤ budget 30`);
  assert.equal(n.isLive(), false, 'a halted node is not live');
});

test('the LIVENESS gate marks a naive node as not-live (flatline, not attractor)', () => {
  const n = new LiveNode({ id: 2, strategy: 'naive', budget: 600 });
  for (let i = 0; i < 80; i++) n.step();
  assert.equal(n.alive, CLASS.FLATLINE, 'a stuck node reads as flatline');
  assert.equal(n.isLive(), false);
});

test('a node wears a LIGHT face — it speaks the mesh protocol and absorbs a beam when dead', async () => {
  const live = new LiveNode({ id: 0, budget: 600 });
  for (let i = 0; i < 64; i++) live.step();
  const face = live.light();
  assert.equal(speaksLight(face).ok, true, 'the node speaks LIGHT');
  assert.equal((await refract(face, { photon: 1 })).passed, true, 'a live node passes the beam');
  const dead = new LiveNode({ id: 9, strategy: 'naive', budget: 600 });
  for (let i = 0; i < 64; i++) dead.step();
  assert.equal((await refract(dead.light(), { photon: 1 })).passed, false, 'a dead node absorbs the beam (non-masking)');
});

test('a healthy mesh comes up LIVE — every node alive, bound by LIGHT into one signature', () => {
  const r = new LiveMesh({ nodes: 3, budget: 600 }).run(120);
  assert.equal(r.live, true);
  assert.equal(r.liveCount, 3);
  assert.ok(r.totalStored > 0);
  assert.match(r.bound.hash, /^[0-9a-f]{32}$/, 'the mesh has one entangled signature');
  assert.equal(r.bound.bound, 3, 'three node spectra bound');
});

test('the mesh is HONEST — one dead node and it is not LIVE (never hidden)', () => {
  const mesh = new LiveMesh({ nodes: 3, budget: 600, strategies: ['wisp', 'wisp', 'naive'] });
  const r = mesh.run(120);
  assert.equal(r.live, false, 'a mesh with a dead node is not live');
  assert.equal(r.liveCount, 2, 'exactly the two healthy nodes are live');
});

test('run(n) advances every healthy node exactly n cycles; an empty mesh is never live', () => {
  const m = new LiveMesh({ nodes: 2, budget: 600 });
  m.run(50);
  assert.equal(m.nodes[0].wisp.cycle, 50, 'exactly n steps, not one more or fewer');
  assert.equal(new LiveMesh({ nodes: 0 }).run(5).live, false, 'a mesh with no nodes is not live');
});

test('liveness needs ≥8 points to judge (attractor minPoints) — no verdict before then', () => {
  const n = new LiveNode({ budget: 600 });
  for (let i = 0; i < 7; i++) n.step();
  assert.equal(n.alive, null, '7 points — not enough to classify');
  n.step();
  assert.notEqual(n.alive, null, 'the 8th point — now it classifies');
});

test('spectrum reports the node state; the four gates are named', () => {
  const n = new LiveNode({ id: 4, budget: 600 });
  n.step();
  const s = n.spectrum();
  assert.equal(s.id, 4);
  assert.ok('cycle' in s && 'stored' in s && 'spent' in s && 'alive' in s);
  assert.deepEqual(GATES, ['correctness', 'behaviour', 'liveness', 'resource']);
});
