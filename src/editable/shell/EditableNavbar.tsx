'use client'

import Link from 'next/link'
import {
  BookOpen,
  Compass,
  Layers,
  LogIn,
  Plus,
  Search,
  Sparkles,
  UserPlus,
} from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'

const primaryLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

const megaColumns = [
  {
    title: 'Directory',
    icon: Compass,
    items: [
      { label: 'Trusted places', href: '/listing', desc: 'Verified local venues and services' },

    ],
  },
  {
    title: 'Reading room',
    icon: BookOpen,
    items: [

      { label: 'Documents & PDFs', href: '/pdf', desc: 'Practical references worth bookmarking' },

    ],
  },
  {
    title: 'Community',
    icon: Sparkles,
    items: [
      { label: 'Contributor program', href: '/create', desc: 'Publish your own entry' },

      { label: 'Support desk', href: '/contact', desc: 'Talk to a human in under a day' },
    ],
  },
]


export function EditableNavbar() {
  const { session, logout } = useEditableLocalAuthSession()

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--editable-border)] bg-white/95 text-[var(--editable-nav-text)] backdrop-blur-xl">
      {/* Utility strip */}
     

      {/* Main navbar */}
      <nav className="mx-auto flex h-[82px] w-full max-w-[var(--editable-container)] items-center gap-6 px-5 sm:px-6 lg:px-[30px]">
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-3" aria-label={`${SITE_CONFIG.name} home`}>
          <span className="flex h-11 w-11 items-center justify-center rounded bg-[var(--slot4-accent-soft)]">
            <img src="/favicon.png?v=20260413" alt="" className="h-9 w-9 object-contain" />
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="max-w-[240px] truncate text-lg font-semibold">{SITE_CONFIG.name}</span>
            <span className="hidden text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--slot4-muted-text)] sm:block">Local knowledge, clearly organized</span>
          </span>
        </Link>

        {/* Primary + mega */}
        <div className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {primaryLinks.map((item) => (
            <Link key={item.href} href={item.href} className="rounded px-3 py-2 text-sm font-medium transition duration-300 hover:bg-[var(--slot4-panel-bg)] hover:text-[var(--slot4-accent)]">
              {item.label}
            </Link>
          ))}
          <details className="group relative">
            <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded px-3 py-2 text-sm font-medium transition hover:bg-[var(--slot4-panel-bg)] hover:text-[var(--slot4-accent)]">
              <Layers className="h-4 w-4" /> Explore
            </summary>
            <div className="absolute left-1/2 top-full z-50 mt-3 w-[860px] max-w-[92vw] -translate-x-1/2 rounded-lg border border-[var(--editable-border)] bg-white p-6 shadow-[0_24px_80px_rgba(10,10,10,0.12)]">
              <div className="grid gap-6 md:grid-cols-3">
                {megaColumns.map((col) => (
                  <div key={col.title}>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--slot4-accent)]">
                      <col.icon className="h-4 w-4" /> {col.title}
                    </div>
                    <ul className="mt-4 space-y-3">
                      {col.items.map((item) => (
                        <li key={item.href + item.label}>
                          <Link href={item.href} className="group/item block rounded p-2 transition hover:bg-[var(--slot4-panel-bg)]">
                            <span className="block text-sm font-semibold text-[var(--slot4-page-text)] group-hover/item:text-[var(--slot4-accent)]">{item.label}</span>
                            <span className="mt-0.5 block text-xs text-[var(--slot4-muted-text)]">{item.desc}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              
            </div>
          </details>
        </div>

        {/* Search + CTA */}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <form action="/search" className="hidden items-center rounded border border-[var(--editable-border)] bg-white pl-3 md:flex">
            <Search className="h-4 w-4 text-[var(--slot4-muted-text)]" />
            <input
              name="q"
              type="search"
              placeholder="Search places, guides, reports&hellip;"
              className="h-10 w-[220px] bg-transparent px-2 text-sm outline-none placeholder:text-[var(--slot4-muted-text)] xl:w-[280px]"
              aria-label="Search the site"
            />
            <button type="submit" className="hidden h-10 rounded-r bg-[var(--slot4-accent-soft)] px-3 text-xs font-semibold text-[var(--slot4-accent)] xl:inline-flex xl:items-center">Go</button>
          </form>
          <Link href="/search" className="flex h-11 w-11 items-center justify-center rounded border border-[var(--editable-border)] transition duration-300 hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)] md:hidden" aria-label="Search">
            <Search className="h-4 w-4" />
          </Link>
          {session ? (
            <Link href="/create" className={`${dc.button.primary} hidden h-11 px-5 sm:inline-flex`}>
              <Plus className="h-4 w-4" /> Post an entry
            </Link>
          ) : (
            <>
              <Link href="/signup" className="hidden h-11 items-center gap-2 rounded border border-[var(--editable-border)] px-4 text-sm font-medium transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)] xl:inline-flex">
                <UserPlus className="h-4 w-4" /> Join
              </Link>
              <Link href="/create" className={`${dc.button.primary} hidden h-11 px-5 sm:inline-flex`}>
                <Plus className="h-4 w-4" /> Post an entry
              </Link>
            </>
          )}

          {/* Mobile menu */}
          <details className="relative lg:hidden">
            <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded border border-[var(--editable-border)]">
              <span className="flex flex-col gap-1.5">
                <span className="block h-0.5 w-4 bg-current" />
                <span className="block h-0.5 w-4 bg-current" />
                <span className="block h-0.5 w-4 bg-current" />
              </span>
            </summary>
            <div className="absolute right-0 top-full z-50 mt-2 w-[300px] rounded border border-[var(--editable-border)] bg-white p-4 shadow-[0_24px_80px_rgba(10,10,10,0.14)]">
              <form action="/search" className="mb-3 flex items-center rounded border border-[var(--editable-border)] px-3">
                <Search className="h-4 w-4 text-[var(--slot4-muted-text)]" />
                <input name="q" type="search" placeholder="Search&hellip;" className="h-10 w-full bg-transparent px-2 text-sm outline-none" aria-label="Search" />
              </form>
              <div className="grid gap-1">
                {primaryLinks.map((item) => (
                  <Link key={item.href} href={item.href} className="rounded px-3 py-2 text-sm font-medium hover:bg-[var(--slot4-panel-bg)]">{item.label}</Link>
                ))}
              </div>
              <details className="mt-2 rounded border border-[var(--editable-border)]">
                <summary className="cursor-pointer list-none px-3 py-2 text-sm font-semibold">Explore &middot; Categories</summary>
                <div className="border-t border-[var(--editable-border)] p-2">
                  {megaColumns.flatMap((col) => col.items).map((item) => (
                    <Link key={item.href + item.label} href={item.href} className="block rounded px-3 py-2 text-xs hover:bg-[var(--slot4-panel-bg)]">{item.label}</Link>
                  ))}
                </div>
              </details>
              <div className="mt-3 grid gap-2">
                {session ? (
                  <>
                    <Link href="/create" className="rounded bg-[var(--slot4-accent)] px-3 py-2 text-center text-sm font-semibold text-white">Post an entry</Link>
                    <button type="button" onClick={logout} className="rounded border border-[var(--editable-border)] px-3 py-2 text-sm font-medium">Sign out</button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded border border-[var(--editable-border)] px-3 py-2 text-sm font-medium"><LogIn className="h-4 w-4" /> Sign in</Link>
                    <Link href="/signup" className="inline-flex items-center justify-center gap-2 rounded bg-[var(--slot4-accent)] px-3 py-2 text-sm font-semibold text-white"><UserPlus className="h-4 w-4" /> Get started</Link>
                    <Link href="/create" className="inline-flex items-center justify-center gap-2 rounded border border-[var(--slot4-accent)] px-3 py-2 text-sm font-semibold text-[var(--slot4-accent)]"><Plus className="h-4 w-4" /> Post an entry</Link>
                  </>
                )}
              </div>
            </div>
          </details>
        </div>
      </nav>
    </header>
  )
}
