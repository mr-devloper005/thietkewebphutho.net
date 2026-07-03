import type { CSSProperties } from 'react'
import type { TaskKey } from '@/lib/site-config'

export type TaskTheme = {
  kicker: string
  note: string
  dark: boolean
  fontDisplay: string
  fontBody: string
  bg: string
  surface: string
  raised: string
  text: string
  muted: string
  line: string
  accent: string
  accentSoft: string
  onAccent: string
  glow: string
  radius: string
}

const base = {
  dark: false,
  fontDisplay: "'Inter', system-ui, sans-serif",
  fontBody: "'Inter', system-ui, sans-serif",
  bg: '#ffffff',
  surface: '#ffffff',
  raised: '#f4f8ff',
  text: '#333334',
  muted: '#5f5e5e',
  line: '#e5e5e5',
  accent: '#0e54f1',
  accentSoft: '#eaf1fe',
  onAccent: '#ffffff',
  glow: 'rgba(14,84,241,0.10)',
  radius: '0.5rem',
} satisfies Omit<TaskTheme, 'kicker' | 'note'>

export const taskThemes: Record<TaskKey, TaskTheme> = {
  article: { ...base, kicker: 'Field Notes', note: 'Useful reporting and practical ideas from across the platform.' },
  listing: { ...base, kicker: 'Places', note: 'Discover trusted local teams, services, and destinations.' },
  classified: { ...base, kicker: 'Marketplace', note: 'Timely offers and opportunities worth a closer look.' },
  image: { ...base, kicker: 'Visual Stories', note: 'Image-led perspectives from the people and places around us.' },
  sbm: { ...base, kicker: 'Saved Finds', note: 'A considered collection of useful links and resources.' },
  pdf: { ...base, kicker: 'Guides & Reports', note: 'Research, handbooks, and useful references ready to explore.' },
  profile: { ...base, kicker: 'People', note: 'Meet the contributors and organizations behind the work.' },
}

export function getTaskTheme(task: TaskKey): TaskTheme {
  return taskThemes[task] || taskThemes.article
}

export function taskThemeStyle(task: TaskKey): CSSProperties {
  const t = getTaskTheme(task)
  return {
    '--tk-bg': t.bg,
    '--tk-surface': t.surface,
    '--tk-raised': t.raised,
    '--tk-text': t.text,
    '--tk-muted': t.muted,
    '--tk-line': t.line,
    '--tk-accent': t.accent,
    '--tk-accent-soft': t.accentSoft,
    '--tk-on-accent': t.onAccent,
    '--tk-glow': t.glow,
    '--tk-radius': t.radius,
    '--slot4-accent': t.accent,
    '--slot4-accent-fill': t.accent,
    '--editable-font-display': t.fontDisplay,
    '--editable-font-body': t.fontBody,
    fontFamily: t.fontBody,
  } as CSSProperties
}
