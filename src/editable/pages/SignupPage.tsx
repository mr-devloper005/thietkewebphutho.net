import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, ShieldCheck, Sparkles, Users, UserPlus, Rocket, Heart } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableLocalSignupForm } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ path: '/signup', title: 'Sign up', description: pagesContent.auth.signup.metadataDescription })
}

const whyJoin = [
  { icon: Sparkles, title: 'Curate what you love', body: 'Build boards of the places, articles, and guides worth revisiting.' },
  { icon: Users, title: 'Meet local experts', body: 'Follow makers, chefs, and shopkeepers you actually want to hear from.' },
  { icon: Rocket, title: 'Launch a listing', body: 'Own a business? Publish and manage a verified profile within minutes.' },
  { icon: Heart, title: 'Support small', body: 'Every save and review sends a signal to independent operators.' },
]

const perks = [
  'Free forever tier with unlimited saves',
  'Weekly digest tuned to your neighborhood',
  'Early access to new city guides',
  'Comment threads with authors and owners',
  'Priority support from a human team',
]

const stats = [
  { value: '42K+', label: 'Active members' },
  { value: '3.2K', label: 'Verified listings' },
  { value: '890', label: 'Contributors' },
  { value: '32', label: 'Cities' },
]

export default function SignupPage() {
  return (
    <EditableSiteShell>
      <main className="bg-[var(--slot4-panel-bg)] text-[var(--slot4-page-text)]">
        <section className="mx-auto grid max-w-[var(--editable-container)] gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-24">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-7 shadow-[0_4px_24px_rgba(0,0,0,0.08)] sm:p-9">
              <div className="mb-6 flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] px-3 py-1 text-[11px] font-semibold text-[var(--slot4-muted-text)] w-fit">
                <UserPlus className="h-3 w-3" /> Free forever plan
              </div>
              <h1 className="text-2xl font-bold tracking-[-0.01em]">{pagesContent.auth.signup.formTitle}</h1>
              <p className="mt-2 text-sm text-[var(--slot4-muted-text)]">Two minutes to a personalized directory.</p>
              <div className="mt-4">
                <EditableLocalSignupForm />
              </div>
              <p className="mt-6 text-sm text-[var(--slot4-muted-text)]">Already have an account? <Link href="/login" className="font-semibold text-[var(--slot4-accent)] underline-offset-4 hover:underline">{pagesContent.auth.signup.loginCta}</Link></p>
            </div>

            <div className="mt-6 rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-6">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--slot4-accent)]">
                <ShieldCheck className="h-4 w-4" /> Your data, your call
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--slot4-muted-text)]">We never sell profile data and we never share your saved places with advertisers. You can export or delete everything in one click.</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--slot4-accent)]">{pagesContent.auth.signup.badge}</p>
            <h2 className="mt-4 max-w-xl text-4xl font-extrabold leading-[1.05] tracking-[-0.02em] sm:text-5xl lg:text-6xl">{pagesContent.auth.signup.title}</h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-[var(--slot4-muted-text)]">{pagesContent.auth.signup.description}</p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {whyJoin.map((item) => (
                <div key={item.title} className="rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-5">
                  <item.icon className="h-5 w-5 text-[var(--slot4-accent)]" />
                  <h3 className="mt-3 text-sm font-bold">{item.title}</h3>
                  <p className="mt-2 text-xs leading-6 text-[var(--slot4-muted-text)]">{item.body}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-6">
              <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--slot4-muted-text)]">What is included</h3>
              <ul className="mt-4 space-y-2">
                {perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--slot4-accent)]" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>

            

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-4 text-center">
                  <div className="text-2xl font-extrabold text-[var(--slot4-accent)]">{stat.value}</div>
                  <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--slot4-muted-text)]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
