'use client'

import Link from 'next/link'
import {
  ArrowRight,
  Globe,
  Send,
  Sparkles,
} from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { taskThemes } from '@/editable/theme/task-themes'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'

const resources = [
  ['About the project', '/about'],
  ['Editorial standards', '/about#standards'],
  ['Search the archive', '/search'],

] as const

const company = [
  ['Contact the desk', '/contact'],
  ['Contributor program', '/create'],
  ['Sign in', '/login'],
  ['Create an account', '/signup'],
] as const



const asSeenIn = ['TechAsia', 'The Local Post', 'Design Weekly', 'CityLab', 'FieldNotes', 'HanoiTimes']

export function EditableFooter() {
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()
  const discovery = SITE_CONFIG.tasks.filter((task) => task.enabled).map((task) => ({ ...task, label: taskThemes[task.key].kicker }))

  return (
    <footer className="bg-[var(--editable-footer-bg)] text-white">
      {/* Newsletter + CTA band */}
      <div className="border-b border-white/15 bg-[linear-gradient(135deg,rgba(14,84,241,0.18),rgba(10,10,10,0)_60%)]">
        <div className="mx-auto grid max-w-[var(--editable-container)] gap-8 px-5 py-14 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:px-[30px]">
          <div>
            <p className="editable-label text-xs uppercase tracking-[0.18em] text-[#7ea9ff]">Share what matters</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl">
              Put a useful place, guide, or local insight in front of the right audience.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">
              Join more than 12,000 contributors publishing verified reviews, city notes, and long-reads every week. It only takes a few minutes to submit.
            </p>
          </div>
          <div className="rounded-lg border border-white/15 bg-white/5 p-6 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8db3ff]">Contribute</p>
            <p className="mt-2 text-lg font-semibold">Add your place, guide, or story.</p>
            <p className="mt-3 text-sm leading-6 text-white/65">
              Reach an audience already looking for verified local recommendations and useful references. It only takes a few minutes to submit.
            </p>
            <Link href="/create" className={`${dc.button.primary} mt-5 h-12 w-full`}>Submit a resource <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/contact" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded border border-white/25 px-5 py-3 text-sm font-semibold text-white/85 transition hover:border-white hover:text-white">
              <Send className="h-4 w-4" /> Talk to the desk
            </Link>
          </div>
        </div>
      </div>

      {/* Sitemap */}
      <div className="mx-auto grid max-w-[var(--editable-container)] gap-10 px-5 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr] lg:px-[30px]">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded bg-white"><img src="/favicon.png?v=20260413" alt="" className="h-8 w-8 object-contain" /></span>
            <span className="text-xl font-semibold">{SITE_CONFIG.name}</span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-7 text-white/65">
            A focused home for trusted local places, practical guides, reports, and field notes that help people make informed decisions in Vietnam and beyond.
          </p>
          
           
          
        </div>

        <FooterColumn title="Directory" links={discovery.map((item) => [item.label, item.route])} />
        <FooterColumn title="Resources" links={resources.map((row) => [...row])} />
        <FooterColumn title="Company" links={company.map((row) => [...row])} />

        <div>
          <h3 className="text-sm font-semibold">Account</h3>
          <div className="mt-5 grid gap-3 text-sm text-white/65">
            {session ? (
              <>
                <Link href="/create" className="hover:text-white">Submit a resource</Link>
            
                <button type="button" onClick={logout} className="text-left hover:text-white">Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-white">Sign in</Link>
                <Link href="/signup" className="hover:text-white">Create an account</Link>
                <Link href="/create" className="hover:text-white">Post an entry</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* As seen in strip */}
      <div className="border-t border-white/10 bg-white/[0.02]">
        <div className="mx-auto flex max-w-[var(--editable-container)] flex-col gap-4 px-5 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-[30px]">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/50">
            <Sparkles className="h-3.5 w-3.5 text-[#7ea9ff]" /> As seen in
          </span>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold uppercase tracking-[0.12em] text-white/60">
            {asSeenIn.map((brand) => (
              <span key={brand} className="opacity-80 transition hover:opacity-100">{brand}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-[var(--editable-container)] flex-col gap-3 px-5 py-5 text-xs text-white/50 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-[30px]">
          <span>Copyright {year} {SITE_CONFIG.name}. All rights reserved.</span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link href="/about" className="hover:text-white">About</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
            <Link href="/search" className="hover:text-white">Search</Link>
            <span className="inline-flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> Global edition</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }: { title: string; links: string[][] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-5 grid gap-3 text-sm text-white/65">
        {links.map(([label, href]) => (
          <Link key={`${label}-${href}`} href={href} className="transition hover:text-white">{label}</Link>
        ))}
      </div>
    </div>
  )
}
