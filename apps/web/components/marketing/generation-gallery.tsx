import { ArrowUpRight, Clapperboard, ImageIcon } from "lucide-react";
import { SHOWCASE_ITEMS } from "@/lib/media";

export function GenerationGallery() {
  return (
    <section className="bg-bg py-20 sm:py-28" aria-labelledby="showcase-title">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Made in AzaisAi</p>
            <h2 id="showcase-title" className="mt-3 max-w-xl text-3xl font-semibold tracking-[-0.035em] text-text sm:text-5xl">
              One workspace, every frame.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-text-muted">
            Move between still images and motion without changing tools or losing your creative flow.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {SHOWCASE_ITEMS.map((item, index) => (
            <article key={item.id} className="group overflow-hidden rounded-2xl border border-border bg-surface p-2 shadow-sm">
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-canvas">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.src} alt={item.prompt} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-left">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-300">
                      {index === 0 ? <Clapperboard size={12} /> : <ImageIcon size={12} />}
                      {index === 0 ? "Video" : "Image"} example
                    </span>
                    <p className="mt-1 line-clamp-2 max-w-lg text-sm leading-5 text-white/85">{item.prompt}</p>
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm">
                    <ArrowUpRight size={16} />
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between px-3 py-3 text-xs">
                <span className="font-medium text-text">{item.model}</span>
                <span className="text-text-faint">Ready to replace with your media</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
