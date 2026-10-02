import type { IndexSnapshot } from '../types/site.ts'

/**
 * Documented FreeSERP stats snapshot from 2026-10-02T12:30:12Z.
 * Used only when the live stats request fails. Niche figures are tag counts
 * on the wider index, not the size of the ai_startups slice.
 */
export const DOCUMENTED_INDEX_SNAPSHOT: IndexSnapshot = {
  generatedAt: '2026-10-02T12:30:12+00:00',
  aiStartupTotal: 33570,
  niches: [
    { name: 'AI Agents & Autonomous', count: 10510 },
    { name: 'AI Automation & Workflows', count: 9352 },
    { name: 'Code & Dev Tools', count: 8283 },
    { name: 'AI Infrastructure & API', count: 3099 },
    { name: 'AI Chatbot & Assistant', count: 2848 },
    { name: 'Image Generation', count: 1210 },
    { name: 'Video Generation', count: 984 },
  ],
  source: 'fallback',
}
