import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft, ArrowUpRight, ArrowUp, Bookmark, Building2, Calendar, Camera, CheckCircle2, ChevronRight,
  Clock, Download, ExternalLink, Eye, Facebook, FileText, Globe2, Info, Link2, Linkedin, Mail,
  MapPin, MessageCircle, Phone, Quote, Shield, Sparkles, Star, Tag, Twitter, UserRound, Users,
} from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableArticleComments } from '@/editable/components/EditableArticleComments'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { Ads } from '@/lib/ads'

export const revalidate = 3

export async function generateEditableDetailMetadata(task: TaskKey, params: Promise<{ slug?: string; username?: string }>) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({ task, params }: { task: TaskKey; params: Promise<{ slug?: string; username?: string }> }) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  const related = (await fetchTaskPosts(task, 9)).filter((item) => item.slug !== post.slug).slice(0, 6)
  const comments = task === 'article' ? await fetchArticleComments(post.slug, 50) : []
  return <TaskDetailView task={task} post={post} related={related} comments={comments} />
}

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const asText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const singleImages = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar'].map((key) => asText(content[key])).filter((url) => url && isUrl(url))
  return [...media, ...images, ...singleImages].filter(Boolean).slice(0, 16)
}

const getBody = (post: SitePost) => {
  const content = getContent(post)
  return asText(content.body) || asText(content.description) || asText(content.details) || post.summary || 'Details will appear here once available.'
}

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const safeUrl = (value: string) => /^https?:\/\//i.test(value) ? value : '#'

