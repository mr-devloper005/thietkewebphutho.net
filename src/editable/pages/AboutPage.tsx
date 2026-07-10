import Link from 'next/link'
import { ArrowRight, Award, Compass, Handshake, Heart, Leaf, MapPin, Sparkles, Star } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'

const values = [
  { icon: Heart, title: 'People before pageviews', body: 'Every editorial and directory decision is measured against whether it helps a real person find a real thing nearby.' },
  { icon: Handshake, title: 'Fair to small operators', body: 'Independent shops publish for free. Featured slots are earned by community signals, never by paid placement.' },
  { icon: Leaf, title: 'Quiet by design', body: 'No pop-ups, no auto-playing video, no trackers. The interface should feel like a well-lit reading room.' },
  { icon: Compass, title: 'Local-first coverage', body: 'We add a city only after we have a real curator on the ground. Depth beats a map full of thin listings.' },
  { icon: Award, title: 'Verified, not vibes', body: 'Hours, addresses, and menus are re-verified on a rolling calendar so guides stay useful, not decorative.' },
  { icon: Sparkles, title: 'Editorial voice', body: 'Long-form guides read like a friend with a favorite table, not a scraped aggregator or a marketing brochure.' },
]

const timeline = [
  { year: '2019', title: 'A shared spreadsheet', body: 'Two neighbors started a public list of family-run shops worth walking to. It filled up in a week.' },
  { year: '2021', title: 'The first city guide', body: 'A hundred contributors joined to write, photograph, and verify entries across three districts.' },
  { year: '2023', title: 'Directory launches', body: 'We opened a free profile portal so owners could claim, update, and reply to comments themselves.' },
  { year: '2025', title: 'Editorial newsletter', body: 'A weekly dispatch tuned to your neighborhood reached fifty thousand subscribers, entirely by word of mouth.' },
  { year: '2026', title: 'Community boards', body: 'Members now curate public boards, follow makers, and coordinate meetups across thirty two cities.' },
]

const stats = [
  { value: '32', label: 'Cities covered' },
  { value: '3,200+', label: 'Verified listings' },
  { value: '890', label: 'Volunteer curators' },
  { value: '42K', label: 'Active members' },
]

const press = ['The Local Post', 'City Signals', 'Neighborhood Weekly', 'Slow Media', 'Radio Kitchen', 'Type & Trade']

export default function AboutPage() {
  return (
    <EditableSiteShell>
      <main className="bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className="mx-auto max-w-[var(--editable-container)] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--slot4-accent)]">{pagesContent.about.badge}</p>
              <h1 className="editable-display mt-5 text-5xl font-extrabold tracking-[-0.02em] sm:text-6xl lg:text-7xl">About {SITE_CONFIG.name}</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--slot4-muted-text)]">{pagesContent.about.description}</p>
            </div>
            <div className="rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--slot4-accent)]">Our promise</p>
              <p className="mt-3 text-base leading-7">A directory and reading room for the places that make a neighborhood feel like home. Written by people who live there, kept honest by the people who visit.</p>
            </div>
          </div>
        </section>

        <section className="border-y border-[var(--editable-border)] bg-[var(--slot4-panel-bg)]">
          <div className="mx-auto max-w-[var(--editable-container)] px-4 py-14 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--slot4-accent)]">Mission</p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl">Make the good stuff easier to find.</h2>
              </div>
              <div className="space-y-4 text-base leading-8 text-[var(--slot4-muted-text)]">
                {pagesContent.about.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                <p>We treat the local internet like a public utility. Every listing is a small commitment to a neighbor; every guide is a favor to a stranger who is about to spend an afternoon nearby.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[var(--editable-container)] px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--slot4-accent)]">The story</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl">How we got here.</h2>
            </div>
          </div>
          <ol className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
            {timeline.map((item, index) => (
              <li key={item.year} className="rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-6">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--slot4-accent)]">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-[10px]">{index + 1}</span>
                  {item.year}
                </div>
                <h3 className="mt-3 text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{item.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="bg-[var(--slot4-panel-bg)]">
          <div className="mx-auto max-w-[var(--editable-container)] px-4 py-16 sm:px-6 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--slot4-accent)]">What we value</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl">Six ideas we return to.</h2>
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {values.map((value) => (
                <div key={value.title} className="rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-6">
                  <value.icon className="h-6 w-6 text-[var(--slot4-accent)]" />
                  <h3 className="mt-4 text-lg font-bold">{value.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--slot4-muted-text)]">{value.body}</p>
                </div>
              ))}
              {pagesContent.about.values.map((value) => (
                <div key={value.title} className="rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-6">
                  <Sparkles className="h-6 w-6 text-[var(--slot4-accent)]" />
                  <h3 className="mt-4 text-lg font-bold">{value.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--slot4-muted-text)]">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

       

        <section className="bg-[var(--slot4-dark-bg)] text-[var(--slot4-dark-text)]">
          <div className="mx-auto max-w-[var(--editable-container)] px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-5xl font-extrabold tracking-[-0.02em] text-[#8db3ff]">{stat.value}</div>
                  <div className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[var(--editable-container)] px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--slot4-accent)]">As mentioned in</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4 text-lg font-semibold text-[var(--slot4-muted-text)]">
            {press.map((name) => (
              <span key={name} className="inline-flex items-center gap-2">
                <Star className="h-4 w-4" /> {name}
              </span>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[var(--editable-container)] px-4 pb-20 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start gap-6 rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold tracking-[-0.02em] sm:text-3xl">Join the crew.</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--slot4-muted-text)]">Whether you write, take pictures, run a shop, or just love your street, there is a place for you here.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] px-5 py-3 text-sm font-bold text-[var(--slot4-on-accent)]">Create an account <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-5 py-3 text-sm font-bold"><MapPin className="h-4 w-4" /> Talk to us</Link>
            </div>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
