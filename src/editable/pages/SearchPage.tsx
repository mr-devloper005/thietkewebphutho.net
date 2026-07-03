import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Filter, Search, TrendingUp, Sparkles, Tag, Lightbulb, Gift, Compass, Flame } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { fetchSiteFeed } from '@/lib/site-connector'
import { getPostTaskKey } from '@/lib/task-data'
import { getMockPostsForTask } from '@/lib/mock-posts'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { pagesContent } from '@/editable/content/pages.content'
import { formatRichHtml } from '@/components/shared/rich-content'
import { Ads } from '@/lib/ads'

export const revalidate = 3

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/search',
    title: pagesContent.search.metadata.title,
    description: pagesContent.search.metadata.description,
  })
}

const popularSearches = ['weekend brunch', 'kids-friendly cafes', 'independent bookshops', 'live jazz venues', 'walking tours', 'artisan bakeries', 'thrift and vintage', 'craft breweries']
const categoryChips = ['Food and drink', 'Shopping', 'Arts and culture', 'Wellness', 'Outdoors', 'Services', 'Nightlife', 'Family']
const searchTips = [
  'Combine a category with a neighborhood, like "coffee koramangala".',
  'Add a season or day, like "sunday market" or "monsoon indoor".',
  'Use plain English. Our search understands intent, not just keywords.',
  'Filter by content type to focus on guides, listings, or classifieds.',
]

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ')
const compactText = (value: unknown) => typeof value === 'string' ? stripHtml(value).replace(/\s+/g, ' ').trim().toLowerCase() : ''
const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const getImage = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.find((item) => typeof item?.url === 'string')?.url : ''
  const images = Array.isArray(content.images) ? content.images.find((item) => typeof item === 'string') as string | undefined : ''
  return media || compactRaw(content.featuredImage) || compactRaw(content.image) || compactRaw(content.thumbnail) || images || ''
}
const compactRaw = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const summaryOf = (post: SitePost) => post.summary || compactRaw(getContent(post).description) || compactRaw(getContent(post).excerpt) || ''

const matches = (post: SitePost, query: string, category: string, task: string) => {
  const content = getContent(post)
  const typeText = compactText(content.type)
  if (typeText === 'comment') return false
  const derivedTask = getPostTaskKey(post) || typeText
  if (task && derivedTask !== task) return false
  const categoryText = compactText(content.category)
  const tagsText = compactText(Array.isArray(post.tags) ? post.tags.join(' ') : '')
  if (category && !(categoryText || tagsText).includes(category)) return false
  if (!query) return true
  return [post.title, post.summary, content.description, content.body, content.excerpt, content.category, Array.isArray(post.tags) ? post.tags.join(' ') : '']
    .some((value) => compactText(value).includes(query))
}

function SearchResultCard({ post, index }: { post: SitePost; index: number }) {
  const task = getPostTaskKey(post) as TaskKey | null
  const taskRoute = SITE_CONFIG.tasks.find((item) => item.key === task)?.route
  const href = `${taskRoute || `/${task || 'article'}`}/${post.slug}`
  const image = getImage(post)
  const summary = summaryOf(post)
  const taskLabel = SITE_CONFIG.tasks.find((item) => item.key === task)?.label || 'Post'
  const strong = index % 5 === 0

  return (
    <Link href={href} className={`group block overflow-hidden rounded-[2rem] border border-[var(--editable-border)] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-2xl ${strong ? 'md:col-span-2' : ''}`}>
      {image ? (
        <div className={`relative overflow-hidden bg-black ${strong ? 'aspect-[16/7]' : 'aspect-[16/10]'}`}>
          <img src={image} alt="" className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-black">{taskLabel}</span>
        </div>
      ) : null}
      <div className="p-5 sm:p-6">
        {!image ? <span className="rounded-full bg-[var(--editable-page-text,#211713)] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-white">{taskLabel}</span> : null}
        <h2 className="mt-4 line-clamp-3 text-2xl font-black leading-[0.95] tracking-[-0.06em] text-[var(--editable-page-text,#211713)]">{post.title}</h2>
        {summary ? <div className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-[var(--slot4-muted-text)]" dangerouslySetInnerHTML={{ __html: formatRichHtml(summary) }} /> : null}
        <span className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] opacity-60 group-hover:opacity-100">Open result <ArrowRight className="h-4 w-4" /></span>
      </div>
    </Link>
  )
}

