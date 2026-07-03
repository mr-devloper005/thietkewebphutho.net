import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  Calendar,
  ChevronLeft,
  Clock3,
  Filter,
  Newspaper,
  Search,
  Share2,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'
import type { SitePost, SiteFeedPagination } from '@/lib/site-connector'
import { CATEGORY_OPTIONS } from '@/lib/categories'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc, editablePalette as pal } from '@/editable/layouts/design-contract'
import { ArticleListCard, getEditableCategory, getEditablePostImage, postHref } from '@/editable/cards/PostCards'

const editorial = [
  { icon: Newspaper, label: 'Weekly briefings', value: '48 issues' },
  { icon: Users, label: 'Contributors', value: '12k+' },
  { icon: TrendingUp, label: 'Read this month', value: '184k' },
]

const readingCollections = [
  { title: 'Neighborhood diaries', desc: 'Stories from people who live and work in the district.', href: '/article?category=neighborhood' },
  { title: 'Studio field notes', desc: 'Behind-the-scenes from designers, chefs and small teams.', href: '/article?category=studio' },
  { title: 'Slow weekend reads', desc: 'Long-form essays for a coffee-slow morning.', href: '/article?category=longform' },
]

export function EditableArticleArchive({ posts, pagination, category = 'all', basePath = '/article' }: { posts: SitePost[]; pagination: SiteFeedPagination; category?: string; basePath?: string }) {
  const voice = taskPageVoices.article
  const page = pagination.page || 1
  const pageHref = (nextPage: number) => `${basePath}?${new URLSearchParams({ ...(category && category !== 'all' ? { category } : {}), page: String(nextPage) }).toString()}`
  const [featured, ...rest] = posts
  const activeCategoryLabel = category && category !== 'all'
    ? CATEGORY_OPTIONS.find((item) => item.slug === category)?.name || category
    : 'All categories'

  return (
    <main className={dc.shell.page}>
      {/* Hero */}
      <section className={`${dc.shell.section} pt-12 sm:pt-16 lg:pt-20`}>
        <div className={`relative overflow-hidden rounded-[2.5rem] border ${pal.border} ${pal.darkBg} p-7 text-white shadow-[0_24px_80px_rgba(24,20,17,0.18)] sm:p-10 lg:p-14`}>
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(14,84,241,0.45),rgba(14,84,241,0)_65%)]" aria-hidden />
          <div className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(68,199,246,0.35),rgba(68,199,246,0)_65%)]" aria-hidden />
          <div className="relative grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`${dc.type.eyebrow} ${pal.accentSoftText}`}>{voice.eyebrow}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/80"><Sparkles className="h-3.5 w-3.5" /> Updated daily</span>
              </div>
              <h1 className={`${dc.type.heroTitle} mt-5 max-w-5xl`}>{voice.headline}</h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-white/72 sm:text-lg">{voice.description}</p>
              <form action={basePath} className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row">
                <label className="flex min-w-0 flex-1 items-center rounded-full bg-white pl-4 pr-2 text-sm text-[var(--slot4-page-text)]">
                  <Search className="h-4 w-4 text-[var(--slot4-muted-text)]" />
                  <input name="q" type="search" placeholder="Search titles, tags, contributors&hellip;" className="h-11 min-w-0 flex-1 bg-transparent px-2 outline-none placeholder:text-[var(--slot4-muted-text)]" aria-label="Search articles" />
                </label>
                <select name="category" defaultValue={category || 'all'} className={`min-w-0 rounded-full border ${pal.darkBorder} bg-white px-5 py-3 text-sm font-bold ${pal.panelText} outline-none`}>
                  <option value="all">All categories</option>
                  {CATEGORY_OPTIONS.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
                </select>
                <button className={`inline-flex items-center justify-center gap-2 rounded-full ${pal.accentSoftBg} px-6 py-3 text-sm font-black ${pal.panelText}`}>
                  <Filter className="h-4 w-4" /> Filter
                </button>
              </form>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link href={basePath} className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${category === 'all' || !category ? 'border-white bg-white text-[var(--slot4-page-text)]' : 'border-white/25 text-white/75 hover:border-white'}`}>All</Link>
                {CATEGORY_OPTIONS.slice(0, 6).map((item) => {
                  const active = category === item.slug
                  return (
                    <Link
                      key={item.slug}
                      href={`${basePath}?category=${item.slug}`}
                      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${active ? 'border-white bg-white text-[var(--slot4-page-text)]' : 'border-white/25 text-white/75 hover:border-white'}`}
                    >
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>

            <aside className="rounded-[2rem] border border-white/15 bg-white/5 p-6 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8db3ff]">Reading room</p>
              <p className="mt-3 text-lg font-semibold">Now viewing &mdash; {activeCategoryLabel}</p>
              <ul className="mt-5 space-y-4 text-sm">
                {editorial.map((row) => (
                  <li key={row.label} className="flex items-center justify-between border-b border-white/10 pb-3 last:border-none last:pb-0">
                    <span className="inline-flex items-center gap-2 text-white/70"><row.icon className="h-4 w-4 text-[#8db3ff]" /> {row.label}</span>
                    <span className="font-semibold">{row.value}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>

      {/* Featured + list */}
      <section className={`${dc.shell.section} pt-12 sm:pt-16`}>
        {featured ? (
          <Link href={postHref('article', featured, basePath)} className={`group relative grid overflow-hidden rounded-[2rem] border ${pal.border} bg-white shadow-[0_24px_80px_rgba(24,20,17,0.08)] lg:grid-cols-[1.1fr_1fr]`}>
            <div className="relative aspect-[4/3] lg:aspect-auto">
              <img src={getEditablePostImage(featured)} alt={featured.title} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
              <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--slot4-accent)]">
                <Sparkles className="h-3.5 w-3.5" /> Editor&rsquo;s pick
              </span>
            </div>
            <div className="flex flex-col justify-center gap-4 p-8 lg:p-10">
              <span className={`${dc.type.eyebrow} ${pal.accentText}`}>{getEditableCategory(featured)}</span>
              <h2 className="text-3xl font-black tracking-[-0.03em] sm:text-4xl">{featured.title}</h2>
              <p className={`text-sm leading-7 ${pal.softMutedText}`}>{featured.summary}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--slot4-muted-text)]">
                <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Published this week</span>
                <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" /> 8 min read</span>
                <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Editorial desk</span>
              </div>
              <span className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-[var(--slot4-accent)] px-5 py-2.5 text-sm font-semibold text-white transition group-hover:gap-3">
                Read the story <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        ) : null}
      </section>

      <section className={`${dc.shell.section} ${dc.shell.sectionY} grid gap-10 lg:grid-cols-[1fr_320px]`}>
        <div className="min-w-0">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-[-0.03em]">Latest entries</h2>
            <span className="text-xs uppercase tracking-[0.14em] text-[var(--slot4-muted-text)]">{pagination.total ?? posts.length} total &middot; page {page} of {pagination.totalPages || 1}</span>
          </div>
          {rest.length || (!featured && posts.length) ? (
            <div className="grid gap-5">
              {(featured ? rest : posts).map((post, index) => (
                <ArticleListCard key={post.id} post={post} href={postHref('article', post, basePath)} index={index + (page - 1) * pagination.limit + (featured ? 1 : 0)} />
              ))}
            </div>
          ) : (
            <div className={`${dc.surface.soft} p-8 text-center`}>
              <h2 className="text-3xl font-black tracking-[-0.05em]">No articles found</h2>
              <p className={`mt-3 text-sm leading-7 ${pal.softMutedText}`}>Try another category or return to all articles.</p>
              <Link href={basePath} className={`${dc.button.secondary} mt-6 h-12`}>Reset filters</Link>
            </div>
          )}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {pagination.hasPrevPage ? <Link href={pageHref(page - 1)} className={`rounded-full border ${pal.border} bg-white px-5 py-3 text-sm font-black`}>Previous</Link> : null}
            <span className={`rounded-full ${pal.darkBg} px-5 py-3 text-sm font-black text-white`}>Page {page} of {pagination.totalPages || 1}</span>
            {pagination.hasNextPage ? <Link href={pageHref(page + 1)} className={`rounded-full border ${pal.border} bg-white px-5 py-3 text-sm font-black`}>Next</Link> : null}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className={`${dc.surface.soft} p-6`}>
            <p className={`${dc.type.eyebrow}`}>Reading collections</p>
            <ul className="mt-4 space-y-4">
              {readingCollections.map((item) => (
                <li key={item.href} className="border-b border-[var(--editable-border)] pb-4 last:border-none last:pb-0">
                  <Link href={item.href} className="block group">
                    <p className="text-sm font-semibold group-hover:text-[var(--slot4-accent)]">{item.title}</p>
                    <p className={`mt-1 text-xs leading-5 ${pal.softMutedText}`}>{item.desc}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={`${dc.surface.dark} p-6`}>
            <p className="text-xs uppercase tracking-[0.18em] text-[#8db3ff]">Weekly Note</p>
            <p className="mt-3 text-lg font-semibold">Three reads, every Friday.</p>
            <p className="mt-2 text-sm leading-6 text-white/70">Our editors pick a place, a guide, and a story worth your weekend.</p>
            <Link href="/contact" className={`${dc.button.primary} mt-4 h-11 w-full`}>Get in touch <ArrowRight className="h-4 w-4" /></Link>
          </div>

          <div className={`${dc.surface.card} p-6`}>
            <p className={dc.type.eyebrow}>Contribute</p>
            <p className="mt-3 text-sm font-semibold">Have a story worth telling?</p>
            <p className={`mt-2 text-xs leading-5 ${pal.softMutedText}`}>We pay for accepted long-form pieces from local writers, photographers, and designers.</p>
            <Link href="/create" className={`${dc.button.secondary} mt-4 h-11 w-full`}>Pitch an idea <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </aside>
      </section>
    </main>
  )
}

export function EditableArticleDetailShell({ slug, post }: { slug: string; post: SitePost | null }) {
  const voice = taskPageVoices.article
  const category = getEditableCategory(post)
  return (
    <main className={dc.shell.page}>
      <section className={`${dc.shell.section} pt-10 sm:pt-14 lg:pt-16`}>
        <div className={`grid gap-6 rounded-[2.5rem] border ${pal.border} bg-white p-6 shadow-[0_24px_80px_rgba(24,20,17,0.08)] lg:grid-cols-[minmax(0,1fr)_320px] lg:p-10`}>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/article" className={`inline-flex items-center gap-2 rounded-full border ${pal.border} px-4 py-2 text-sm font-black ${pal.panelText}`}>
                <ChevronLeft className="h-4 w-4" /> Articles
              </Link>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--slot4-accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--slot4-accent)]">
                <BookOpen className="h-3.5 w-3.5" /> {category}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--editable-border)] bg-white px-3 py-1.5 text-xs text-[var(--slot4-muted-text)]">
                <Clock3 className="h-3.5 w-3.5" /> 8 min read
              </span>
            </div>
            <p className={`${dc.type.eyebrow} mt-8 ${pal.accentText}`}>{voice.eyebrow}</p>
            <h1 className={`mt-4 max-w-4xl text-4xl font-black leading-[0.98] tracking-[-0.07em] ${pal.panelText} sm:text-5xl lg:text-7xl`}>{post?.title || pagesContent.detailPages.article.fallbackTitle}</h1>
            <div className="mt-8 flex flex-wrap items-center gap-4 text-xs text-[var(--slot4-muted-text)]">
              <span className="inline-flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-xs font-semibold text-[var(--slot4-accent)]">ED</span>
                Editorial desk
              </span>
              <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Published this week</span>
              <button type="button" className="inline-flex items-center gap-1.5 rounded-full border border-[var(--editable-border)] px-3 py-1.5 hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]">
                <Share2 className="h-3.5 w-3.5" /> Share
              </button>
            </div>
          </div>
          <aside className={`min-w-0 rounded-[2rem] ${pal.darkBg} p-6 text-white`}>
            <p className={`${dc.type.eyebrow} ${pal.accentSoftText}`}>Reading note</p>
            <p className="mt-4 text-sm leading-7 text-white/72">{voice.secondaryNote}</p>
            <ul className="mt-6 space-y-3 text-sm text-white/70">
              <li className="flex items-center justify-between border-b border-white/10 pb-3"><span>Difficulty</span><span className="font-semibold text-white">Easy</span></li>
              <li className="flex items-center justify-between border-b border-white/10 pb-3"><span>Best paired with</span><span className="font-semibold text-white">Ca phe sua da</span></li>
              <li className="flex items-center justify-between"><span>Original language</span><span className="font-semibold text-white">EN &middot; VI</span></li>
            </ul>
            <Link href="/contact" className={`mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black ${pal.panelText}`}>Contact the desk <ArrowRight className="h-4 w-4" /></Link>
          </aside>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pb-24">
        <div className={`rounded-[2.25rem] border ${pal.border} bg-white p-6 shadow-[0_24px_80px_rgba(24,20,17,0.08)] sm:p-8 lg:p-10`}>
          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--slot4-muted-text)]">In this piece</p>
              <p className="mt-1 text-sm font-semibold">Context &middot; interviews &middot; takeaways</p>
            </div>
            <div className="rounded-lg border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--slot4-muted-text)]">Fact-checked</p>
              <p className="mt-1 text-sm font-semibold">Reviewed by 2 editors</p>
            </div>
            <div className="rounded-lg border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--slot4-muted-text)]">Last updated</p>
              <p className="mt-1 text-sm font-semibold">Within the last 7 days</p>
            </div>
          </div>
          <p className={`text-sm leading-8 ${pal.softMutedText}`}>{post?.summary || `Article detail content for ${slug} will render through the editable detail page.`}</p>

          <div className="mt-10 grid gap-4 rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] p-6 sm:grid-cols-[auto_1fr_auto] sm:items-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--slot4-accent)] text-white"><Sparkles className="h-5 w-5" /></span>
            <div>
              <p className="text-sm font-semibold">Enjoyed this read?</p>
              <p className="text-xs text-[var(--slot4-muted-text)]">Get one hand-picked story delivered every Friday.</p>
            </div>
            <Link href="/#newsletter" className={`${dc.button.primary} h-12`}>Join the list <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>
    </main>
  )
}
