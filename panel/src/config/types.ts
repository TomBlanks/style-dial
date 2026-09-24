// Config schema — spec §5.2.

export const GROUPS = ["Typography", "Spacing", "Layout", "Colour"] as const;
export type Group = (typeof GROUPS)[number];

export const ROLES = [
  "body-size", "h1-size", "h2-size", "h3-size", "small-size",
  "body-line-height", "heading-line-height",
  "measure", "section-spacing", "element-gap", "radius",
  "body-text", "muted-text", "background", "surface",
  "accent", "accent-text",
] as const;
export type Role = (typeof ROLES)[number];

export const UNITS = ["px", "rem", "ch"] as const;
export type Unit = (typeof UNITS)[number];

export const FRAMEWORKS = ["html", "react-vite", "nextjs"] as const;
export type Framework = (typeof FRAMEWORKS)[number];

interface BaseToken {
  var: string;
  label: string;
  group: Group;
  role?: Role;
}

export interface SizeToken extends BaseToken {
  type: "size";
  unit: Unit;
  default: number;
  min: number;
  max: number;
  step: number;
}

export interface NumberToken extends BaseToken {
  type: "number";
  default: number;
  min: number;
  max: number;
  step: number;
}

export interface ColorToken extends BaseToken {
  type: "color";
  default: string;
}

export type Token = SizeToken | NumberToken | ColorToken;
export type RangeToken = SizeToken | NumberToken;

export interface FontSpec {
  family: string;
  fallback: string;
  source: "google" | "system";
  weights?: number[];
}

export interface FontPair {
  id: string;
  name: string;
  heading: FontSpec;
  body: FontSpec;
}

export interface FontControl {
  headingVar: "--font-heading";
  bodyVar: "--font-body";
  default: string;
  options: FontPair[];
}

export interface Suggestion {
  id: string;
  title: string;
  reason: string;
  changes: Record<string, number | string>;
  fontPair?: string;
}

export interface TweakConfig {
  version: 1;
  id: string;
  framework: Framework;
  tailwind: boolean;
  tokensFile: string;
  tokens: Token[];
  /** Absent when the config has no usable font control. */
  fonts?: FontControl;
  suggestions: Suggestion[];
}
