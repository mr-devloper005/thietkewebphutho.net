'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { MessageSquare, Search, Heart, ShieldCheck, Sparkles, Users, Flame, TrendingUp } from 'lucide-react'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'

type StoredComment = {
  id: string
  name: string
  email?: string
  comment: string
  createdAt: string
  articleTitle?: string
  articleSlug?: string
}

const COMMENTS_PER_PAGE = 8
const COMMENT_KEY_PREFIX = 'slot4:article-comments:'

const guidelines = [
  { icon: Heart, title: 'Be kind', body: 'Fair criticism is welcome; personal attacks are not. Assume the person on the other side is a neighbor.' },
  { icon: ShieldCheck, title: 'Stay honest', body: 'Share your first-hand experience. No paid endorsements, no astroturfing, no impersonation.' },
  { icon: Sparkles, title: 'Add something', body: 'The best threads sharpen a guide, correct a fact, or point to a spot the writer missed.' },
]

const featuredMembers = [
  { name: 'Ravi Kumar', role: 'Cafe hopper', initials: 'RK' },
  { name: 'Meera Das', role: 'Bookshop crawler', initials: 'MD' },
  { name: 'Josh Alvarez', role: 'Live music tipster', initials: 'JA' },
  { name: 'Nina Ito', role: 'Farmers market regular', initials: 'NI' },
  { name: 'Sana Patel', role: 'Weekend walker', initials: 'SP' },
  { name: 'Ben Ochieng', role: 'Coffee obsessive', initials: 'BO' },
]

const formatDate = (value: string) => {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
  } catch {
    return 'Just now'
  }
}

