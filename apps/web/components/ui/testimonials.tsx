import { Quote } from "lucide-react";

const testimonials = [
  {
    text: "The model and credit cost are clear before I generate, so I can choose speed or quality without guessing.",
    initials: "RM",
    name: "Renee Marsh",
    role: "Independent filmmaker",
  },
  {
    text: "Switching from an image concept to a video pass in the same workspace keeps the whole creative process focused.",
    initials: "DK",
    name: "Devon Kaur",
    role: "Motion designer",
  },
  {
    text: "Every finished generation stays in history, which makes comparing versions and downloading the right one much easier.",
    initials: "PN",
    name: "Priya Nair",
    role: "Content strategist",
  },
];

export function TestimonialsSection() {
  return (
    <section className="border-b border-border-soft bg-bg py-20 sm:py-28" aria-labelledby="testimonials-heading">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Creator workflows</p>
          <h2 id="testimonials-heading" className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-text sm:text-5xl">
            Built to stay out of your way.
          </h2>
          <p className="mt-4 text-base leading-7 text-text-muted">
            A focused interface for choosing a model, shaping a prompt, and getting to the result.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="flex min-h-64 flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm">
              <Quote size={20} className="text-accent" />
              <p className="mt-5 flex-1 text-sm leading-6 text-text-muted">{item.text}</p>
              <div className="mt-7 flex items-center gap-3 border-t border-border-soft pt-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-wash text-xs font-bold text-accent-hi">
                  {item.initials}
                </span>
                <div>
                  <p className="text-sm font-semibold text-text">{item.name}</p>
                  <p className="text-xs text-text-faint">{item.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
