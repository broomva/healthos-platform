// Layer registry — all available layers for symphony-forge

import { autoanyLayer } from "./autoany.js";
import { consciousnessLayer } from "./consciousness.js";
import { controlLayer } from "./control.js";
import { harnessLayer } from "./harness.js";
import { knowledgeLayer } from "./knowledge.js";
import type { Layer } from "./types.js";

export const layers: Record<string, Layer> = {
  control: controlLayer,
  harness: harnessLayer,
  knowledge: knowledgeLayer,
  consciousness: consciousnessLayer,
  autoany: autoanyLayer,
};

/** Get layers in dependency-safe order */
export const getOrderedLayers = (names: string[]): Layer[] => {
  const order = ["control", "harness", "knowledge", "consciousness", "autoany"];
  return order.filter((n) => names.includes(n)).map((n) => layers[n]);
};

export const ALL_LAYER_NAMES = Object.keys(layers);