const readCommentsFromStorage = (): StoredComment[] => {
  const items: StoredComment[] = []
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index)
    if (!key?.startsWith(COMMENT_KEY_PREFIX)) continue
    const articleSlug = key.replace(COMMENT_KEY_PREFIX, '')
    try {
      const parsed = JSON.parse(window.localStorage.getItem(key) || '[]')
      if (!Array.isArray(parsed)) continue
      for (const item of parsed) {
        if (!item || typeof item !== 'object') continue
        if (typeof item.name !== 'string' || typeof item.comment !== 'string') continue
        items.push({
          id: typeof item.id === 'string' ? item.id : `${articleSlug}-${items.length}`,
          name: item.name,
          email: typeof item.email === 'string' ? item.email : undefined,
          comment: item.comment,
          createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
          articleTitle: typeof item.articleTitle === 'string' ? item.articleTitle : undefined,
          articleSlug: typeof item.articleSlug === 'string' ? item.articleSlug : articleSlug,
        })
      }
    } catch {
      // Ignore corrupted local comment records.
    }
  }

  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export default function CommentsPage() {
  const [comments, setComments] = useState<StoredComment[]>([])
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setComments(readCommentsFromStorage())
  }, [])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return comments
    return comments.filter((item) => {
      return [item.name, item.email, item.comment, item.articleTitle, item.articleSlug]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    })
  }, [comments, query])

  const uniqueThreads = useMemo(() => new Set(comments.map((c) => c.articleSlug).filter(Boolean)).size, [comments])
  const uniqueAuthors = useMemo(() => new Set(comments.map((c) => c.name)).size, [comments])

  const totalPages = Math.max(1, Math.ceil(filtered.length / COMMENTS_PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const visibleComments = filtered.slice((currentPage - 1) * COMMENTS_PER_PAGE, currentPage * COMMENTS_PER_PAGE)

  function refreshComments() {
    setComments(readCommentsFromStorage())
    setPage(1)
  }

  return (
    <EditableSiteShell>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                <MessageSquare className="h-4 w-4" /> Community threads
              </p>
              <h1 className="mt-4 text-4xl font-extrabold tracking-[-0.03em] sm:text-6xl">Comments and conversations</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                The living room of the site. This is where readers correct a fact, thank an owner, argue about the best bakery on a street, and quietly make every guide sharper.
              </p>
            </div>
            <button type="button" className="rounded-full border border-[var(--editable-border)] px-4 py-2 text-sm font-black" onClick={refreshComments}>Refresh comments</button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Total comments</div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[var(--slot4-accent)]">{comments.length}</span>
                <TrendingUp className="h-4 w-4 text-[var(--slot4-accent)]" />
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Threads active</div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[var(--slot4-accent)]">{uniqueThreads}</span>
                <Flame className="h-4 w-4 text-[var(--slot4-accent)]" />
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Voices in the room</div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[var(--slot4-accent)]">{uniqueAuthors}</span>
                <Users className="h-4 w-4 text-[var(--slot4-accent)]" />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-[var(--slot4-accent)]/40 bg-[var(--slot4-accent-soft)] p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-[var(--slot4-accent)]" />
            <div>
              <h2 className="text-lg font-bold">Community guidelines</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Three rules keep this space useful. Read them before joining a thread.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {guidelines.map((rule) => (
              <div key={rule.title} className="rounded-2xl border border-[var(--editable-border)] bg-white p-5">
                <rule.icon className="h-5 w-5 text-[var(--slot4-accent)]" />
                <h3 className="mt-3 text-sm font-bold">{rule.title}</h3>
                <p className="mt-2 text-xs leading-6 text-muted-foreground">{rule.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Recent commenters</h2>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">This week</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            {featuredMembers.map((member) => (
              <div key={member.name} className="flex items-center gap-3 rounded-full border border-[var(--editable-border)] bg-white py-2 pl-2 pr-4">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-xs font-extrabold text-[var(--slot4-accent)]">{member.initials}</span>
                <div className="text-xs">
                  <div className="font-bold">{member.name}</div>
                  <div className="text-muted-foreground">{member.role}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setPage(1)
                }}
                placeholder="Search comments..."
                className="h-11 w-full rounded-2xl border border-[var(--editable-border)] bg-white pl-9 pr-3 text-sm outline-none"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {filtered.length} comment{filtered.length === 1 ? '' : 's'} found
            </p>
          </div>
        </section>

        {visibleComments.length ? (
          <section className="mt-8 grid gap-4">
            {visibleComments.map((item) => (
              <article key={`${item.articleSlug}-${item.id}`} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-sm font-extrabold text-[var(--slot4-accent)]">{item.name.slice(0, 1).toUpperCase()}</span>
                    <div>
                      <p className="font-semibold text-foreground">{item.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>
                    </div>
                  </div>
                  {item.articleSlug ? (
                    <Link href={`/article/${item.articleSlug}`} className="text-sm text-primary underline-offset-4 hover:underline">
                      Open article
                    </Link>
                  ) : null}
                </div>
                {item.articleTitle ? <p className="mt-4 text-sm font-medium text-foreground">{item.articleTitle}</p> : null}
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.comment}</p>
              </article>
            ))}
          </section>
        ) : (
          <section className="mt-8 rounded-2xl border border-dashed border-border bg-card/70 p-8 text-center">
            <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground" />
            <h2 className="mt-3 text-xl font-semibold text-foreground">The room is quiet</h2>
            <p className="mt-2 text-sm text-muted-foreground">Add a comment on any article page and it will appear here.</p>
            <Link href="/article" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] px-5 py-2 text-sm font-bold text-[var(--slot4-on-accent)]">Browse articles</Link>
          </section>
        )}

        {filtered.length > COMMENTS_PER_PAGE ? (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
            <span>Page {currentPage} of {totalPages}</span>
            <div className="flex gap-2">
              <button type="button" className="rounded-full border border-[var(--editable-border)] px-4 py-2 font-black disabled:opacity-40" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button>
              <button type="button" className="rounded-full border border-[var(--editable-border)] px-4 py-2 font-black disabled:opacity-40" disabled={currentPage >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next</button>
            </div>
          </div>
        ) : null}
      </main>
    </EditableSiteShell>
  )
}
