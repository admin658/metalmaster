import type { Section } from "./types";

export function sectionForBar(sections: Section[], barNumber1Based: number) {
  return sections.find((s) => barNumber1Based >= s.bars[0] && barNumber1Based <= s.bars[1]) ?? null;
}
