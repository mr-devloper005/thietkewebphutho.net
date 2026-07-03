import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, ShieldCheck, Sparkles, Users, Star, Lock, Zap, Globe2 } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableLocalLoginForm } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ path: '/login', title: 'Login', description: pagesContent.auth.login.metadataDescription })
}

const benefits = [
  { icon: Sparkles, title: 'Personal recommendations', body: 'Save searches, follow neighborhoods, and get a homepage tuned to what you actually visit.' },
  { icon: ShieldCheck, title: 'Verified access', body: 'Passwordless-friendly sign-in with device-level trust and no third-party trackers.' },
  { icon: Users, title: 'Community threads', body: 'Comment on guides, reply to owner updates, and follow curators you love.' },
  { icon: Zap, title: 'Faster checkouts', body: 'One-tap bookings and saved payment profiles across partner listings.' },
]

const stats = [
  { value: '42K+', label: 'Members' },
  { value: '18K', label: 'Guides saved' },
  { value: '4.9', label: 'Avg rating' },
  { value: '96%', label: 'Return rate' },
]

const trustBadges = ['SOC 2 aligned', 'GDPR ready', 'No ad tracking', 'Human support']

export default function LoginPage() {
  return (
    <EditableSiteShell>
      <main className="bg-[var(--slot4-panel-bg)] text-[var(--slot4-page-text)]">
        <section className="mx-auto grid max-w-[var(--editable-container)] gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--slot4-accent)]">{pagesContent.auth.login.badge}</p>
            <h1 className="mt-4 max-w-xl text-4xl font-extrabold leading-[1.05] tracking-[-0.02em] sm:text-5xl lg:text-6xl">{pagesContent.auth.login.title}</h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-[var(--slot4-muted-text)]">{pagesContent.auth.login.description}</p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-5">
                  <benefit.icon className="h-5 w-5 text-[var(--slot4-accent)]" />
                  <h3 className="mt-3 text-sm font-bold">{benefit.title}</h3>
                  <p className="mt-2 text-xs leading-6 text-[var(--slot4-muted-text)]">{benefit.body}</p>
                </div>
              ))}
            </div>

           

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-4 text-center">
                  <div className="text-2xl font-extrabold text-[var(--slot4-accent)]">{stat.value}</div>
                  <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--slot4-muted-text)]">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {trustBadges.map((badge) => (
                <span key={badge} className="inline-flex items-center gap-1 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-3 py-1 text-[11px] font-semibold text-[var(--slot4-muted-text)]">
                  <CheckCircle2 className="h-3 w-3 text-[var(--slot4-accent)]" /> {badge}
                </span>
              ))}
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-7 shadow-[0_4px_24px_rgba(0,0,0,0.08)] sm:p-9">
              <div className="mb-6 flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] px-3 py-1 text-[11px] font-semibold text-[var(--slot4-muted-text)] w-fit">
                <Lock className="h-3 w-3" /> Secure sign-in
              </div>
              <h2 className="text-2xl font-bold tracking-[-0.01em]">{pagesContent.auth.login.formTitle}</h2>
              <p className="mt-2 text-sm text-[var(--slot4-muted-text)]">Welcome back. Pick up where you left off.</p>
              <div className="mt-4">
                <EditableLocalLoginForm />
              </div>
              <p className="mt-6 text-sm text-[var(--slot4-muted-text)]">New here? <Link href="/signup" className="font-semibold text-[var(--slot4-accent)] underline-offset-4 hover:underline">{pagesContent.auth.login.createCta}</Link></p>
            </div>

            <div className="mt-6 rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-6">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--slot4-accent)]">
                <Globe2 className="h-4 w-4" /> Trusted globally
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--slot4-muted-text)]">Members from 32 cities keep the directory fresh. Every listing you save, comment you leave, and business you visit helps a neighbor find something great.</p>
            </div>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