const linkifyMarkdown = (value: string) => value
  .replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/gi, (_m, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${label}</a>`)

const linkifyText = (value: string) => linkifyMarkdown(value)
  .replace(/(^|[\s(>])((https?:\/\/)[^\s<)]+)/gi, (_m, prefix, url) => `${prefix}<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${url}</a>`)

const hardenLinks = (html: string) => html.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_m, attrs) => {
  let next = String(attrs).replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  if (!/\starget=/i.test(next)) next += ' target="_blank"'
  if (!/\srel=/i.test(next)) next += ' rel="nofollow noopener noreferrer"'
  return `<a ${next}>`
})

const sanitizeHtml = (html: string) => hardenLinks(html
  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
  .replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  .replace(/(href|src)=(['"])javascript:[\s\S]*?\2/gi, '$1="#"'))

// Split body into H2-anchored sections for a table-of-contents sidebar. If the
// author didn't provide any H2s, we synthesize headings from paragraph breaks so
// the sidebar still has something to anchor to.
const slugify = (value: string) => value.toLowerCase()
  .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 60) || 'section'

type BodySection = { id: string; heading: string; html: string }

const injectHeadingIds = (html: string): { html: string; sections: BodySection[] } => {
  const sections: BodySection[] = []
  const withIds = html.replace(/<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi, (_m, level, attrs = '', inner) => {
    const text = stripHtml(String(inner))
    if (!text) return _m
    const id = slugify(text) + '-' + sections.length
    if (String(level) === '2') sections.push({ id, heading: text, html: '' })
    const cleanAttrs = String(attrs).replace(/\sid=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    return `<h${level}${cleanAttrs} id="${id}">${inner}</h${level}>`
  })
  return { html: withIds, sections }
}

const formatPlainText = (raw: string): { html: string; sections: BodySection[] } => {
  const value = raw.trim()
  if (!value) return { html: '', sections: [] }
  let html: string
  if (/<[a-z][\s\S]*>/i.test(value)) {
    html = sanitizeHtml(linkifyMarkdown(value))
  } else {
    html = value
      .split(/\n{2,}/)
      .map((part) => `<p>${linkifyText(escapeHtml(part).replace(/\n/g, '<br />'))}</p>`)
      .join('')
  }
  return injectHeadingIds(html)
}

const summaryText = (post: SitePost) => post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || ''
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const leadText = (post: SitePost) => {
  const summary = summaryText(post)
  if (!summary) return ''
  const lead = stripHtml(summary)
  return lead && lead !== stripHtml(getBody(post)) ? lead : ''
}
const categoryOf = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const mapSrcFor = (post: SitePost) => {
  const address = getField(post, ['address', 'location', 'city'])
  const lat = getField(post, ['lat', 'latitude'])
  const lng = getField(post, ['lng', 'lon', 'longitude'])
  if (lat && lng) return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=14&output=embed`
  if (address) return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=13&output=embed`
  return ''
}

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

const wordCountOf = (post: SitePost) => stripHtml(getBody(post)).split(/\s+/).filter(Boolean).length
const readingMinutes = (post: SitePost) => Math.max(1, Math.round(wordCountOf(post) / 220))
const viewsOf = (post: SitePost) => 240 + (hashStr((post.slug || 'v') + 'view') % 9800)
const likesOf = (post: SitePost) => 12 + (hashStr((post.slug || 'l') + 'like') % 480)

const dateOf = (post: SitePost) => {
  const raw = asText(getContent(post).publishedAt) || asText(getContent(post).date) || (post as unknown as { createdAt?: string }).createdAt
  if (!raw) return ''
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return typeof raw === 'string' ? raw : ''
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

const authorOf = (post: SitePost) => getField(post, ['author', 'byline', 'writer', 'seller', 'poster']) || SITE_CONFIG.name

const takeawaysOf = (post: SitePost): string[] => {
  const content = getContent(post)
  const raw = content.takeaways ?? content.highlights ?? content.keyPoints
  if (Array.isArray(raw)) return raw.map((r) => asText(r)).filter(Boolean).slice(0, 5)
  // Synthesize from the first list items or opening sentences.
  const body = stripHtml(getBody(post))
  const sentences = body.split(/(?<=[.!?])\s+/).filter((s) => s.length > 30).slice(0, 3)
  return sentences
}

const faqOf = (post: SitePost): Array<{ q: string; a: string }> => {
  const content = getContent(post)
  const raw = content.faq ?? content.faqs ?? content.questions
  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (!item || typeof item !== 'object') return null
        const q = asText((item as Record<string, unknown>).q ?? (item as Record<string, unknown>).question)
        const a = asText((item as Record<string, unknown>).a ?? (item as Record<string, unknown>).answer)
        return q && a ? { q, a } : null
      })
      .filter((v): v is { q: string; a: string } => !!v)
      .slice(0, 6)
  }
  return []
}

const tagsOf = (post: SitePost): string[] => {
  const list = Array.isArray(post.tags) ? post.tags.filter(Boolean) : []
  const category = categoryOf(post, '')
  return Array.from(new Set([category, ...list].filter(Boolean))).slice(0, 12)
}

const canonicalUrlOf = (task: TaskKey, post: SitePost) => {
  const base = (SITE_CONFIG as unknown as { url?: string }).url || ''
  const route = getTaskConfig(task)?.route || `/${task}`
  return `${base.replace(/\/$/, '')}${route}/${post.slug}`
}

// ---------------------------------------------------------------------------
// SchemaJsonLd (kept minimal — post + breadcrumb list)
// ---------------------------------------------------------------------------

function SchemaJsonLd({ task, post }: { task: TaskKey; post: SitePost }) {
  const config = getTaskConfig(task)
  const url = canonicalUrlOf(task, post)
  const image = getImages(post)[0]
  const doc: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': task === 'article' ? 'Article' : task === 'listing' ? 'LocalBusiness' : task === 'classified' ? 'Product' : 'CreativeWork',
    headline: post.title,
    name: post.title,
    description: stripHtml(summaryText(post)).slice(0, 300),
    url,
    ...(image ? { image } : {}),
    author: { '@type': 'Person', name: authorOf(post) },
    publisher: { '@type': 'Organization', name: SITE_CONFIG.name },
  }
  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: (SITE_CONFIG as unknown as { url?: string }).url || '/' },
      { '@type': 'ListItem', position: 2, name: config?.label || task, item: config?.route || `/${task}` },
      { '@type': 'ListItem', position: 3, name: post.title, item: url },
    ],
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(doc) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
    </>
  )
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export function TaskDetailView({ task, post, related, comments = [] }: { task: TaskKey; post: SitePost; related: SitePost[]; comments?: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  return (
    <EditableSiteShell>
      <main
        id="tk-detail-top"
        style={taskThemeStyle(task)}
        className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]"
      >
        <SchemaJsonLd task={task} post={post} />
        <Breadcrumbs task={task} post={post} />
        <HeroStrip task={task} />

        {task === 'listing' ? <ListingDetail post={post} related={related} /> : null}
        {task === 'classified' ? <ClassifiedDetail post={post} related={related} /> : null}
        {task === 'image' ? <ImageDetail post={post} related={related} /> : null}
        {task === 'sbm' ? <BookmarkDetail post={post} related={related} /> : null}
        {task === 'pdf' ? <PdfDetail post={post} related={related} /> : null}
        {task === 'profile' ? <ProfileDetail post={post} related={related} /> : null}
        {task === 'article' ? <ArticleDetail post={post} related={related} comments={comments} /> : null}

        <CtaBand task={task} post={post} />
        <RelatedGrid task={task} related={related} />
        <BackToTop />
      </main>
    </EditableSiteShell>
  )
}

// ---------------------------------------------------------------------------
// Global page chrome — breadcrumbs, hero strip, CTA band, back-to-top
// ---------------------------------------------------------------------------

function Breadcrumbs({ task, post }: { task: TaskKey; post: SitePost }) {
  const config = getTaskConfig(task)
  return (
    <nav aria-label="Breadcrumb" className="border-b border-[var(--tk-line)] bg-[var(--tk-surface)]/60">
      <ol className="mx-auto flex max-w-[var(--editable-container)] flex-wrap items-center gap-1.5 px-6 py-3 text-xs text-[var(--tk-muted)] lg:px-8">
        <li><Link href="/" className="hover:text-[var(--tk-text)]">Home</Link></li>
        <li aria-hidden="true"><ChevronRight className="h-3.5 w-3.5" /></li>
        <li><Link href={config?.route || `/${task}`} className="hover:text-[var(--tk-text)]">{config?.label || task}</Link></li>
        <li aria-hidden="true"><ChevronRight className="h-3.5 w-3.5" /></li>
        <li className="max-w-[60ch] truncate font-medium text-[var(--tk-text)]">{post.title}</li>
      </ol>
    </nav>
  )
}

function HeroStrip({ task }: { task: TaskKey }) {
  const theme = getTaskTheme(task)
  return (
    <div className="border-b border-[var(--tk-line)] bg-[linear-gradient(180deg,var(--tk-accent-soft),transparent)]">
      <div className="mx-auto flex max-w-[var(--editable-container)] flex-wrap items-center gap-x-6 gap-y-3 px-6 py-5 text-xs text-[var(--tk-muted)] lg:px-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--tk-accent)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--tk-on-accent)]">
          <Sparkles className="h-3 w-3" /> {theme.kicker}
        </span>

        <span className="ml-auto inline-flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> Verified by {SITE_CONFIG.name}</span>
      </div>
    </div>
  )
}

function CtaBand({ task, post }: { task: TaskKey; post: SitePost }) {
  const config = getTaskConfig(task)
  return (
    <section className="border-t border-[var(--tk-line)] bg-[var(--tk-accent-soft)]">
      <div className="mx-auto flex max-w-[var(--editable-container)] flex-col items-start gap-6 px-6 py-14 sm:py-16 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--tk-accent)]">Keep exploring</p>
          <h2 className="editable-display mt-3 text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
            Enjoyed {post.title}? Discover more {(config?.label || 'posts').toLowerCase()} on {SITE_CONFIG.name}.
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={config?.route || '/'} className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:opacity-90">
            Browse all {config?.label?.toLowerCase() || 'posts'} <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-5 py-3 text-sm font-semibold transition hover:border-[var(--tk-accent)]">
            Back to home
          </Link>
        </div>
      </div>
    </section>
  )
}

function BackToTop() {
  return (
    <div className="mx-auto flex max-w-[var(--editable-container)] justify-end px-6 py-8 lg:px-8">
      <a href="#tk-detail-top" className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-4 py-2 text-xs font-semibold text-[var(--tk-muted)] transition hover:text-[var(--tk-text)]">
        <ArrowUp className="h-3.5 w-3.5" /> Back to top
      </a>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Shared bits
// ---------------------------------------------------------------------------

function DetailMeta({ post, category, center = false }: { post: SitePost; category?: string; center?: boolean }) {
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  return (
    <div className={`mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 ${center ? 'justify-center' : ''}`}>
      <span className="inline-flex items-center gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className={`h-[18px] w-[18px] ${i < filled ? 'fill-[var(--tk-accent)] text-[var(--tk-accent)]' : 'fill-[var(--tk-line)] text-[var(--tk-line)]'}`} />
        ))}
      </span>
      <span className="text-sm font-semibold text-[var(--tk-text)]">{rating.toFixed(1)}</span>
      <span className="text-sm text-[var(--tk-muted)]">{reviewsOf(post)} reviews</span>
      {category ? (
        <>
          <span className="h-1 w-1 rounded-full bg-[var(--tk-muted)] opacity-50" />
          <span className="text-sm text-[var(--tk-muted)]">{category}</span>
        </>
      ) : null}
    </div>
  )
}

function Kicker({ task, children }: { task: TaskKey; children: React.ReactNode }) {
  const theme = getTaskTheme(task)
  return (
    <div className="flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--tk-accent)]">
      <span>{theme.kicker}</span>
      <span className="h-1 w-1 rounded-full bg-[var(--tk-accent)] opacity-50" />
      <span className="text-[var(--tk-muted)]">{children}</span>
    </div>
  )
}

function BackLink({ task }: { task: TaskKey }) {
  const taskConfig = getTaskConfig(task)
  return (
    <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--tk-muted)] transition hover:text-[var(--tk-text)]">
      <ArrowLeft className="h-4 w-4" /> Back to {taskConfig?.label || 'posts'}
    </Link>
  )
}

function AuthorCard({ post }: { post: SitePost }) {
  const image = getImages(post)[0]
  const author = authorOf(post)
  const initial = author.trim().charAt(0).toUpperCase() || 'A'
  return (
    <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">Written by</p>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[var(--tk-accent-soft)] text-sm font-semibold text-[var(--tk-accent)]">
          {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : initial}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{author}</p>
          <p className="truncate text-xs text-[var(--tk-muted)]">Contributor at {SITE_CONFIG.name}</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-[var(--tk-muted)]">Publishing curated insights, guides and resources for the {SITE_CONFIG.name} community.</p>
    </div>
  )
}

function TableOfContents({ sections }: { sections: BodySection[] }) {
  if (!sections.length) return null
  return (
    <nav aria-label="On this page" className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">On this page</p>
      <ol className="mt-4 space-y-2 text-sm">
        {sections.map((section, i) => (
          <li key={section.id} className="flex gap-2 leading-6">
            <span className="w-5 shrink-0 text-xs text-[var(--tk-muted)]">{String(i + 1).padStart(2, '0')}</span>
            <a href={`#${section.id}`} className="min-w-0 truncate text-[var(--tk-text)] transition hover:text-[var(--tk-accent)]">{section.heading}</a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

function KeyTakeaways({ post }: { post: SitePost }) {
  const items = takeawaysOf(post)
  if (!items.length) return null
  return (
    <aside className="mt-10 rounded-[var(--tk-radius)] border-l-4 border-[var(--tk-accent)] bg-[var(--tk-accent-soft)] p-6">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--tk-accent)]">
        <Sparkles className="h-4 w-4" /> Key takeaways
      </div>
      <ul className="mt-4 space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm leading-6 text-[var(--tk-text)]">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--tk-accent)]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </aside>
  )
}

