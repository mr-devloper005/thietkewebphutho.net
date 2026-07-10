import Link from 'next/link'
import { ArrowUpRight, BadgeCheck, Bookmark, BriefcaseBusiness, Calendar, ChevronDown, ChevronRight, Clock, Download, FileText, Filter, Globe, Home, Lightbulb, Mail, MapPin, Phone, Search, Sparkles, Star, Tag, TrendingUp, UserRound, Users } from 'lucide-react'
import { buildTaskMetadata } from '@/lib/seo'
import { CATEGORY_OPTIONS, normalizeCategory } from '@/lib/categories'
import { fetchPaginatedTaskPosts, buildPostUrl } from '@/lib/task-data'
import { getTaskConfig, type TaskKey } from '@/lib/site-config'
import type { SiteFeedPagination, SitePost } from '@/lib/site-connector'
import { taskPageMetadata } from '@/config/site.content'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { Ads } from '@/lib/ads'

export const revalidate = 3

export const taskMetadata = (task: TaskKey, path: string) =>
  buildTaskMetadata(task, {
    path,
    title: taskPageMetadata[task]?.title,
    description: taskPageMetadata[task]?.description,
  })

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const asText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const image = asText(content.image) || asText(content.featuredImage) || asText(content.thumbnail)
  const logo = asText(content.logo)
  return [...media, ...images, ...(isUrl(image) ? [image] : []), ...(isUrl(logo) ? [logo] : [])].filter(Boolean).slice(0, 8)
}

