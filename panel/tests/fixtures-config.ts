import { validateConfig } from "../src/config/validate";
import type { TweakConfig } from "../src/config/types";
import { sampleConfig } from "./fixtures";

/** The sample config after validation. */
export function validSample(mutate?: (raw: any) => void): TweakConfig {
  const raw = sampleConfig();
  mutate?.(raw);
  const r = validateConfig(raw);
  if (!r.ok) throw new Error(r.error);
  return r.config;
}
