'use client'

import { Building2, Clock, FileText, Image as ImageIcon, Mail, MapPin, MessageSquare, Phone, Sparkles, Bookmark, Twitter, Instagram, Linkedin, HelpCircle } from 'lucide-react'
import { pagesContent } from '@/editable/content/pages.content'
import { getFactoryState } from '@/design/factory/get-factory-state'
import { getProductKind } from '@/design/factory/get-product-kind'
import { EditableContactLeadForm } from '@/editable/components/EditableContactLeadForm'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'

const tone = {
  shell: 'bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]',
  panel: 'border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)]',
  soft: 'border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)]',
  muted: 'text-[var(--slot4-muted-text)]',
}

function getLanes(kind: ReturnType<typeof getProductKind>) {
  if (kind === 'directory') {
    return [
      { icon: Building2, title: 'Business onboarding', body: 'Add listings, verify operational details, and bring your business surface live quickly.' },
      { icon: Phone, title: 'Partnership support', body: 'Talk through bulk publishing, local growth, and operational setup questions.' },
      { icon: MapPin, title: 'Coverage requests', body: 'Need a new geography or category lane? We can shape the directory around it.' },
    ]
  }
  if (kind === 'editorial') {
    return [
      { icon: FileText, title: 'Editorial submissions', body: 'Pitch essays, columns, and long-form ideas that fit the publication.' },
      { icon: Mail, title: 'Newsletter partnerships', body: 'Coordinate sponsorships, collaborations, and issue-level campaigns.' },
      { icon: Sparkles, title: 'Contributor support', body: 'Get help with voice, formatting, and publication workflow questions.' },
    ]
  }
  if (kind === 'visual') {
    return [
      { icon: ImageIcon, title: 'Creator collaborations', body: 'Discuss gallery launches, creator features, and visual campaigns.' },
      { icon: Sparkles, title: 'Licensing and use', body: 'Reach out about usage rights, commercial requests, and visual partnerships.' },
      { icon: Mail, title: 'Media kits', body: 'Request creator decks, editorial support, or visual feature placement.' },
    ]
  }
  return [
    { icon: Bookmark, title: 'Collection submissions', body: 'Suggest resources, boards, and links that deserve a place in the library.' },
    { icon: Mail, title: 'Resource partnerships', body: 'Coordinate curation projects, reference pages, and link programs.' },
    { icon: Sparkles, title: 'Curator support', body: 'Need help organizing shelves, collections, or profile-connected boards?' },
  ]
}

const channels = [
  { icon: Mail, title: 'Email', value: 'hello@thietkewebphutho.net', body: 'General enquiries answered within one business day by a human editor.' },
  { icon: Phone, title: 'Phone', value: '+91 80 4820 1900', body: 'Weekdays, 10:00 to 18:00 IST. Voicemail is transcribed and returned same day.' },
  { icon: MessageSquare, title: 'Live chat', value: 'In-app widget', body: 'Signed-in members can start a chat from any page. Median first reply: eight minutes.' },
  { icon: MapPin, title: 'Office', value: 'Level 3, 214 Church Street', body: 'Drop in Wednesdays for open office hours or to pick up a stack of print guides.' },
]

const offices = [
  { city: 'Bengaluru', address: 'Level 3, 214 Church Street, 560001', hours: 'Mon to Fri, 10:00 to 18:00 IST' },
  { city: 'Chennai', address: 'Unit 7, Alwarpet Studios, 600018', hours: 'Tue and Thu, 11:00 to 17:00 IST' },
  { city: 'Kochi', address: '3rd Floor, Cabral Yard, Fort Kochi, 682001', hours: 'By appointment' },
]

const faqs = [
  { q: 'How long until I get a reply?', a: 'Most emails receive a reply within one business day. Partnership requests may take up to three days while we loop in the right editor.' },
  { q: 'Can I list my business for free?', a: 'Yes. Basic listings are always free and always will be. Verification adds a badge and unlocks reply tools; it takes about two days.' },
  { q: 'Do you accept guest pitches?', a: 'We do. Send a two-paragraph pitch and one recent clip. We reply to every pitch, even the ones we cannot take.' },
  { q: 'What if my listing has wrong information?', a: 'Click Report on any listing or email us the correction. We update within 24 hours and re-verify on our rolling calendar.' },
  { q: 'Do you sponsor community events?', a: 'We host and co-host small gatherings and provide print guides for meetups. Tell us what you are planning.' },
]

export default function ContactPage() {
  const { recipe } = getFactoryState()
  const productKind = getProductKind(recipe)
  const lanes = getLanes(productKind)

  return (
    <EditableSiteShell className={tone.shell}>
      <main className="mx-auto max-w-[var(--editable-container)] px-4 py-14 sm:px-6 lg:px-8">
        <section className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--slot4-accent)]">{pagesContent.contact.eyebrow}</p>
            <h1 className="editable-display mt-4 text-5xl font-extrabold tracking-[-0.02em] sm:text-6xl">{pagesContent.contact.title}</h1>
            <p className={`mt-5 max-w-2xl text-base leading-8 ${tone.muted}`}>{pagesContent.contact.description}</p>
          </div>

          <div className={`rounded-2xl p-7 ${tone.panel}`}>
            <h2 className="editable-display text-2xl font-bold">{pagesContent.contact.formTitle}</h2>
            <p className={`mt-2 text-sm ${tone.muted}`}>Fill this in and a human will get back to you. No autoresponders.</p>
            <div className="mt-4">
              <EditableContactLeadForm />
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--slot4-accent)]">Reasons to reach out</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl">Pick the lane that fits.</h2>
            </div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {lanes.map((lane) => (
              <div key={lane.title} className={`rounded-2xl p-6 ${tone.soft}`}>
                <lane.icon className="h-5 w-5 text-[var(--slot4-accent)]" />
                <h3 className="mt-3 text-lg font-bold">{lane.title}</h3>
                <p className={`mt-2 text-sm leading-7 ${tone.muted}`}>{lane.body}</p>
              </div>
            ))}
          </div>
        </section>

       

        <section className="mt-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--slot4-accent)]"><HelpCircle className="mr-1 inline h-4 w-4" /> Frequently asked</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl">Answers before you ask.</h2>
            </div>
          </div>
          <div className="mt-8 divide-y divide-[var(--editable-border)] rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)]">
            {faqs.map((faq) => (
              <details key={faq.q} className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-bold">
                  {faq.q}
                  <span className="ml-4 text-xl leading-none text-[var(--slot4-accent)] transition group-open:rotate-45">+</span>
                </summary>
                <p className={`mt-3 text-sm leading-7 ${tone.muted}`}>{faq.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
