import { Camera, MapPin, Sparkles, Star } from 'lucide-react'

/*
  Server-rendered collage for the home hero. Lays the latest post images out in
  a five-tile mosaic with layered captions and a floating "trusted picks" badge,
  so the hero reads as an editorial spread rather than a single photograph.
  Deterministic markup (no client rotation) means it renders on the server and
  never causes a hydration mismatch.
*/

const CAPTIONS: Array<{ eyebrow: string; title: string }> = [
  { eyebrow: 'Field note', title: 'Hidden staircases of Hang Bac' },
  { eyebrow: 'Studio', title: 'A print shop that still hand-mixes ink' },
  { eyebrow: 'Guide', title: 'The 5pm walk locals actually take' },
  { eyebrow: 'Report', title: 'Craft cafes worth the detour' },
  { eyebrow: 'Portrait', title: 'The bookshop keeper of Trang Tien' },
]

export function EditableHeroCollage({ images }: { images: string[] }) {
  const pool = images.length ? images : ['/placeholder.svg?height=900&width=1400']
  // Build a stable 5-tile mosaic: hero + 4 supporting tiles, wrapping the pool as needed.
  const tiles = Array.from({ length: 5 }).map((_, i) => ({
    src: pool[i % pool.length],
    caption: CAPTIONS[i % CAPTIONS.length],
  }))

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div className="grid h-full w-full grid-cols-6 grid-rows-6 gap-2 p-2 sm:gap-3 sm:p-3">
        {/* Primary hero tile */}
        <figure className="group relative col-span-4 row-span-4 overflow-hidden rounded-lg bg-[var(--slot4-media-bg)]">
          <img
            src={tiles[0].src}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.05)_45%,rgba(10,10,10,0.75))]" />
          <figcaption className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/90 backdrop-blur">
              <Camera className="h-3.5 w-3.5" /> {tiles[0].caption.eyebrow}
            </span>
            <p className="mt-3 max-w-md text-lg font-semibold text-white sm:text-2xl">{tiles[0].caption.title}</p>
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-white/70">
              <MapPin className="h-3.5 w-3.5" /> Hoan Kiem &middot; Hanoi
            </p>
          </figcaption>
        </figure>

        {/* Right column: two stacked tiles */}
        <figure className="group relative col-span-2 row-span-2 overflow-hidden rounded-lg bg-[var(--slot4-media-bg)]">
          <img src={tiles[1].src} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]" loading="lazy" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0)_40%,rgba(10,10,10,0.65))]" />
          <figcaption className="absolute inset-x-0 bottom-0 p-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80">{tiles[1].caption.eyebrow}</span>
            <p className="mt-1 line-clamp-2 text-sm font-semibold text-white">{tiles[1].caption.title}</p>
          </figcaption>
        </figure>

        <figure className="group relative col-span-2 row-span-2 overflow-hidden rounded-lg bg-[var(--slot4-media-bg)]">
          <img src={tiles[2].src} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]" loading="lazy" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0)_40%,rgba(10,10,10,0.65))]" />
          <figcaption className="absolute inset-x-0 bottom-0 p-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--slot4-accent)]">
              <Star className="h-3 w-3 fill-[var(--slot4-accent)]" /> {tiles[2].caption.eyebrow}
            </span>
            <p className="mt-1 line-clamp-2 text-sm font-semibold text-white">{tiles[2].caption.title}</p>
          </figcaption>
        </figure>

        {/* Bottom row: two wide tiles */}
        <figure className="group relative col-span-3 row-span-2 overflow-hidden rounded-lg bg-[var(--slot4-media-bg)]">
          <img src={tiles[3].src} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" loading="lazy" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0)_40%,rgba(10,10,10,0.7))]" />
          <figcaption className="absolute inset-x-0 bottom-0 p-4">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80">{tiles[3].caption.eyebrow}</span>
            <p className="mt-1 line-clamp-2 text-sm font-semibold text-white sm:text-base">{tiles[3].caption.title}</p>
          </figcaption>
        </figure>

        <figure className="group relative col-span-3 row-span-2 overflow-hidden rounded-lg bg-[var(--slot4-media-bg)]">
          <img src={tiles[4].src} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" loading="lazy" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0)_40%,rgba(10,10,10,0.7))]" />
          <figcaption className="absolute inset-x-0 bottom-0 p-4">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80">{tiles[4].caption.eyebrow}</span>
            <p className="mt-1 line-clamp-2 text-sm font-semibold text-white sm:text-base">{tiles[4].caption.title}</p>
          </figcaption>
        </figure>
      </div>

      {/* Floating trust badge */}
      <div className="pointer-events-none absolute left-4 top-4 hidden items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-[var(--slot4-page-text)] shadow-lg backdrop-blur sm:inline-flex">
        <Sparkles className="h-3.5 w-3.5 text-[var(--slot4-accent)]" /> Curated by the editorial desk
      </div>
    </div>
  )
}
