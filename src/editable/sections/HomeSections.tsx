import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Building2,
  CheckCircle2,
  Compass,
  FileText,
  Flame,
  Globe2,
  Layers,
  Newspaper,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import {
  EditorialFeatureCard,
  RailPostCard,
  getEditablePostImage,
  postHref,
} from '@/editable/cards/PostCards'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { taskThemes } from '@/editable/theme/task-themes'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

function dedupePosts(posts: SitePost[]) {
  return Array.from(new Map(posts.map((post) => [post.slug || post.id || post.title, post])).values())
}

function poolOf(posts: SitePost[], timeSections: HomeTimeSection[]) {
  return dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
}

const taskIcon = (key: TaskKey) => {
  switch (key) {
    case 'listing':
      return Building2
    case 'pdf':
      return BookOpen
    case 'article':
      return Newspaper
    case 'image':
      return Sparkles
    case 'profile':
      return Users
    case 'classified':
      return TrendingUp
    case 'sbm':
      return Layers
    default:
      return BarChart3
  }
}


/* ------------------------------------------------------------------ */
/* HERO                                                                */
/* ------------------------------------------------------------------ */

export function EditableHomeHero({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = poolOf(posts, timeSections)
  const featured = pool[0]
  const supporting = pool.slice(1, 4)
  const enabledTasks = SITE_CONFIG.tasks.filter((task) => task.enabled)
  const marqueeChips = [...enabledTasks, ...enabledTasks]

  return (
    <section className="bg-white px-3 pb-3 pt-3 sm:px-5 sm:pb-5">
      <div className="relative mx-auto min-h-[720px] max-w-[1860px] overflow-hidden rounded-lg bg-[var(--slot4-dark-bg)] text-white">
        {featured ? (
          <img
            src={getEditablePostImage(featured)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-25"
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(10,10,10,0.98)_0%,rgba(10,10,10,0.86)_45%,rgba(14,84,241,0.35)_100%)]" />
        <div className="pointer-events-none absolute -right-24 top-1/4 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(68,199,246,0.35),transparent_70%)] blur-2xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(14,84,241,0.35),transparent_70%)] blur-2xl" />

        <div className={`${dc.shell.section} relative grid min-h-[720px] items-center gap-14 py-20 lg:grid-cols-[1.05fr_0.95fr]`}>
          <EditableReveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[#8db3ff] backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Local knowledge, organized
            </span>
            <h1 className={`mt-6 max-w-4xl ${dc.type.heroTitle}`}>
              Find the right place. <span className="text-[#8db3ff]">Read</span> the guide. Make a{' '}
              <em className="not-italic underline decoration-[#44c7f6] decoration-4 underline-offset-[10px]">better</em> decision.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/72 sm:text-lg">
              Explore trusted Vietnamese local places alongside practical guides, field reports, and
              first-hand notes, all in one focused discovery platform built for real questions.
            </p>

            <form
              action="/search"
              className="mt-8 flex max-w-3xl flex-col gap-2 rounded-md bg-white p-2 shadow-[0_30px_90px_rgba(14,84,241,0.35)] md:flex-row"
            >
              <label className="flex min-w-0 flex-1 items-center gap-3 px-4">
                <Search className="h-5 w-5 shrink-0 text-[var(--slot4-accent)]" />
                <input
                  name="q"
                  placeholder="Search places, guides, topics"
                  className="h-12 min-w-0 flex-1 bg-transparent text-sm text-[var(--slot4-page-text)] outline-none"
                />
              </label>

              <label className="flex items-center gap-2 border-t border-[var(--editable-border)] px-4 md:border-l md:border-t-0">
                <Layers className="h-4 w-4 text-[var(--slot4-accent)]" />
                <select
                  name="category"
                  defaultValue="all"
                  className="h-12 bg-transparent pr-2 text-sm text-[var(--slot4-page-text)] outline-none"
                >
                  <option value="all">All categories</option>
                  {enabledTasks.map((task) => (
                    <option key={task.key} value={task.key}>
                      {taskThemes[task.key].kicker}
                    </option>
                  ))}
                </select>
              </label>
              <button className={`${dc.button.primary} h-12 shrink-0`}>
                Search library <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/70">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#8db3ff]" /> Clear local details
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#8db3ff]" /> Practical references
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#8db3ff]" /> Free to browse
              </span>
              <Link href={primaryRoute} className="inline-flex items-center gap-2 font-medium text-white">
                Explore latest <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Floating stat pills */}
            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
              <div className="rounded-md border border-white/15 bg-white/5 p-4 backdrop-blur">
                <p className="text-2xl font-semibold text-white">12k+</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-white/60">Places indexed</p>
              </div>
              <div className="rounded-md border border-white/15 bg-white/5 p-4 backdrop-blur">
                <p className="text-2xl font-semibold text-white">3.8k</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-white/60">Guides &amp; reports</p>
              </div>
              <div className="rounded-md border border-white/15 bg-white/5 p-4 backdrop-blur">
                <p className="text-2xl font-semibold text-white">63 cities</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-white/60">Coverage</p>
              </div>
            </div>
          </EditableReveal>

          {/* Right column: featured mosaic */}
          <div className="relative hidden gap-4 lg:grid">
            {featured ? (
              <EditableReveal index={0}>
                <Link
                  href={postHref(primaryTask, featured, primaryRoute)}
                  className="group relative block overflow-hidden rounded-lg border border-white/15 bg-white/10 backdrop-blur"
                >
                  <div className="relative aspect-[16/11] overflow-hidden">
                    <img
                      src={getEditablePostImage(featured)}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(10,10,10,0.9))]" />
                    <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                      <Flame className="h-3 w-3" /> Editor's lead
                    </span>
                    <div className="absolute inset-x-4 bottom-4">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-[#8db3ff]">
                        {taskThemes[primaryTask].kicker}
                      </p>
                      <h3 className="mt-2 line-clamp-2 text-2xl font-semibold leading-snug text-white">
                        {featured.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              </EditableReveal>
            ) : null}

            <div className="grid grid-cols-2 gap-4">
              {supporting.map((post, index) => (
                <EditableReveal key={post.id || post.slug} index={index + 1}>
                  <Link
                    href={postHref(primaryTask, post, primaryRoute)}
                    className="group flex h-full flex-col overflow-hidden rounded-md border border-white/15 bg-white/10 p-3 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:bg-white/15"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden rounded-sm">
                      <img
                        src={getEditablePostImage(post)}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]"
                      />
                    </div>
                    <div className="p-2">
                      <p className="text-[10px] uppercase tracking-wider text-[#8db3ff]">
                        Featured {String(index + 1).padStart(2, '0')}
                      </p>
                      <h4 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-white">
                        {post.title}
                      </h4>
                    </div>
                  </Link>
                </EditableReveal>
              ))}
            </div>
          </div>
        </div>

        {/* Marquee of category chips */}
        <div className="relative border-t border-white/10 bg-black/40 py-4">
          <div className="flex gap-3 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
            <div className="flex shrink-0 animate-[marquee_38s_linear_infinite] gap-3 pr-3">
              {marqueeChips.map((task, i) => {
                const Icon = taskIcon(task.key)
                return (
                  <Link
                    key={`${task.key}-${i}`}
                    href={task.route}
                    className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur transition hover:border-[#8db3ff] hover:text-white"
                  >
                    <Icon className="h-3.5 w-3.5 text-[#8db3ff]" />
                    {taskThemes[task.key].kicker}
                  </Link>
                )
              })}
            </div>
          </div>
          <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* STATS BAND                                                          */
/* ------------------------------------------------------------------ */

export function EditableStatsBand(_: HomeSectionProps) {
  const stats = [
    { icon: Building2, value: '12,480+', label: 'Local places indexed', tint: 'text-[#0e54f1]' },
    { icon: BookOpen, value: '3,820', label: 'Guides & PDF reports', tint: 'text-[#0e54f1]' },
    { icon: Users, value: '260k', label: 'Monthly readers', tint: 'text-[#0e54f1]' },
    { icon: Globe2, value: '63/63', label: 'Provinces covered', tint: 'text-[#0e54f1]' },
  ]
  return (
    <section className="bg-white">
      <div className={`${dc.shell.section} py-14 sm:py-16`}>
        <EditableReveal className="mx-auto max-w-3xl text-center">
          <p className={dc.type.eyebrow}>Trusted at scale</p>
          <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
            A working library the Vietnamese web keeps coming back to.
          </h2>
        </EditableReveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <EditableReveal key={stat.label} index={i}>
                <div className={`${dc.surface.soft} flex items-center gap-4 p-6`}>
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-white shadow-sm">
                    <Icon className={`h-6 w-6 ${stat.tint}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold leading-none">{stat.value}</p>
                    <p className="mt-2 text-xs uppercase tracking-wider text-[var(--slot4-muted-text)]">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </EditableReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* STORY RAIL — reimagined as icon-tab bento                           */
/* ------------------------------------------------------------------ */

export function EditableStoryRail({ primaryRoute }: HomeSectionProps) {
  const categories = SITE_CONFIG.tasks.filter((task) => task.enabled)
  const [lead, ...rest] = categories
  return (
    <section className={dc.shell.sectionY}>
      <div className={dc.shell.section}>
        <EditableReveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className={dc.type.eyebrow}>Explore the platform</p>
            <h2 className={`mt-4 ${dc.type.sectionTitle}`}>
              One search, several ways to find something useful.
            </h2>
            <p className="mt-5 text-[var(--slot4-muted-text)]">
              Move from local discovery to deeper reading without losing context. Pick a lane below or
              browse everything in the primary index.
            </p>
          </div>
          <Link href={primaryRoute} className={dc.button.secondary}>
            Browse everything <ArrowRight className="h-4 w-4" />
          </Link>
        </EditableReveal>

        {/* Bento grid */}
        <div className="mt-12 grid gap-4 lg:grid-cols-4 lg:grid-rows-2">
          {lead ? (
            (() => {
              const LeadIcon = taskIcon(lead.key)
              return (
                <EditableReveal className="lg:col-span-2 lg:row-span-2">
                  <Link
                    href={lead.route}
                    className="group relative flex h-full flex-col justify-between overflow-hidden rounded-lg bg-[var(--slot4-dark-bg)] p-8 text-white transition duration-300 hover:-translate-y-0.5"
                  >
                    <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(68,199,246,0.35),transparent_70%)] blur-2xl" />
                    <div>
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-wider text-[#8db3ff]">
                        Primary lane
                      </span>
                      <LeadIcon className="mt-8 h-10 w-10 text-[#8db3ff]" />
                      <h3 className="mt-8 text-3xl font-semibold sm:text-4xl">
                        {taskThemes[lead.key].kicker}
                      </h3>
                      <p className="mt-4 max-w-md text-white/70">{taskThemes[lead.key].note}</p>
                    </div>
                    <div className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-white">
                      Open {taskThemes[lead.key].kicker} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </div>
                  </Link>
                </EditableReveal>
              )
            })()
          ) : null}

          {rest.slice(0, 6).map((task, index) => {
            const Icon = taskIcon(task.key)
            return (
              <EditableReveal key={task.key} index={index}>
                <Link
                  href={task.route}
                  className={`group flex h-full flex-col justify-between ${dc.surface.soft} p-6 ${dc.motion.lift}`}
                >
                  <div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-md bg-white shadow-sm">
                      <Icon className="h-5 w-5 text-[var(--slot4-accent)]" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold">{taskThemes[task.key].kicker}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--slot4-muted-text)] line-clamp-3">
                      {taskThemes[task.key].note}
                    </p>
                  </div>
                  <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[var(--slot4-accent)]">
                    Explore <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              </EditableReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* MAGAZINE SPLIT — editorial 3-column                                 */
/* ------------------------------------------------------------------ */

export function EditableMagazineSplit({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = poolOf(posts, timeSections)
  if (!pool.length) return null
  const lead = pool[0]
  const secondary = pool.slice(1, 3)
  const columnList = pool.slice(3, 8)

  return (
    <section className="bg-[var(--slot4-panel-bg)]">
      <div className={`${dc.shell.section} ${dc.shell.sectionY}`}>
        <EditableReveal className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={dc.type.eyebrow}>Curated now</p>
            <h2 className={`mt-4 ${dc.type.sectionTitle}`}>Worth your attention this week.</h2>
            <p className="mt-4 max-w-2xl text-[var(--slot4-muted-text)]">
              Hand-picked reads across places, reports and field notes. Updated every Monday by the
              editorial team.
            </p>
          </div>
          <Link href={primaryRoute} className={dc.button.secondary}>
            View all entries <ArrowRight className="h-4 w-4" />
          </Link>
        </EditableReveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <EditableReveal className="lg:col-span-1">
            <EditorialFeatureCard
              post={lead}
              href={postHref(primaryTask, lead, primaryRoute)}
              label="Lead selection"
            />
          </EditableReveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-1 lg:grid-cols-1">
            {secondary.map((post, index) => (
              <EditableReveal key={post.id || post.slug} index={index}>
                <Link
                  href={postHref(primaryTask, post, primaryRoute)}
                  className={`group flex h-full flex-col overflow-hidden ${dc.surface.card} ${dc.motion.lift}`}
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={getEditablePostImage(post)}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className={dc.type.eyebrow}>
                      {taskThemes[primaryTask].kicker} · Pick {String(index + 2).padStart(2, '0')}
                    </p>
                    <h3 className="mt-3 line-clamp-2 text-lg font-semibold leading-snug">
                      {post.title}
                    </h3>
                    <span className="mt-auto inline-flex items-center gap-2 pt-4 text-xs font-semibold text-[var(--slot4-accent)]">
                      Read more <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              </EditableReveal>
            ))}
          </div>

          <EditableReveal className="lg:col-span-1">
            <div className={`${dc.surface.card} h-full p-6`}>
              <div className="flex items-center gap-2 text-[var(--slot4-accent)]">
                <FileText className="h-4 w-4" />
                <p className={dc.type.eyebrow}>Reading list</p>
              </div>
              <h3 className="mt-4 text-xl font-semibold leading-snug">More from the index</h3>
              <ol className="mt-6 divide-y divide-[var(--editable-border)]">
                {columnList.map((post, index) => (
                  <li key={post.id || post.slug} className="py-4 first:pt-0 last:pb-0">
                    <Link
                      href={postHref(primaryTask, post, primaryRoute)}
                      className="group grid grid-cols-[36px_1fr] items-start gap-3"
                    >
                      <span className="text-lg font-semibold tabular-nums text-[var(--slot4-accent)]">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <h4 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-[var(--slot4-accent)]">
                          {post.title}
                        </h4>
                        <p className="mt-1 text-xs text-[var(--slot4-muted-text)]">
                          {taskThemes[primaryTask].kicker}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </EditableReveal>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* CATEGORY-TABBED SHOWCASE                                            */
/* ------------------------------------------------------------------ */

export function EditableCategoryShowcase({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = poolOf(posts, timeSections)
  const categories = SITE_CONFIG.tasks.filter((task) => task.enabled).slice(0, 5)
  if (!pool.length || !categories.length) return null

  const chunkSize = Math.max(3, Math.floor(pool.length / categories.length))

  return (
    <section className={`${dc.shell.sectionY} bg-white`}>
      <div className={dc.shell.section}>
        <EditableReveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className={dc.type.eyebrow}>Across categories</p>
            <h2 className={`mt-4 ${dc.type.sectionTitle}`}>Pick a lane, see what is new.</h2>
            <p className="mt-4 text-[var(--slot4-muted-text)]">
              Every collection is refreshed as contributors submit new entries. Use the tabs to jump
              between lanes without a full page load.
            </p>
          </div>
        </EditableReveal>

        {/* Tab bar (static server-rendered anchors) */}
        <nav className="mt-10 flex flex-wrap gap-2 border-b border-[var(--editable-border)] pb-3">
          {categories.map((task, i) => {
            const Icon = taskIcon(task.key)
            return (
              <a
                key={task.key}
                href={`#tab-${task.key}`}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  i === 0
                    ? 'border-[var(--slot4-accent)] bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]'
                    : 'border-[var(--editable-border)] bg-white text-[var(--slot4-page-text)] hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {taskThemes[task.key].kicker}
              </a>
            )
          })}
        </nav>

        <div className="mt-10 space-y-16">
          {categories.map((task, i) => {
            const slice = pool.slice(i * chunkSize, i * chunkSize + 3)
            const items = slice.length ? slice : pool.slice(0, 3)
            return (
              <div key={task.key} id={`tab-${task.key}`}>
                <EditableReveal className="flex items-end justify-between gap-4">
                  <div>
                    <p className={dc.type.eyebrow}>{taskThemes[task.key].kicker}</p>
                    <h3 className="mt-2 text-2xl font-semibold sm:text-3xl">
                      {taskThemes[task.key].note}
                    </h3>
                  </div>
                  <Link
                    href={task.route}
                    className="hidden shrink-0 items-center gap-2 text-sm font-semibold text-[var(--slot4-accent)] sm:inline-flex"
                  >
                    Open lane <ArrowRight className="h-4 w-4" />
                  </Link>
                </EditableReveal>
                <div className="mt-6 grid gap-6 md:grid-cols-3">
                  {items.map((post, index) => (
                    <EditableReveal key={`${task.key}-${post.id || post.slug}`} index={index}>
                      <Link
                        href={postHref(primaryTask, post, primaryRoute)}
                        className={`group flex h-full flex-col overflow-hidden ${dc.surface.card} ${dc.motion.lift}`}
                      >
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <img
                            src={getEditablePostImage(post)}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
                          />
                          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--slot4-accent)]">
                            {taskThemes[task.key].kicker}
                          </span>
                        </div>
                        <div className="flex flex-1 flex-col p-5">
                          <h4 className="line-clamp-2 text-base font-semibold leading-snug">
                            {post.title}
                          </h4>
                          <span className="mt-auto inline-flex items-center gap-2 pt-4 text-xs font-semibold text-[var(--slot4-accent)]">
                            Read entry <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </Link>
                    </EditableReveal>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* EDITOR'S PICKS TRIO                                                 */
/* ------------------------------------------------------------------ */

export function EditableEditorsPicks({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = poolOf(posts, timeSections)
  const picks = pool.slice(5, 8)
  if (picks.length < 1) return null
  const editors = [
    { name: 'Linh Pham', role: 'Editor · Places' },
    { name: 'Minh Tran', role: 'Editor · Guides' },
    { name: 'Anh Nguyen', role: 'Editor · Field notes' },
  ]

  return (
    <section className="bg-[var(--slot4-panel-bg)]">
      <div className={`${dc.shell.section} ${dc.shell.sectionY}`}>
        <EditableReveal className="mx-auto max-w-3xl text-center">
          <p className={dc.type.eyebrow}>Editor's picks</p>
          <h2 className={`mt-4 ${dc.type.sectionTitle}`}>Three reads our editors kept talking about.</h2>
          <p className="mt-5 text-[var(--slot4-muted-text)]">
            A rotating shortlist from the team. Each pick includes a short note on why it made the cut.
          </p>
        </EditableReveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {picks.map((post, index) => {
            const editor = editors[index % editors.length]
            return (
              <EditableReveal key={post.id || post.slug} index={index}>
                <article className={`flex h-full flex-col ${dc.surface.card} overflow-hidden`}>
                  <Link href={postHref(primaryTask, post, primaryRoute)} className="group block">
                    <div className="relative aspect-[16/11] overflow-hidden">
                      <img
                        src={getEditablePostImage(post)}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
                      />
                      <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-[var(--slot4-dark-bg)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                        <Star className="h-3 w-3 text-[#8db3ff]" /> Pick {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                  </Link>
                  <div className="flex flex-1 flex-col p-6">
                    <p className={dc.type.eyebrow}>{taskThemes[primaryTask].kicker}</p>
                    <h3 className="mt-3 line-clamp-2 text-xl font-semibold leading-snug">
                      <Link href={postHref(primaryTask, post, primaryRoute)}>{post.title}</Link>
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-[var(--slot4-muted-text)]">
                      "A concise, source-backed read that respects your time. Worth bookmarking for your
                      next planning session."
                    </p>
                    <div className="mt-6 flex items-center gap-3 border-t border-[var(--editable-border)] pt-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-sm font-semibold text-[var(--slot4-accent)]">
                        {editor.name.split(' ').map((s) => s[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{editor.name}</p>
                        <p className="text-xs text-[var(--slot4-muted-text)]">{editor.role}</p>
                      </div>
                    </div>
                  </div>
                </article>
              </EditableReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* HOW IT WORKS                                                        */
/* ------------------------------------------------------------------ */

export function EditableHowItWorks({ primaryRoute }: HomeSectionProps) {
  const steps = [
    {
      icon: Search,
      title: '01. Search or browse',
      body:
        'Start with a place, a topic or a question. Filter by city, category, or dig into a curated lane.',
    },
    {
      icon: Compass,
      title: '02. Read the guide',
      body:
        'Each entry pairs a real listing with practical notes, references, and links to deeper reading.',
    },
    {
      icon: ShieldCheck,
      title: '03. Decide with confidence',
      body:
        'Save, share, or contact the source directly. Every listing is human-reviewed before it goes live.',
    },
  ]
  return (
    <section className="bg-white">
      <div className={`${dc.shell.section} ${dc.shell.sectionY}`}>
        <EditableReveal className="mx-auto max-w-3xl text-center">
          <p className={dc.type.eyebrow}>How it works</p>
          <h2 className={`mt-4 ${dc.type.sectionTitle}`}>Three quick steps, no account required.</h2>
        </EditableReveal>

        <div className="relative mt-14 grid gap-6 lg:grid-cols-3">
          <div className="pointer-events-none absolute inset-x-16 top-16 hidden h-px bg-[linear-gradient(90deg,transparent,var(--editable-border),transparent)] lg:block" />
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <EditableReveal key={step.title} index={index}>
                <div className={`relative flex h-full flex-col ${dc.surface.soft} p-8`}>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--slot4-accent)] text-white shadow-[0_12px_30px_rgba(14,84,241,0.35)]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--slot4-muted-text)]">{step.body}</p>
                </div>
              </EditableReveal>
            )
          })}
        </div>

        <EditableReveal className="mt-10 flex justify-center">
          <Link href={primaryRoute} className={dc.button.primary}>
            Try a search now <ArrowRight className="h-4 w-4" />
          </Link>
        </EditableReveal>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* TIME COLLECTIONS                                                    */
/* ------------------------------------------------------------------ */

const sectionCopy: Record<string, { eyebrow: string; title: string; blurb: string }> = {
  spotlight: {
    eyebrow: 'Fresh this week',
    title: 'Newly added',
    blurb: 'The latest entries added by our contributors and editors.',
  },
  browse: {
    eyebrow: 'This month',
    title: 'Popular discoveries',
    blurb: 'What Vietnamese readers keep clicking on right now.',
  },
  index: {
    eyebrow: 'From the index',
    title: 'Still useful',
    blurb: 'Evergreen references that continue to earn their spot.',
  },
}

export function EditableTimeCollections({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const sections = timeSections.length
    ? timeSections
    : [{ key: 'spotlight', posts: posts.slice(0, 8), href: primaryRoute } as HomeTimeSection]
  return (
    <>
      {sections
        .filter((section) => section.posts.length)
        .map((section, sectionIndex) => {
          const copy = sectionCopy[section.key] || {
            eyebrow: 'More to explore',
            title: 'Selected for you',
            blurb: 'A rotating shortlist from across the platform.',
          }
          return (
            <section
              key={section.key}
              className={sectionIndex % 2 ? 'bg-[var(--slot4-panel-bg)]' : 'bg-white'}
            >
              <div className={`${dc.shell.section} ${dc.shell.sectionY}`}>
                <EditableReveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div className="max-w-2xl">
                    <p className={dc.type.eyebrow}>{copy.eyebrow}</p>
                    <h2 className={`mt-4 ${dc.type.sectionTitle}`}>{copy.title}</h2>
                    <p className="mt-4 text-[var(--slot4-muted-text)]">{copy.blurb}</p>
                  </div>
                  <Link
                    href={section.href || primaryRoute}
                    className="hidden items-center gap-2 text-sm font-semibold text-[var(--slot4-accent)] sm:inline-flex"
                  >
                    Browse all <ArrowRight className="h-4 w-4" />
                  </Link>
                </EditableReveal>
                <div className="mt-12 flex gap-5 overflow-x-auto pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {section.posts.slice(0, 8).map((post, index) => (
                    <EditableReveal key={post.id || post.slug} index={index} className="shrink-0">
                      <RailPostCard
                        post={post}
                        href={postHref(primaryTask, post, primaryRoute)}
                        index={index}
                      />
                    </EditableReveal>
                  ))}
                </div>
              </div>
            </section>
          )
        })}
    </>
  )
}

/* ------------------------------------------------------------------ */
/* TESTIMONIALS                                                        */
/* ------------------------------------------------------------------ */

export function EditableTestimonials(_: HomeSectionProps) {
  return null
}

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */

export function EditableFaq(_: HomeSectionProps) {
  const faqs = [
    {
      q: 'Is Thietkewebphutho free to use?',
      a: 'Yes. Browsing listings, guides and reports is completely free. We may show contextual ads and sponsored placements, always clearly labelled.',
    },
    {
      q: 'How are listings verified?',
      a: 'Every submission is human-reviewed before it goes live. We check contact details, cross-reference public sources, and reject anything we cannot confirm.',
    },
    {
      q: 'Can I contribute a guide or a place?',
      a: "Absolutely. Use the Submit an entry button to send us a draft. If it's a fit, an editor will get in touch within a few working days.",
    },
    {
      q: 'Do you cover the whole of Vietnam?',
      a: 'Yes. Coverage is deepest in the largest metros, but we accept submissions from all 63 provinces and actively expand smaller-city coverage each quarter.',
    },
    {
      q: 'How often is the index updated?',
      a: 'Fresh entries appear daily. The editor-curated selections on the home page rotate every Monday morning.',
    },
  ]
  return (
    <section className="bg-white">
      <div className={`${dc.shell.section} ${dc.shell.sectionY}`}>
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <EditableReveal>
            <p className={dc.type.eyebrow}>Frequently asked</p>
            <h2 className={`mt-4 ${dc.type.sectionTitle}`}>Questions we hear a lot.</h2>
            <p className="mt-5 text-[var(--slot4-muted-text)]">
              Cannot find what you are looking for? Reach out and a human on our team will get back to
              you within a working day.
            </p>
            <Link href="/contact" className={`${dc.button.secondary} mt-8`}>
              Contact the team <ArrowRight className="h-4 w-4" />
            </Link>
          </EditableReveal>

          <EditableReveal index={1}>
            <div className="divide-y divide-[var(--editable-border)] rounded-lg border border-[var(--editable-border)] bg-white">
              {faqs.map((item, i) => (
                <details key={item.q} className="group px-6 py-5 open:bg-[var(--slot4-panel-bg)]" open={i === 0}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left">
                    <span className="text-base font-semibold sm:text-lg">{item.q}</span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--editable-border)] text-[var(--slot4-accent)] transition group-open:rotate-45">
                      <span className="text-lg leading-none">+</span>
                    </span>
                  </summary>
                  <p className="mt-4 text-sm leading-7 text-[var(--slot4-muted-text)]">{item.a}</p>
                </details>
              ))}
            </div>
          </EditableReveal>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* NEWSLETTER                                                          */
/* ------------------------------------------------------------------ */

export function EditableNewsletter(_: HomeSectionProps) {
  return (
    <section className="bg-[var(--slot4-panel-bg)]">
      <div className={`${dc.shell.section} py-16 sm:py-20`}>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* CTA                                                                 */
/* ------------------------------------------------------------------ */

export function EditableHomeCta() {
  return (
    <section className="bg-white px-3 pb-3 sm:px-5 sm:pb-5">
      <div className="relative mx-auto max-w-[1860px] overflow-hidden rounded-lg bg-[var(--slot4-dark-bg)] text-white">
        <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(68,199,246,0.35),transparent_70%)] blur-2xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(14,84,241,0.35),transparent_70%)] blur-2xl" />
        <div className={`${dc.shell.section} relative grid gap-10 py-20 lg:grid-cols-[1fr_auto] lg:items-center`}>
          <EditableReveal>
            <p className="editable-label text-xs uppercase tracking-[0.18em] text-[#8db3ff]">
              Contribute to the index
            </p>
            <h2 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight sm:text-5xl">
              Help people find a great place or a genuinely useful guide.
            </h2>
            <p className="mt-5 max-w-2xl leading-7 text-white/65">
              Share accurate local information and practical resources with an audience already looking
              for them. Contributors get an editor byline and a permanent link in the index.
            </p>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/75">
              <li className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#8db3ff]" /> Free to publish
              </li>
              <li className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#8db3ff]" /> Reviewed within 3 days
              </li>
              <li className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#8db3ff]" /> Byline &amp; permanent link
              </li>
            </ul>
          </EditableReveal>
          <EditableReveal index={1} className="flex flex-wrap gap-3">
            <Link href="/create" className={dc.button.primary}>
              Submit an entry <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/contact" className={dc.button.ghost}>
              Talk to us
            </Link>
          </EditableReveal>
        </div>
      </div>
    </section>
  )
}
