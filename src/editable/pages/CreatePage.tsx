'use client'

import { FormEvent, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, ClipboardList, FileText, ImageIcon, Lock, PlusCircle, Rocket, Send, Shield, Sparkles, Upload, Eye, Award, HelpCircle } from 'lucide-react'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'

type DraftPost = {
  id: string
  task: TaskKey
  title: string
  category: string
  summary: string
  url: string
  image: string
  body: string
  createdAt: string
}

const STORE_KEY = 'slot4:created-posts'

const taskIcon: Record<string, typeof FileText> = {
  article: FileText,
  listing: Sparkles,
  classified: PlusCircle,
  image: ImageIcon,
  profile: Sparkles,
  pdf: FileText,
  sbm: ArrowRight,
}

const fieldClass = 'rounded-2xl border border-[var(--editable-border)] bg-white px-4 py-3 text-sm font-bold text-[var(--editable-page-text,#2f1d16)] outline-none transition placeholder:text-current/35 focus:border-current'

const steps = [
  { icon: Upload, title: 'Draft it', body: 'Pick a content type, drop your title, summary, and body. Attach a hero image or a link if you have one.' },
  { icon: Eye, title: 'We review it', body: 'A human editor checks accuracy, category fit, and formatting. Most posts clear review inside a day.' },
  { icon: Rocket, title: 'It goes live', body: 'Your post lands on the homepage feed, category pages, and every relevant guide. You keep full edit access.' },
]

const benefits = [
  { icon: Award, title: 'Byline and profile', body: 'Every published post carries your name and a link back to a profile you control.' },
  { icon: Shield, title: 'Editorial protection', body: 'We defend fair criticism, protect sources, and never sell your contact details.' },
  { icon: Sparkles, title: 'Amplified reach', body: 'Featured picks land in the weekly digest read by tens of thousands of locals.' },
  { icon: ClipboardList, title: 'Simple tools', body: 'Save drafts, schedule updates, and revise anytime without waiting for support.' },
]

const guidelines = [
  'Write like a person who has actually been there. First-hand detail beats a press release every time.',
  'Include practical facts: hours, price range, neighborhood, and the closest transit stop.',
  'Attribute quotes and photos, and skip anything you did not shoot or write yourself.',
  'No affiliate links, no paid placements, no astroturfing. We spot it and we take it down.',
  'Keep it kind. Fair criticism is welcome; personal attacks are not.',
]

const faqs = [
  { q: 'Who can submit a post?', a: 'Any signed-in member can draft and submit. Featured contributors get a badge after three published posts.' },
  { q: 'How long is review?', a: 'The median review is under 24 hours on weekdays. We message you if anything needs clarifying.' },
  { q: 'Can I edit after publishing?', a: 'Yes. You keep full edit access forever. Major changes trigger a light re-review.' },
  { q: 'Do you pay contributors?', a: 'Regular columns and commissioned features are paid on our standard rate card. One-offs earn a free membership tier.' },
]

const saveDraft = (draft: DraftPost) => {
  try {
    const existing = JSON.parse(window.localStorage.getItem(STORE_KEY) || '[]')
    const list = Array.isArray(existing) ? existing : []
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft, ...list].slice(0, 50)))
  } catch {
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft]))
  }
}