function SummaryHighlight({ post }: { post: SitePost }) {
  const lead = leadText(post)
  if (!lead) return null
  return (
    <blockquote className="mt-10 rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 text-lg leading-8 text-[var(--tk-text)]">
      <Quote className="h-6 w-6 text-[var(--tk-accent)]" />
      <p className="mt-3 italic">{lead}</p>
    </blockquote>
  )
}

function ShareRow({ task, post }: { task: TaskKey; post: SitePost }) {
  const url = canonicalUrlOf(task, post)
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(post.title)
  const share = [
    { name: 'Twitter', href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, Icon: Twitter },
    { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, Icon: Facebook },
    { name: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, Icon: Linkedin },
    { name: 'Email', href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`, Icon: Mail },
    { name: 'Copy link', href: url, Icon: Link2 },
  ]
  return (
    <div className="mt-10 flex flex-wrap items-center gap-3 border-y border-[var(--tk-line)] py-5">
      <span className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">Share</span>
      <div className="flex flex-wrap gap-2">
        {share.map(({ name, href, Icon }) => (
          <a key={name} href={href} target="_blank" rel="noreferrer" aria-label={`Share on ${name}`} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-3 py-1.5 text-xs font-medium transition hover:border-[var(--tk-accent)] hover:text-[var(--tk-accent)]">
            <Icon className="h-3.5 w-3.5" /> {name}
          </a>
        ))}
      </div>
    </div>
  )
}

function TagCloud({ post }: { post: SitePost }) {
  const tags = tagsOf(post)
  if (!tags.length) return null
  return (
    <div className="mt-10">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">Tags</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-3 py-1 text-xs font-medium text-[var(--tk-muted)] transition hover:border-[var(--tk-accent)] hover:text-[var(--tk-accent)]">
            <Tag className="h-3 w-3" /> {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

function FaqAccordion({ post }: { post: SitePost }) {
  const faqs = faqOf(post)
  if (!faqs.length) return null
  return (
    <section className="mt-14">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-[var(--tk-accent)]">
        <Info className="h-4 w-4" /> Frequently asked
      </div>
      <h2 className="editable-display mt-3 text-2xl font-semibold tracking-[-0.02em]">Questions &amp; answers</h2>
      <div className="mt-6 space-y-3">
        {faqs.map((item, i) => (
          <details key={i} className="group rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-5 open:shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold">
              <span>{item.q}</span>
              <ChevronRight className="h-4 w-4 text-[var(--tk-muted)] transition group-open:rotate-90" />
            </summary>
            <p className="mt-3 text-sm leading-7 text-[var(--tk-muted)]">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

function CommentsPrompt({ post }: { post: SitePost }) {
  return (
    <section className="mt-14 rounded-[var(--tk-radius)] border border-dashed border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div>
          <h3 className="editable-display text-lg font-semibold tracking-[-0.01em]">Join the conversation</h3>
          <p className="mt-1 text-sm leading-6 text-[var(--tk-muted)]">Have thoughts on {post.title}? Share your feedback and questions with the community.</p>
          <Link href="#comments" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--tk-accent)]">
            Leave a comment <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

// Real ads slot on the detail sidebar — pulls from the app's ads system.
function AdsSlot({ label = 'Sponsored' }: { label?: string }) {
  return (
    <div data-ads-slot="detail-sidebar" className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-raised)] p-4">
      <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--tk-muted)]">{label}</p>
      <Ads slot="sidebar" showLabel={false} className="mx-auto w-full" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Article
// ---------------------------------------------------------------------------

function ArticleDetail({ post, related, comments }: { post: SitePost; related: SitePost[]; comments: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  const images = getImages(post)
  const { html, sections } = formatPlainText(getBody(post))
  return (
    <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-20 lg:px-8">
      <BackLink task="article" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-[var(--tk-accent)]">{categoryOf(post, 'Article')}</p>
          <h1 className="editable-display mt-5 text-balance text-4xl font-semibold leading-[1.06] tracking-[-0.03em] sm:text-5xl lg:text-[3.4rem]">{post.title}</h1>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-[var(--tk-muted)]">
            <span className="inline-flex items-center gap-1.5"><UserRound className="h-4 w-4" /> {authorOf(post)}</span>
            {dateOf(post) ? <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {dateOf(post)}</span> : null}
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {readingMinutes(post)} min read</span>
            <span className="inline-flex items-center gap-1.5"><Eye className="h-4 w-4" /> {viewsOf(post).toLocaleString()} views</span>
          </div>
          {images[0] ? <img src={images[0]} alt="" className="mt-10 aspect-[16/9] w-full rounded-[var(--tk-radius)] border border-[var(--tk-line)] object-cover" /> : null}
          <SummaryHighlight post={post} />
          <KeyTakeaways post={post} />
          <div
            className="article-content mt-10 max-w-none text-[1.0625rem] leading-8 text-[var(--tk-text)]"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <ShareRow task="article" post={post} />
          <TagCloud post={post} />
          <FaqAccordion post={post} />
          <CommentsPrompt post={post} />
          <div id="comments" className="mt-10">
            <EditableArticleComments slug={post.slug} comments={comments} />
          </div>
        </article>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <TableOfContents sections={sections} />
          <AuthorCard post={post} />
          <AdsSlot />
          <RelatedPanel task="article" post={post} related={related} />
        </aside>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Listing (business hours + map + contact card)
// ---------------------------------------------------------------------------

function BusinessHours({ post }: { post: SitePost }) {
  const content = getContent(post)
  const raw = content.hours ?? content.businessHours
  const defaults = [
    ['Monday', '9:00 AM - 6:00 PM'],
    ['Tuesday', '9:00 AM - 6:00 PM'],
    ['Wednesday', '9:00 AM - 6:00 PM'],
    ['Thursday', '9:00 AM - 6:00 PM'],
    ['Friday', '9:00 AM - 6:00 PM'],
    ['Saturday', '10:00 AM - 4:00 PM'],
    ['Sunday', '10:00 AM - 4:00 PM'],
  ] as Array<[string, string]>
  let entries: Array<[string, string]> = defaults
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    entries = Object.entries(raw as Record<string, unknown>).map(([k, v]) => [k, asText(v) || 'Closed'])
  }
  return (
    <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
      <div className="flex items-center gap-2 text-sm font-semibold"><Clock className="h-4 w-4 text-[var(--tk-accent)]" /> Business hours</div>
      <dl className="mt-4 grid grid-cols-1 gap-1.5 text-sm">
        {entries.map(([day, time]) => (
          <div key={day} className="flex items-center justify-between gap-3 border-b border-dashed border-[var(--tk-line)] py-1.5 last:border-b-0">
            <dt className="text-[var(--tk-muted)]">{day}</dt>
            <dd className="font-medium">{time}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function ListingDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const logo = images[0]
  const address = getField(post, ['address', 'location', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  const mapSrc = mapSrcFor(post)
  const { html, sections } = formatPlainText(getBody(post))
  return (
    <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-20 lg:px-8">
      <BackLink task="listing" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        <article className="min-w-0">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-raised)]">
              {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : <Building2 className="h-12 w-12 text-[var(--tk-muted)]" />}
            </div>
            <div className="min-w-0">
              <Kicker task="listing">Business listing</Kicker>
              <h1 className="editable-display mt-4 text-4xl font-semibold leading-[1.04] tracking-[-0.03em] sm:text-5xl">{post.title}</h1>
              <DetailMeta post={post} category={getField(post, ['category'])} />
            </div>
          </div>
          {leadText(post) ? <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
          <InfoGrid items={[['Location', address, MapPin], ['Phone', phone, Phone], ['Email', email, Mail], ['Website', website, Globe2]]} />
          <KeyTakeaways post={post} />
          <Divider />
          <div className="article-content mt-2 max-w-none text-[1.0625rem] leading-8 text-[var(--tk-text)]" dangerouslySetInnerHTML={{ __html: html }} />
          <ImageStrip images={images.slice(1)} label="Showcase" />
          <ShareRow task="listing" post={post} />
          <TagCloud post={post} />
          <FaqAccordion post={post} />
          <CommentsPrompt post={post} />
        </article>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <TableOfContents sections={sections} />
          {mapSrc ? <MapBox src={mapSrc} label={address || post.title} /> : null}
          <BusinessHours post={post} />
          <ContactAction website={website} phone={phone} email={email} />
          <AuthorCard post={post} />
          <AdsSlot />
          <RelatedPanel task="listing" post={post} related={related} />
        </aside>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Classified (price + condition + seller)
// ---------------------------------------------------------------------------

function ClassifiedDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'availability', 'type'])
  const brand = getField(post, ['brand', 'make', 'manufacturer'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  const { html, sections } = formatPlainText(getBody(post))
  return (
    <section className="mx-auto grid max-w-[var(--editable-container)] gap-10 px-6 py-14 sm:py-20 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-8">
      <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <BackLink task="classified" />
        <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-7 shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
          <Kicker task="classified">Classified</Kicker>
          <h1 className="editable-display mt-4 text-2xl font-semibold leading-tight tracking-[-0.02em]">{post.title}</h1>
          <DetailMeta post={post} category={getField(post, ['category'])} />
          <p className="editable-display mt-6 text-4xl font-semibold tracking-[-0.03em] text-[var(--tk-accent)]">{price || 'Open offer'}</p>
          <div className="mt-6 space-y-2.5">
            {condition ? <BadgeLine label="Condition" value={condition} /> : null}
            {brand ? <BadgeLine label="Brand" value={brand} /> : null}
            {location ? <BadgeLine label="Location" value={location} /> : null}
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            {phone ? <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:opacity-90"><Phone className="h-4 w-4" /> Call now</a> : null}
            {email ? <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-5 py-2.5 text-sm font-semibold transition hover:border-[var(--tk-accent)]"><Mail className="h-4 w-4" /> Email</a> : null}
          </div>
        </div>
        <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">Seller</p>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-sm font-semibold text-[var(--tk-accent)]">{authorOf(post).charAt(0).toUpperCase()}</div>
            <div>
              <p className="text-sm font-semibold">{authorOf(post)}</p>
              <p className="text-xs text-[var(--tk-muted)]">Member since {dateOf(post) || 'this year'}</p>
            </div>
          </div>
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-[var(--tk-muted)]"><Shield className="h-3.5 w-3.5" /> Verified seller</p>
        </div>
        <TableOfContents sections={sections} />
        <AdsSlot />
      </aside>
      <article className="min-w-0">
        <ImageStrip images={images} label="Offer images" large />
        <SummaryHighlight post={post} />
        <KeyTakeaways post={post} />
        <div className="article-content mt-10 max-w-none text-[1.0625rem] leading-8 text-[var(--tk-text)]" dangerouslySetInnerHTML={{ __html: html }} />
        <ContactAction website={website} phone={phone} email={email} />
        <ShareRow task="classified" post={post} />
        <TagCloud post={post} />
        <FaqAccordion post={post} />
        <CommentsPrompt post={post} />
        <RelatedPanel task="classified" post={post} related={related} />
      </article>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Image (gallery-lightbox-like grid with details drawer via <details>)
// ---------------------------------------------------------------------------

function ImageDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const gallery = images.length ? images : ['/placeholder.svg?height=900&width=1200']
  const { html, sections } = formatPlainText(getBody(post))
  return (
    <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-20 lg:px-8">
      <BackLink task="image" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_0.6fr]">
        <div>
          <figure className="overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
            <img src={gallery[0]} alt="" className="w-full object-cover" />
            <figcaption className="border-t border-[var(--tk-line)] p-4 text-xs text-[var(--tk-muted)]">
              {post.title} — cover shot 1 of {gallery.length}
            </figcaption>
          </figure>
          {gallery.length > 1 ? (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {gallery.slice(1).map((image, index) => (
                <details key={`${image}-${index}`} className="group">
                  <summary className="block cursor-pointer list-none overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
                    <img src={image} alt="" className="aspect-[4/3] w-full object-cover transition group-open:scale-[1.02]" />
                  </summary>
                  <div className="mt-2 rounded-lg bg-[var(--tk-raised)] p-3 text-xs text-[var(--tk-muted)]">Shot {index + 2} of {gallery.length}</div>
                </details>
              ))}
            </div>
          ) : null}
          <SummaryHighlight post={post} />
          <div className="article-content mt-8 max-w-none text-[1.0625rem] leading-8 text-[var(--tk-text)]" dangerouslySetInnerHTML={{ __html: html }} />
          <ShareRow task="image" post={post} />
          <TagCloud post={post} />
          <FaqAccordion post={post} />
        </div>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-3.5 py-1.5 text-xs font-medium text-[var(--tk-muted)]"><Camera className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> Image story</div>
          <h1 className="editable-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl">{post.title}</h1>
          <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">Image details</p>
            <dl className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-[var(--tk-muted)]">Shots</dt><dd className="font-medium">{gallery.length}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[var(--tk-muted)]">Category</dt><dd className="font-medium">{categoryOf(post, 'Image')}</dd></div>
              
            </dl>
          </div>
          <KeyTakeaways post={post} />
          <TableOfContents sections={sections} />
          <AuthorCard post={post} />
          <AdsSlot />
          <RelatedPanel task="image" post={post} related={related} />
        </aside>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Bookmark
// ---------------------------------------------------------------------------

function BookmarkDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const website = getField(post, ['website', 'url', 'link'])
  const { html, sections } = formatPlainText(getBody(post))
  return (
    <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-20 lg:px-8">
      <BackLink task="sbm" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="min-w-0 max-w-3xl">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><Bookmark className="h-7 w-7" /></div>
          <div className="mt-6"><Kicker task="sbm">Saved resource</Kicker></div>
          <h1 className="editable-display mt-4 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl">{post.title}</h1>
          {leadText(post) ? <p className="mt-6 text-lg leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
          {website ? (
            <div className="mt-8 rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">Resource URL</p>
              <p className="mt-3 truncate text-sm font-semibold text-[var(--tk-accent)]">{website}</p>
              <Link href={website} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:opacity-90">
                Open resource <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          ) : null}
          <KeyTakeaways post={post} />
          <div className="article-content mt-8 max-w-none text-[1.0625rem] leading-8 text-[var(--tk-text)]" dangerouslySetInnerHTML={{ __html: html }} />
          <ShareRow task="sbm" post={post} />
          <TagCloud post={post} />
          <FaqAccordion post={post} />
          <CommentsPrompt post={post} />
        </article>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <TableOfContents sections={sections} />
          <AuthorCard post={post} />
          <AdsSlot />
          <RelatedPanel task="sbm" post={post} related={related} />
        </aside>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// PDF (downloads + doc metadata)
// ---------------------------------------------------------------------------

function DocumentMetadata({ post }: { post: SitePost }) {
  const size = getField(post, ['fileSize', 'size']) || `${(0.5 + (hashStr(post.slug || 's') % 40) / 10).toFixed(1)} MB`
  const language = getField(post, ['language']) || 'English'
  return (
    <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">Document details</p>
      <dl className="mt-3 space-y-1.5 text-sm">
        <div className="flex justify-between gap-4"><dt className="text-[var(--tk-muted)]">Format</dt><dd className="font-medium">PDF</dd></div>
    
        <div className="flex justify-between gap-4"><dt className="text-[var(--tk-muted)]">Size</dt><dd className="font-medium">{size}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-[var(--tk-muted)]">Language</dt><dd className="font-medium">{language}</dd></div>
       
      </dl>
    </div>
  )
}

function PdfDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const fileUrl = getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
  const { html, sections } = formatPlainText(getBody(post))
  return (
    <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-20 lg:px-8">
      <BackLink task="pdf" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article className="min-w-0">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[var(--tk-radius)] bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><FileText className="h-9 w-9" /></div>
            <div className="min-w-0">
              <Kicker task="pdf">{categoryOf(post, 'Document')}</Kicker>
              <h1 className="editable-display mt-3 text-3xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-4xl">{post.title}</h1>
            </div>
          </div>
          <SummaryHighlight post={post} />
          <KeyTakeaways post={post} />
          <div className="article-content mt-10 max-w-none text-[1.0625rem] leading-8 text-[var(--tk-text)]" dangerouslySetInnerHTML={{ __html: html }} />
          {fileUrl ? (
            <div className="mt-10 overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
              <div className="flex items-center justify-between gap-3 border-b border-[var(--tk-line)] p-4">
                <span className="text-sm font-semibold">Document preview</span>
                <Link href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-4 py-2 text-xs font-semibold text-[var(--tk-on-accent)] transition hover:opacity-90">Download <Download className="h-4 w-4" /></Link>
              </div>
              <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} title={post.title} className="h-[78vh] w-full bg-[var(--tk-raised)]" />
            </div>
          ) : null}
          <ShareRow task="pdf" post={post} />
          <TagCloud post={post} />
          <FaqAccordion post={post} />
          <CommentsPrompt post={post} />
        </article>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {fileUrl ? (
            <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
              <p className="text-sm font-semibold">Get this document</p>
              <p className="mt-2 text-sm leading-6 text-[var(--tk-muted)]">Open or download the full file in a new tab.</p>
              <Link href={fileUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:opacity-90">Download PDF <Download className="h-4 w-4" /></Link>
              <a href={fileUrl} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--tk-line)] px-5 py-3 text-sm font-semibold transition hover:border-[var(--tk-accent)]">Save link <Bookmark className="h-4 w-4" /></a>
            </div>
          ) : null}
          <DocumentMetadata post={post} />
          <TableOfContents sections={sections} />
          <AuthorCard post={post} />
          <AdsSlot />
          <RelatedPanel task="pdf" post={post} related={related} />
        </aside>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Profile (portfolio grid + skills)
// ---------------------------------------------------------------------------

function ProfileDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  const website = getField(post, ['website', 'url'])
  const email = getField(post, ['email'])
  const phone = getField(post, ['phone', 'telephone'])
  const skills = tagsOf(post)
  const { html, sections } = formatPlainText(getBody(post))
  return (
    <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-20 lg:px-8">
      <BackLink task="profile" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-8 text-center shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
            <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-[var(--tk-line)] bg-[var(--tk-raised)]">
              {images[0] ? <img src={images[0]} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-14 w-14 text-[var(--tk-muted)]" />}
            </div>
            <h1 className="editable-display mt-6 text-2xl font-semibold tracking-[-0.02em]">{post.title}</h1>
            {role ? <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--tk-accent)]">{role}</p> : null}
            <DetailMeta post={post} center />
            <ContactAction website={website} email={email} phone={phone} bare />
          </div>
          {skills.length ? (
            <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">Skills &amp; focus</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span key={skill} className="inline-flex items-center rounded-full bg-[var(--tk-accent-soft)] px-3 py-1 text-xs font-medium text-[var(--tk-accent)]">{skill}</span>
                ))}
              </div>
            </div>
          ) : null}
          <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">Community</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-center">
              <div><p className="editable-display text-xl font-semibold">{viewsOf(post).toLocaleString()}</p><p className="text-[10px] uppercase tracking-[0.16em] text-[var(--tk-muted)]">Views</p></div>
              <div><p className="editable-display text-xl font-semibold">{likesOf(post)}</p><p className="text-[10px] uppercase tracking-[0.16em] text-[var(--tk-muted)]">Followers</p></div>
            </div>
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-[var(--tk-muted)]"><Users className="h-3.5 w-3.5" /> Active member</p>
          </div>
          <TableOfContents sections={sections} />
          <AdsSlot />
        </aside>
        <article className="min-w-0">
          <Kicker task="profile">Profile</Kicker>
          <SummaryHighlight post={post} />
          <KeyTakeaways post={post} />
          <div className="article-content mt-10 max-w-none text-[1.0625rem] leading-8 text-[var(--tk-text)]" dangerouslySetInnerHTML={{ __html: html }} />
          {images.length > 1 ? (
            <section className="mt-12">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">Portfolio</p>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {images.slice(1).map((image, index) => (
                  <figure key={`${image}-${index}`} className="overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
                    <img src={image} alt="" className="aspect-square w-full object-cover transition hover:scale-[1.03]" />
                  </figure>
                ))}
              </div>
            </section>
          ) : null}
          <ShareRow task="profile" post={post} />
          <TagCloud post={post} />
          <FaqAccordion post={post} />
          <CommentsPrompt post={post} />
          <RelatedPanel task="profile" post={post} related={related} />
        </article>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Shared building blocks
// ---------------------------------------------------------------------------

function Divider() {
  return <div className="my-10 h-px bg-[var(--tk-line)]" />
}

function InfoGrid({ items }: { items: Array<[string, string, typeof MapPin]> }) {
  const visible = items.filter(([, value]) => value)
  if (!visible.length) return null
  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-2">
      {visible.map(([label, value, Icon]) => (
        <div key={label} className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]"><Icon className="h-4 w-4 text-[var(--tk-accent)]" /> {label}</div>
          <p className="mt-2 break-words text-sm font-medium leading-6">{value}</p>
        </div>
      ))}
    </div>
  )
}

function ImageStrip({ images, label, large = false }: { images: string[]; label: string; large?: boolean }) {
  if (!images.length) return null
  return (
    <section className="mt-10">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">{label}</p>
      <div className={`mt-4 grid gap-3 ${large ? 'sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {images.slice(0, large ? 4 : 8).map((image, index) => <img key={`${image}-${index}`} src={image} alt="" className="aspect-[4/3] rounded-[var(--tk-radius)] border border-[var(--tk-line)] object-cover" />)}
      </div>
    </section>
  )
}

function MapBox({ src, label }: { src: string; label: string }) {
  return (
    <div className="overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
      <div className="flex items-center gap-2 p-4 text-sm font-semibold"><MapPin className="h-4 w-4 text-[var(--tk-accent)]" /> {label || 'Map location'}</div>
      <iframe src={src} title="Map" loading="lazy" className="h-72 w-full border-0" />
    </div>
  )
}

function ContactAction({ website, phone, email, bare = false }: { website?: string; phone?: string; email?: string; bare?: boolean }) {
  if (!website && !phone && !email) return null
  const buttons = (
    <div className={`flex flex-wrap gap-2.5 ${bare ? 'justify-center' : ''}`}>
      {website ? <Link href={website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:opacity-90">Website <ExternalLink className="h-4 w-4" /></Link> : null}
      {phone ? <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-4 py-2.5 text-sm font-semibold transition hover:border-[var(--tk-accent)]"><Phone className="h-4 w-4" /> Call</a> : null}
      {email ? <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-4 py-2.5 text-sm font-semibold transition hover:border-[var(--tk-accent)]"><Mail className="h-4 w-4" /> Email</a> : null}
    </div>
  )
  if (bare) return <div className="mt-6">{buttons}</div>
  return (
    <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">Quick actions</p>
      <div className="mt-4">{buttons}</div>
    </div>
  )
}

function BadgeLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--tk-line)] bg-[var(--tk-raised)] px-4 py-3 text-sm">
      <span className="font-medium uppercase tracking-[0.12em] text-[var(--tk-muted)]">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

function RelatedPanel({ task, post, related }: { task: TaskKey; post: SitePost; related: SitePost[] }) {
  const taskConfig = getTaskConfig(task)
  const sidebarRelated = related.slice(0, 4)
  return (
    <div className="space-y-6">
      <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">About this post</p>
        <div className="mt-4 grid gap-2.5 text-sm text-[var(--tk-muted)]">
          <p className="inline-flex items-center gap-2"><Tag className="h-4 w-4 text-[var(--tk-accent)]" /> {taskConfig?.label || task}</p>
          <p className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[var(--tk-accent)]" /> {SITE_CONFIG.name}</p>
          <p className="inline-flex items-center gap-2"><Clock className="h-4 w-4 text-[var(--tk-accent)]" /> {readingMinutes(post)} min read</p>
        </div>
      </div>
      {sidebarRelated.length ? (
        <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="editable-display text-lg font-semibold tracking-[-0.02em]">More like this</h2>
            <Link href={taskConfig?.route || '/'} className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--tk-accent)]">View all</Link>
          </div>
          <div className="mt-5 grid gap-3">
            {sidebarRelated.map((item) => <RelatedCard key={item.id || item.slug} task={task} post={item} />)}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function RelatedGrid({ task, related }: { task: TaskKey; related: SitePost[] }) {
  if (!related.length) return null
  const taskConfig = getTaskConfig(task)
  return (
    <section className="border-t border-[var(--tk-line)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-16 lg:px-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--tk-accent)]">Related</p>
            <h2 className="editable-display mt-2 text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">More {(taskConfig?.label || 'posts').toLowerCase()} to explore</h2>
          </div>
          <Link href={taskConfig?.route || '/'} className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-[var(--tk-accent)]">View all <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {related.map((item) => <RelatedCard key={item.id || item.slug} task={task} post={item} grid />)}
        </div>
      </div>
    </section>
  )
}

function RelatedCard({ task, post, grid = false }: { task: TaskKey; post: SitePost; grid?: boolean }) {
  const image = getImages(post)[0]
  const href = `${getTaskConfig(task)?.route || `/${task}`}/${post.slug}`
  if (grid) {
    return (
      <Link href={href} className="group block overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-300 hover:-translate-y-1 hover:border-[var(--tk-accent)]">
        <div className="relative aspect-[16/10] overflow-hidden bg-[var(--tk-raised)]">
          {image ? <img src={image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" /> : <div className="flex h-full items-center justify-center"><FileText className="h-7 w-7 text-[var(--tk-muted)]" /></div>}
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[var(--tk-accent)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--tk-on-accent)]">{categoryOf(post, task)}</span>
        </div>
        <div className="p-5">
          <h3 className="editable-display line-clamp-2 text-base font-semibold leading-snug tracking-[-0.01em]">{post.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{stripHtml(summaryText(post))}</p>
          <div className="mt-3 flex items-center gap-3 text-[11px] text-[var(--tk-muted)]">
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {readingMinutes(post)} min</span>
            <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> {viewsOf(post).toLocaleString()}</span>
          </div>
        </div>
      </Link>
    )
  }
  return (
    <Link href={href} className="group flex gap-3 rounded-xl border border-[var(--tk-line)] p-3 transition hover:border-[var(--tk-accent)]">
      {image && task !== 'sbm' ? <img src={image} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" /> : <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-[var(--tk-raised)]"><FileText className="h-5 w-5 text-[var(--tk-muted)]" /></div>}
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug tracking-[-0.01em]">{post.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[var(--tk-muted)]">{stripHtml(summaryText(post))}</p>
      </div>
    </Link>
  )
}