export default async function SearchPage({ searchParams }: { searchParams?: Promise<{ q?: string; category?: string; task?: string; master?: string }> }) {
  const resolved = (await searchParams) || {}
  const query = (resolved.q || '').trim()
  const normalized = query.toLowerCase()
  const category = (resolved.category || '').trim().toLowerCase()
  const task = (resolved.task || '').trim().toLowerCase()
  const useMaster = resolved.master !== '0'
  const feed = await fetchSiteFeed(useMaster ? 1000 : 300, useMaster ? { fresh: true, category: category || undefined, task: task || undefined } : undefined)
  const posts = feed?.posts?.length ? feed.posts : useMaster ? [] : SITE_CONFIG.tasks.filter((item) => item.enabled).flatMap((item) => getMockPostsForTask(item.key))
  const results = posts.filter((post) => matches(post, normalized, category, task)).slice(0, normalized ? 80 : 36)
  const relatedStrip = results.slice(0, 6)
  const enabledTasks = SITE_CONFIG.tasks.filter((item) => item.enabled)

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--editable-page-bg,#fff7ee)] text-[var(--editable-page-text,#2f1d16)]">
        <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-8 rounded-[2.5rem] border border-[var(--editable-border)] bg-white/70 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.08)] backdrop-blur md:grid-cols-[0.8fr_1.2fr] lg:p-10">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] opacity-55">{pagesContent.search.hero.badge}</p>
              <h1 className="mt-5 text-5xl font-black leading-[0.92] tracking-[-0.08em] sm:text-7xl">{pagesContent.search.hero.title}</h1>
              <p className="mt-6 max-w-xl text-base font-semibold leading-8 opacity-70">{pagesContent.search.hero.description}</p>
            </div>
            <form action="/search" className="self-end rounded-[2rem] border border-[var(--editable-border)] bg-[var(--editable-page-bg,#fff7ee)] p-4 sm:p-5">
              <input type="hidden" name="master" value="1" />
              <label className="flex items-center gap-3 rounded-2xl border border-[var(--editable-border)] bg-white px-4 py-3">
                <Search className="h-5 w-5 opacity-45" />
                <input name="q" defaultValue={query} placeholder={pagesContent.search.hero.placeholder} className="min-w-0 flex-1 bg-transparent text-base font-bold outline-none placeholder:text-current/35" />
              </label>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-2 rounded-2xl border border-[var(--editable-border)] bg-white px-4 py-3">
                  <Filter className="h-4 w-4 opacity-45" />
                  <input name="category" defaultValue={category} placeholder="Category" className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-current/35" />
                </label>
                <select name="task" defaultValue={task} className="rounded-2xl border border-[var(--editable-border)] bg-white px-4 py-3 text-sm font-black outline-none">
                  <option value="">All content types</option>
                  {enabledTasks.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
                </select>
              </div>
              <button className="mt-3 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[var(--editable-page-text,#2f1d16)] px-6 text-sm font-black uppercase tracking-[0.18em] text-[var(--editable-page-bg,#fff7ee)] transition hover:-translate-y-0.5" type="submit">Search</button>
            </form>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] opacity-55"><Tag className="mr-1 inline h-3 w-3" /> Browse by category</span>
            {categoryChips.map((chip) => (
              <Link key={chip} href={`/search?category=${encodeURIComponent(chip.toLowerCase())}`} className="rounded-full border border-[var(--editable-border)] bg-white px-3 py-1 text-xs font-black hover:-translate-y-0.5 transition">{chip}</Link>
            ))}
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_18rem]">
            <div>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] opacity-50">{results.length} results</p>
                  <h2 className="mt-2 text-3xl font-black tracking-[-0.06em]">{query ? `Results for "${query}"` : pagesContent.search.resultsTitle}</h2>
                </div>
                <Link href="/article" className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-white px-5 py-3 text-sm font-black">Browse latest <ArrowRight className="h-4 w-4" /></Link>
              </div>

              {results.length ? (
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  {results.map((post, index) => <SearchResultCard key={post.id || post.slug} post={post} index={index} />)}
                </div>
              ) : (
                <div className="mt-8 rounded-[2rem] border border-dashed border-[var(--editable-border)] bg-white/70 p-10 text-center">
                  <p className="text-2xl font-black tracking-[-0.04em]">No matching posts found.</p>
                  <p className="mt-3 text-sm font-semibold opacity-60">Try a different keyword, task type, or category.</p>
                </div>
              )}
            </div>

            <aside className="space-y-5">
              <div className="rounded-3xl border border-[var(--editable-border)] bg-white p-5">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] opacity-55"><TrendingUp className="h-4 w-4" /> Popular searches</div>
                <ul className="mt-4 space-y-2">
                  {popularSearches.map((term) => (
                    <li key={term}>
                      <Link href={`/search?q=${encodeURIComponent(term)}`} className="flex items-center justify-between gap-2 rounded-xl border border-transparent px-3 py-2 text-sm font-semibold hover:border-[var(--editable-border)] hover:bg-[var(--editable-page-bg,#fff7ee)]">
                        <span>{term}</span>
                        <Flame className="h-3 w-3 opacity-50" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-[var(--editable-border)] bg-white p-5">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] opacity-55"><Lightbulb className="h-4 w-4" /> Search tips</div>
                <ul className="mt-4 space-y-3">
                  {searchTips.map((tip) => (
                    <li key={tip} className="flex gap-2 text-xs font-semibold leading-6 opacity-80">
                      <Sparkles className="mt-0.5 h-3 w-3 shrink-0 opacity-60" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-[var(--editable-border)] bg-white p-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] opacity-55"><Gift className="h-4 w-4" /> Sponsored</div>
                <Ads slot="sidebar" showLabel={false} className="mx-auto w-full" />
              </div>
            </aside>
          </div>

          {relatedStrip.length ? (
            <div className="mt-16">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] opacity-55"><Compass className="mr-1 inline h-4 w-4" /> Also worth a look</p>
                  <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] sm:text-3xl">Related picks from the feed.</h2>
                </div>
                <Link href="/article" className="inline-flex items-center gap-2 text-sm font-black opacity-70 hover:opacity-100">See all <ArrowRight className="h-4 w-4" /></Link>
              </div>
              <div className="mt-6 flex snap-x gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {relatedStrip.map((post) => {
                  const task = getPostTaskKey(post) as TaskKey | null
                  const taskRoute = SITE_CONFIG.tasks.find((item) => item.key === task)?.route
                  const href = `${taskRoute || `/${task || 'article'}`}/${post.slug}`
                  const image = getImage(post)
                  return (
                    <Link key={`related-${post.id || post.slug}`} href={href} className="group w-[260px] shrink-0 snap-start overflow-hidden rounded-2xl border border-[var(--editable-border)] bg-white sm:w-[300px]">
                      {image ? (
                        <div className="aspect-[16/10] overflow-hidden bg-black">
                          <img src={image} alt="" className="h-full w-full object-cover opacity-90 transition group-hover:scale-105" />
                        </div>
                      ) : null}
                      <div className="p-4">
                        <h3 className="line-clamp-2 text-base font-black leading-tight tracking-[-0.02em]">{post.title}</h3>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ) : null}
        </section>
      </main>
    </EditableSiteShell>
  )
}