export default function CreatePage() {
  const { session } = useEditableLocalAuthSession()
  const enabledTasks = useMemo(() => SITE_CONFIG.tasks.filter((task) => task.enabled), [])
  const [task, setTask] = useState<TaskKey>((enabledTasks[0]?.key || 'article') as TaskKey)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [summary, setSummary] = useState('')
  const [url, setUrl] = useState('')
  const [image, setImage] = useState('')
  const [body, setBody] = useState('')
  const [created, setCreated] = useState<DraftPost | null>(null)

  const activeTask = enabledTasks.find((item) => item.key === task) || enabledTasks[0]

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const draft: DraftPost = {
      id: `draft-${Date.now()}`,
      task,
      title: title.trim(),
      category: category.trim() || 'uncategorized',
      summary: summary.trim(),
      url: url.trim(),
      image: image.trim(),
      body: body.trim(),
      createdAt: new Date().toISOString(),
    }
    saveDraft(draft)
    setCreated(draft)
    setTitle('')
    setCategory('')
    setSummary('')
    setUrl('')
    setImage('')
    setBody('')
  }

  if (!session) {
    return (
      <EditableSiteShell>
        <main className="min-h-screen bg-[var(--editable-page-bg,#fff7ee)] px-4 py-16 text-[var(--editable-page-text,#2f1d16)] sm:px-6 lg:px-8">
          <section className="mx-auto grid max-w-5xl gap-8 rounded-[2.8rem] border border-[var(--editable-border)] bg-white/75 p-7 shadow-[0_30px_90px_rgba(15,23,42,0.08)] md:grid-cols-[0.9fr_1.1fr] md:p-10">
            <div className="flex h-full min-h-72 items-center justify-center rounded-[2rem] bg-[var(--editable-page-text,#2f1d16)] text-[var(--editable-page-bg,#fff7ee)]">
              <Lock className="h-20 w-20 opacity-80" />
            </div>
            <div className="self-center">
              <p className="text-xs font-black uppercase tracking-[0.28em] opacity-55">{pagesContent.create.locked.badge}</p>
              <h1 className="mt-5 text-5xl font-black leading-[0.92] tracking-[-0.08em] sm:text-7xl">{pagesContent.create.locked.title}</h1>
              <p className="mt-6 max-w-xl text-base font-semibold leading-8 opacity-70">{pagesContent.create.locked.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/login" className="inline-flex items-center gap-2 rounded-full bg-[var(--editable-page-text,#2f1d16)] px-6 py-3 text-sm font-black text-[var(--editable-page-bg,#fff7ee)]">Login <ArrowRight className="h-4 w-4" /></Link>
                <Link href="/signup" className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-white px-6 py-3 text-sm font-black">Sign up</Link>
              </div>
            </div>
          </section>
        </main>
      </EditableSiteShell>
    )
  }

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--editable-page-bg,#fff7ee)] text-[var(--editable-page-text,#2f1d16)]">
        <section className="mx-auto max-w-[var(--editable-container)] px-4 pt-10 sm:px-6 lg:px-8 lg:pt-16">
          <div className="rounded-[2.8rem] border border-[var(--editable-border)] bg-white/75 p-7 shadow-[0_30px_90px_rgba(15,23,42,0.08)] sm:p-10">
            <p className="text-xs font-black uppercase tracking-[0.28em] opacity-55">{pagesContent.create.hero.badge}</p>
            <h1 className="mt-4 max-w-3xl text-5xl font-black leading-[0.92] tracking-[-0.06em] sm:text-6xl">{pagesContent.create.hero.title}</h1>
            <p className="mt-5 max-w-2xl text-base font-semibold leading-8 opacity-70">{pagesContent.create.hero.description}</p>
          </div>
        </section>

        <section className="mx-auto max-w-[var(--editable-container)] px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-black uppercase tracking-[0.24em] opacity-55">How submissions work</p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">Three steps to published.</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-3xl border border-[var(--editable-border)] bg-white p-6">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--editable-page-text,#2f1d16)] text-white text-sm font-black">{index + 1}</span>
                  <step.icon className="h-5 w-5 opacity-60" />
                </div>
                <h3 className="mt-4 text-xl font-black tracking-[-0.03em]">{step.title}</h3>
                <p className="mt-2 text-sm font-semibold leading-7 opacity-70">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[var(--editable-container)] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 rounded-[2.8rem] border border-[var(--editable-border)] bg-white/75 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.08)] backdrop-blur lg:grid-cols-[0.85fr_1.15fr] lg:p-10">
            <aside>
              <p className="text-xs font-black uppercase tracking-[0.28em] opacity-55">Pick a format</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">What are you publishing?</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {enabledTasks.map((item) => {
                  const Icon = taskIcon[item.key] || FileText
                  const active = item.key === task
                  return (
                    <button key={item.key} type="button" onClick={() => setTask(item.key)} className={`rounded-2xl border p-4 text-left transition ${active ? 'border-current bg-[var(--editable-page-text,#2f1d16)] text-[var(--editable-page-bg,#fff7ee)]' : 'border-[var(--editable-border)] bg-white hover:-translate-y-0.5'}`}>
                      <Icon className="h-5 w-5" />
                      <span className="mt-3 block text-sm font-black">{item.label}</span>
                      <span className="mt-1 block text-xs font-semibold opacity-65">{item.description}</span>
                    </button>
                  )
                })}
              </div>
            </aside>

            <form onSubmit={submit} className="rounded-[2.2rem] border border-[var(--editable-border)] bg-[var(--editable-page-bg,#fff7ee)] p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] opacity-50">Create {activeTask?.label || 'post'}</p>
                  <h2 className="mt-1 text-3xl font-black tracking-[-0.06em]">{pagesContent.create.formTitle}</h2>
                </div>
                <span className="rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em]">{session.name}</span>
              </div>

              <div className="mt-6 grid gap-4">
                <input className={fieldClass} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Post title" required />
                <div className="grid gap-4 sm:grid-cols-2">
                  <input className={fieldClass} value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Category" />
                  <input className={fieldClass} value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Website or source URL" />
                </div>
                <input className={fieldClass} value={image} onChange={(event) => setImage(event.target.value)} placeholder="Featured image URL" />
                <textarea className={`${fieldClass} min-h-24`} value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="Short summary" required />
                <textarea className={`${fieldClass} min-h-48`} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Main content, details, notes, or description" required />
              </div>

              {created ? (
                <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                  <p className="flex items-center gap-2 text-sm font-black"><CheckCircle2 className="h-5 w-5" /> {pagesContent.create.successTitle}</p>
                  <p className="mt-1 text-sm font-semibold opacity-80">{created.title}</p>
                </div>
              ) : null}

              <button type="submit" className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--editable-page-text,#2f1d16)] px-6 text-sm font-black uppercase tracking-[0.18em] text-[var(--editable-page-bg,#fff7ee)] transition hover:-translate-y-0.5">
                <Send className="h-4 w-4" /> {pagesContent.create.submitLabel}
              </button>
            </form>
          </div>
        </section>

        <section className="mx-auto max-w-[var(--editable-container)] px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-black uppercase tracking-[0.24em] opacity-55">Why publish here</p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">Benefits contributors keep coming back for.</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="rounded-3xl border border-[var(--editable-border)] bg-white p-6">
                <benefit.icon className="h-6 w-6 text-[var(--editable-page-text,#2f1d16)]" />
                <h3 className="mt-4 text-lg font-black tracking-[-0.02em]">{benefit.title}</h3>
                <p className="mt-2 text-sm font-semibold leading-7 opacity-70">{benefit.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[var(--editable-container)] px-4 pb-14 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-3xl border border-[var(--editable-border)] bg-white p-8">
              <p className="text-xs font-black uppercase tracking-[0.24em] opacity-55">Editorial guidelines</p>
              <h2 className="mt-3 text-2xl font-black tracking-[-0.03em]">The short version.</h2>
              <ul className="mt-6 space-y-3">
                {guidelines.map((rule) => (
                  <li key={rule} className="flex items-start gap-3 text-sm font-semibold leading-7">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-[var(--editable-border)] bg-white p-8">
              <p className="text-xs font-black uppercase tracking-[0.24em] opacity-55"><HelpCircle className="mr-1 inline h-4 w-4" /> Questions</p>
              <h2 className="mt-3 text-2xl font-black tracking-[-0.03em]">Frequently asked.</h2>
              <div className="mt-4 divide-y divide-[var(--editable-border)]">
                {faqs.map((faq) => (
                  <details key={faq.q} className="group py-4 [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-black">
                      {faq.q}
                      <span className="text-lg leading-none transition group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-3 text-sm font-semibold leading-7 opacity-70">{faq.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
