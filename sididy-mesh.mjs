// ════════════════════════════════════════════════════════════════
// sididy-mesh · the wire-up — every organ RUNNING as one live mesh. Not a spec of parts; the parts together.
//
// A LiveNode is a complete si-didy node, actually running:
//   · the WISP     — the loop as movement across its rigs (INIT→BUILD→VERIFY→REMEMBER→EXPLORE, dancing)
//   · REMEMBER     — fall-remember, the dodeca-store, holds the stable folds
//   · VERIFY       — the κ-gate, inside every fold (runaways rejected before they're stored)
//   · LIVENESS     — attractor watches the node's own trajectory: alive (spiral) or dead-orbit/runaway
//   · RESOURCE     — sididy-govern meters the burn and halts at budget (no runaway bill)
//   · a LIGHT face — the node speaks the mesh protocol (lens · filter · spectrum) so nodes compose
//
// A LiveMesh runs N such nodes, binds them by LIGHT (entangled spectra), and reports whether the whole is
// LIVE: every node alive (attractor band), bounded (within budget), connected (entangled). The gates are
// honest — a starved node halts, a dead node flatlines, and the mesh reports it, never fakes it.
//
// This is the integration crown: it imports and RUNS the real estate organs. Requires the siblings
// ../sididy-wisp ../fall-remember ../sididy-govern ../attractor ../falllight. Deterministic.
// ════════════════════════════════════════════════════════════════

import { Wisp } from '../sididy-wisp/sididy-wisp.mjs';
import { FallRemember } from '../fall-remember/fall-remember.mjs';
import { Governor } from '../sididy-govern/sididy-govern.mjs';
import { classify, CLASS } from '../attractor/attractor.mjs';
import { node as lightNode, entangle } from '../falllight/light.mjs';

export const GATES = ['correctness', 'behaviour', 'liveness', 'resource'];

export class LiveNode {
  constructor({ id = 0, rigs = 12, budget = 600, ceiling = 6, strategy = 'wisp', memory } = {}) {
    this.id = id;
    this.mem = memory || new FallRemember();                 // REMEMBER organ
    this.wisp = new Wisp({ rigs, strategy, memory: this.mem }); // the loop as movement (VERIFY inside)
    this.gov = new Governor({ budget, ceiling });            // RESOURCE gate
    this.halted = false;
  }

  // one cycle: the resource gate first (charge the burn), then the wisp dances (VERIFY inside).
  step() {
    const gate = this.gov.charge(1);
    if (!gate.ok) { this.halted = true; return { ok: false, halted: true }; }
    this.wisp.step();
    return { ok: true, cycle: this.wisp.cycle };
  }

  // LIVENESS gate — classify the node's own trajectory on demand (needs attractor's minPoints=8 to judge).
  get alive() {
    return this.wisp.forgeSeries.length >= 8 ? classify(this.wisp.forgeSeries.slice(-40)).class : null;
  }

  isLive() { return !this.halted && this.alive === CLASS.ATTRACTOR; }

  // the LIGHT face — a node the mesh can compose (lens carries a photon + this node's spectrum; the filter
  // passes only while the node is live, so a dead node absorbs the beam — non-masking, honest).
  light() {
    return lightNode(`node:${this.id}`,
      (photon) => ({ ...photon, via: this.id, spectrum: this.spectrum() }),
      () => this.isLive());
  }

  spectrum() {
    return { id: this.id, cycle: this.wisp.cycle, stored: this.mem.size,
      coverage: new Set(this.wisp.trail).size, alive: this.alive, spent: this.gov.spent, halted: this.halted };
  }
}

export class LiveMesh {
  constructor({ nodes = 3, rigs = 12, budget = 600, ceiling = 6, strategies } = {}) {
    this.nodes = Array.from({ length: nodes }, (_, i) =>
      new LiveNode({ id: i, rigs, budget, ceiling, strategy: strategies ? strategies[i] : 'wisp' }));
  }
  step() { for (const n of this.nodes) n.step(); }
  run(cycles) { for (let c = 0; c < cycles; c++) this.step(); return this.report(); }

  bind() { return entangle(...this.nodes.map((n) => n.light())); }   // LIGHT: the mesh's entangled signature
  live() { return this.nodes.length > 0 && this.nodes.every((n) => n.isLive()); }

  report() {
    return {
      nodes: this.nodes.length,
      live: this.live(),
      liveCount: this.nodes.filter((n) => n.isLive()).length,
      bound: this.bind(),
      totalStored: this.nodes.reduce((s, n) => s + n.mem.size, 0),
      perNode: this.nodes.map((n) => n.spectrum()),
    };
  }
}

export default LiveMesh;