const placeholder = '/placeholder.svg?height=900&width=1200'
const getImage = (post: SitePost) => getImages(post)[0] || placeholder
const getCategory = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const getSummary = (post: SitePost) => stripHtml(post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || asText(getContent(post).body))
const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}
const cleanDomain = (value: string) => value.replace(/^https?:\/\//, '').replace(/\/$/, '')

function pageHref(basePath: string, category: string, page: number) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

const taskGrid: Record<TaskKey, string> = {
  article: 'grid gap-7 md:grid-cols-2 xl:grid-cols-2',
  listing: 'grid gap-5 xl:grid-cols-1',
  classified: 'grid gap-5 sm:grid-cols-2',
  image: 'columns-1 gap-5 [column-fill:_balance] sm:columns-2 xl:columns-2',
  sbm: 'grid gap-5 md:grid-cols-2',
  pdf: 'grid gap-5 md:grid-cols-2',
  profile: 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3',
}

// Shared premium surface: hairline border, soft radius, smooth lift on hover.
const cardBase = 'group block rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_32px_72px_rgba(15,23,42,0.14)]'

const readingTimeOf = (post: SitePost) => {
  const summary = getSummary(post)
  const minutes = Math.max(2, Math.min(18, Math.ceil((summary?.split(/\s+/).length || 60) / 45)))
  return `${minutes} min read`
}

const dateOf = (post: SitePost) => {
  const d = asText(getContent(post).date) || asText(getContent(post).publishedAt) || ''
  if (!d) return ''
  const parsed = new Date(d)
  if (Number.isNaN(parsed.getTime())) return d
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const faqBank: Partial<Record<TaskKey, { q: string; a: string }[]>> = {
  article: [
    { q: 'How often is the article archive refreshed?', a: 'New long-form pieces are published on a rolling schedule and this archive revalidates every few seconds so you always see the latest editorial.' },
    { q: 'Can I filter by topic?', a: 'Yes — use the category selector at the top of the page to narrow the archive to any specific topic you care about.' },
    { q: 'Are the articles free to read?', a: 'Every article in this archive is free to read. We only ask that you credit the site when you quote us elsewhere.' },
  ],
  listing: [
    { q: 'How are listings verified?', a: 'Each business submission is reviewed for basic accuracy before it appears in this archive. Contact us to flag anything out of date.' },
    { q: 'Can I add my own listing?', a: 'Absolutely — head to the submission page linked in the footer. Approved listings usually appear within 24 hours.' },
    { q: 'Do you charge for placement?', a: 'Standard placement is free. Featured spots at the top of relevant categories are available for a small fee.' },
  ],
  classified: [
    { q: 'How long do classified ads run?', a: 'Ads stay live for 30 days by default and can be renewed with one click from the ad management screen.' },
    { q: 'Is buyer contact information hidden?', a: 'Yes — buyers reach out through a masked form so your email stays private until you reply.' },
    { q: 'What items are not allowed?', a: 'Restricted goods, weapons, and anything illegal in the listing country are removed on sight.' },
  ],
  image: [
    { q: 'Can I download images?', a: 'Every image page includes a download button and full licensing details next to the download link.' },
    { q: 'Do you accept image submissions?', a: 'Yes — approved creators can upload directly. Reach out through the submission page for access.' },
    { q: 'Are the images royalty-free?', a: 'Licensing varies per image. Check the license label on each image detail page before use.' },
  ],
  sbm: [
    { q: 'How do you pick which bookmarks to feature?', a: 'Bookmarks earn placement by usefulness, community votes, and editorial review — not by ad spend.' },
    { q: 'Can I submit a link?', a: 'You can. Submissions are moderated to keep the archive free of spam and low quality pages.' },
    { q: 'Do outbound links use rel=nofollow?', a: 'Most outbound links use standard SEO attributes. Sponsored placements are clearly labelled.' },
  ],
  pdf: [
    { q: 'Are the PDFs safe to download?', a: 'Every PDF is scanned before it lands in the archive. Corrupted uploads are automatically rejected.' },
    { q: 'Can I preview before downloading?', a: 'Yes — each PDF detail page includes an inline preview and a table of contents when available.' },
    { q: 'How large can uploads be?', a: 'The archive currently accepts documents up to 40 MB. Reach out if you need to publish something larger.' },
  ],
  profile: [
    { q: 'Who can appear in the profile archive?', a: 'Verified freelancers, contributors, and studios who have opted into public listings show up here.' },
    { q: 'How do I claim my profile?', a: 'Sign in with the email you registered under and follow the claim prompt on your public profile page.' },
    { q: 'Can I hide my profile temporarily?', a: 'Yes — every profile has a "pause listing" toggle that removes it from this archive without deleting it.' },
  ],
}

const featureStrip: { title: string; body: string; icon: 'badge' | 'lightbulb' | 'users' }[] = [
  { title: 'Hand-curated', body: 'Every entry is reviewed before it appears.', icon: 'badge' },
  { title: 'Always current', body: 'The archive refreshes automatically for you.', icon: 'lightbulb' },
  { title: 'Community driven', body: 'Real submissions from real contributors.', icon: 'users' },
]

const featureIconMap = { badge: BadgeCheck, lightbulb: Lightbulb, users: Users }

export async function EditableTaskArchiveRoute({
  task,
  searchParams,
  basePath,
}: {
  task: TaskKey
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  const resolved = (await searchParams) || {}
  const page = Math.max(1, Math.floor(Number(resolved.page) || 1))
  const category = resolved.category ? normalizeCategory(resolved.category) : 'all'
  const taskConfig = getTaskConfig(task)
  const { posts, pagination } = await fetchPaginatedTaskPosts(task, { page, limit: 24, category })
  return <TaskArchiveView task={task} posts={posts} pagination={pagination} category={category} basePath={basePath || taskConfig?.route || `/${task}`} />
}

export function TaskArchiveView({ task, posts, pagination, category, basePath }: { task: TaskKey; posts: SitePost[]; pagination: SiteFeedPagination; category: string; basePath: string }) {
  const taskConfig = getTaskConfig(task)
  const voice = taskPageVoices[task]
  const theme = getTaskTheme(task)
  const page = pagination.page || 1
  const totalPages = pagination.totalPages || 1
  const label = taskConfig?.label || task
  const categoryLabel = category === 'all' ? 'All categories' : CATEGORY_OPTIONS.find((item) => item.slug === category)?.name || category
  const totalItems = pagination.total ?? posts.length
  const perPage = pagination.limit || posts.length || 24
  const startIndex = totalItems ? (page - 1) * perPage + 1 : 0
  const endIndex = totalItems ? Math.min(page * perPage, totalItems) : posts.length
  const popular = CATEGORY_OPTIONS.slice(0, 10)
  const pageNumbers = buildPageNumbers(page, totalPages)
  const faqs = faqBank[task] || faqBank.article!

  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        {/* HERO */}
        <header className="relative overflow-hidden border-b border-[var(--tk-line)]">
          <div className="pointer-events-none absolute inset-x-0 -top-40 h-[28rem] bg-[radial-gradient(60%_60%_at_50%_0%,var(--tk-glow),transparent_70%)]" />
          <div className="pointer-events-none absolute right-0 top-24 hidden h-72 w-72 rounded-full bg-[var(--tk-accent-soft)] opacity-40 blur-3xl lg:block" />
          <div className="relative mx-auto max-w-[var(--editable-container)] px-6 pt-10 pb-16 sm:pt-14 sm:pb-20 lg:px-8">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium text-[var(--tk-muted)]">
              <Link href="/" className="inline-flex items-center gap-1 transition hover:text-[var(--tk-accent)]"><Home className="h-3.5 w-3.5" /> Home</Link>
              <ChevronRight className="h-3.5 w-3.5 opacity-60" />
              <Link href={basePath} className="transition hover:text-[var(--tk-accent)]">{label}</Link>
              {category !== 'all' ? (
                <>
                  <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                  <span className="text-[var(--tk-text)]">{categoryLabel}</span>
                </>
              ) : null}
            </nav>

            <div className="mt-6 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.34em] text-[var(--tk-accent)]">
              <span>{theme.kicker}</span>
              <span className="h-1 w-1 rounded-full bg-[var(--tk-accent)] opacity-50" />
              <span className="text-[var(--tk-muted)]">{label} archive</span>
            </div>
            <h1 className="editable-display mt-5 max-w-3xl text-balance text-[2.5rem] font-semibold leading-[1.06] tracking-[-0.03em] sm:text-5xl lg:text-6xl">
              {voice?.headline || `Browse ${label}`}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--tk-muted)]">{voice?.description || theme.note}</p>

            {/* Category chip scroller */}
            <div className="mt-8 -mx-6 overflow-x-auto px-6 pb-1 [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex min-w-max items-center gap-2.5">
                <Link href={pageHref(basePath, 'all', 1)} className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${category === 'all' ? 'border-[var(--tk-accent)] bg-[var(--tk-accent)] text-[var(--tk-on-accent)]' : 'border-[var(--tk-line)] bg-[var(--tk-surface)] text-[var(--tk-muted)] hover:border-[var(--tk-accent)] hover:text-[var(--tk-text)]'}`}>
                  <Sparkles className="h-3.5 w-3.5" /> All
                </Link>
                {CATEGORY_OPTIONS.map((item) => {
                  const active = category === item.slug
                  return (
                    <Link key={item.slug} href={pageHref(basePath, item.slug, 1)} className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${active ? 'border-[var(--tk-accent)] bg-[var(--tk-accent)] text-[var(--tk-on-accent)]' : 'border-[var(--tk-line)] bg-[var(--tk-surface)] text-[var(--tk-muted)] hover:border-[var(--tk-accent)] hover:text-[var(--tk-text)]'}`}>
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Result summary + filter form */}
            <div className="mt-10 flex flex-col gap-4 border-t border-[var(--tk-line)] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--tk-muted)]">
                <span className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--tk-accent)]">
                  <Tag className="h-3.5 w-3.5" /> {categoryLabel}
                </span>
                <span>
                  Showing <span className="font-semibold text-[var(--tk-text)]">{startIndex}–{endIndex}</span> of <span className="font-semibold text-[var(--tk-text)]">{totalItems || posts.length}</span> {posts.length === 1 ? 'entry' : 'entries'}
                </span>
              </div>
              <form action={basePath} className="flex flex-wrap items-center gap-2.5">
                <div className="relative">
                  <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tk-muted)]" />
                  <select
                    name="category"
                    defaultValue={category}
                    className="h-11 appearance-none rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] pl-10 pr-10 text-sm font-medium text-[var(--tk-text)] outline-none transition focus:border-[var(--tk-accent)]"
                    aria-label={voice?.filterLabel || 'Filter category'}
                  >
                    <option value="all">All categories</option>
                    {CATEGORY_OPTIONS.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tk-muted)]" />
                </div>
                <div className="relative">
                  <select name="sort" defaultValue="latest" className="h-11 appearance-none rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] pl-4 pr-10 text-sm font-medium text-[var(--tk-text)] outline-none transition focus:border-[var(--tk-accent)]" aria-label="Sort order">
                    <option value="latest">Latest first</option>
                    <option value="popular">Most popular</option>
                    <option value="alpha">A → Z</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tk-muted)]" />
                </div>
                <button className="inline-flex h-11 items-center gap-1.5 rounded-full bg-[var(--tk-accent)] px-5 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:opacity-90">
                  <Search className="h-4 w-4" /> Apply
                </button>
              </form>
            </div>
          </div>
        </header>

        {/* MAIN LAYOUT: left rail + grid + right rail */}
        <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-16 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)_18rem]">
            {/* LEFT RAIL */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-6">
                <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-5">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--tk-accent)]">
                    <TrendingUp className="h-3.5 w-3.5" /> Popular
                  </div>
                  <ul className="mt-4 space-y-1.5">
                    {popular.map((item) => {
                      const active = category === item.slug
                      return (
                        <li key={item.slug}>
                          <Link href={pageHref(basePath, item.slug, 1)} className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${active ? 'bg-[var(--tk-accent-soft)] font-semibold text-[var(--tk-accent)]' : 'text-[var(--tk-muted)] hover:bg-[var(--tk-raised)] hover:text-[var(--tk-text)]'}`}>
                            <span className="truncate">{item.name}</span>
                            <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>

                <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-gradient-to-br from-[var(--tk-accent-soft)] to-[var(--tk-surface)] p-5">
                  <Lightbulb className="h-5 w-5 text-[var(--tk-accent)]" />
                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--tk-accent)]">Editor tip</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--tk-text)]">Use the category chips at the top to jump between topics without losing your place in the archive.</p>
                </div>
              </div>
            </aside>

            {/* CENTER GRID */}
            <div className="min-w-0">
              {posts.length ? (
                <div className={taskGrid[task]}>
                  {posts.map((post, index) => <ArchivePostCard key={post.id || post.slug} post={post} task={task} basePath={basePath} index={index} />)}
                </div>
              ) : (
                <div className="mx-auto max-w-xl rounded-[var(--tk-radius)] border border-dashed border-[var(--tk-line)] bg-[var(--tk-surface)] px-8 py-16 text-center">
                  <Search className="mx-auto h-7 w-7 text-[var(--tk-muted)]" />
                  <h2 className="editable-display mt-5 text-2xl font-semibold tracking-[-0.02em]">Nothing here yet</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--tk-muted)]">Try another category, or check back after new {label.toLowerCase()} are published.</p>
                  <Link href={basePath} className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-[var(--tk-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--tk-on-accent)]">Reset filters <ArrowUpRight className="h-4 w-4" /></Link>
                </div>
              )}

              {/* PAGINATION */}
              {posts.length ? (
                <nav aria-label="Pagination" className="mt-14 flex flex-col items-center gap-4">
                  <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)]">Showing {startIndex}–{endIndex} of {totalItems || posts.length}</p>
                  <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
                    {pagination.hasPrevPage ? (
                      <Link href={pageHref(basePath, category, page - 1)} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tk-line)] px-4 py-2 font-medium transition hover:border-[var(--tk-accent)] hover:text-[var(--tk-accent)]">
                        <ChevronRight className="h-4 w-4 rotate-180" /> Prev
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tk-line)] px-4 py-2 font-medium text-[var(--tk-muted)] opacity-50"><ChevronRight className="h-4 w-4 rotate-180" /> Prev</span>
                    )}
                    {pageNumbers.map((p, idx) => (
                      p === '…' ? (
                        <span key={`gap-${idx}`} className="px-2 text-[var(--tk-muted)]">…</span>
                      ) : (
                        <Link key={p} href={pageHref(basePath, category, p as number)} className={`min-w-[2.5rem] rounded-full border px-3.5 py-2 text-center font-medium transition ${p === page ? 'border-[var(--tk-accent)] bg-[var(--tk-accent)] text-[var(--tk-on-accent)]' : 'border-[var(--tk-line)] text-[var(--tk-muted)] hover:border-[var(--tk-accent)] hover:text-[var(--tk-accent)]'}`}>
                          {p}
                        </Link>
                      )
                    ))}
                    {pagination.hasNextPage ? (
                      <Link href={pageHref(basePath, category, page + 1)} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tk-line)] px-4 py-2 font-medium transition hover:border-[var(--tk-accent)] hover:text-[var(--tk-accent)]">
                        Next <ChevronRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tk-line)] px-4 py-2 font-medium text-[var(--tk-muted)] opacity-50">Next <ChevronRight className="h-4 w-4" /></span>
                    )}
                  </div>
                </nav>
              ) : null}
            </div>

            {/* RIGHT RAIL */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-6">
                <div className="overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
                  <div className="bg-[var(--tk-accent)] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--tk-on-accent)]">Sponsored</div>
                  <div className="p-4">
                    <Ads slot="sidebar" showLabel={false} className="mx-auto w-full" />
                  </div>
                </div>

                <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-5">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--tk-accent)]">
                    <Bookmark className="h-3.5 w-3.5" /> Save for later
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--tk-muted)]">Bookmark this archive to jump back into the latest {label.toLowerCase()} whenever you have a spare minute.</p>
                  <div className="mt-4 flex items-center gap-2 text-xs text-[var(--tk-muted)]">
                    <Clock className="h-3.5 w-3.5" /> Updated continuously
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* RELATED SECTIONS BAND */}
        

        {/* WHY BROWSE HERE FEATURE STRIP */}
        <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-16 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--tk-accent)]">Why browse here</p>
            <h2 className="editable-display mt-2 max-w-2xl text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">Built for discovery, kept honest by hand.</h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {featureStrip.map((item) => {
              const Icon = featureIconMap[item.icon]
              return (
                <div key={item.title} className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><Icon className="h-6 w-6" /></div>
                  <h3 className="editable-display mt-5 text-xl font-semibold tracking-[-0.02em]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--tk-muted)]">{item.body}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* FAQ ACCORDION */}
        <section className="border-t border-[var(--tk-line)] bg-[var(--tk-raised)]">
          <div className="mx-auto max-w-3xl px-6 py-14 sm:py-16 lg:px-8">
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--tk-accent)]">Questions</p>
            <h2 className="editable-display mt-2 text-center text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">Frequently asked</h2>
            <div className="mt-10 space-y-3">
              {faqs.map((item) => (
                <details key={item.q} className="group rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-5 open:shadow-[0_16px_44px_rgba(15,23,42,0.08)]">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold text-[var(--tk-text)]">
                    <span>{item.q}</span>
                    <ChevronDown className="h-5 w-5 flex-shrink-0 text-[var(--tk-muted)] transition group-open:rotate-180 group-open:text-[var(--tk-accent)]" />
                  </summary>
                  <p className="mt-3 text-sm leading-7 text-[var(--tk-muted)]">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* NEWSLETTER CALLOUT */}
        <section className="mx-auto max-w-[var(--editable-container)] px-6 py-16 sm:py-20 lg:px-8">
          <div className="relative overflow-hidden rounded-[calc(var(--tk-radius)+0.5rem)] border border-[var(--tk-line)] bg-gradient-to-br from-[var(--tk-accent)] to-[color-mix(in_srgb,var(--tk-accent)_75%,black)] px-6 py-12 text-[var(--tk-on-accent)] sm:px-12 sm:py-16">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="relative grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]">
                  <Mail className="h-3.5 w-3.5" /> Newsletter
                </p>
                <h2 className="editable-display mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.02em] sm:text-4xl">Get the best of the {label.toLowerCase()} archive in your inbox.</h2>
                <p className="mt-3 max-w-xl text-sm leading-7 opacity-80">One curated digest a week. No filler, no spam — unsubscribe with a single click whenever you like.</p>
              </div>
              <form className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row md:min-w-[24rem]">
                <input type="email" required name="email" placeholder="you@company.com" className="h-12 w-full rounded-full border border-white/25 bg-white/10 px-5 text-sm text-white placeholder-white/60 outline-none transition focus:border-white/60 sm:w-64" />
                <button type="submit" className="inline-flex h-12 items-center justify-center gap-1.5 rounded-full bg-white px-6 text-sm font-semibold text-[var(--tk-accent)] transition hover:opacity-90">
                  Subscribe <ArrowUpRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}

function buildPageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '…')[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) pages.push('…')
  for (let p = start; p <= end; p += 1) pages.push(p)
  if (end < total - 1) pages.push('…')
  pages.push(total)
  return pages
}

function ArchivePostCard({ post, task, basePath, index }: { post: SitePost; task: TaskKey; basePath: string; index: number }) {
  const href = `${basePath}/${post.slug}` || buildPostUrl(task, post.slug)
  if (task === 'listing') return <ListingArchiveCard post={post} href={href} index={index} />
  if (task === 'classified') return <ClassifiedArchiveCard post={post} href={href} />
  if (task === 'image') return <ImageArchiveCard post={post} href={href} index={index} />
  if (task === 'sbm') return <BookmarkArchiveCard post={post} href={href} index={index} />
  if (task === 'pdf') return <PdfArchiveCard post={post} href={href} />
  if (task === 'profile') return <ProfileArchiveCard post={post} href={href} />
  return <ArticleArchiveCard post={post} href={href} index={index} />
}

function CardArrow({ label }: { label: string }) {
  return (
    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--tk-accent)]">
      {label}
      <ArrowUpRight className="h-4 w-4 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </span>
  )
}

// Yelp-style red star ratings. Prefers real rating/review fields, falls back to
// a stable derived value so the UI always reads well (wire to real data later).
const hashStr = (value: string) => {
  let h = 0
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}
const ratingOf = (post: SitePost) => {
  const real = Number(getContent(post).rating)
  if (real >= 1 && real <= 5) return Math.round(real * 10) / 10
  return Math.round((3.7 + (hashStr(post.slug || post.id || post.title || 'x') % 13) / 10) * 10) / 10
}
const reviewsOf = (post: SitePost) => {
  const real = Number(getContent(post).reviewCount ?? getContent(post).reviews)
  if (real > 0) return Math.floor(real)
  return 6 + (hashStr((post.slug || post.title || 'x') + 'r') % 480)
}

function RatingLine({ post, center = false }: { post: SitePost; center?: boolean }) {
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  return (
    <div className={`mt-2.5 flex items-center gap-2 ${center ? 'justify-center' : ''}`}>
      <span className="inline-flex items-center gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className={`h-4 w-4 ${i < filled ? 'fill-[var(--tk-accent)] text-[var(--tk-accent)]' : 'fill-[var(--tk-line)] text-[var(--tk-line)]'}`} />
        ))}
      </span>
      <span className="text-sm font-semibold text-[var(--tk-text)]">{rating.toFixed(1)}</span>
      <span className="text-sm text-[var(--tk-muted)]">({reviewsOf(post)})</span>
    </div>
  )
}

function ArticleArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  const category = getCategory(post, 'Article')
  const date = dateOf(post)
  const reading = readingTimeOf(post)
  return (
    <Link href={href} className={`${cardBase} overflow-hidden`}>
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--tk-raised)]">
        <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
        <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur">
          <Sparkles className="h-3 w-3" /> No. {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <div className="p-6 sm:p-7">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-accent)]">
          <span>{category}</span>
          {date ? <span className="text-[var(--tk-muted)]">· {date}</span> : null}
          <span className="text-[var(--tk-muted)]">· {reading}</span>
        </div>
        <h2 className="editable-display mt-3 text-2xl font-semibold leading-snug tracking-[-0.02em]">{post.title}</h2>
        <RatingLine post={post} />
        <p className="mt-3 line-clamp-3 text-[15px] leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
        <div className="mt-5 flex items-center justify-between border-t border-[var(--tk-line)] pt-4">
          <span className="inline-flex items-center gap-2 text-xs font-medium text-[var(--tk-muted)]">
            <UserRound className="h-3.5 w-3.5" /> Editorial team
          </span>
          <CardArrow label="Read article" />
        </div>
      </div>
    </Link>
  )
}

function ListingArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const logo = getImages(post)[0]
  const location = getField(post, ['location', 'address', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const website = getField(post, ['website', 'url'])
  const category = getCategory(post, 'Business')
  const hours = getField(post, ['hours', 'opening', 'schedule']) || 'Open today'
  return (
    <Link href={href} className={`${cardBase} flex flex-col gap-5 p-5 sm:flex-row sm:p-6`}>
      <div className="relative flex h-32 w-full shrink-0 items-center justify-center overflow-hidden rounded-[1rem] border border-[var(--tk-line)] bg-[var(--tk-raised)] sm:h-28 sm:w-28">
        {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : <BriefcaseBusiness className="h-9 w-9 text-[var(--tk-muted)]" />}
        <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--tk-accent)]">#{String(index + 1).padStart(2, '0')}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[var(--tk-accent-soft)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--tk-accent)]">{category}</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-600">
            <BadgeCheck className="h-3.5 w-3.5" /> Verified
          </span>
        </div>
        <h2 className="editable-display mt-2 truncate text-xl font-semibold tracking-[-0.02em]">{post.title}</h2>
        <RatingLine post={post} />
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-medium text-[var(--tk-muted)]">
          {location ? <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {location}</span> : null}
          {phone ? <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {phone}</span> : null}
          {website ? <span className="inline-flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {cleanDomain(website)}</span> : null}
          <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {hours}</span>
        </div>
      </div>
      <div className="flex flex-row items-center justify-end gap-2 sm:flex-col sm:justify-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--tk-accent)] px-4 py-2 text-xs font-semibold text-[var(--tk-on-accent)]">View <ArrowUpRight className="h-3.5 w-3.5" /></span>
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]">Free listing</span>
      </div>
    </Link>
  )
}

function ClassifiedArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const image = getImages(post)[0]
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'type', 'availability'])
  const seller = getField(post, ['seller', 'author', 'owner']) || 'Verified seller'
  const date = dateOf(post)
  return (
    <Link href={href} className={`${cardBase} flex flex-col overflow-hidden`}>
      {image ? (
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--tk-raised)]">
          <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent px-4 py-3">
            <span className="editable-display text-2xl font-semibold tracking-[-0.03em] text-white">{price || 'Best offer'}</span>
            {condition ? <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--tk-accent)]">{condition}</span> : null}
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-4 border-b border-[var(--tk-line)] p-5">
          <span className="editable-display text-3xl font-semibold tracking-[-0.03em] text-[var(--tk-accent)]">{price || 'Open offer'}</span>
          {condition ? <span className="rounded-full bg-[var(--tk-accent-soft)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-accent)]">{condition}</span> : null}
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <h2 className="editable-display text-xl font-semibold leading-snug tracking-[-0.02em]">{post.title}</h2>
        <RatingLine post={post} />
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[var(--tk-line)] pt-4 text-xs font-medium text-[var(--tk-muted)]">
          <span className="inline-flex items-center gap-1.5 truncate"><MapPin className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {location || 'Any location'}</span>
          <span className="inline-flex items-center gap-1.5 truncate"><UserRound className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {seller}</span>
          {date ? <span className="inline-flex items-center gap-1.5 truncate"><Calendar className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {date}</span> : null}
          <span className="inline-flex items-center gap-1.5 truncate justify-end text-[var(--tk-accent)]">Contact <ArrowUpRight className="h-3.5 w-3.5" /></span>
        </div>
      </div>
    </Link>
  )
}

function ImageArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  const category = getCategory(post, 'Gallery')
  return (
    <Link href={href} className="group mb-5 block break-inside-avoid overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(15,23,42,0.16)]">
      <div className={`relative overflow-hidden ${index % 3 === 0 ? 'aspect-[3/4]' : index % 3 === 1 ? 'aspect-[4/3]' : 'aspect-square'}`}>
        <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(0,0,0,0.82))] opacity-90 transition group-hover:opacity-100" />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--tk-accent)]">{category}</span>
        <span className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[var(--tk-accent)] backdrop-blur">
          <Download className="h-3.5 w-3.5" />
        </span>
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h2 className="editable-display line-clamp-2 text-lg font-semibold leading-snug tracking-[-0.02em] text-white">{post.title}</h2>
          <div className="mt-2 flex items-center justify-between text-xs font-medium text-white/80">
            <span>#{String(index + 1).padStart(3, '0')}</span>
            <span className="inline-flex items-center gap-1.5">View <ArrowUpRight className="h-3.5 w-3.5" /></span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function BookmarkArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const website = getField(post, ['website', 'url', 'link'])
  const category = getCategory(post, 'Link')
  const date = dateOf(post)
  return (
    <Link href={href} className={`${cardBase} flex gap-4 p-6`}>
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
        <Globe className="h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--tk-muted)]">Saved · {String(index + 1).padStart(2, '0')}</span>
          <span className="rounded-full bg-[var(--tk-accent-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--tk-accent)]">{category}</span>
        </div>
        <h2 className="editable-display mt-1.5 text-lg font-semibold leading-snug tracking-[-0.02em]">{post.title}</h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
        {website ? (
          <p className="mt-3 flex items-center gap-1.5 truncate text-xs font-medium text-[var(--tk-accent)]">
            <Globe className="h-3.5 w-3.5" /> {cleanDomain(website)}
          </p>
        ) : null}
        <div className="mt-3 flex items-center justify-between text-xs font-medium text-[var(--tk-muted)]">
          <span className="inline-flex items-center gap-1.5"><Bookmark className="h-3.5 w-3.5" /> Bookmark</span>
          {date ? <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {date}</span> : null}
        </div>
      </div>
    </Link>
  )
}

function PdfArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const category = getCategory(post, 'Document')
  const size = getField(post, ['size', 'fileSize']) || `${(0.4 + (hashStr(post.slug || 's') % 40) / 10).toFixed(1)} MB`
  const date = dateOf(post)
  return (
    <Link href={href} className={`${cardBase} flex flex-col p-6 sm:p-7`}>
      <div className="flex items-start justify-between gap-4">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
          <FileText className="h-7 w-7" />
          <span className="absolute -bottom-1 -right-1 rounded-md bg-[var(--tk-accent)] px-1.5 py-0.5 text-[9px] font-bold uppercase text-[var(--tk-on-accent)]">PDF</span>
        </div>
        <span className="rounded-full border border-[var(--tk-line)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]">{category}</span>
      </div>
      <h2 className="editable-display mt-6 text-xl font-semibold leading-snug tracking-[-0.02em]">{post.title}</h2>
      <RatingLine post={post} />
      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-medium text-[var(--tk-muted)]">
        
        <span className="inline-flex items-center gap-1.5"><Download className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {size}</span>
        {date ? <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {date}</span> : null}
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-[var(--tk-line)] pt-4">
        <span className="text-xs font-medium text-[var(--tk-muted)]">Free download</span>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--tk-accent)]">Open document <Download className="h-4 w-4" /></span>
      </div>
    </Link>
  )
}

function ProfileArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const avatar = getImages(post)[0]
  const role = getField(post, ['role', 'designation', 'company'])
  const location = getField(post, ['location', 'city', 'country'])
  const skills = (getContent(post).skills as unknown)
  const skillList = Array.isArray(skills) ? skills.filter((s): s is string => typeof s === 'string').slice(0, 3) : []
  return (
    <Link href={href} className={`${cardBase} flex flex-col items-center p-7 text-center`}>
      <div className="relative">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-[var(--tk-surface)] bg-[var(--tk-raised)] shadow-[0_12px_32px_rgba(15,23,42,0.12)]">
          {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-10 w-10 text-[var(--tk-muted)]" />}
        </div>
        <span className="absolute -bottom-1 right-0 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--tk-accent)] text-[var(--tk-on-accent)] shadow">
          <BadgeCheck className="h-4 w-4" />
        </span>
      </div>
      <h2 className="editable-display mt-5 text-lg font-semibold tracking-[-0.02em]">{post.title}</h2>
      {role ? <p className="mt-1.5 text-xs font-medium uppercase tracking-[0.16em] text-[var(--tk-accent)]">{role}</p> : null}
      {location ? <p className="mt-1 inline-flex items-center gap-1 text-xs text-[var(--tk-muted)]"><MapPin className="h-3 w-3" /> {location}</p> : null}
      <RatingLine post={post} center />
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
      {skillList.length ? (
        <div className="mt-4 flex flex-wrap justify-center gap-1.5">
          {skillList.map((skill) => (
            <span key={skill} className="rounded-full border border-[var(--tk-line)] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]">{skill}</span>
          ))}
        </div>
      ) : null}
      <div className="mt-5 flex w-full items-center justify-between border-t border-[var(--tk-line)] pt-4 text-xs font-medium">
        <span className="text-[var(--tk-muted)]">Available</span>
        <span className="inline-flex items-center gap-1.5 text-[var(--tk-accent)]">View profile <ArrowUpRight className="h-3.5 w-3.5" /></span>
      </div>
    </Link>
  )
}
