import { filterStateToUrlSearch } from '../api/params.ts'
import { PRIORITY_NICHES } from '../types/site.ts'

const NICHE_COPY: Record<(typeof PRIORITY_NICHES)[number], string> = {
  'AI Agents & Autonomous':
    'Autonomous systems, agentic products, and workflows meant to carry out tasks with limited human intervention.',
  'AI Automation & Workflows':
    'Products that connect models to repeatable work: triggers, pipelines, and tools that run a process.',
  'Code & Dev Tools':
    'Software for writing, reviewing, and shipping code, from editors to developer platforms.',
  'AI Infrastructure & API':
    'Models, APIs, and the infrastructure other AI products call.',
  'AI Chatbot & Assistant':
    'Conversational products and assistants that answer, draft, or guide a person through a task.',
  'Image Generation':
    'Tools for creating or editing images from prompts and other visual inputs.',
  'Video Generation':
    'Tools for generating or editing video, motion, or frame sequences.',
}

export type NicheCopy = {
  name: string
  description: string
}

function isPriorityNiche(name: string): name is (typeof PRIORITY_NICHES)[number] {
  return PRIORITY_NICHES.some((niche) => niche === name)
}

export function nicheDescription(name: string): string {
  if (isPriorityNiche(name)) return NICHE_COPY[name]
  return 'A category assigned by the FreeSERP AI classification. This text describes the category, not a specific company.'
}

export function nicheExplorePath(name: string): string {
  const search = filterStateToUrlSearch({
    query: '',
    niche: name,
    domainRatingMin: null,
    confirmedLiveAfter: null,
    sort: 'discovered',
    page: 1,
  })
  return search === '' ? '/explore' : `/explore?${search}`
}

export const START_PATHS = [
  {
    kicker: 'Build',
    name: 'Code & Dev Tools',
    note: 'A place to begin if you are looking for software around writing and shipping code.',
  },
  {
    kicker: 'Automate',
    name: 'AI Automation & Workflows',
    note: 'A place to begin if you are looking for products that run a process.',
  },
  {
    kicker: 'Discover',
    name: 'AI Agents & Autonomous',
    note: 'A place to begin if you are looking for agentic and autonomous products.',
  },
] as const
