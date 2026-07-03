import Link from 'next/link'
import { ArrowUpRight, BookOpen, Bookmark, Clock3, Flame, MapPin, Star, TrendingUp, Users } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { TaskKey } from '@/lib/site-config'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'

export function getEditablePostImage(post?: SitePost | null) {
  const media = Array.isArray(post?.media) ? post?.media : []
  const mediaUrl = media.find((item) => typeof item?.url === 'string' && item.url)?.url
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  const images = Array.isArray(content.images) ? content.images : []
  const contentImage = images.find((url): url is string => typeof url === 'string' && Boolean(url))
  const logo = typeof content.logo === 'string' ? content.logo : ''
  return mediaUrl || contentImage || logo || '/placeholder.svg?height=900&width=1400'
}

export function getEditableExcerpt(post?: SitePost | null, limit = 150) {
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  const raw = (typeof content.description === 'string' && content.description) || (typeof content.summary === 'string' && content.summary) || post?.summary || ''
  const clean = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return clean.length > limit ? `${clean.slice(0, limit).trim()}...` : clean
}

export function getEditableCategory(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || 'Featured'
}

export function postHref(task: TaskKey, post: SitePost, route = `/${task}`) {
  return `${route}/${post.slug}`
}

// --- internal helpers -------------------------------------------------------

function readingTimeFor(post?: SitePost | null) {
  const text = getEditableExcerpt(post, 4000)
  const words = text ? text.split(/\s+/).length : 0
  const minutes = Math.max(3, Math.round(words / 220) || 4)
  return minutes
}

function pseudoNumber(post: SitePost | null | undefined, base: number, spread: number) {
  const seed = (post?.id || post?.slug || 'x').toString()
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  return base + (hash % spread)
}

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

function MetaDot() {
  return <span aria-hidden className="inline-block h-1 w-1 rounded-full bg-current opacity-40" />
}

function AuthorAvatar({ post, tone = 'light' }: { post: SitePost; tone?: 'light' | 'dark' }) {
  const initials = (post.title || 'A').trim().charAt(0).toUpperCase()
  const bg = tone === 'dark' ? 'bg-white/15 text-white' : 'bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]'
  return (
    <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${bg}`} aria-hidden>
      {initials}
    </span>
  )
}

// --- exported cards ---------------------------------------------------------

export function EditorialFeatureCard({ post, href, label = 'Featured read' }: { post: SitePost; href: string; label?: string }) {
  const minutes = readingTimeFor(post)
  const readers = pseudoNumber(post, 1200, 4800)
  const rating = (pseudoNumber(post, 42, 8) / 10).toFixed(1)
  return (
    <Link href={href} className={`group relative block min-h-[520px] overflow-hidden ${dc.surface.dark}`}>
      <img src={getEditablePostImage(post)} alt={post.title} className={`absolute inset-0 h-full w-full object-cover opacity-65 ${dc.motion.zoom}`} />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.05),rgba(10,10,10,0.9))]" />

      {/* Top row: label + rating */}
      <div className="relative flex items-center justify-between p-7 sm:p-10 sm:pb-0">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8db3ff] backdrop-blur">
          <Flame className="h-3.5 w-3.5" /> {label}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
          <Star className="h-3.5 w-3.5 fill-[#ffd166] text-[#ffd166]" /> {rating}
        </span>
      </div>

      <div className="relative flex min-h-[440px] flex-col justify-end p-7 sm:p-10">
        <span className="editable-label text-xs uppercase tracking-[0.18em] text-[#8db3ff]">{getEditableCategory(post)}</span>
        <h3 className="mt-4 max-w-3xl text-3xl font-semibold leading-[1.08] transition duration-300 group-hover:translate-x-1 sm:text-5xl">
          {post.title}
        </h3>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">{getEditableExcerpt(post, 180)}</p>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-white/65">
          <span className="inline-flex items-center gap-2"><AuthorAvatar post={post} tone="dark" /> Editorial desk</span>
          <MetaDot />
          <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" /> {minutes} min read</span>
          <MetaDot />
          <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {formatCount(readers)} readers</span>
        </div>

        <span className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[var(--slot4-page-text)] transition duration-300 group-hover:bg-[var(--slot4-accent)] group-hover:text-white">
          Read the story <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}

export function RailPostCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const minutes = readingTimeFor(post)
  const hot = index < 2
  return (
    <Link href={href} className={`group ${dc.layout.minRailCard} block ${dc.surface.card} ${dc.motion.lift}`}>
      <div className={`${dc.media.frame} aspect-[4/3] rounded-b-none`}>
        <img src={getEditablePostImage(post)} alt={post.title} className={`absolute inset-0 h-full w-full object-cover ${dc.motion.zoom}`} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_55%,rgba(0,0,0,0.55))]" />
        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--slot4-accent)]">
            <BookOpen className="h-3 w-3" /> {getEditableCategory(post)}
          </span>
          {hot ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--slot4-accent)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
              <TrendingUp className="h-3 w-3" /> Trending
            </span>
          ) : null}
        </div>
        <span className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-[var(--slot4-page-text)] opacity-0 transition duration-300 group-hover:opacity-100">
          <Bookmark className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-mono text-[var(--slot4-muted-text)]">#{String(index + 1).padStart(2, '0')}</span>
          <span className="inline-flex items-center gap-1.5 text-[var(--slot4-muted-text)]"><Clock3 className="h-3.5 w-3.5" /> {minutes} min</span>
        </div>
        <h3 className="mt-3 line-clamp-2 text-xl font-semibold leading-snug transition duration-300 group-hover:text-[var(--slot4-accent)]">{post.title}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--slot4-muted-text)]">{getEditableExcerpt(post, 120)}</p>
        <div className="mt-4 flex items-center justify-between border-t border-[var(--editable-border)] pt-3">
          <span className="inline-flex items-center gap-2 text-xs text-[var(--slot4-muted-text)]">
            <AuthorAvatar post={post} /> Editorial desk
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--slot4-accent)] transition group-hover:gap-2">
            Read <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

export function CompactIndexCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const minutes = readingTimeFor(post)
  const saves = pseudoNumber(post, 40, 220)
  return (
    <Link href={href} className={`group block ${dc.surface.soft} p-5 ${dc.motion.lift}`}>
      <div className="flex gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-[linear-gradient(135deg,#44c7f6,#0037f0)] text-sm font-semibold text-white shadow-[0_10px_24px_rgba(14,84,241,0.35)]">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[var(--slot4-accent)]">
              <MapPin className="h-3 w-3" /> {getEditableCategory(post)}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[var(--slot4-muted-text)]">
              <Clock3 className="h-3 w-3" /> {minutes} min read
            </span>
            <span className="inline-flex items-center gap-1.5 text-[var(--slot4-muted-text)]">
              <Bookmark className="h-3 w-3" /> {saves} saves
            </span>
          </div>
          <h3 className="mt-2 line-clamp-2 text-lg font-semibold leading-snug transition duration-300 group-hover:text-[var(--slot4-accent)]">
            {post.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{getEditableExcerpt(post, 100)}</p>
          <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--slot4-accent)] transition group-hover:gap-2">
            Open entry <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

export function ArticleListCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const minutes = readingTimeFor(post)
  const readers = pseudoNumber(post, 380, 5200)
  const rating = (pseudoNumber(post, 42, 8) / 10).toFixed(1)
  return (
    <Link href={href} className={`group grid gap-5 overflow-hidden ${dc.surface.card} p-4 ${dc.motion.lift} sm:grid-cols-[240px_minmax(0,1fr)]`}>
      <div className={`${dc.media.frame} aspect-[4/3] sm:aspect-auto sm:min-h-[200px]`}>
        <img src={getEditablePostImage(post)} alt={post.title} className={`absolute inset-0 h-full w-full object-cover ${dc.motion.zoom}`} />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--slot4-accent)]">
          <BookOpen className="h-3 w-3" /> {getEditableCategory(post)}
        </span>
      </div>
      <div className="min-w-0 p-2 sm:py-4 sm:pr-5">
        <div className="flex items-center gap-3 text-xs text-[var(--slot4-muted-text)]">
          <span className={`${dc.type.eyebrow} !mt-0`}>Entry {String(index + 1).padStart(2, '0')}</span>
          <MetaDot />
          <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {minutes} min read</span>
          <MetaDot />
          <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 text-[var(--slot4-accent)]" /> {rating}</span>
        </div>
        <h2 className="mt-3 line-clamp-2 text-2xl font-semibold leading-tight transition duration-300 group-hover:text-[var(--slot4-accent)] sm:text-3xl">{post.title}</h2>
        <p className="mt-4 line-clamp-3 text-sm leading-7 text-[var(--slot4-muted-text)]">{getEditableExcerpt(post, 170)}</p>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--editable-border)] pt-4">
          <span className="inline-flex items-center gap-2 text-xs text-[var(--slot4-muted-text)]">
            <AuthorAvatar post={post} /> Editorial desk &middot; {formatCount(readers)} readers
          </span>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--slot4-accent)] transition group-hover:gap-3">
            View entry <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}
